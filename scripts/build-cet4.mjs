import fs from "node:fs";
import path from "node:path";
import { associations } from "./cet4-image-map.mjs";

const original = path.resolve("source/word-atlas-main");
const source = JSON.parse(fs.readFileSync(path.join(original,"data/word-atlas.json"),"utf8"));
const originalIndex = JSON.parse(fs.readFileSync(path.join(original,"public/atlas/index.json"),"utf8"));
const byWord = new Map(source.map(e => [e.w.toLowerCase(), e]));
const sourceDir = process.argv[2] || "cet4-source/Daily_Plans";
const records = new Map();
fs.mkdirSync("cet4-source/Daily_Plans",{recursive:true});
for(const file of fs.readdirSync(sourceDir).filter(f => f.endsWith(".md"))) {
  const text = fs.readFileSync(path.join(sourceDir,file),"utf8");
  if(path.resolve(sourceDir,file)!==path.resolve("cet4-source/Daily_Plans",file)) fs.copyFileSync(path.join(sourceDir,file),path.join("cet4-source/Daily_Plans",file));
  if(!file.startsWith("Day")) continue;
  for(const m of text.matchAll(/^\|\s*(\d+)\s*\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/gm)) {
    const record={seq:Number(m[1]),w:m[2],uk:m[3],us:m[4],zh:m[5]};
    if(records.has(record.seq) && JSON.stringify(records.get(record.seq)) !== JSON.stringify(record)) throw Error(`conflicting source row ${record.seq}`);
    records.set(record.seq,record);
  }
}
const words=[...records.values()].sort((a,b)=>a.seq-b.seq);
if(words.length!==2607 || words.some((w,i)=>w.seq!==i+1)) throw Error("Expected 2,607 consecutive source rows");
const unresolved=[];
const report=[];
const pub="public/atlas";
for(const folder of ["entries","img","thumb","audio/uk","audio/us","audio/ex","audio/ex2"]) fs.mkdirSync(path.join(pub,folder),{recursive:true});
const copy=(file,id,kind) => {
  const relative=kind.startsWith("audio") ? `${kind}/${id}.mp3` : `${kind}/${id}.webp`;
  if(!fs.existsSync(file)) return false;
  fs.copyFileSync(file,path.join(pub,relative)); return true;
};
const entries=words.map(w=>{
  const exact=byWord.get(w.w.toLowerCase());
  const imageSource=exact || (associations[w.w]??[]).map(v=>byWord.get(v.toLowerCase())).find(Boolean);
  const id=`cet4-${String(w.seq).padStart(4,"0")}`;
  const generated=path.join("public/generated",`${w.w.toLowerCase()}.webp`);
  let m=0;
  let imageKind="missing";
  if(fs.existsSync(generated)) {
    copy(generated,id,"img");copy(generated,id,"thumb");m|=1;imageKind="generated";
  } else if(imageSource && copy(path.join(original,`public/atlas/img/${imageSource.id}.webp`),id,"img")) {
    copy(path.join(original,`public/atlas/thumb/${imageSource.id}.webp`),id,"thumb"); m|=1;imageKind=exact?"exact":"association";
  } else unresolved.push({word:w.w,candidates:associations[w.w]});
  if(exact) {
    for(const [kind,bit] of [["uk",2],["us",4],["ex",8],["ex2",16]]) if(copy(path.join(original,`public/atlas/audio/${kind}/${exact.id}.mp3`),id,`audio/${kind}`)) m|=bit;
    if(exact.ex.length) m|=32;
  }
  const note=w.w === "Negro" ? "原词表保留词。此词用于指人已过时且有冒犯性，现代语境请使用 Black person / Black people。" : w.w === "connexion" ? "connection 的旧式英式拼写，现代英语通常使用 connection。" : undefined;
  const generatedTopics={camel:"nature",dragon:"arts",molecule:"science",bracket:"education",newsstand:"media",ax:"daily",devil:"arts"};
  const e={...(exact??{col:[],fam:[],syn:[],ant:[],ex:[],cefr:"B1",topic:generatedTopics[w.w.toLowerCase()]??imageSource?.topic??"thinking"}),id,w:w.w,uk:w.uk,us:w.us,senses:[{pos:exact?.senses[0]?.pos??"",zh:w.zh,en:""}],tip:exact?.tip??"",m,note,sourceSeq:w.seq,imageKind,imageSource:imageSource?.w};
  if(imageKind==="association") e.tip=`${e.tip ? e.tip+" " : ""}画面联想：复用「${imageSource.w}」的相关场景；请以本词释义为准。`;
  report.push({seq:w.seq,word:w.w,kind:imageKind,source:imageKind==="generated"?"built-in image_gen":imageSource?.w,audio:exact?"original":"browser speech synthesis",examples:e.ex.length});
  return e;
});
const idx={...originalIndex,id:"word-atlas-cet4",name:"词光 · 四级 14 天",count:entries.length,examples:entries.reduce((n,e)=>n+e.ex.length,0),illustrated:entries.filter(e=>e.m&1).length,voiced:entries.filter(e=>e.m&2).length,words:entries.map(e=>[e.id,e.w,e.senses[0].zh,e.uk,Math.max(0,originalIndex.cefr.indexOf(e.cefr)),Math.max(0,originalIndex.topics.findIndex(t=>t[0]===e.topic)),e.m])};
fs.writeFileSync(path.join(pub,"index.json"),JSON.stringify(idx));
for(let i=0;i<entries.length;i+=idx.chunk) fs.writeFileSync(path.join(pub,`entries/${i/idx.chunk}.json`),JSON.stringify(entries.slice(i,i+idx.chunk)));
fs.mkdirSync("data",{recursive:true});
fs.writeFileSync("data/word-atlas.json",JSON.stringify(entries,null,1));
fs.writeFileSync("data/media-provenance.json",JSON.stringify(report,null,1));
fs.writeFileSync("data/cet4-plan.json",JSON.stringify(Array.from({length:14},(_,i)=>({day:i+1,fresh:i===13?[]:words.slice(i*200,i===12?2607:(i+1)*200).map(w=>w.seq),review:i===0?[]:words.slice((i-1)*200,i===13?2607:i*200).map(w=>w.seq)})),null,1));
console.log(JSON.stringify({words:entries.length,images:idx.illustrated,exact:report.filter(r=>r.kind==="exact").length,association:report.filter(r=>r.kind==="association").length,generated:report.filter(r=>r.kind==="generated").length,unresolved},null,2));
