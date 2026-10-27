import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { headwordForms, headwordPattern } from "../src/lib/text.ts";
import { readPaper, normalizeQuote } from "./read-papers.mjs";
import {
  readTranslations,
  applyPaperTranslations,
} from "./paper-translations.mjs";

// Read the corpus in place. Only selected quotations and provenance are written;
// no source paper, full paragraph, or audio file is copied into the website.
const input = process.argv[2];
if (!input)
  throw Error(
    "Usage: node --import tsx scripts/import-paper-examples.mjs <local Paper directory>",
  );
const root = path.resolve(input);
const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, e.name);
    if (e.isDirectory()) walk(file);
    else if (e.isFile() && file.endsWith(".md")) files.push(file);
  }
}
walk(root);
files.sort();
const documents = [];
const candidates = [];
for (const file of files) {
  const parsed = readPaper(
    fs.readFileSync(file, "utf8"),
    path.relative(root, file),
  );
  documents.push(parsed.document);
  candidates.push(...parsed.candidates);
}
if (!documents.length || !candidates.length)
  throw Error("No usable source documents / sentences");
const inverted = new Map();
for (const [i, c] of candidates.entries()) {
  const tokens = new Set(
    (c.en.toLowerCase().match(/[a-z]+(?:[-'’][a-z]+)*/g) ?? []).map((t) =>
      t.replaceAll("’", "'"),
    ),
  );
  for (const t of tokens) {
    if (!inverted.has(t)) inverted.set(t, []);
    inverted.get(t).push(i);
  }
}
const entries = JSON.parse(fs.readFileSync("data/word-atlas.json", "utf8"));
let replacedWords = 0;
let genuineExamples = 0;
const unmatched = [];
const selected = [];
const seenQuotes = new Set();
for (const entry of entries) {
  const pool = new Set();
  for (const form of headwordForms(entry.w)) {
    for (const i of inverted.get(form.toLowerCase().split(/\s+/)[0]) ?? [])
      pool.add(i);
  }
  const pattern = headwordPattern(entry.w);
  const matches = [...pool]
    .flatMap((i) => {
      const c = candidates[i];
      const match = pattern.exec(c.en);
      if (!match) return [];
      const wc = c.en.match(/[A-Za-z]+/g).length;
      let score =
        40 -
        Math.abs(wc - 18) +
        (match[0].toLowerCase() === entry.w.toLowerCase() ? 14 : 0);
      score += c.source.part === "reading" ? 8 : 0;
      score += Math.min(8, Math.max(0, c.source.year - 2016));
      if (
        /^(?:But|And|So|This|That|These|Those|It|They|He|She|Well|Yeah|Yes|No)\b/i.test(
          c.en,
        )
      )
        score -= 9;
      if (/[\u4e00-\u9fff]/.test(c.en)) score -= 8;
      if (/\b(?:said|says|told)\b/i.test(c.en)) score -= 2;
      return [{ ...c, score, matchedForm: match[0] }];
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.source.year - a.source.year ||
        a.source.file.localeCompare(b.source.file) ||
        a.source.lineStart - b.source.lineStart,
    );
  const chosen = [];
  for (const c of matches) {
    if (chosen.some((x) => normalizeQuote(x.en) === normalizeQuote(c.en)))
      continue;
    if (chosen.length && chosen[0].source.documentId === c.source.documentId)
      continue;
    chosen.push(c);
    if (chosen.length === 2) break;
  }
  if (chosen.length) {
    entry.ex = chosen.map((c) => ({
      en: c.en,
      zh: "",
      source: { ...c.source, matchedForm: c.matchedForm },
    }));
    entry.m &= ~24;
    replacedWords++;
    genuineExamples += entry.ex.length;
    for (const c of chosen) {
      selected.push({
        id: entry.id,
        word: entry.w,
        en: c.en,
        ...c.source,
        matchedForm: c.matchedForm,
      });
      seenQuotes.add(c.en);
    }
  } else {
    entry.ex = entry.ex
      .filter((x) => x.source?.kind !== "cet4-paper")
      .map((x) => ({
        ...x,
        source: {
          kind: "legacy-generated",
          label: "原 Word Atlas 学习示例，未在本次真题库中核验",
        },
      }));
    unmatched.push({
      id: entry.id,
      word: entry.w,
      retainedExamples: entry.ex.length,
    });
    if (!entry.ex.length) entry.m &= ~24;
  }
  if (entry.ex[0] && pattern.test(entry.ex[0].en)) entry.m |= 32;
  else entry.m &= ~32;
}
const translationStats = applyPaperTranslations(entries, readTranslations());
const index = JSON.parse(fs.readFileSync("public/atlas/index.json", "utf8"));
Object.assign(index, translationStats);
if (
  index.words.length !== entries.length ||
  entries.some((e, i) => index.words[i][0] !== e.id)
)
  throw Error("Atlas identities / source order changed");
index.words.forEach((r, i) => {
  r[6] = entries[i].m;
});
index.examples = entries.reduce((n, e) => n + e.ex.length, 0);
index.exampleRevision = createHash("sha256")
  .update(JSON.stringify(entries))
  .digest("hex")
  .slice(0, 12);
const stats = {
  documents: documents.length,
  papers: documents.filter((d) => d.kind === "paper").length,
  transcripts: documents.filter((d) => d.kind === "listening").length,
  candidates: candidates.length,
  words: entries.length,
  replacedWords,
  genuineExamples,
  uniqueQuotes: seenQuotes.size,
  unmatchedWords: unmatched.length,
  legacyExamples: entries.reduce(
    (n, e) =>
      n + e.ex.filter((x) => x.source?.kind === "legacy-generated").length,
    0,
  ),
  wordsWithoutExamples: entries.filter((e) => !e.ex.length).length,
  ...translationStats,
};
index.realExamples = genuineExamples;
index.realExampleWords = replacedWords;
fs.writeFileSync(
  "data/paper-example-sources.json",
  JSON.stringify(
    documents.map(({ lines, ...metadata }) => metadata),
    null,
    1,
  ),
);
fs.writeFileSync("data/word-atlas.json", JSON.stringify(entries, null, 1));
fs.writeFileSync("public/atlas/index.json", JSON.stringify(index));
for (let i = 0; i < entries.length; i += index.chunk)
  fs.writeFileSync(
    `public/atlas/entries/${i / index.chunk}.json`,
    JSON.stringify(entries.slice(i, i + index.chunk)),
  );
fs.writeFileSync(
  "data/paper-example-import.json",
  JSON.stringify(
    {
      source:
        "Paper (user-provided Markdown corpus; source files remain local)",
      stats,
      unmatched,
      selected,
    },
    null,
    1,
  ),
);
fs.writeFileSync(
  "src/generated/paper-summary.json",
  JSON.stringify(stats, null, 2) + "\n",
);
console.log(JSON.stringify(stats, null, 2));
