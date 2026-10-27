/** Verify the complete translation input against the already public atlas. */
import fs from "node:fs";
import { sentenceHash } from "./paper-translations.mjs";

const root =
  "https://raw.githubusercontent.com/irinsann/word-atlas_CET-4/main/public/atlas/";
const response = await fetch(root + "index.json");
if (!response.ok) throw Error(`Public index: ${response.status}`);
const index = await response.json();
const quotes = new Set();
const files = [];
for (let n = 0; n < Math.ceil(index.count / index.chunk); n++) {
  const url = `${root}entries/${n}.json`;
  const r = await fetch(url);
  if (!r.ok) throw Error(`Public chunk ${n}: ${r.status}`);
  const entries = await r.json();
  for (const entry of entries)
    for (const x of entry.ex)
      if (x.source?.kind === "cet4-paper") quotes.add(x.en);
  files.push(url);
}
const local = JSON.parse(fs.readFileSync("data/word-atlas.json", "utf8"));
const wanted = new Set(
  local.flatMap((e) =>
    e.ex.filter((x) => x.source?.kind === "cet4-paper").map((x) => x.en),
  ),
);
if (quotes.size !== wanted.size || [...wanted].some((en) => !quotes.has(en)))
  throw Error(
    "Public English does not match the local quotations; do not send local-only text",
  );
const manifest = {
  kind: "verified-public-atlas-quotes",
  repo: "irinsann/word-atlas_CET-4",
  publicRevision: index.exampleRevision,
  files,
  quotes: [...wanted].map((en) => ({ id: sentenceHash(en), en })),
};
fs.writeFileSync(
  "output/public-paper-sentences.json",
  JSON.stringify(manifest, null, 1),
);
console.log(
  JSON.stringify({
    publicFilesVerified: files.length,
    publicSentencesVerified: quotes.size,
    characters: [...quotes].reduce((n, s) => n + s.length, 0),
    revision: index.exampleRevision,
  }),
);
