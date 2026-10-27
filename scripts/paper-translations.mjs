import fs from "node:fs";
import { createHash } from "node:crypto";

export const sentenceHash = (en) =>
  createHash("sha256").update(en).digest("hex");

export function reviseTranslations(
  catalog,
  file = "data/paper-self-translation-revisions.json",
) {
  const byHash = new Map(catalog.translations.map((x) => [x.id, x]));
  for (const x of catalog.translations) x.zh = x.zh.trim();
  if (fs.existsSync(file)) {
    const seen = new Set();
    for (const revision of JSON.parse(fs.readFileSync(file, "utf8"))) {
      const id = sentenceHash(revision.en);
      const x = byHash.get(id);
      if (
        !x ||
        x.en !== revision.en ||
        seen.has(id) ||
        !/[\u3400-\u9fff]/.test(revision.zh)
      )
        throw Error(`Invalid / unmatched editorial revision: ${id}`);
      seen.add(id);
      x.zh = revision.zh;
      x.revised = true;
      if (revision.note) x.note = revision.note;
    }
  }
  catalog.review = {
    method: "Consolidated exact-sentence validation and sampled semantic review by Codex",
    revisedQuotes: catalog.translations.filter((x) => x.revised).length,
  };
  return catalog;
}

export function readTranslations(file = "data/paper-translations.json") {
  if (!fs.existsSync(file)) return null;
  const catalog = JSON.parse(fs.readFileSync(file, "utf8"));
  if (
    catalog.version !== 1 ||
    catalog.language !== "zh-CN" ||
    catalog.provider !== "Codex" || catalog.mode !== "assistant" ||
    !Array.isArray(catalog.translations)
  )
    throw Error("Invalid translation catalog");
  reviseTranslations(catalog);
  const byHash = new Map();
  for (const item of catalog.translations) {
    if (
      item.id !== sentenceHash(item.en) ||
      item.method !== "assistant-authored" ||
      byHash.has(item.id) ||
      !/[\u3400-\u9fff]/.test(item.zh) ||
      /\[Q\d+\]|<unk>|▁/i.test(item.zh)
    )
      throw Error(`Invalid / duplicate translation: ${item.id}`);
    byHash.set(item.id, item);
  }
  return { ...catalog, byHash };
}

/** Match the complete immutable English string, never an array index or a word id. */
export function applyPaperTranslations(
  entries,
  catalog,
  requireComplete = false,
) {
  if (catalog && catalog.mode !== "assistant") throw Error("Only directly assistant-authored translations are permitted");
  const pending = [];
  const unique = new Set();
  let count = 0;
  for (const entry of entries)
    for (const x of entry.ex) {
      if (x.source?.kind !== "cet4-paper") continue;
      const hash = sentenceHash(x.en);
      const item = catalog?.byHash.get(hash);
      if (!item || item.en !== x.en) {
        pending.push(hash);
        continue;
      }
      count++;
      unique.add(hash);
    }
  if (requireComplete && pending.length)
    throw Error(
      `Missing translations for ${new Set(pending).size} distinct quotations`,
    );
  for (const entry of entries)
    for (const x of entry.ex) {
      if (x.source?.kind !== "cet4-paper") continue;
      const hash = sentenceHash(x.en);
      const item = catalog?.byHash.get(hash);
      if (!item || item.en !== x.en) continue;
      x.zh = item.zh.trim();
      x.translation = {
        kind: "ai-authored",
        mode: "assistant",
        provider: catalog.provider,
        sentenceHash: hash,
        ...(item.revised ? { revised: true } : {}),
        ...(item.note ? { note: item.note } : {}),
      };
    }
  return { translatedExamples: count, translatedQuotes: unique.size };
}
