import fs from "node:fs";
import path from "node:path";
import { sentenceHash, reviseTranslations } from "./paper-translations.mjs";

// Checkpoints contain direct model-authored translations, never API/model drafts.
const directory = process.argv[2] ?? "output/self-translations";
const entries = JSON.parse(fs.readFileSync("data/word-atlas.json", "utf8"));
const wanted = [...new Set(entries.flatMap(e => e.ex.filter(x => x.source?.kind === "cet4-paper").map(x => x.en)))];
const expected = new Set(wanted);
const found = new Map();
for (const file of fs.readdirSync(directory).filter(f => f.endsWith(".json")).sort()) {
  const batch = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
  if (!Array.isArray(batch)) throw Error(`Invalid checkpoint: ${file}`);
  for (const x of batch) {
    if (!expected.has(x.en) || x.id !== sentenceHash(x.en) || found.has(x.en) || x.method !== "assistant-authored" || typeof x.zh !== "string" || !/[\u3400-\u9fff]/.test(x.zh) || /<unk>|▁|\[Q\d+\]/i.test(x.zh))
      throw Error(`Invalid / duplicate translation in ${file}: ${x.id}`);
    found.set(x.en, {id:x.id, en:x.en, zh:x.zh.trim(), method:x.method});
  }
}
const missing = wanted.filter(en => !found.has(en));
if (missing.length) throw Error(`Incomplete: ${found.size}/${wanted.length}; missing ${missing.length}. Catalog has not been changed.`);
const catalog = reviseTranslations({
  version: 1,
  language: "zh-CN",
  provider: "Codex",
  mode: "assistant",
  method: "Direct translation of each English quotation by same-level Codex models, followed by consolidated checks and sampled review; no translation API or local small-model drafts used. Not official exam translations.",
  generatedAt: new Date().toISOString(),
  translations: wanted.map(en => found.get(en)),
});
fs.writeFileSync("data/paper-translations.json", JSON.stringify(catalog, null, 1));
console.log(JSON.stringify({translatedQuotes:catalog.translations.length, reviewedRevisions:catalog.review.revisedQuotes}));
