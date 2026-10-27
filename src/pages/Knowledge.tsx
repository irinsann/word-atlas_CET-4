import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useKnowledgeCatalog } from "../atlas/knowledge";
import { MEMORY_METHODS, METHOD_NAMES, MemoryNoteCard } from "../ui/MemoryNotes";

export function Knowledge({ query = "" }: { query?: string }) {
  const { data, error, retry } = useKnowledgeCatalog();
  const [q, setQ] = useState(query);
  const [unit, setUnit] = useState(0);
  const [method, setMethod] = useState("");
  const [page, setPage] = useState(0);
  const resultsTop = useRef<HTMLDivElement>(null);
  useEffect(() => setQ(query), [query]);
  useEffect(() => setPage(0), [q, unit, method]);
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data?.notes.filter(n => (!unit || n.units.includes(unit)) && (!method || n.methods.includes(method)) && (!term || [n.word, n.meaning, ...n.related].some(t => t.toLowerCase().includes(term)))) ?? [];
  }, [data, q, unit, method]);
  const pages = Math.max(1, Math.ceil(results.length / 24));
  const current = Math.min(page, pages - 1);
  const turn = (next: number) => { setPage(next); resultsTop.current?.scrollIntoView({ block: "start" }); };
  return <div className="page knowledge">
    <header className="page-head">
      <p className="eyebrow">单词记法</p>
      <h1 className="display">有些词，可以这样记。</h1>
      <p className="lede">遇到不好记的词，可以查查谐音、联想或词根词缀。</p>
    </header>
    <details className="panel memory-guide">
      <summary><BookOpen size={20} /><span>这些记法怎么用</span><ChevronDown size={18} /></summary>
      <div className="memory-method-grid">{MEMORY_METHODS.map(m => <article key={m.id}><h3>{m.title}</h3><p>{m.text}</p><small>{m.example}</small></article>)}</div>
      <p className="memory-caution">记法是辅助：记完还要听发音、读例句，再试着遮住释义回想。谐音不代表标准发音，拆词联想也不一定是词源。</p>
    </details>
    <p className="knowledge-intro">整理自《英语四级，你还在背单词吗？》编号文档。{data && <>共整理了 {data.stats.notes.toLocaleString()} 份笔记，其中 {data.stats.linkedAtlasWords.toLocaleString()} 个单词可以在词卡里直接查看。</>} 部分扫描文字和音标可能有误，真题年份按原文保留。</p>
    <div className="knowledge-filters">
      <label className="search"><Search size={18} /><input aria-label="搜索记忆笔记" placeholder="搜索单词、派生词或释义" value={q} onChange={e => setQ(e.target.value)} type="search" /></label>
      <label><span>单元</span><select aria-label="筛选笔记单元" value={unit} onChange={e => setUnit(Number(e.target.value))}><option value={0}>全部单元</option>{data?.units.map(u => <option key={u.id} value={u.id}>第 {u.id} 单元</option>)}</select></label>
      <label><span>内容</span><select aria-label="筛选记忆方法" value={method} onChange={e => setMethod(e.target.value)}><option value="">全部内容</option>{Object.entries(METHOD_NAMES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    </div>
    <div ref={resultsTop} className="knowledge-results-top"><span>{data ? `${results.length.toLocaleString()} 份笔记` : "正在加载笔记目录…"}</span><a className="link" href="#/atlas">返回词库 <ArrowRight size={15} /></a></div>
    {error ? <p role="status">{error} <button className="link" onClick={retry}>重试</button></p> : <div className="memory-card-list">{results.slice(current * 24, current * 24 + 24).map(n => <MemoryNoteCard key={n.id} note={n} />)}</div>}
    {data && !results.length && <p className="knowledge-empty">没有符合条件的笔记，换个单词或筛选条件试试。</p>}
    {results.length > 24 && <nav className="knowledge-pagination" aria-label="笔记翻页"><button className="btn btn-ghost" disabled={!current} onClick={() => turn(current - 1)}><ArrowLeft size={16} />上一页</button><span>{current + 1} / {pages}</span><button className="btn btn-ghost" disabled={current >= pages - 1} onClick={() => turn(current + 1)}>下一页<ArrowRight size={16} /></button></nav>}
  </div>;
}
