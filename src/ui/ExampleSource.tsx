import type { Example } from "../atlas/types";

/** Provenance for the quotation, independent of the word's illustration or audio. */
export function ExampleSource({ example }: { example: Example }) {
  const source = example.source;
  if (!source) return null;
  if (source.kind === "legacy-generated")
    return (
      <p className="example-source example-unverified">
        原项目学习示例 · 未在本次题库中核验
      </p>
    );
  const location = [
    source.part === "reading" ? "阅读" : "听力原文",
    source.section && `Section ${source.section}`,
    source.passage,
    source.paragraph && `段落 ${source.paragraph}`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <details className="example-source">
      <summary>
        四级真题原句 · {source.year} 年 {source.month} 月 · 第 {source.set} 套 ·{" "}
        {location}
      </summary>
      <div className="example-source-detail">
        <p>来源：用户提供的真题库；原句仅合并换行与空白。</p>
        <p>
          原文件：<code>{source.file}</code>
        </p>
        <p>
          位置：第 {source.lineStart}
          {source.lineEnd !== source.lineStart ? `–${source.lineEnd}` : ""} 行
        </p>
        <p>
          文件 SHA-256：<code>{source.sha256}</code>
        </p>
        <p>
          {example.translation
            ? "中文为本站补充的 AI 参考译文，由大模型逐句翻译并统一校核，非官方译文。"
            : "题库未附逐句译文。"}
          朗读由设备合成，并非原题录音。词图用于单词联想。
        </p>
        {example.translation?.note && <p>{example.translation.note}</p>}
      </div>
    </details>
  );
}

export function ExampleTranslation({
  example,
  className = "ex-zh",
}: {
  example: Example;
  className?: string;
}) {
  if (!example.zh) return null;
  return (
    <p className={className} lang="zh-CN">
      {example.translation && (
        <small className="example-translation-label">参考译文</small>
      )}
      {example.zh}
    </p>
  );
}
