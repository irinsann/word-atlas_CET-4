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
