import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { headwordPattern } from "../src/lib/text.ts";
import { coreImageAssociations } from "./core-image-map.mjs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 1) + "\n");
const current = read("data/word-atlas.json");
const base = current.filter(e => !e.id.startsWith("cet4-core-"));
const supplementFile = "data/core-vocabulary-supplement.json";
let supplement;
if (process.argv[2]) {
  const input = process.argv[2];
  const text = fs.readFileSync(input, "utf8");
  const rows = [...text.matchAll(/^\|\s*(\d+)\s*\|\s*\*\*(.+?)\*\*\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/gm)]
    .map(m => ({seq:Number(m[1]), word:m[2].trim(), uk:m[3].trim(), us:m[4].trim(), zh:m[5].trim()}));
  if (rows.length !== 2607 || rows.some((r,i) => r.seq !== i + 1)) throw Error("Invalid core vocabulary table");
  const known = new Set(base.map(e => e.w));
  supplement = {
    source: {file:path.basename(input), sha256:createHash("sha256").update(text).digest("hex"),
      attribution:"The supplied document credits RealKai42/qwerty-learner.", url:"https://github.com/RealKai42/qwerty-learner"},
    words:rows.filter(r => !known.has(r.word)),
  };
} else supplement = read(supplementFile);
if (supplement.words.length !== 403 || new Set(supplement.words.map(r=>r.word)).size !== 403)
  throw Error("Expected 403 additional, distinct core words");

const upstreamRoot = "source/word-atlas-main";
const upstream = read(`${upstreamRoot}/data/word-atlas.json`);
const exact = new Map(upstream.map(e => [e.w,e]));
const folded = new Map(upstream.map(e => [e.w.toLowerCase(),e]));
const baseByWord = new Map(base.map(e => [e.w.toLowerCase(),e]));
const index = read("public/atlas/index.json");
const report = read("data/paper-example-import.json");
const quoted = [...new Map(base.flatMap(e=>e.ex.filter(x=>x.source?.kind === "cet4-paper")).map(x=>[x.en,x])).values()];
const media = read("data/media-provenance.json").filter(x=>!x.id?.startsWith("cet4-core-"));
const additions = [];
const copies = [];
const queue = (from,to) => { if (!fs.existsSync(from)) throw Error(`Missing media ${from}`); copies.push([from,to]); };

for (const row of supplement.words) {
  const id = `cet4-core-${String(row.seq).padStart(4,"0")}`;
  const original = exact.get(row.word) ?? folded.get(row.word.toLowerCase());
  const generated = `public/generated/${row.word.toLowerCase()}.webp`;
  let illustration, thumb, imageSource, imageKind;
  if (original) {
    illustration = `${upstreamRoot}/public/atlas/img/${original.id}.webp`;
    thumb = `${upstreamRoot}/public/atlas/thumb/${original.id}.webp`;
    imageSource = original.w; imageKind = "exact";
  } else if (fs.existsSync(generated)) {
    illustration = generated; thumb = generated; imageSource = row.word; imageKind = "generated";
  } else {
    for (const word of coreImageAssociations[row.word] ?? []) {
      const related = folded.get(word.toLowerCase());
      const existing = baseByWord.get(word.toLowerCase());
      const local = `public/generated/${word.toLowerCase()}.webp`;
      if (related) {
        illustration = `${upstreamRoot}/public/atlas/img/${related.id}.webp`;
        thumb = `${upstreamRoot}/public/atlas/thumb/${related.id}.webp`;
      } else if (existing && (existing.m & 1)) {
        illustration = `public/atlas/img/${existing.id}.webp`; thumb = `public/atlas/thumb/${existing.id}.webp`;
      } else if (fs.existsSync(local)) { illustration = local; thumb = local; }
      if (illustration) { imageSource = word; imageKind = "association"; break; }
    }
  }
  if (!illustration) throw Error(`No illustration for ${row.word}`);
  queue(illustration,`public/atlas/img/${id}.webp`); queue(thumb,`public/atlas/thumb/${id}.webp`);
  const pattern = headwordPattern(row.word);
  const candidates = quoted.filter(x=>pattern.test(x.en)).sort((a,b)=>Math.abs(a.en.length-125)-Math.abs(b.en.length-125)||a.en.localeCompare(b.en));
  const chosen = [];
  for (const example of candidates) {
    if (chosen.length && chosen[0].source.documentId === example.source.documentId) continue;
    const x = structuredClone(example);
    x.source.matchedForm = pattern.exec(x.en)[0]; chosen.push(x);
    if (chosen.length === 2) break;
  }
  const examples = chosen.length ? chosen : (original?.ex ?? []).map(x=>({ ...x, source:{kind:"legacy-generated",label:"原 Word Atlas 学习示例，未在本次真题库中核验"} }));
  let m = 1;
  if (original) {
    for (const [kind,bit] of [["uk",2],["us",4],...(!chosen.length?[["ex",8],["ex2",16]]:[])]) {
      if ((kind === "ex" && !examples[0]) || (kind === "ex2" && !examples[1])) continue;
      const file = `${upstreamRoot}/public/atlas/audio/${kind}/${original.id}.mp3`;
      if (fs.existsSync(file)) { queue(file,`public/atlas/audio/${kind}/${id}.mp3`); m |= bit; }
    }
  }
  if (examples[0] && pattern.test(examples[0].en)) m |= 32;
  const entry = {
    col:original?.col ?? [], fam:original?.fam ?? [], syn:original?.syn ?? [], ant:original?.ant ?? [],
    ...(original ?? {}), id, w:row.word, uk:row.uk, us:row.us,
    senses:[{pos:"",zh:row.zh,en:""}], ex:examples, coreSeq:row.seq,
    cefr:original?.cefr ?? "B1", topic:original?.topic ?? "thinking", m,
    imageKind, imageSource,
    tip:original?.tip ?? (imageKind === "association" ? `图片借用 ${imageSource} 的相关场景，词义以本词释义为准。` : ""),
  };
  delete entry.sourceSeq; delete entry.sourceRows;
  additions.push(entry);
  media.push({id,seq:row.seq,word:row.word,sourceList:supplement.source.file,kind:imageKind,source:imageSource,audio:original?"original":"browser speech synthesis",examples:examples.length});
}

