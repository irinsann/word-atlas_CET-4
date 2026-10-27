import type { Example } from "../atlas/types";

/** Provenance for the quotation, independent of the word's illustration or audio. */
export function ExampleSource({ example }: { example: Example }) {
  const source = example.source;
  if (!source) return null;
  if (source.kind === "legacy-generated")
    return (
      <p className="example-source example-unverified">
        原项目例句 · 尚未找到真题出处
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
        <p>摘自四级真题库，已整理换行和空格。</p>
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
            ? "中文由 AI 翻译，并做过抽查修订，供学习参考，不是官方译文。"
            : "题库未附逐句译文。"}
          朗读使用设备语音，不是原题录音；插画用来辅助记词。
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
