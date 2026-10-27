import assert from "node:assert/strict";
import { test } from "node:test";
import type { IndexRow } from "./types";
import { makeWordCatalog } from "./catalog";

const rows: IndexRow[] = Array.from({ length: 240 }, (_, i) => [`word-${i}`, `word${i}`, `释义${i}`, "", 0, 0, 1, i + 1]);

test("mixed order retains every word exactly once and remains stable across reloads", () => {
  const a = makeWordCatalog(rows, "test");
  const b = makeWordCatalog(rows, "test");
  assert.notDeepEqual(a.words.map(w => w.id), rows.map(r => r[0]));
  assert.deepEqual(a.words.map(w => w.id), b.words.map(w => w.id));
  assert.equal(new Set(a.words.map(w => w.id)).size, rows.length);
  assert.equal(rows[0][0], "word-0");
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
