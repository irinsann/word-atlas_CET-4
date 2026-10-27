import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import {
  applyPaperTranslations,
  readTranslations,
  sentenceHash,
} from "./paper-translations.mjs";

test("translation matching uses exact sentence hashes and preserves English, sources and media", () => {
  const en = "The library offers easy access to useful information.";
  const id = sentenceHash(en);
  const source = {
    kind: "cet4-paper",
    file: "2020/06/Set-1/paper.md",
    lineStart: 12,
    sha256: "source-file-hash",
  };
  const entries = [
    { id: "a", m: 7, ex: [{ en, zh: "", source: { ...source } }] },
    {
      id: "b",
      m: 7,
      ex: [{ en, zh: "", source: { ...source, lineStart: 18 } }],
    },
    {
      id: "legacy",
      m: 15,
      ex: [
        { en, zh: "保留原项目译文。", source: { kind: "legacy-generated" } },
      ],
    },
  ];
  const catalog = {
    provider: "Test translator",
    mode: "assistant",
    byHash: new Map([
      [id, { en, zh: "这家图书馆让人们能够方便地获取有用的信息。" }],
    ]),
  };
  const original = structuredClone(entries);
  assert.deepEqual(applyPaperTranslations(entries, catalog, true), {
    translatedExamples: 2,
    translatedQuotes: 1,
  });
  assert.deepEqual(entries[0].ex[0].source, source);
  assert.equal(entries[0].ex[0].en, en);
  assert.equal(entries[0].m, 7);
  assert.equal(entries[1].ex[0].source.lineStart, 18);
  assert.equal(entries[0].ex[0].zh, entries[1].ex[0].zh);
  assert.deepEqual(entries[2], original[2]);
  const missing = structuredClone(original);
  assert.throws(
    () =>
      applyPaperTranslations(missing, { ...catalog, byHash: new Map() }, true),
    /Missing translations/,
  );
  assert.deepEqual(
    missing,
    original,
    "Incomplete catalogs must fail before editing entries",
  );
  for (const mode of ["remote", "offline"])
    assert.throws(() => applyPaperTranslations(structuredClone(original), { ...catalog, mode }, true), /Only directly assistant-authored/);
});

test("all real quotations have matching Chinese translations while provenance is retained", () => {
  const catalog = readTranslations();
  assert.equal(catalog.mode, "assistant");
  assert.equal(catalog.provider, "Codex");
  assert.ok(catalog.translations.every(x => x.method === "assistant-authored"));
  assert.equal(catalog.model, undefined);
  assert.ok(
    catalog,
    "Complete translation catalog required before publication",
  );
  const entries = JSON.parse(fs.readFileSync("data/word-atlas.json", "utf8"));
  const report = JSON.parse(
    fs.readFileSync("data/paper-example-import.json", "utf8"),
  );
  const selected = new Map(report.selected.map((x) => [`${x.id}:${x.en}`, x]));
  const translations = new Map();
  let total = 0;
  for (const e of entries)
    for (const x of e.ex) {
      if (x.source?.kind !== "cet4-paper") continue;
      const expected = catalog.byHash.get(sentenceHash(x.en));
      assert.ok(expected);
      assert.equal(x.zh, expected.zh.trim());
      assert.match(x.zh, /[\u3400-\u9fff]/);
      assert.equal(x.translation.sentenceHash, sentenceHash(x.en));
      assert.equal(x.translation.provider, catalog.provider);
      assert.equal(x.translation.kind, "ai-authored");
      assert.equal(x.translation.mode, "assistant");
      const quoted = selected.get(`${e.id}:${x.en}`);
      assert.ok(quoted);
      const { id, word, en, ...source } = quoted;
      assert.deepEqual(x.source, source, `Original source changed: ${e.w}`);
      if (translations.has(x.en)) assert.equal(translations.get(x.en), x.zh);
      translations.set(x.en, x.zh);
      total++;
    }
  assert.equal(total, report.stats.genuineExamples);
  assert.equal(translations.size, 4043);
  assert.equal(catalog.translations.length, 4043);
  const index = JSON.parse(fs.readFileSync("public/atlas/index.json", "utf8"));
  assert.equal(index.translatedExamples, total);
  assert.equal(index.translatedQuotes, translations.size);
});
