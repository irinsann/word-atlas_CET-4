import fs from "node:fs";
import { createHash } from "node:crypto";
import {
  applyPaperTranslations,
  readTranslations,
} from "./paper-translations.mjs";

const entries = JSON.parse(fs.readFileSync("data/word-atlas.json", "utf8"));
const catalog = readTranslations();
if (!catalog) throw Error("Translation catalog is missing");
const stats = applyPaperTranslations(entries, catalog, true);
const { byHash, ...savedCatalog } = catalog;
const index = JSON.parse(fs.readFileSync("public/atlas/index.json", "utf8"));
if (
  entries.length !== index.words.length ||
  entries.some((e, i) => e.id !== index.words[i][0])
)
  throw Error("Word identities / source order changed");
index.exampleRevision = createHash("sha256")
  .update(JSON.stringify(entries))
  .digest("hex")
  .slice(0, 12);
Object.assign(index, stats);
fs.writeFileSync("data/word-atlas.json", JSON.stringify(entries, null, 1));
fs.writeFileSync(
  "data/paper-translations.json",
  JSON.stringify(savedCatalog, null, 1),
);
for (let i = 0; i < entries.length; i += index.chunk)
  fs.writeFileSync(
    `public/atlas/entries/${i / index.chunk}.json`,
    JSON.stringify(entries.slice(i, i + index.chunk)),
  );
fs.writeFileSync("public/atlas/index.json", JSON.stringify(index));
const summary = JSON.parse(
  fs.readFileSync("src/generated/paper-summary.json", "utf8"),
);
Object.assign(summary, stats);
fs.writeFileSync(
  "src/generated/paper-summary.json",
  JSON.stringify(summary, null, 2) + "\n",
);
console.log(JSON.stringify(stats));
