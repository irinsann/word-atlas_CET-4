import fs from "node:fs";
import { createHash } from "node:crypto";
import { decisions, dictionaryEvidence } from "./vocabulary-review-decisions.mjs";
import { headwordPattern } from "../src/lib/text.ts";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const compactIndent = new Set(["data/word-atlas.json","data/paper-example-import.json","data/media-provenance.json","src/generated/paper-summary.json"]);
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, compactIndent.has(file)?1:2) + "\n");
const baseline = read("data/vocabulary-audit-reference.json");
const refs = new Map(baseline.entries.map(e => [e.id, e]));
const aliases = { "cet4-core-0942":"cet4-all-0030", "cet4-core-1899":"cet4-all-2004", "cet4-core-2101":"cet4-all-3091", "cet4-core-1461":"cet4-all-3186", "cet4-core-2152":"cet4-all-3863", "cet4-all-3106":"cet4-all-3105" };
const corrections = [
  ["cet4-all-0030","accommodatio","accommodation"], ["cet4-all-2004","inser","insert"],
  ["cet4-all-3091","recommendati","recommendation"], ["cet4-all-3186","reservior","reservoir"],
  ["cet4-all-3863","systematic(al)","systematic"], ["cet4-all-2723","outskirt","outskirts"],
  ["cet4-all-4407","world-wide","worldwide"], ["cet4-all-2091","jew","Jew"],
  ["cet4-all-2093","jewish","Jewish"], ["cet4-all-0117","a.m","a.m."],
];
let entries = read("data/word-atlas.json");
const index = read("public/atlas/index.json");
const upstream = new Map(read("source/word-atlas-main/data/word-atlas.json").map(e => [e.w, e]));
// Look up punctuation identities from the frozen source instead of inventing IDs.
corrections[9][0] = baseline.entries.find(e => e.word === "a.m").id;
corrections.push([baseline.entries.find(e => e.word === "P.M.").id,"P.M.","p.m."]);

function copyMedia(from, to) {
  for (const [folder, ext] of [["img","webp"],["thumb","webp"],["audio/uk","mp3"],["audio/us","mp3"],["audio/ex","mp3"],["audio/ex2","mp3"]]) {
    const file=`public/atlas/${folder}/${from}.${ext}`;
    if (fs.existsSync(file)) fs.copyFileSync(file,`public/atlas/${folder}/${to}.${ext}`);
  }
}
function refreshWordMedia(e, word) {
  const original=upstream.get(word);
  if (!original) throw Error(`No verified pronunciation for ${word}`);
  e.uk=original.uk; e.us=original.us;
  for (const [kind,bit] of [["uk",2],["us",4]]) {
    const file=`source/word-atlas-main/public/atlas/audio/${kind}/${original.id}.mp3`;
    if (fs.existsSync(file)) {fs.copyFileSync(file,`public/atlas/audio/${kind}/${e.id}.mp3`);e.m|=bit;}
  }
  if (e.imageSource===word) {e.imageKind="exact";e.tip="";}
}
// Merge corrected duplicates while retaining raw source rows and stable base IDs.
for (const [oldId,targetId] of Object.entries(aliases)) {
  const old=entries.find(e=>e.id===oldId), target=entries.find(e=>e.id===targetId);
  if (!old) continue;
  if (!target) throw Error(`Missing merge target ${targetId}`);
  if (oldId.startsWith("cet4-core")) {
    const identity={id:target.id,sourceSeq:target.sourceSeq,sourceRows:target.sourceRows};
    const examples=[...target.ex];
    Object.assign(target,old,identity);
    target.ex=[...new Map([...target.ex,...examples].map(x=>[x.en,x])).values()];
    copyMedia(oldId,targetId);
  } else {
    target.sourceRows=[...(target.sourceRows??[]),...(old.sourceRows??[])];
    target.ex=[...new Map([...target.ex,...old.ex].map(x=>[x.en,x])).values()];
  }
  entries=entries.filter(e=>e.id!==oldId);
}
for (const [id,from,to] of corrections) {
  const e=entries.find(e=>e.id===id);
  if (!e || ![from,to].includes(e.w)) throw Error(`Unexpected correction target ${id}`);
  e.w=to;
  if (["accommodation","insert","recommendation","systematic"].includes(to)) refreshWordMedia(e,to);
}
const forbid=entries.find(e=>e.id==="cet4-all-1548");
if (!entries.some(e=>e.id==="cet4-all-1549")) {
  const raw=forbid.sourceRows.find(r=>r.seq===1549);
  if (!raw) throw Error("Missing forbidden extraction row");
  const forbidden={...structuredClone(forbid),id:"cet4-all-1549",w:"forbidden",sourceSeq:1549,sourceRows:[raw],
    senses:[{pos:"",zh:"adj. 被禁止的；forbid 的过去分词",en:""}],fam:["forbid (v.)"],
    tip:"forbidden 是 forbid 的过去分词，也可以作形容词。",imageKind:"association",imageSource:"forbid"};
  copyMedia(forbid.id,forbidden.id);refreshWordMedia(forbidden,"forbidden");
  entries.splice(entries.indexOf(forbid)+1,0,forbidden);
}
forbid.sourceRows=forbid.sourceRows.filter(r=>r.seq!==1549);
forbid.senses=forbid.senses.filter(s=>!s.zh.startsWith("adj."));
const notes={
  "ought":"通常与 to 连用：ought to do sth. 表示应该做某事。",
  "according":"常用于 according to，表示“根据、按照”；不要将它当作普通形容词自由使用。",
  "systematical":"Collins 将此形式对应到 systematic 的生物分类学义。日常表示“有系统的、有计划的”，优先使用 systematic。",
  "Negro":"历史词汇：现代英语中通常被视为过时或冒犯性称谓，仅供理解历史文本，不建议用于称呼他人。",
};
for (const e of entries) {
  if (notes[e.w]) e.note=notes[e.w];
  if (e.w==="systematical") e.senses=[{pos:"",zh:"adj. （生物）分类学的；systematic 的异体",en:""}];
}

