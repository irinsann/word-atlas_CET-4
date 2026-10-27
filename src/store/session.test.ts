import assert from "node:assert/strict";
import { test } from "node:test";
import type { Atlas, WordRef } from "../atlas/types";
import { nextNew, todayPlan, buildSession } from "./session";
import { defaultSettings, dayKey, emptyProgress, sanitizeSettings, sanitizeProgress } from "./store";
import { review, Rating } from "./srs";

const words:WordRef[]=Array.from({length:60},(_,i)=>({id:`all-${i}`,word:`word${i}`,zh:`释义${i}`,ipa:"",cefr:i%6,topic:0,media:0,order:i}));
const atlas={id:"word-atlas-cet4-words-all-v1",words,byId:new Map(words.map(w=>[w.id,w]))} as Atlas;

test("a fresh round follows the current catalog order and is not limited by words already studied today",()=>{
  const p=emptyProgress(atlas.id);
  p.days[dayKey()]={n:400,r:400,c:400,t:2000};
  p.cards[words[0].id]=review(undefined,Rating.Good,Date.now());
  const plan=todayPlan(atlas,p,{...defaultSettings,roundNew:20,startLevel:5});
  assert.equal(plan.fresh.length,20);
  assert.equal(plan.fresh[0],words[1].id);
  assert.equal(nextNew(atlas,p,10).length,10);
});

test("new-only and review-only choices build independent sessions",()=>{
  const p=emptyProgress(atlas.id);
  const card=review(undefined,Rating.Good,Date.now());
  p.cards[words[0].id]={...card,due:0};
  const fresh=buildSession(atlas,p,defaultSettings,{newOnly:true});
  assert.equal(fresh.reviewIds.length,0);
  assert.equal(fresh.newIds.length,10);
  assert.ok(fresh.steps.slice(0,10).every(s=>s.kind==="intro"));
  const due=buildSession(atlas,p,defaultSettings,{reviewOnly:true});
  assert.equal(due.newIds.length,0);
  assert.deepEqual(due.reviewIds,[words[0].id]);
});

test("old day allocations are dropped while preferences remain valid",()=>{
  const settings=sanitizeSettings({planDay:14,dailyNew:200,roundNew:20,accent:"us"});
  assert.equal(settings.roundNew,20);
  assert.equal(settings.accent,"us");
  assert.ok(!("planDay" in settings));
  assert.ok(!("dailyNew" in settings));
  const p=sanitizeProgress({...emptyProgress(atlas.id),planReviews:{14:["old"]}},atlas.id);
  assert.ok(!("planReviews" in p));
});
