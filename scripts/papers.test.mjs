import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import {
  readPaper,
  normalizeQuote,
  sentenceSpans,
  isUsableSentence,
} from "./read-papers.mjs";
import { headwordPattern } from "../src/lib/text.ts";

test("extracts complete reading sentences, excludes directions, options, gaps and writing", () => {
  const text = [
    "# Test",
    "## Part I Writing",
    "Writing is an essential skill for students to develop.",
    "## Part III Reading Comprehension",
    "### Section A",
    "Directions: Select the best answer from the word bank.",
    "A) abandon",
    "Many people prefer to __26__ their time at home.",
    "I've learned to ski at 40, and flown up the Rhine River in a 55.",
    "### Section B",
    "A) Modern libraries provide people with access to many valuable resources. Students can borrow useful books and study in a quiet environment.",
    "36. Students can borrow useful books at the library.",
    "### Section C",
    "Passage One",
    "Mr. Chan has decided to visit the library this afternoon.",
    "Students need access to accurate information",
    "when they are working on a research project.",
    "46. What does the author suggest in this passage?",
    "A) Students should be able to access more useful resources.",
    "[C] Help it to obtain financial support from industry.",
    "## Part IV Translation",
    "Translation is a useful exercise for language learners.",
  ].join("\n");
  const { document, candidates } = readPaper(
    text,
    "2025/12/Set-1/2025-12-Set1_试卷.md",
  );
  assert.equal(candidates.length, 4);
  assert.equal(candidates[0].source.paragraph, "A");
  assert.ok(candidates.some((c) => c.en.startsWith("Mr. Chan")));
  const wrapped = candidates.find((c) => c.en.startsWith("Students need"));
  assert.equal(wrapped.source.lineEnd - wrapped.source.lineStart, 1);
  for (const c of candidates)
    assert.ok(
      normalizeQuote(
        document.lines
          .slice(c.source.lineStart - 1, c.source.lineEnd)
          .join(" "),
      ).includes(c.en),
    );
  const early = readPaper(text, "2013/06/Set-1/2013-06-Set1_试卷.md");
  assert.equal(
    early.candidates.filter((c) => c.source.section === "B").length,
    0,
  );
});

test("transcript extraction preserves spoken words without speaker labels or question options", () => {
  const { candidates } = readPaper(
    "# Transcript\n### Section A\n11. W: I am planning to visit my brother this weekend.\nM: Would you like to take the train to London?\nQ: What does the woman plan to do?\nA) Visit her brother in the nearby town.\n\nNews Report One\nA local company has developed a new method of recycling plastic.",
    "2024/06/Set-1/2024-06-Set1_听力原文.md",
  );
  assert.equal(candidates.length, 3);
  assert.equal(candidates[0].source.lineStart, 3);
  assert.equal(
    candidates[0].en,
    "I am planning to visit my brother this weekend.",
  );
  assert.equal(candidates[2].source.part, "listening");
});

test("rejects cut-off quotations and retains abbreviations", () => {
  assert.equal(
    isUsableSentence(
      '"The students need access to more resources in their local library.',
    ),
    false,
  );
  assert.equal(
    isUsableSentence(
      "“The students need access to more resources in their local library.”",
    ),
    true,
  );
  assert.equal(
    isUsableSentence(
      "Albert Einstein (42) predicted this in 1905, when he (43) introduced the concept of relative time.",
    ),
    false,
  );
  const spans = sentenceSpans(
    "Mr. Chan has moved to the U.S. to study engineering. His brother decided to join him a year later.",
  );
  assert.equal(spans.length, 2);
  assert.ok(spans[0].text.includes("U.S."));
});

test("every published quotation resolves to document metadata and a real headword form", () => {
  const entries = JSON.parse(fs.readFileSync("data/word-atlas.json", "utf8"));
  const index = JSON.parse(fs.readFileSync("public/atlas/index.json", "utf8"));
  const report = JSON.parse(
    fs.readFileSync("data/paper-example-import.json", "utf8"),
  );
  const docs = new Map(
    JSON.parse(fs.readFileSync("data/paper-example-sources.json", "utf8")).map(
      (d) => [d.id, d],
    ),
  );
  const runtime = Array.from(
    { length: Math.ceil(index.count / index.chunk) },
    (_, n) =>
      JSON.parse(fs.readFileSync(`public/atlas/entries/${n}.json`, "utf8")),
  ).flat();
  let real = 0,
    words = 0;
  for (const e of entries) {
    if (e.ex.some((x) => x.source?.kind === "cet4-paper")) {
      words++;
      assert.equal(
        e.m & 24,
        0,
        `${e.w} must not play the replaced sentence's recording`,
      );
    }
    for (const x of e.ex) {
      const s = x.source;
      assert.ok(s, `Unlabeled source: ${e.w}`);
      if (s.kind !== "cet4-paper") {
        assert.equal(s.kind, "legacy-generated");
        continue;
      }
      real++;
      const doc = docs.get(s.documentId);
      assert.ok(doc);
      assert.equal(s.file, doc.path);
      assert.equal(s.sha256, doc.sha256);
      assert.match(s.sha256, /^[a-f0-9]{64}$/);
      assert.equal(s.year, doc.year);
      assert.equal(s.month, doc.month);
      assert.equal(s.set, doc.set);
      assert.ok(s.lineStart >= 1 && s.lineEnd >= s.lineStart);
      assert.ok(isUsableSentence(x.en), e.w);
      assert.equal(headwordPattern(e.w).exec(x.en)?.[0], s.matchedForm, e.w);
      assert.equal(
        x.zh,
        "",
        "Do not pair new English with an unrelated old translation",
      );
    }
  }
  assert.deepEqual(runtime, entries);
  assert.equal(real, index.realExamples);
  assert.equal(words, index.realExampleWords);
  assert.equal(real, report.stats.genuineExamples);
  assert.equal(words, report.stats.replacedWords);
  assert.equal(real, report.selected.length);
  assert.ok(real > 5000);
});
