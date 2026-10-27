import { ChevronDown, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useKnowledgeCatalog, useKnowledgeNotes, type MemoryNote, type NoteSummary } from "../atlas/knowledge";

export const MEMORY_METHODS = [
  { id: "sound", title: "谐音记忆", text: "借读音相近的中文记住词义，发音仍以单词录音为准。", example: "ambition：借“俺必胜”联想到雄心。" },
  { id: "association", title: "联想记忆", text: "把单词和一个具体的场景或动作联系起来。", example: "记住联想后，再试着完整读出、拼出单词。" },
  { id: "roots", title: "词根词缀", text: "找出几个词里相同的词根，再看前后缀怎样改变词义。", example: "对照 project、reject、inject，看看共同的 ject。" },
  { id: "contrast", title: "形近对照", text: "容易混的词放在一起看，比较拼写和用法有什么不同。", example: "对照 derive 与 deprive，用各自的例句区分。" },
];
export const METHOD_NAMES: Record<string, string> = Object.fromEntries([...MEMORY_METHODS.map(m => [m.id, m.title]), ["context", "例句语境"]]);

function NoteBody({ note }: { note: MemoryNote }) {
  return <>
    {note.sections.map(section => <section className="memory-source-section" key={section.seq}>
      <p className="memory-source">《英语四级，你还在背单词吗？》 · 第 {section.unit} 单元 · 原文 #{section.seq}</p>
      <p className="memory-meaning"><b>笔记中的释义</b> {section.meaning}</p>
      {section.blocks.map((block, i) => <div className={`memory-block memory-block-${block.kind}`} key={i}>
        <h4>{block.kind === "exam" ? "文档真题标注 · 出处未核验" : block.label}</h4>
        <p>{block.text}</p>
      </div>)}
    </section>)}
    {note.related.length > 0 && <div className="memory-related" aria-label="派生与相关词">
      {note.related.map((r, i) => r.atlasId ? <a className="chip-btn" key={i} href={`#/atlas?w=${r.atlasId}`}>{r.word}<ArrowUpRight size={13} /></a> : <span className="chip" key={i}>{r.word}</span>)}
    </div>}
  </>;
}

function LoadedNotes({ ids, currentWord }: { ids: number[]; currentWord?: string }) {
  const { data, error, retry } = useKnowledgeNotes(ids);
  if (error) return <p className="memory-load">{error} <button className="link" onClick={retry}>重试</button></p>;
  if (!data) return <p className="memory-load" role="status">正在加载笔记…</p>;
  return <>{data.map(note => <div className="memory-note-body" key={note.id}>
    {currentWord && note.word.toLowerCase() !== currentWord.toLowerCase() && <p className="memory-relation">这条笔记还涉及 <b lang="en">{note.word}</b></p>}
    {note.atlasId && !currentWord && <a className="link" href={`#/atlas?w=${note.atlasId}`}>打开 {note.word} 词卡 <ArrowUpRight size={14} /></a>}
    <NoteBody note={note} />
  </div>)}</>;
}

export function WordMemoryNotes({ wordId, word }: { wordId: string; word: string }) {
  const { data } = useKnowledgeCatalog();
  const [open, setOpen] = useState(false);
  const ids = data?.lookup[wordId];
  if (!ids?.length) return null;
  return <section className="block word-memory">
    <details className="memory-details" onToggle={e => setOpen(e.currentTarget.open)}>
      <summary><span><b>记忆笔记</b><small>查看记法、例句和相关词</small></span><ChevronDown size={18} /></summary>
      {open && <LoadedNotes ids={ids} currentWord={word} />}
    </details>
    <p className="memory-caution">谐音只用来帮助记忆。原稿来自扫描，个别文字可能有误。<a href={`#/knowledge?q=${encodeURIComponent(word)}`}>查看笔记</a></p>
  </section>;
}

export function MemoryNoteCard({ note }: { note: NoteSummary }) {
  const [open, setOpen] = useState(false);
  return <details className="memory-card" onToggle={e => setOpen(e.currentTarget.open)}>
    <summary>
      <span className="memory-card-heading"><b lang="en">{note.word}</b><span className="memory-unit">第 {note.units.join("、")} 单元</span></span>
      <span className="memory-card-meaning">{note.meaning}</span>
      <span className="memory-card-tags">{note.methods.map(m => <span key={m}>{METHOD_NAMES[m]}</span>)}</span>
      <ChevronDown size={18} className="memory-chevron" />
    </summary>
    {open && <LoadedNotes ids={[note.id]} />}
  </details>;
}
