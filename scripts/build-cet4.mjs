import fs from "node:fs";
import path from "node:path";
import { associations } from "./cet4-image-map.mjs";
import { wordListAssociations } from "./words-image-map.mjs";
import { readWordList, deduplicateWords } from "./read-word-list.mjs";

const original = path.resolve("source/word-atlas-main");
const source = JSON.parse(fs.readFileSync(path.join(original,"data/word-atlas.json"),"utf8"));
const originalIndex = JSON.parse(fs.readFileSync(path.join(original,"public/atlas/index.json"),"utf8"));
const sourceFile = process.argv[2] || "cet4-source/Words_all.md";
const text = fs.readFileSync(sourceFile,"utf8");
const rawRows = readWordList(text);
const declared = /共\s*(\d+)\s*条/.exec(text);
if (declared && Number(declared[1]) !== rawRows.length) throw Error("Source count does not match the Markdown header");
const words = deduplicateWords(rawRows);
fs.mkdirSync("cet4-source",{recursive:true});
if (path.resolve(sourceFile) !== path.resolve("cet4-source/Words_all.md")) fs.copyFileSync(sourceFile,"cet4-source/Words_all.md");
const exactCase = new Map(source.map(e => [e.w,e]));
const folded = new Map(source.map(e => [e.w.toLowerCase(),e]));
const preserveCase = new Set(["angle","china","grant","polish"]);
const map = {...associations,...wordListAssociations};
const pub = "public/atlas";
for(const folder of ["entries","img","thumb","audio/uk","audio/us","audio/ex","audio/ex2"]) fs.mkdirSync(path.join(pub,folder),{recursive:true});
const expected = new Set();
const copy = (file,id,kind) => {
  const relative = `${kind}/${id}.${kind.startsWith("audio") ? "mp3" : "webp"}`;
  if(!fs.existsSync(file)) return false;
  fs.copyFileSync(file,path.join(pub,relative));
  expected.add(relative.replaceAll("\\","/"));
  return true;
};
const unresolved=[];
const report=[];
const generatedTopics={camel:"nature",dragon:"arts",molecule:"science",bracket:"education",newsstand:"media",ax:"daily",devil:"arts",owl:"nature",zoo:"nature"};
const entries=words.map(w => {
  const exact=exactCase.get(w.w) || (!preserveCase.has(w.w.toLowerCase()) ? folded.get(w.w.toLowerCase()) : undefined);
  const imageSource=exact || (map[w.w]??map[w.w.toLowerCase()]??[]).map(v=>folded.get(v.toLowerCase())).find(Boolean);
  const id=`cet4-all-${String(w.seq).padStart(4,"0")}`;
  const generated=path.join("public/generated",`${w.w.toLowerCase()}.webp`);
  let m=0;
  let imageKind="missing";
  if(fs.existsSync(generated)) {
    copy(generated,id,"img");copy(generated,id,"thumb");m|=1;imageKind="generated";
  } else if(imageSource && copy(path.join(original,`public/atlas/img/${imageSource.id}.webp`),id,"img")) {
    copy(path.join(original,`public/atlas/thumb/${imageSource.id}.webp`),id,"thumb");m|=1;imageKind=exact?"exact":"association";
  } else unresolved.push(w.w);
  if(exact) {
    for(const [kind,bit] of [["uk",2],["us",4],["ex",8],["ex2",16]]) if(copy(path.join(original,`public/atlas/audio/${kind}/${exact.id}.mp3`),id,`audio/${kind}`)) m|=bit;
    if(exact.ex.length) m|=32;
  }
  const notes=[];
  if(w.w==="Negro") notes.push("此词用于指人已过时且有冒犯性，现代语境请使用 Black person / Black people。");
  if(["accommodatio","inser","recommendati","reservior","systematic(al)"].includes(w.w)) notes.push("保留原 PDF 提取的拼写，原文未校订；请结合词典核对。");
  if(w.sources.length>1) notes.push(`已合并原表 ${w.sources.map(r=>`#${r.seq}`).join("、")}，保留各条原始读音和释义。`);
  if(!w.ipa) notes.push("原表未提供音标。");
  const senses=[...new Map(w.sources.map(r=>[r.zh,{pos:"",zh:r.zh,en:""}])).values()];
  const e={...(exact??{col:[],fam:[],syn:[],ant:[],ex:[],cefr:"B1",topic:generatedTopics[w.w.toLowerCase()]??imageSource?.topic??"thinking"}),id,w:w.w,uk:w.ipa?`/${w.ipa}/`:"",us:exact?.us??(w.ipa?`/${w.ipa}/`:""),senses,tip:exact?.tip??"",m,note:notes.join(" ")||undefined,sourceSeq:w.seq,sourceRows:w.sources.map(r=>({seq:r.seq,w:r.w,ipa:r.ipa,zh:r.zh})),imageKind,imageSource:imageSource?.w};
  if(imageKind==="association") e.tip=`${e.tip?e.tip+" ":""}画面联想：复用「${imageSource.w}」的相关场景；请以本词释义为准。`;
  report.push({seq:w.seq,sourceRows:w.sources.map(r=>r.seq),word:w.w,kind:imageKind,source:imageKind==="generated"?"built-in image_gen":imageSource?.w,audio:exact?"original":"browser speech synthesis",examples:e.ex.length});
  return e;
});
if(unresolved.length) { console.error(JSON.stringify({unresolved},null,2));process.exit(1); }
const idx={...originalIndex,id:"word-atlas-cet4-words-all-v1",name:"词光 · 四级自由词库",source:"Words_all.md",sourceCount:rawRows.length,count:entries.length,examples:entries.reduce((n,e)=>n+e.ex.length,0),illustrated:entries.filter(e=>e.m&1).length,voiced:entries.filter(e=>e.m&2).length,words:entries.map(e=>[e.id,e.w,e.senses.map(s=>s.zh).join("；"),e.uk,Math.max(0,originalIndex.cefr.indexOf(e.cefr)),Math.max(0,originalIndex.topics.findIndex(t=>t[0]===e.topic)),e.m,e.sourceSeq])};
fs.writeFileSync(path.join(pub,"index.json"),JSON.stringify(idx));
for(let i=0;i<entries.length;i+=idx.chunk) {
  const relative=`entries/${i/idx.chunk}.json`;
  fs.writeFileSync(path.join(pub,relative),JSON.stringify(entries.slice(i,i+idx.chunk)));
  expected.add(relative);
}
// Only remove obsolete generated runtime files inside this project's atlas.
const root=fs.realpathSync(process.cwd());
const absolutePub=fs.realpathSync(pub);
if(!absolutePub.startsWith(root+path.sep)) throw Error("Runtime cleanup must stay in the workspace");
for(const folder of ["entries","img","thumb","audio/uk","audio/us","audio/ex","audio/ex2"]) {
  const directory=path.join(absolutePub,folder);
  if(fs.lstatSync(directory).isSymbolicLink()) throw Error("Unexpected linked runtime directory");
  for(const file of fs.readdirSync(directory,{withFileTypes:true})) if(file.isFile()&&!expected.has(`${folder}/${file.name}`)) fs.unlinkSync(path.join(directory,file.name));
}
fs.mkdirSync("data",{recursive:true});
fs.writeFileSync("data/word-atlas.json",JSON.stringify(entries,null,1));
fs.writeFileSync("data/media-provenance.json",JSON.stringify(report,null,1));
const importReport={source:"cet4-source/Words_all.md",sourceCount:rawRows.length,uniqueCount:words.length,mergedCount:rawRows.length-words.length,merges:words.filter(w=>w.sources.length>1).map(w=>({word:w.w,sources:w.sources})),caseDistinct:["angle / Angle","China / china","grant / Grant","polish / Polish"]};
fs.writeFileSync("data/source-import.json",JSON.stringify(importReport,null,2));
console.log(JSON.stringify({words:entries.length,sourceRows:rawRows.length,merged:importReport.mergedCount,images:idx.illustrated,exact:report.filter(r=>r.kind==="exact").length,association:report.filter(r=>r.kind==="association").length,generated:report.filter(r=>r.kind==="generated").length},null,2));
