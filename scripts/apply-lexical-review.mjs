import fs from "node:fs";
import { createHash } from "node:crypto";
import {
  glosses,
  singlePos,
  phonetics,
  american,
  variants,
  editorialNotes,
} from "./lexical-editorial.mjs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const write = (p, x) => fs.writeFileSync(p, JSON.stringify(x, null, 1) + "\n");
const hash = (x) =>
  createHash("sha256").update(JSON.stringify(x)).digest("hex");
const immutable = (e) => ({
  id: e.id,
  w: e.w,
  sourceRows: e.sourceRows,
  ex: e.ex,
  learning: e.learning,
  m: e.m,
  media: e.media,
  coreSeq: e.coreSeq,
});
const file = "data/lexical-review.json",
  entries = read("data/word-atlas.json"),
  index = read("public/atlas/index.json");
const existing = fs.existsSync(file) ? read(file) : null;
const comparison = existing
  ? null
  : read("output/lexical-audit/all-entries.json");
const baseline = new Map(
  (existing?.entries ?? comparison).map((r) => [r.id, r]),
);
const rows = [];
function cleanLabels(s) {
  return s
    .replace(/\ba\.dj\.?/g, "adj.")
    .replace(/\bad\.v\.?/g, "adv.")
    .replace(/\badvS\./g, "adv.")
    .replace(/\bini\./g, "interj.")
    .replace(/\ba\.\s*(?=[\u4e00-\u9fff(（])/g, "adj. ")
    .replace(/\bad\.\s*(?=[\u4e00-\u9fff(（])/g, "adv. ")
    .replace(/<([^<>]+)>/g, "（$1）");
}
for (const e of entries) {
  const base = baseline.get(e.id);
  if (!base) throw Error(`Missing lexical baseline ${e.id}`);
  const before = existing
    ? base.before
    : {
        uk: e.uk,
        us: e.us,
        senses: structuredClone(e.senses),
        ...(e.note ? { note: e.note } : {}),
      };
  const originalHash = existing ? base.immutableHash : hash(immutable(e));
  if (hash(immutable(e)) !== originalHash)
    throw Error(`Source/example/scope changed since lexical review: ${e.w}`);
  Object.assign(e, structuredClone(before));
  if (!before.note) delete e.note;
  delete e.pronunciations;
  if (glosses[e.w]) e.senses = [{ pos: "", zh: glosses[e.w], en: "" }];
  else if (
    singlePos.has(e.w) &&
    !e.senses.some(
      (s) =>
        s.pos ||
        /\b(?:adj|adv|prep|conj|pron|aux|art|interj|int|num|abbr|vt|vi|v|n)\./.test(
          s.zh,
        ),
    )
  )
    e.senses[0].pos = singlePos.get(e.w);
  for (const s of e.senses) {
    s.pos = cleanLabels(s.pos);
    s.zh = cleanLabels(s.zh);
  }
  if (american[e.w]) e.us = `/${american[e.w]}/`;
  if (phonetics[e.w]) [e.uk, e.us] = phonetics[e.w].map((s) => `/${s}/`);
  if (variants[e.w]) {
    e.pronunciations = variants[e.w].map(([label, uk, us]) => ({
      label,
      uk: `/${uk}/`,
      us: `/${us}/`,
    }));
    // The compact card includes every reviewed reading; details associate each with its meaning.
    for (const accent of ["uk", "us"])
      e[accent] = [...new Set(e.pronunciations.map((p) => p[accent]))].join(
        "; ",
      );
  }
  if (editorialNotes[e.w]) e.note = editorialNotes[e.w];
  for (const accent of ["uk", "us"])
    e[accent] = e[accent].replaceAll("\u200b", "");
  if ([e.uk, e.us].some((p) => !p || p === "-" || /[\u4e00-\u9fff]/.test(p)))
    throw Error(`Malformed IPA remains: ${e.w}`);
  const changed = ["uk", "us", "senses", "note"].filter(
    (k) => JSON.stringify(before[k]) !== JSON.stringify(e[k]),
  );
  if (e.pronunciations) changed.push("pronunciations");
  const compared = existing
    ? base.compared
    : { meaning: !!base.ecZH, uk: !!base.refUK, us: !!base.refUS };
  const flags = existing ? base.flags : base.flags;
  rows.push({
    id: e.id,
    word: e.w,
    before,
    immutableHash: originalHash,
    compared,
    flags,
    changed,
    review: changed.length
      ? "editorial-correction"
      : flags.length
        ? "flag-reviewed-retained"
        : "automated-comparison",
    reason: changed.length
      ? (editorialNotes[e.w] ??
        (glosses[e.w]
          ? "补正词性、错义、漏义或提取残缺；保留常用义项。"
          : variants[e.w]
            ? "区分词性/词义对应的读音。"
            : american[e.w]
              ? "美式栏误沿用英式音标；补正通用美式读音。"
              : phonetics[e.w]
                ? "补正缺失、截断或混入说明文字的读音。"
                : "补充词性标注或整理标签格式。"))
      : flags.length
        ? "已检查对照疑点；保留有效义项、大小写区别、传统音标写法或正常发音变体，未按字面差异盲目替换。"
        : "已完成参考覆盖及结构检查；不代表逐个义项都经人工辞书审定。",
  });
}
const stats = {
  words: entries.length,
  meaningReference: rows.filter((r) => r.compared.meaning).length,
  ukReference: rows.filter((r) => r.compared.uk).length,
  usReference: rows.filter((r) => r.compared.us).length,
  updatedWords: rows.filter((r) => r.changed.length).length,
  meaningEdits: rows.filter((r) => r.changed.includes("senses")).length,
  ipaEdits: rows.filter(
    (r) => r.changed.includes("uk") || r.changed.includes("us"),
  ).length,
  readingGuides: entries.filter((e) => e.pronunciations).length,
};
write(file, {
  date: "2026-10-28",
  method:
    "全库对照、结构筛查、疑点人工审定；不以辞书间字面差异判错，不声称穷尽所有义项。",
  references: [
    {
      name: "ECDICT",
      url: "https://github.com/skywind3000/ECDICT",
      file: "ecdict.csv",
      blob: "0e527e22e0e0d22f012b0ed251a8dddd5891773b",
      use: "用于释义与词性对照；未整体替换词条。",
    },
    {
      name: "ipa-dict",
      url: "https://github.com/open-dict-data/ipa-dict",
      files: ["en_UK.txt", "en_US.txt"],
      use: "用于发音差异筛查；自动生成的英国发音有误，不整库导入，未复制 GPL 数据集。",
    },
    {
      name: "Cambridge Dictionary",
      url: "https://dictionary.cambridge.org/dictionary/english/statistic",
      use: "词义及用法复核；释义由编辑自行表述。",
    },
    {
      name: "Collins",
      url: "https://www.collinsdictionary.com/dictionary/english/systematical",
      use: "少见词形 systematical 的义项复核。",
    },
  ],
  stats,
  entries: rows,
});
write("data/word-atlas.json", entries);
index.words = entries.map((e) => [
  e.id,
  e.w,
  e.senses.map((s) => [s.pos, s.zh].filter(Boolean).join(" ")).join("；"),
  e.uk,
  Math.max(0, index.cefr.indexOf(e.cefr)),
  Math.max(
    0,
    index.topics.findIndex((t) => t[0] === e.topic),
  ),
  e.m,
  ...(e.sourceSeq ? [e.sourceSeq] : []),
]);
index.exampleRevision = hash(entries).slice(0, 12);
fs.writeFileSync("public/atlas/index.json", JSON.stringify(index));
for (let i = 0; i < entries.length; i += index.chunk)
  fs.writeFileSync(
    `public/atlas/entries/${i / index.chunk}.json`,
    JSON.stringify(entries.slice(i, i + index.chunk)),
  );
write("src/generated/lexical-summary.json", stats);
let doc = `# 释义与音标核对（2026-10-28）\n\n全库 ${stats.words} 词完成结构和参考对照，修订 ${stats.updatedWords} 词，其中释义/词性 ${stats.meaningEdits} 词、音标 ${stats.ipaEdits} 词，${stats.readingGuides} 词增加分义读音说明（各项有重叠）。\n\n释义参考覆盖 ${stats.meaningReference} 词；英音参考覆盖 ${stats.ukReference} 词，美音参考覆盖 ${stats.usReference} 词。未匹配的 esp. 已单独核实为缩写。\n\n这是全库对照加疑点审校，不等于 4,843 词每个义项都已逐一通过人工辞书审定。旧式音标、弱读、可接受的方言差异不会仅因写法不同而被替换。参考词典也有错误，例如 scary 不能因为对照表写作“胆小的”就覆盖现有“吓人的”。中文释义采用编辑自行组织的表述。\n\n原始 4,449 行、真题引文、译文与出处、插画和录音、四级/扩展划分均保留。音标修订不表示重新录制单词音频；多音词的录音可能只覆盖一种常见读法。记忆笔记属于原文资料，不在本次词卡释义/音标校订范围内。\n\n完整的逐词覆盖、筛查标记、修改前值及原因见 [data/lexical-review.json](../data/lexical-review.json)，编辑决定见 [scripts/lexical-editorial.mjs](../scripts/lexical-editorial.mjs)。\n\n## 参考资料\n\n`;
for (const r of read(file).references)
  doc += `- [${r.name}](${r.url})：${r.use}\n`;
doc += "\n## 修改记录\n\n| 单词 | 修改字段 | 原因 |\n| --- | --- | --- |\n";
for (const r of rows.filter((r) => r.changed.length))
  doc += `| ${r.word} | ${r.changed.join(", ")} | ${r.reason.replaceAll("|", "／")} |\n`;
fs.writeFileSync("docs/lexical-review.md", doc);
console.log(JSON.stringify(stats));