const reviews=[];
const inverse=new Map(Object.entries(aliases).map(([old,id])=>[id,old]));
for (const e of entries) {
  const ref=refs.get(e.id), previousWord=ref?.word;
  let result;
  if (e.w==="forbidden") result={scope:"cet4",kind:"derived",reason:"forbid 的过去分词/形容词；修复了 PDF 中误合并的词头。",roots:["forbid"]};
  else if (decisions.has(previousWord)) result=decisions.get(previousWord);
  else if (ref?.category==="CET4") result={scope:"cet4",kind:"outline",reason:"对应 2016 版大纲四级词头、列出的异拼或同列词族。"};
  else if (ref?.category==="CET6") result={scope:"extension",kind:"cet6",reason:"2016 版大纲中所在词头行带六级★标记（含同列词族）。"};
  else throw Error(`Unreviewed entry ${e.id} ${e.w}`);
  result=structuredClone(result);
  if (e.w==="reservoir") result={scope:"extension",kind:"cet6",reason:"修正 reservior 并合并重复；reservoir 在 2016 版大纲标为六级。"};
  if (["accommodation","insert","recommendation","systematic","reflection","outskirts","worldwide"].includes(e.w))
    result={scope:"cet4",kind:"outline",reason:"已修正或归一词形，对应 2016 版大纲四级词头或同列词族。"};
  // China/china, Polish/polish, Angle/angle and Grant/grant differ in meaning.
  // A case-insensitive candidate is not affirmative outline evidence.
  let evidence=ref?.category==="case-review"?[]:ref?.evidence??[];
  if (result.roots?.length) evidence=[...evidence,...result.roots.flatMap(root=>baseline.rootEvidence.filter(r=>r.forms.includes(root)||root==="honour"&&r.forms.includes("hono(u)r")).map(r=>({level:r.level,headword:r.headword,form:root,role:"reviewed-root",page:r.page,pdfPage:r.pdfPage})))];
  if (inverse.has(e.id)) evidence=[...evidence,...(refs.get(inverse.get(e.id))?.evidence??[])];
  const label=result.kind==="cet6"?"六级词":result.kind==="outside"?"大纲外补充":result.kind==="outline"?"大纲四级":"四级基础补充";
  e.learning={scope:result.scope,kind:result.kind,label,reason:result.reason};
  if (evidence.length) e.learning.page=evidence[0].page;
  reviews.push({id:e.id,word:e.w,...result,evidence});
  e.m=(e.m&~32)|(e.ex[0]&&headwordPattern(e.w).test(e.ex[0].en)?32:0);
}
if (new Set(entries.map(e=>e.w)).size!==entries.length || new Set(entries.map(e=>e.id)).size!==entries.length) throw Error(`Duplicate corrected identity: ${entries.filter((e,i)=>entries.findIndex(x=>x.w===e.w||x.id===e.id)!==i).map(e=>e.id+':'+e.w).join(', ')}`);
const rawRows=entries.flatMap(e=>e.sourceRows??[]);
if(rawRows.length!==4449||new Set(rawRows.map(r=>r.seq)).size!==4449) throw Error("Lost raw source rows");
const counts={total:entries.length,cet4:reviews.filter(r=>r.scope==="cet4").length,extension:reviews.filter(r=>r.scope==="extension").length,cet6:reviews.filter(r=>r.kind==="cet6").length,outside:reviews.filter(r=>r.kind==="outside").length};
const revision=createHash("sha256").update(JSON.stringify(entries)).digest("hex").slice(0,12);
const scope={datasetId:index.id,revision,...counts,aliases,extensionIds:reviews.filter(r=>r.scope==="extension").map(r=>r.id)};
write("data/vocabulary-review.json",{source:baseline.source,dictionaryEvidence,counts,unmatchedReviewed:305,corrections:corrections.map(([id,from,to])=>({id,from,to})),aliases,entries:reviews});
write("src/generated/vocabulary-scope.json",scope);
write("public/atlas/vocabulary.json",{...scope,source:baseline.source});
write("data/word-atlas.json",entries);
index.words=entries.map(e=>[e.id,e.w,e.senses.map(s=>s.zh).join("；"),e.uk,Math.max(0,index.cefr.indexOf(e.cefr)),Math.max(0,index.topics.findIndex(t=>t[0]===e.topic)),e.m,...(e.sourceSeq?[e.sourceSeq]:[])]);
Object.assign(index,{count:entries.length,baseWords:entries.filter(e=>e.sourceSeq).length,coreAddedWords:entries.filter(e=>!e.sourceSeq).length,
  examples:entries.reduce((n,e)=>n+e.ex.length,0),illustrated:entries.filter(e=>e.m&1).length,voiced:entries.filter(e=>e.m&2).length,exampleRevision:revision,vocabulary:counts});
