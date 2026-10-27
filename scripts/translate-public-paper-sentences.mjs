/** Explicit, resumable translation of verified public quotations only.
 * Local source papers, file paths and user data are never sent to the service.
 */
import fs from "node:fs";
import { sentenceHash, reviseTranslations } from "./paper-translations.mjs";

if (!process.argv.includes("--google"))
  throw Error(
    "Explicit --google flag required; normal builds never call a translation service",
  );
const manifest = JSON.parse(
  fs.readFileSync("output/public-paper-sentences.json", "utf8"),
);
if (
  manifest.kind !== "verified-public-atlas-quotes" ||
  manifest.repo !== "irinsann/word-atlas_CET-4"
)
  throw Error("Verified public input is required");
const all = manifest.quotes;
if (all.some((x) => x.id !== sentenceHash(x.en)))
  throw Error("Input hash mismatch");
const journal = "output/paper-translations-google.jsonl";
const done = new Map(
  fs.existsSync(journal)
    ? fs
        .readFileSync(journal, "utf8")
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          const x = JSON.parse(line);
          return [x.id, x];
        })
    : [],
);
const todo = all.map((x, i) => ({ ...x, n: i })).filter((x) => !done.has(x.id));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const batches = [];
let batch = [],
  length = 0;
for (const x of todo) {
  if (length + x.en.length + 12 > 3200 && batch.length) {
    batches.push(batch);
    batch = [];
    length = 0;
  }
  batch.push(x);
  length += x.en.length + 12;
}
if (batch.length) batches.push(batch);
let cursor = 0,
  lastReport = done.size;
console.log(
  JSON.stringify({
    uniqueSentences: all.length,
    remaining: todo.length,
    batches: batches.length,
  }),
);

async function translate(items) {
  const q = items
    .map((x) => `[Q${String(x.n).padStart(5, "0")}] ${x.en}`)
    .join("\n");
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  for (const [k, v] of Object.entries({
    client: "gtx",
    sl: "en",
    tl: "zh-CN",
    dt: "t",
    q,
  }))
    url.searchParams.set(k, v);
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) {
          await sleep(Math.min(60000, 3000 * 2 ** attempt));
          continue;
        }
        throw Error(`Translation service HTTP ${res.status}`);
      }
      const response = await res.json();
      const text = response[0].map((row) => row[0] ?? "").join("");
      const markers = [...text.matchAll(/\[\s*Q\s*(\d{5})\s*\]/g)];
      if (
        markers.length !== items.length ||
        markers.some((m, i) => Number(m[1]) !== items[i].n)
      )
        throw Error("Translation markers lost or reordered");
      return markers.map((m, i) => {
        const zh = text
          .slice(m.index + m[0].length, markers[i + 1]?.index ?? text.length)
          .replace(/\s+/g, " ")
          .trim();
        if (!/[\u3400-\u9fff]/.test(zh) || /\[Q\d+/i.test(zh))
          throw Error("Empty / unmatched translation");
        return { id: items[i].id, en: items[i].en, zh };
      });
    } catch (error) {
      if (/HTTP (?:400|401|403)/.test(String(error))) throw error;
      if (attempt === 5) {
        if (items.length > 1) {
          const out = [];
          for (const item of items) {
            out.push(...(await translate([item])));
            await sleep(700);
          }
          return out;
        }
        throw error;
      }
      await sleep(Math.min(15000, 1500 * 2 ** attempt));
    }
  }
  throw Error(
    "Translation service rate limit / availability retries exhausted; resume later",
  );
}

async function worker() {
  while (cursor < batches.length) {
    const items = batches[cursor++];
    const result = await translate(items);
    fs.appendFileSync(
      journal,
      result.map((x) => JSON.stringify(x)).join("\n") + "\n",
    );
    result.forEach((x) => done.set(x.id, x));
    if (done.size - lastReport >= 200 || done.size === all.length) {
      lastReport = done.size;
      console.log(JSON.stringify({ completed: done.size, total: all.length }));
    }
    await sleep(1000);
  }
}
await Promise.all([worker(), worker()]);
if (all.some((x) => !done.has(x.id)))
  throw Error("Incomplete translation journal");
const catalog = {
  version: 1,
  language: "zh-CN",
  provider: "Google Translate",
  method:
    "machine translation with selected editorial revisions; not official exam translations",
  generatedAt: new Date().toISOString(),
  publicInputRevision: manifest.publicRevision,
  translations: all.map((x) => done.get(x.id)),
};
fs.writeFileSync(
  "data/paper-translations.json",
  JSON.stringify(reviseTranslations(catalog), null, 1),
);
console.log("Complete catalog written; review before applying to the atlas.");
