import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const file = process.argv[2];
const reportFile = "data/core-priority-import.json";
let source;
let rows;
if (file) {
  const text = fs.readFileSync(file, "utf8");
  // Only read numbered vocabulary table rows; document prose is not instructions.
  rows = [...text.matchAll(/^\|\s*(\d+)\s*\|\s*\*\*(.+?)\*\*\s*\|/gm)]
    .map(m => ({ seq: Number(m[1]), word: m[2].trim() }));
  source = {
    file: path.basename(file),
    sha256: createHash("sha256").update(text).digest("hex"),
    attribution: "The supplied vocabulary document credits RealKai42/qwerty-learner.",
    url: "https://github.com/RealKai42/qwerty-learner",
  };
} else {
  const previous = JSON.parse(fs.readFileSync(reportFile, "utf8"));
  ({ source, rows } = previous);
}
if (rows.length !== 2607 || rows.some((r, i) => r.seq !== i + 1) || new Set(rows.map(r => r.word)).size !== rows.length)
  throw Error("Expected exactly 2,607 unique, consecutively numbered vocabulary rows");

const index = JSON.parse(fs.readFileSync("public/atlas/index.json", "utf8"));
const byWord = new Map(index.words.map(r => [r[1], r[0]]));
if (fs.existsSync("data/vocabulary-review.json")) {
  for (const {from,to} of JSON.parse(fs.readFileSync("data/vocabulary-review.json","utf8")).corrections)
    if (byWord.has(to)) byWord.set(from,byWord.get(to));
}
const matched = rows.filter(r => byWord.has(r.word)).map(r => ({ ...r, id: byWord.get(r.word) }));
const unmatched = rows.filter(r => !byWord.has(r.word));
const summary = {
  datasetId: index.id,
  sourceCount: rows.length,
  matchedCount: matched.length,
  unmatchedCount: unmatched.length,
  wordIds: matched.map(r => r.id),
};
fs.writeFileSync("src/generated/core-priority.json", JSON.stringify(summary, null, 2) + "\n");
fs.writeFileSync(reportFile, JSON.stringify({
  source, rows,
  matching: "Exact headword matching, preserving capitalization; no synonym or derived-word substitutions.",
  order: "Matched entries first; retain the existing stable shuffled order within each group.",
  sourceCount: rows.length, matchedCount: matched.length, unmatchedCount: unmatched.length,
  matched, unmatched,
}, null, 2) + "\n");
console.log(JSON.stringify({ sourceCount: rows.length, matchedCount: matched.length, unmatchedCount: unmatched.length }));