fs.writeFileSync("public/atlas/index.json",JSON.stringify(index));
for(let i=0;i<entries.length;i+=index.chunk) fs.writeFileSync(`public/atlas/entries/${i/index.chunk}.json`,JSON.stringify(entries.slice(i,i+index.chunk)));
const paper=read("data/paper-example-import.json");
paper.selected=entries.flatMap(e=>e.ex.filter(x=>x.source?.kind==="cet4-paper").map(x=>({id:e.id,word:e.w,en:x.en,...x.source})));
paper.unmatched=entries.filter(e=>!e.ex.some(x=>x.source?.kind==="cet4-paper")).map(e=>({id:e.id,word:e.w,retainedExamples:e.ex.length}));
Object.assign(paper.stats,{words:entries.length,replacedWords:entries.filter(e=>e.ex.some(x=>x.source?.kind==="cet4-paper")).length,genuineExamples:paper.selected.length,
  uniqueQuotes:new Set(paper.selected.map(x=>x.en)).size,unmatchedWords:paper.unmatched.length,legacyExamples:entries.reduce((n,e)=>n+e.ex.filter(x=>x.source?.kind==="legacy-generated").length,0),
  wordsWithoutExamples:entries.filter(e=>!e.ex.length).length,translatedExamples:paper.selected.length,translatedQuotes:new Set(paper.selected.map(x=>x.en)).size});
Object.assign(index,{realExamples:paper.stats.genuineExamples,realExampleWords:paper.stats.replacedWords,translatedExamples:paper.stats.translatedExamples,translatedQuotes:paper.stats.translatedQuotes});
fs.writeFileSync("public/atlas/index.json",JSON.stringify(index));
write("data/paper-example-import.json",paper);write("src/generated/paper-summary.json",paper.stats);
const provenance=read("data/media-provenance.json").map(e=>({...e,id:e.id??`cet4-all-${String(e.seq).padStart(4,"0")}`})).filter(e=>!aliases[e.id]);
for (const e of entries) {
  let record=provenance.find(r=>r.id===e.id);
  if(!record){record={id:e.id};provenance.push(record);}
  Object.assign(record,{word:e.w,kind:e.imageKind,source:e.imageSource,examples:e.ex.length,audio:(e.m&6)?"original":"browser speech synthesis"});
  if(e.sourceRows)record.sourceRows=e.sourceRows.map(r=>r.seq);
}
write("data/media-provenance.json",provenance);
console.log(JSON.stringify({...counts,revision,reviewed:305}));
