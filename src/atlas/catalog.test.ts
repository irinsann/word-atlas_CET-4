import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import type { IndexRow } from "./types";
import { makeWordCatalog } from "./catalog";
import type { Atlas } from "./types";
import { nextNew } from "../store/session";
import { emptyProgress } from "../store/store";
import { review, Rating } from "../store/srs";

const rows: IndexRow[] = Array.from({ length: 240 }, (_, i) => [`word-${i}`, `word${i}`, `释义${i}`, "", 0, 0, 1, i + 1]);

test("mixed order retains every word exactly once and remains stable across reloads", () => {
  const a = makeWordCatalog(rows, "test");
  const b = makeWordCatalog(rows, "test");
  assert.notDeepEqual(a.words.map(w => w.id), rows.map(r => r[0]));
  assert.deepEqual(a.words.map(w => w.id), b.words.map(w => w.id));
  assert.equal(new Set(a.words.map(w => w.id)).size, rows.length);
  assert.equal(rows[0][0], "word-0");
});

test("priority words come first without reshuffling either group or changing file locations", () => {
  const ids = ["word-9", "word-24", "word-177", "word-9", "not-in-this-dataset"];
  const priority = new Set(ids);
  const original = makeWordCatalog(rows, "test");
  const ordered = makeWordCatalog(rows, "test", ids);
  const expected = [...original.words.filter(w => priority.has(w.id)), ...original.words.filter(w => !priority.has(w.id))];
  assert.deepEqual(ordered.words.map(w => w.id), expected.map(w => w.id));
  assert.deepEqual(ordered.sourcePositions, original.sourcePositions);
  assert.deepEqual(ordered.words.map(w => w.id), makeWordCatalog(rows, "test", ids).words.map(w => w.id));
  assert.equal(new Set(ordered.words.map(w => w.id)).size, rows.length);
  for (const [i, word] of ordered.words.entries()) {
    assert.equal(word.order, i);
    assert.equal(rows[ordered.sourcePositions.get(word.id)!][1], word.word);
  }
});

test("the supplied core list covers the entire priority prefix and fresh sessions skip learned core words", () => {
  const index = JSON.parse(fs.readFileSync("public/atlas/index.json", "utf8"));
  const priority = JSON.parse(fs.readFileSync("src/generated/core-priority.json", "utf8"));
  const report = JSON.parse(fs.readFileSync("data/core-priority-import.json", "utf8"));
  const { words, sourcePositions } = makeWordCatalog(index.words, index.id, priority.wordIds);
  const core = new Set<string>(priority.wordIds);
  assert.equal(priority.datasetId, index.id);
  assert.equal(priority.sourceCount, 2607);
  assert.equal(priority.matchedCount + priority.unmatchedCount, 2607);
  assert.equal(core.size, priority.matchedCount);
  assert.ok(words.slice(0, core.size).every(w => core.has(w.id)));
  assert.ok(words.slice(core.size).every(w => !core.has(w.id)));
  assert.deepEqual(report.matched.map((r: {id: string}) => r.id), priority.wordIds);
  const reviewReport = JSON.parse(fs.readFileSync("data/vocabulary-review.json", "utf8"));
  const corrected = new Map<string, string>(reviewReport.corrections.map((c: {from:string;to:string}) => [c.from,c.to]));
  const supplied = new Set(report.rows.map((r: {word: string}) => corrected.get(r.word) ?? r.word));
  assert.ok(words.every(w => core.has(w.id) === supplied.has(w.word)));
  for (const word of words) assert.equal(index.words[sourcePositions.get(word.id)!][1], word.word);
  const atlas = {id:index.id, words, byId:new Map(words.map(w => [w.id, w]))} as Atlas;
  const progress = emptyProgress(atlas.id);
  progress.cards[words[0].id] = review(undefined, Rating.Good, Date.now());
  assert.deepEqual(nextNew(atlas, progress, 20), words.slice(1, 21).map(w => w.id));
  assert.ok(nextNew(atlas, progress, 20).every(id => core.has(id)));
});

test("a shuffled position never changes the source chunk or the identity of a word", () => {
  const { words, sourcePositions } = makeWordCatalog(rows, "test");
  for (const [i, word] of words.entries()) {
    const source = sourcePositions.get(word.id)!;
    assert.equal(word.order, i);
    assert.equal(rows[source][0], word.id);
    assert.equal(rows[source][1], word.word);
    assert.equal(rows[source][2], word.zh);
    assert.equal(rows[source][7], word.sourceSeq);
    assert.equal(Math.floor(source / 100), Math.floor(Number(word.id.split("-")[1]) / 100));
    if (i < words.length - 1) assert.notEqual(words[word.order + 1].id, word.id);
  }
});
