import fs from "node:fs";
import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const entries = read("data/word-atlas.json"),
  review = read("data/lexical-review.json"),
  index = read("public/atlas/index.json");
test("whole-library lexical review covers every ID while preserving raw rows, examples, scope and media", () => {
  assert.equal(review.entries.length, entries.length);
  for (const e of entries) {
    const r = review.entries.find((r) => r.id === e.id);
    assert.ok(r, e.id);
    const immutable = {
      id: e.id,
      w: e.w,
      sourceRows: e.sourceRows,
      ex: e.ex,
      learning: e.learning,
      m: e.m,
      media: e.media,
      coreSeq: e.coreSeq,
    };
    assert.equal(
      createHash("sha256").update(JSON.stringify(immutable)).digest("hex"),
      r.immutableHash,
      e.w,
    );
    for (const accent of ["uk", "us"])
      assert.ok(
        e[accent] && e[accent] !== "-" && !/[\u4e00-\u9fff]/.test(e[accent]),
        e.w + accent,
      );
    assert.ok(
      e.senses.some(
        (s) =>
          s.pos ||
          /\b(?:adj|adv|prep|conj|pron|aux|art|int|interj|num|abbr|modal|det|vt|vi|v|n)\./.test(
            s.zh,
          ),
      ),
      e.w,
    );
    const row = index.words.find((r) => r[0] === e.id);
    assert.equal(row[3], e.uk, e.w);
    assert.equal(
      row[2],
      e.senses.map((s) => [s.pos, s.zh].filter(Boolean).join(" ")).join("；"),
      e.w,
    );
  }
});
test("specific corrupt readings, wrong parts of speech and heteronyms remain fixed", () => {
  const byWord = new Map(entries.map((e) => [e.w, e]));
  assert.equal(byWord.get("Polish").uk, "/ˈpəʊlɪʃ/");
  assert.equal(byWord.get("teenager").uk, "/ˈtiːneɪdʒə/");
  assert.ok(byWord.get("cycle").senses[0].zh.includes("n. 周期"));
  assert.ok(byWord.get("hospitalize").senses[0].zh.includes("送……住院"));
  assert.ok(byWord.get("statistic").senses[0].zh.includes("一项统计数据"));
  assert.equal(byWord.get("work").us, "/wɜːrk/");
  assert.equal(byWord.get("lead").pronunciations[1].uk, "/led/");
  assert.equal(
    entries.filter((e) => e.pronunciations).length,
    review.stats.readingGuides,
  );
});
