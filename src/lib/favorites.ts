import type { Entry, Example } from "../atlas/types";
import vocabulary from "../generated/vocabulary-scope.json";

export function canonicalBookmarks(ids: readonly string[]): string[] {
  const aliases = vocabulary.aliases as Record<string, string>;
  return [...new Set(ids.map((id) => aliases[id] ?? id))];
}
function source(x: Example): string {
  const s = x.source;
  if (!s || s.kind === "legacy-generated")
    return "原项目例句，尚未核验真题出处";
  return [
    `${s.year}年${s.month}月四级第${s.set}套`,
    s.part === "reading" ? "阅读" : "听力原文",
    s.section && `Section ${s.section}`,
    s.passage,
    s.paragraph && `段落 ${s.paragraph}`,
    `${s.file}:${s.lineStart}${s.lineEnd !== s.lineStart ? `–${s.lineEnd}` : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");
}
const meaning = (e: Entry) =>
  e.senses.map((s) => `${s.pos} ${s.zh}`.trim()).join("；");
const scope = (e: Entry) =>
  e.learning?.scope === "extension"
    ? `扩展词库 · ${e.learning.label}`
    : (e.learning?.label ?? "四级词库");
const readings = (e: Entry) =>
  e.pronunciations
    ?.map((p) => `${p.label}：英 ${p.uk}；美 ${p.us}`)
    .join("\n") ?? "";
export function csvCell(value: unknown): string {
  let s = String(value ?? "");
  if (/^[\s\uFEFF]*[=+@-]/u.test(s) || /^[\t\r]/u.test(s)) s = "'" + s;
  return `"${s.replaceAll('"', '""')}"`;
}
export function exportFavorites(
  entries: readonly Entry[],
  format: "csv" | "md",
  date = new Date(),
): string {
  if (format === "csv") {
    const rows = [
      [
        "序号",
        "单词",
        "英式音标",
        "美式音标",
        "词性与释义",
        "学习范围",
        "分义读音",
        "用法提醒",
        "英文例句",
        "参考译文",
        "例句出处",
        "词卡网址",
      ],
      ...entries.map((e, i) => [
        i + 1,
        e.w,
        e.uk,
        e.us,
        meaning(e),
        scope(e),
        readings(e),
        e.note ?? "",
        e.ex.map((x) => x.en).join("\n\n"),
        e.ex.map((x) => x.zh).join("\n\n"),
        e.ex.map(source).join("\n\n"),
        `https://words.irin.im/#/atlas?w=${encodeURIComponent(e.id)}`,
      ]),
    ];
    return (
      "\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n"
    );
  }
  const inline = (s: string) =>
    s.replace(/[\\`*_{}[\]<>#]/g, "\\$&").replace(/\r?\n/g, " ");
  return (
    `# 词光 · 我的收藏\n\n导出时间：${date.toISOString()}\n\n共 ${entries.length} 个词。中文例句为参考译文，真题出处随句保留。\n\n` +
    entries
      .map(
        (e, i) =>
          `## ${i + 1}. ${inline(e.w)}\n\n- 英：${inline(e.uk) || "暂缺"}\n- 美：${inline(e.us) || "暂缺"}\n- 范围：${scope(e)}\n- 释义：${inline(meaning(e))}\n${readings(e) ? `- 分义读音：${inline(readings(e))}\n` : ""}${e.note ? `- 用法：${inline(e.note)}\n` : ""}\n` +
          e.ex
            .map(
              (x) =>
                `${inline(x.en)}\n\n${inline(x.zh)}\n\n出处：${source(x)}\n\n`,
            )
            .join("") +
          `[打开词卡](https://words.irin.im/#/atlas?w=${encodeURIComponent(e.id)})\n`,
      )
      .join("\n")
  );
}
