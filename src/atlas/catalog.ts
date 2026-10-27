import { hashSeed, shuffle } from "../lib/text";
import type { IndexRow, WordRef } from "./types";

/** Keep file locations independent from the shuffled learning / browsing order. */
export function makeWordCatalog(rows: IndexRow[], datasetId: string) {
  const sourcePositions = new Map(rows.map((row, i) => [row[0], i]));
  const words: WordRef[] = shuffle(rows, hashSeed(`${datasetId}:mixed-order-v1`)).map((r, order) => ({
    id: r[0], word: r[1], zh: r[2], ipa: r[3], cefr: r[4], topic: r[5], media: r[6], sourceSeq: r[7], order,
  }));
  return { words, sourcePositions };
}
