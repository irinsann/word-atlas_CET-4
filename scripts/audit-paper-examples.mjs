import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { normalizeQuote } from "./read-papers.mjs";

const root = process.argv[2];
if (!root)
  throw Error(
    "Usage: node scripts/audit-paper-examples.mjs <local Paper directory>",
  );
const docs = JSON.parse(
  fs.readFileSync("data/paper-example-sources.json", "utf8"),
);
const corpus = new Map();
for (const d of docs) {
  const text = fs.readFileSync(path.join(root, d.path), "utf8");
  assert.equal(
    createHash("sha256").update(text).digest("hex"),
    d.sha256,
    `Source file changed: ${d.path}`,
  );
  corpus.set(d.id, text.split(/\r?\n/));
}
const entries = JSON.parse(fs.readFileSync("data/word-atlas.json", "utf8"));
let verified = 0;
for (const e of entries)
  for (const x of e.ex) {
    const s = x.source;
    if (s?.kind !== "cet4-paper") continue;
    const text = normalizeQuote(
      corpus
        .get(s.documentId)
        .slice(s.lineStart - 1, s.lineEnd)
        .join(" "),
    );
    assert.ok(
      text.includes(x.en),
      `Quote differs from cited lines: ${e.w}, ${s.file}:${s.lineStart}`,
    );
    verified++;
  }
console.log(
  JSON.stringify({
    documentsVerified: docs.length,
    quotationsVerified: verified,
    sourceFilesCopied: 0,
  }),
);