const entries = [...base,...additions];
if (new Set(entries.map(e=>e.id)).size !== entries.length || new Set(entries.map(e=>e.w)).size !== entries.length) throw Error("Duplicate identity / headword");
const oldSelected = report.selected.filter(x=>!x.id.startsWith("cet4-core-"));
const selected = [...oldSelected,...additions.flatMap(e=>e.ex.filter(x=>x.source?.kind === "cet4-paper").map(x=>({id:e.id,word:e.w,en:x.en,...x.source})))];
const unmatched = entries.filter(e=>!e.ex.some(x=>x.source?.kind === "cet4-paper")).map(e=>({id:e.id,word:e.w,retainedExamples:e.ex.length}));
const stats = {...report.stats,
  words:entries.length, replacedWords:entries.filter(e=>e.ex.some(x=>x.source?.kind === "cet4-paper")).length,
  genuineExamples:selected.length, uniqueQuotes:new Set(selected.map(x=>x.en)).size,
  unmatchedWords:unmatched.length, legacyExamples:entries.reduce((n,e)=>n+e.ex.filter(x=>x.source?.kind === "legacy-generated").length,0),
  wordsWithoutExamples:entries.filter(e=>!e.ex.length).length,
  translatedExamples:selected.length,translatedQuotes:new Set(selected.map(x=>x.en)).size,
};
index.words = entries.map(e=>[e.id,e.w,e.senses.map(s=>s.zh).join("；"),e.uk,Math.max(0,index.cefr.indexOf(e.cefr)),Math.max(0,index.topics.findIndex(t=>t[0]===e.topic)),e.m,...(e.sourceSeq?[e.sourceSeq]:[])]);
Object.assign(index,{count:entries.length,baseWords:base.length,coreAddedWords:additions.length,
  examples:entries.reduce((n,e)=>n+e.ex.length,0), illustrated:entries.filter(e=>e.m&1).length,
  voiced:entries.filter(e=>e.m&2).length,realExamples:stats.genuineExamples,realExampleWords:stats.replacedWords,
  translatedExamples:stats.translatedExamples,translatedQuotes:stats.translatedQuotes,
  exampleRevision:createHash("sha256").update(JSON.stringify(entries)).digest("hex").slice(0,12),
});
// All source/media checks finish before any live dataset file is replaced.
for (const [from,to] of copies) fs.copyFileSync(from,to);
write(supplementFile,supplement); write("data/word-atlas.json",entries);
fs.writeFileSync("public/atlas/index.json",JSON.stringify(index));
for(let i=0;i<entries.length;i+=index.chunk) fs.writeFileSync(`public/atlas/entries/${i/index.chunk}.json`,JSON.stringify(entries.slice(i,i+index.chunk)));
write("data/media-provenance.json",media); write("data/paper-example-import.json",{...report,stats,unmatched,selected});
write("src/generated/paper-summary.json",stats);
console.log(JSON.stringify({added:additions.length,exactImages:additions.filter(e=>e.imageKind === "exact").length,associationImages:additions.filter(e=>e.imageKind === "association").length,generatedImagesReused:additions.filter(e=>e.imageKind === "generated").length,newWordsWithPaperExamples:additions.filter(e=>e.ex.some(x=>x.source?.kind === "cet4-paper")).length,newWordsWithoutExamples:additions.filter(e=>!e.ex.length).length,total:entries.length}));
