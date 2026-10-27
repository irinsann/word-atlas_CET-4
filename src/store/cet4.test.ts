import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import type { Atlas, IndexRow, WordRef } from "../atlas/types";
import { cet4Plan, dayWords } from "./cet4";
import { buildSession } from "./session";
import { defaultSettings, emptyProgress, sanitizeProgress, sanitizeSettings } from "./store";

const index = JSON.parse(fs.readFileSync("public/atlas/index.json", "utf8"));
const words: WordRef[] = index.words.map((r: IndexRow, order: number) => ({id:r[0],word:r[1],zh:r[2],ipa:r[3],cefr:r[4],topic:r[5],media:r[6],order}));
const atlas = {id:"word-atlas-cet4", words, byId:new Map(words.map(w => [w.id,w]))} as Atlas;

test("14 days cover every source number once and review exactly the previous day's list", () => {
  const days = Array.from({length:14}, (_,i) => dayWords(atlas,i+1));
  assert.deepEqual(days.map(d => d.fresh.length), [...Array(12).fill(200),207,0]);
  assert.deepEqual(days.map(d => d.review.length), [0,...Array(12).fill(200),207]);
  assert.deepEqual(days.flatMap(d => d.fresh.map(w => w.order)), Array.from({length:2607},(_,i)=>i));
  for(let i=1;i<14;i++) assert.deepEqual(days[i].review,days[i-1].fresh);
});

test("sessions keep all 207 final reviews, even for words without an existing memory card", () => {
  const p=emptyProgress(atlas.id);
  const s=buildSession(atlas,p,{...defaultSettings,planDay:14});
  assert.equal(s.reviewIds.length,207);
  assert.equal(s.newIds.length,0);
  assert.equal(s.steps.length,207);
  assert.equal(s.steps[0].id,"cet4-2401");
  assert.equal(s.steps.at(-1)?.id,"cet4-2607");
  assert.ok(s.steps.every(step => step.kind!=="intro"));
});

test("yesterday is reviewed first and new words are introduced in groups of ten", () => {
  const s=buildSession(atlas,emptyProgress(atlas.id),{...defaultSettings,planDay:2});
  assert.equal(s.reviewIds.length,200);
  assert.equal(s.newIds.length,200);
  assert.ok(s.steps.slice(0,200).every(step=>step.kind!=="intro"));
  assert.ok(s.steps.slice(200,210).every(step=>step.kind==="intro"));
  assert.ok(s.steps.slice(210,220).every(step=>step.kind!=="intro"));
  assert.deepEqual(s.steps.slice(200,210).map(step=>step.id),words.slice(200,210).map(w=>w.id));
  assert.equal(s.planDay,2);
});

test("day selection and completed review words survive sanitized persistence without affecting other days", () => {
  const p=sanitizeProgress({...emptyProgress(atlas.id),planReviews:{14:["cet4-2401","cet4-2401",7],99:["bad"]}},atlas.id);
  assert.deepEqual(p.planReviews,{14:["cet4-2401"]});
  assert.equal(cet4Plan(atlas,p,14).due.length,206);
  assert.equal(cet4Plan(atlas,p,14).done,1);
  assert.equal(cet4Plan(atlas,p,2).due.length,200);
  assert.equal(sanitizeSettings({planDay:14}).planDay,14);
  assert.equal(sanitizeSettings({planDay:99}).planDay,1);
});
