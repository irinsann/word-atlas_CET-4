import { createHash } from "node:crypto";

export const normalizeQuote = (s) => s.replace(/\s+/g, " ").trim();
const INSTRUCTIONS =
  /^(?:Directions?\s*[:：]|Questions?\s+\d|Q\s*[:：]|Now (?:you|listen|let)|You (?:will|should|must|are required)|This is the end|For questions|注意|说明)/i;
const META =
  /Answer Sheet|four choices|following questions|best answer|spoken only once|mark the corresponding|word bank|blank spaces|answer the questions/i;
const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });

export function sentenceSpans(text) {
  const protectedText = text.replace(
    /\b(?:Mr|Mrs|Ms|Dr|Prof|St|vs|etc|e\.g|i\.e|U\.S|U\.K)\./g,
    (s) => s.replaceAll(".", "\uE000"),
  );
  return [...segmenter.segment(protectedText)].map((s) => {
    const raw = text.slice(s.index, s.index + s.segment.length);
    const left = raw.length - raw.trimStart().length;
    return {
      text: raw.trim(),
      start: s.index + left,
      end: s.index + raw.trimEnd().length,
    };
  });
}

export function isUsableSentence(s) {
  const words = s.match(/[A-Za-z]+(?:[-'’][A-Za-z]+)*/g) ?? [];
  return (
    words.length >= 7 &&
    words.length <= 44 &&
    s.length <= 400 &&
    (s.match(/"/g)?.length ?? 0) % 2 === 0 &&
    (s.match(/“/g)?.length ?? 0) === (s.match(/”/g)?.length ?? 0) &&
    /^[“"'(\[]?[A-Z]/.test(s) &&
    /[.!?][”"')\]]*$/.test(s) &&
    !/_{2}|\(\d{1,3}\)|\uFFFD|\.{3}|\*\*|https?:\/\/|What does the (?:man|woman)|What do we learn/.test(
      s,
    ) &&
    !INSTRUCTIONS.test(s) &&
    !META.test(s)
  );
}

/** Read body paragraphs and spoken turns as data, retaining their original line spans. */
export function readPaper(text, relativePath) {
  const p = relativePath.replaceAll("\\", "/");
  const m = /^(\d{4})\/(\d{2})\/Set-(\d+)\/([^/]+\.md)$/.exec(p);
  if (!m) throw Error(`Unrecognized paper path: ${p}`);
  const [, y, month, set, file] = m;
  const transcript = file.includes("听力原文");
  const document = {
    id: `${y}-${month}-set${set}-${transcript ? "listening" : "paper"}`,
    path: p,
    year: Number(y),
    month: Number(month),
    set: Number(set),
    kind: transcript ? "listening" : "paper",
    sha256: createHash("sha256").update(text).digest("hex"),
    lines: text.split(/\r?\n/),
  };
  let part = transcript ? "listening" : "";
  let section = "";
  let passage = "";
  let paragraph = "";
  let parts = [];
  const candidates = [];
  const flush = () => {
    if (!parts.length) return;
    let joined = "";
    const offsets = parts.map((r, i) => {
      if (i) joined += " ";
      const start = joined.length;
      joined += r.text;
      return { start, end: joined.length, line: r.line };
    });
    for (const span of sentenceSpans(joined)) {
      const en = normalizeQuote(span.text);
      if (!isUsableSentence(en)) continue;
      const lineStart = offsets.find((o) => span.start < o.end)?.line;
      const lineEnd = [...offsets]
        .reverse()
        .find((o) => span.end > o.start)?.line;
      if (!lineStart || !lineEnd) continue;
      if (
        !normalizeQuote(
          document.lines.slice(lineStart - 1, lineEnd).join(" "),
        ).includes(en)
      )
        continue;
      candidates.push({
        en,
        source: {
          kind: "cet4-paper",
          documentId: document.id,
          file: p,
          year: document.year,
          month: document.month,
          set: document.set,
          part,
          section,
          passage,
          paragraph,
          lineStart,
          lineEnd,
          sha256: document.sha256,
        },
      });
    }
    parts = [];
  };
  for (let i = 0; i < document.lines.length; i++) {
    const raw = document.lines[i].trim();
    if (/^#{1,6}\s/.test(raw)) {
      flush();
      if (/^##\s+Part/i.test(raw)) {
        part = /Reading|Skimming|Scanning/i.test(raw)
          ? "reading"
          : /Listening/i.test(raw)
            ? "listening"
            : "";
        if (!transcript && part === "listening") part = "";
        section = "";
        passage = "";
        paragraph = "";
      } else {
        const s = /^###\s+Section\s+([A-Z])/i.exec(raw);
        if (s) {
          section = s[1];
          passage = "";
          paragraph = "";
        }
      }
      continue;
    }
    if (!raw || !part) {
      flush();
      continue;
    }
    const title =
      /^(?:Passage|Conversation|News? Report|Report|Text)\s+(?:One|Two|Three|Four|\d+)\b/i.exec(
        raw,
      );
    if (title && raw.length < 80) {
      flush();
      passage = raw;
      paragraph = "";
      continue;
    }
    if (
      INSTRUCTIONS.test(raw) ||
      META.test(raw) ||
      /^\d{1,3}[.．]?\s*$/.test(raw)
    ) {
      flush();
      continue;
    }
    const speaker =
      /^(?:\d{1,3}[.)]\s*)?(?:M|W|Man|Woman)\s*[:：]\s*(.+)$/i.exec(raw);
    if (speaker && transcript) {
      flush();
      parts.push({ text: speaker[1], line: i + 1 });
      flush();
      continue;
    }
    // Section A is word-bank cloze, including older extracts with bare number gaps.
    if (part === "reading" && section === "A") {
      flush();
      continue;
    }
    const marker = /^(?:[([]([A-O])[)\]]|([A-O])[)）.])\s*(.*)$/.exec(raw);
    if (marker) {
      flush();
      if (
        part === "reading" &&
        section === "B" &&
        (Number(y) > 2013 || (Number(y) === 2013 && Number(month) >= 12)) &&
        marker[3].length >= 75
      ) {
        paragraph = marker[1] ?? marker[2];
        parts.push({ text: marker[3], line: i + 1 });
      }
      continue;
    }
    if (
      /^\d{1,3}[.)．]\s/.test(raw) ||
      /^Q\s*[:：]/i.test(raw) ||
      /^\|/.test(raw)
    ) {
      flush();
      continue;
    }
    if (/^[\u4e00-\u9fff]/.test(raw)) {
      flush();
      continue;
    }
    parts.push({ text: raw, line: i + 1 });
  }
  flush();
  return { document, candidates };
}
