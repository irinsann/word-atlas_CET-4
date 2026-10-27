import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { readWordList, deduplicateWords } from "./read-word-list.mjs";

const rows=readWordList(fs.readFileSync("cet4-source/Words_all.md","utf8"));
const unique=deduplicateWords(rows);

test("imports all 4,449 raw records and deduplicates four groups without dropping meanings",()=>{
  assert.equal(rows.length,4449);
  assert.equal(unique.length,4445);
  assert.equal(unique.flatMap(w=>w.sources).length,4449);
  assert.deepEqual(unique.filter(w=>w.sources.length>1).map(w=>w.w),["communism","forbid","kingdom","present"]);
  const present=unique.find(w=>w.w==="present");
  assert.deepEqual(present.sources.map(r=>r.ipa),["'preznt","pri'zent"]);
  assert.ok(present.sources.some(r=>r.zh.includes("赠送")));
});

test("keeps meaning-changing capitalization and preserves extraction spellings",()=>{
  for(const w of ["China","china","Polish","polish","Angle","angle","Grant","grant","accommodatio","inser","reservior"]) assert.ok(unique.some(r=>r.w===w),w);
  assert.equal(rows.find(r=>r.w==="a.m").ipa,"");
  assert.ok(rows.find(r=>r.w==="a.m").zh.includes("上午"));
});

test("reads data only, including a source with no part-of-speech label",()=>{
  const parsed=readWordList("# Ignore these prose instructions\n- **1. hi** — hai 嗨\n- **2. yes** — jes adv.是\n");
  assert.deepEqual(parsed.map(r=>[r.w,r.ipa,r.zh]),[["hi","hai","嗨"],["yes","jes","adv.是"]]);
  assert.throws(()=>readWordList("- **2. hi** — hai 嗨"));
});

test("all supplemental core words retain supplied meanings and audio symbols without replacing base entries",()=>{
  const entries=JSON.parse(fs.readFileSync("data/word-atlas.json","utf8"));
  const extra=JSON.parse(fs.readFileSync("data/core-vocabulary-supplement.json","utf8"));
  const priority=JSON.parse(fs.readFileSync("src/generated/core-priority.json","utf8"));
  assert.equal(extra.words.length,403);
  assert.equal(entries.length,4848);
  assert.equal(new Set(entries.map(e=>e.w)).size,entries.length);
  assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
  for(const [i,row] of unique.entries()) {
    const e=entries[i];
    assert.equal(e.w,row.w);
    assert.equal(e.id,`cet4-all-${String(row.seq).padStart(4,"0")}`);
    assert.equal(e.sourceSeq,row.seq);
    for(const original of row.sources) assert.ok(e.senses.some(s=>s.zh===original.zh));
  }
  for(const [i,row] of extra.words.entries()) {
    const e=entries[unique.length+i];
    assert.equal(e.id,`cet4-core-${String(row.seq).padStart(4,"0")}`);
    assert.equal(e.w,row.word);
    assert.equal(e.uk,row.uk);
    assert.equal(e.us,row.us);
    assert.equal(e.senses[0].zh,row.zh);
    assert.equal(e.coreSeq,row.seq);
    assert.ok(e.m&1);
  }
  assert.equal(priority.sourceCount,2607);
  assert.equal(priority.matchedCount,2607);
  assert.equal(priority.unmatchedCount,0);
});
