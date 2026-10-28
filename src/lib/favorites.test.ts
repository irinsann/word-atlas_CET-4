import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalBookmarks, csvCell, exportFavorites } from "./favorites";
import type { Entry } from "../atlas/types";
const entry: Entry = {
  id: "test-word",
  w: "lead",
  uk: "/liːd/; /led/",
  us: "/liːd/; /led/",
  senses: [{ pos: "n.", zh: "铅；领先", en: "" }],
  ex: [
    {
      en: 'A "lead", for example.\nA second line.',
      zh: "这是“铅”。",
      source: {
        kind: "cet4-paper",
        documentId: "paper",
        file: "paper.md",
        year: 2020,
        month: 12,
        set: 1,
        part: "reading",
        section: "C",
        passage: "Passage One",
        paragraph: "2",
        lineStart: 12,
        lineEnd: 14,
        sha256: "abc",
        matchedForm: "lead",
      },
    },
  ],
  col: [],
  fam: [],
  syn: [],
  ant: [],
  tip: "",
  cefr: "B1",
  topic: "",
  m: 0,
  learning: { scope: "extension", kind: "cet6", label: "六级词", reason: "" },
  pronunciations: [{ label: "n. 铅", uk: "/led/", us: "/led/" }],
  note: "区分词义。",
};
test("old bookmark aliases collapse without changing newest-first order", () => {
  assert.deepEqual(
    canonicalBookmarks(["cet4-core-0942", "x", "cet4-all-0030", "x"]),
    ["cet4-all-0030", "x"],
  );
});
test("CSV preserves Unicode, multiline quotes, provenance and polysemy; neutralizes formulas", () => {
  const out = exportFavorites([entry], "csv");
  assert.ok(out.startsWith("\uFEFF"));
  assert.ok(out.includes('"A ""lead"", for example.\nA second line."'));
  assert.ok(out.includes("2020年12月四级第1套"));
  assert.ok(out.includes("paper.md:12–14"));
  assert.ok(out.includes("扩展词库 · 六级词"));
  assert.ok(out.includes("n. 铅：英 /led/；美 /led/"));
  for (const s of ["=1+1", " +cmd", "\t@SUM(1)", "\r-1", "\uFEFF=2"])
    assert.ok(csvCell(s).startsWith("\"'"), s);
});
test("Markdown retains citations, use notes and word-card links, escaping markup", () => {
  const out = exportFavorites(
    [{ ...entry, w: "*lead*" }],
    "md",
    new Date("2026-10-28T00:00:00Z"),
  );
  assert.ok(out.includes("## 1. \\*lead\\*"));
  assert.ok(out.includes("出处：2020年12月四级第1套"));
  assert.ok(out.includes("用法：区分词义。"));
  assert.ok(out.includes("https://words.irin.im/#/atlas?w=test-word"));
  assert.ok(out.includes("分义读音："));
});
