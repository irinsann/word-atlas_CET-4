import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { makeWordCatalog } from "./catalog";
import { scopeAtlas, sessionInScope } from "./scope";
import type { Atlas } from "./types";
import { buildSession, todayPlan } from "../store/session";
import { defaultSettings, emptyProgress, sanitizeSettings } from "../store/store";
import { Rating, review } from "../store/srs";

const index=JSON.parse(fs.readFileSync("public/atlas/index.json","utf8"));
const meta=JSON.parse(fs.readFileSync("src/generated/vocabulary-scope.json","utf8"));
const priority=JSON.parse(fs.readFileSync("src/generated/core-priority.json","utf8"));
const catalog=makeWordCatalog(index.words,index.id,priority.wordIds);
const ext=new Set<string>(meta.extensionIds);
catalog.words.forEach(w=>{w.learningScope=ext.has(w.id)?"extension":"cet4";});
const full={id:index.id,words:catalog.words,byId:new Map(catalog.words.map(w=>[w.id,w])),count:catalog.words.length} as Atlas;
const main=scopeAtlas(full,"cet4"), extra=scopeAtlas(full,"extension");

test("every word belongs to exactly one reviewed pool, and current spelling corrections merge duplicate identities",()=>{
  const report=JSON.parse(fs.readFileSync("data/vocabulary-review.json","utf8"));
  assert.equal(report.unmatchedReviewed,305);
  assert.equal(main.count,4558);assert.equal(extra.count,285);
  assert.equal(report.entries.filter((e:{kind:string})=>e.kind==="cet6").length,211);
  assert.equal(report.entries.filter((e:{kind:string})=>e.kind==="outside").length,74);
  assert.equal(new Set([...main.words,...extra.words].map(w=>w.id)).size,full.count);
  assert.ok(extra.words.every(w=>!main.byId.has(w.id)));
  for(const scope of [main,extra])scope.words.forEach((w,i)=>assert.equal(w.order,i));
  assert.ok(main.words.some(w=>w.word==="forbidden"));
  for(const w of ["abnormal","reservoir","astrophysics","remonstrate","heterogeneity","Grant","Angle"])
    assert.ok(extra.words.some(e=>e.word===w),w);
  for(const w of ["accommodatio","inser","recommendati","reservior","systematic(al)","reflexion"])
    assert.ok(full.words.every(e=>e.word!==w),w);
  assert.equal(sanitizeSettings({}).vocabularyScope,"cet4");
  assert.equal(sanitizeSettings({vocabularyScope:"extension"}).vocabularyScope,"extension");
});

test("new words, due reviews, distractors, and explicit practice requests cannot cross learning pools",()=>{
  const p=emptyProgress(full.id);
  for(const w of [...main.words.slice(0,6),...extra.words.slice(0,6)])p.cards[w.id]=review(undefined,Rating.Again,Date.now()-86400000);
  for(const atlas of [main,extra]) {
    const plan=todayPlan(atlas,p,defaultSettings);
    assert.equal(plan.due.length,6);
    assert.ok([...plan.due,...plan.fresh].every(id=>atlas.byId.has(id)));
    for(const options of [undefined,{reviewOnly:true},{newOnly:true},{ids:[main.words[0].id,extra.words[0].id]}]) {
      const session=buildSession(atlas,p,defaultSettings,options);
      assert.ok(sessionInScope(session,atlas));
      const other=atlas===main?extra:main;
      assert.equal(sessionInScope(session,other),false);
      assert.ok(session.steps.every(s=>atlas.byId.has(s.id)&&(!("options" in s)||!s.options||s.options.every(id=>atlas.byId.has(id)))));
    }
  }
});

test("legacy paused sessions containing an extension target or distractor are not resumed in the default pool",()=>{
  const session=buildSession(main,emptyProgress(full.id),defaultSettings);
  delete session.vocabularyScope;
  assert.ok(sessionInScope(session,main));
  session.steps[0]={id:main.words[0].id,kind:"meaning",options:[main.words[0].id,extra.words[0].id]};
  assert.equal(sessionInScope(session,main),false);
  session.steps[0]={id:extra.words[0].id,kind:"intro"};
  assert.equal(sessionInScope(session,main),false);
});
