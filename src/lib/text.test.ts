import assert from "node:assert/strict";
import { test } from "node:test";
import { gap, normalize, splitHighlight, splitPair } from "./text";

test("highlights the headword and common inflections", () => {
  assert.deepEqual(
    splitHighlight("Training with a friend motivates me.", "motivate")?.[1],
    "motivates",
  );
  assert.deepEqual(
    splitHighlight("She studied hard.", "study")?.[1],
    "studied",
  );
  assert.deepEqual(
    splitHighlight("We got a day off today.", "day off")?.[1],
    "day off",
  );
  assert.equal(splitHighlight("Nothing here.", "salt"), null);
});

test("does not match inside longer unrelated words", () => {
  assert.equal(splitHighlight("The cartoon was funny.", "art"), null);
  assert.equal(
    splitHighlight("The artist read this article carefully.", "art"),
    null,
  );
  assert.equal(
    splitHighlight("The teacher arrived early this morning.", "teach"),
    null,
  );
  assert.equal(
    splitHighlight("Polish scientists studied the new material.", "polish"),
    null,
  );
  assert.equal(
    splitHighlight("Please polish the surface before painting.", "Polish"),
    null,
  );
  assert.equal(
    splitHighlight("She taught the children to swim.", "teach")?.[1],
    "taught",
  );
  assert.equal(
    splitHighlight("They were swimming in the river.", "swim")?.[1],
    "swimming",
  );
  assert.equal(
    splitHighlight("The children were singing together.", "child")?.[1],
    "children",
  );
  assert.equal(
    splitHighlight("The colour of the sky changes.", "color")?.[1],
    "colour",
  );
});

test("gaps the sentence for cloze questions", () => {
  const g = gap(
    "I refused the extra money as a matter of principle.",
    "principle",
  );
  assert.equal(g?.hidden, "principle");
  assert.equal(g?.after, ".");
});

test("normalizes typography from mobile keyboards", () => {
  assert.equal(normalize("  Don’t  "), "don't");
  assert.deepEqual(splitPair("in principle｜原则上"), {
    en: "in principle",
    zh: "原则上",
  });
});
