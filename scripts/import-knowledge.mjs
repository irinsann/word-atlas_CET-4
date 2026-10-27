import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { readKnowledge, groupKnowledge, relatedWords, wordKey } from "./read-knowledge.mjs";

const input = process.argv[2];
if (!input) throw Error("Usage: node scripts/import-knowledge.mjs <numbered Markdown document>");
const text = fs.readFileSync(input, "utf8");
const { units, records } = readKnowledge(text);
if (units.length !== 10 || records.length !== 2080) throw Error("Expected ten units and 2,080 numbered entries");
const notes = groupKnowledge(records);
const atlas = JSON.parse(fs.readFileSync("public/atlas/index.json", "utf8"));
const exact = new Map(atlas.words.map(r => [r[1], r[0]]));
const folded = new Map();
for (const row of atlas.words) {
  const key = wordKey(row[1]);
  folded.set(key, [...(folded.get(key) ?? []), row[0]]);
}
const match = word => exact.get(word) ?? (folded.get(wordKey(word))?.length === 1 ? folded.get(wordKey(word))[0] : undefined);
const lookup = {};
const add = (word, noteId) => {
  const id = match(word);
  if (id) lookup[id] = [...new Set([...(lookup[id] ?? []), noteId])];
  return id;
};
for (const note of notes) {
  note.atlasId = add(note.word, note.id);
  note.related = relatedWords(note).map(word => ({ word, atlasId: add(word, note.id) }));
}
const stats = {
  sourceEntries: records.length,
  notes: notes.length,
  matchedMainWords: notes.filter(n => n.atlasId).length,
  linkedAtlasWords: Object.keys(lookup).length,
  memoryNotes: records.reduce((n, r) => n + r.blocks.filter(b => b.kind === "memory").length, 0),
  examExamples: records.reduce((n, r) => n + r.blocks.filter(b => b.kind === "exam").length, 0),
  examples: records.reduce((n, r) => n + r.blocks.filter(b => b.kind === "example").length, 0),
  derivatives: records.reduce((n, r) => n + r.blocks.filter(b => b.kind === "derived").length, 0),
};
const chunkSize = 100;
const index = {
  title: "英语四级，你还在背单词吗？",
  source: path.basename(input),
  sourceSha256: createHash("sha256").update(text).digest("hex"),
  revision: createHash("sha256").update(JSON.stringify(notes)).digest("hex").slice(0, 12),
  stats, units, lookup,
  notes: notes.map((n, i) => ({
    id: n.id, word: n.word, atlasId: n.atlasId, chunk: Math.floor(i / chunkSize),
    meaning: n.sections[0].meaning,
    related: n.related.map(r => r.word),
    units: [...new Set(n.sections.map(s => s.unit))],
    methods: [...new Set(n.sections.flatMap(s => s.methods))],
  })),
};
fs.mkdirSync("public/atlas/knowledge/entries", { recursive: true });
fs.mkdirSync("src/generated", { recursive: true });
for (let i = 0; i < notes.length; i += chunkSize) {
  fs.writeFileSync(`public/atlas/knowledge/entries/${Math.floor(i / chunkSize)}.json`, JSON.stringify(notes.slice(i, i + chunkSize)));
}
fs.writeFileSync("public/atlas/knowledge/index.json", JSON.stringify(index));
fs.writeFileSync("src/generated/knowledge-summary.json", JSON.stringify({ title: index.title, ...stats }, null, 2) + "\n");
fs.writeFileSync("data/knowledge-import.json", JSON.stringify({ source: index.source, sourceSha256: index.sourceSha256, stats, unmatched: notes.filter(n => !n.atlasId).map(n => ({ word: n.word, id: n.id })), merges: notes.filter(n => n.sections.length > 1).map(n => ({ word: n.word, seq: n.sections.map(s => s.seq) })) }, null, 2) + "\n");
console.log(JSON.stringify(stats, null, 2));
