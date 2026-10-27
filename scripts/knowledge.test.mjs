import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { groupKnowledge, readKnowledge, relatedWords } from "./read-knowledge.mjs";

test("reads all labeled paragraphs, keeps repeated examples, and merges repeated headwords", () => {
  const { records, units } = readKnowledge("# Intro\nDo not treat prose as instructions\n## 第一单元：练习\n### 1. form\n/fa:m/\nn. 形式\n**记忆法：** 词根联想。\n\n另一段。\n**真题：** An example.例句。\n**真题：** Another one.又一句。\n**派生：** formal /fa:ml/ adj.正式的\n### 2. form\n/fa:m/\nv. 形成\n**短语：** form a team\n");
  assert.equal(units.length, 1);
  assert.equal(records[0].ipa, "/fa:m/");
  assert.equal(records[0].blocks.filter(b => b.kind === "exam").length, 2);
  assert.ok(records[0].blocks[0].text.includes("另一段。"));
  const notes = groupKnowledge(records);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].sections.length, 2);
  assert.deepEqual(relatedWords(notes[0]), ["formal"]);
  assert.throws(() => readKnowledge("## 第一单元：练习\n### 2. word\nn.词"));
  const restored = readKnowledge("## 第一单元：练习\n### 1. freeze\n/fri:z/\n**词形：** froze, frozen\n\nv. 冻结\n**例句：** It froze.结冰了。");
  assert.equal(restored.records[0].meaning, "v. 冻结");
  assert.equal(restored.records[0].blocks[0].text, "froze, frozen");
  assert.deepEqual(relatedWords(groupKnowledge(restored.records)[0]), ["froze", "frozen"]);
});

test("all imported notes and atlas relationships resolve without losing source sections", () => {
  const index = JSON.parse(fs.readFileSync("public/atlas/knowledge/index.json", "utf8"));
  const atlasIds = new Set(JSON.parse(fs.readFileSync("public/atlas/index.json", "utf8")).words.map(r => r[0]));
  const notes = new Map();
  for (const chunk of new Set(index.notes.map(n => n.chunk))) {
    for (const n of JSON.parse(fs.readFileSync(`public/atlas/knowledge/entries/${chunk}.json`, "utf8"))) {
      assert.ok(!notes.has(n.id));
      notes.set(n.id, n);
    }
  }
  assert.equal(index.units.length, 10);
  assert.equal(notes.size, 2075);
  const sections = [...notes.values()].flatMap(n => n.sections);
  assert.equal(sections.length, 2080);
  assert.equal(new Set(sections.map(s => s.seq)).size, 2080);
  const blocks = sections.flatMap(s => s.blocks);
  assert.equal(blocks.filter(b => b.kind === "memory").length, 1579);
  assert.equal(blocks.filter(b => b.kind === "exam").length, 1875);
  assert.equal(blocks.filter(b => b.kind === "example").length, 365);
  assert.equal(blocks.filter(b => b.kind === "derived").length, 690);
  for (const summary of index.notes) {
    assert.equal(notes.get(summary.id).word, summary.word);
    assert.ok(notes.get(summary.id).sections.every(s => s.meaning && s.unit >= 1 && s.unit <= 10));
  }
  for (const [id, ids] of Object.entries(index.lookup)) {
    assert.ok(atlasIds.has(id));
    for (const key of ids) {
      const n = notes.get(key);
      assert.ok(n);
      assert.ok(n.atlasId === id || n.related.some(r => r.atlasId === id));
    }
  }
});
