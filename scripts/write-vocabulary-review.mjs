import fs from "node:fs";
import { decisions } from "./vocabulary-review-decisions.mjs";
const read=f=>JSON.parse(fs.readFileSync(f,"utf8"));
const review=read("data/vocabulary-review.json"), baseline=read("data/vocabulary-audit-reference.json");
const current=new Map(review.entries.map(e=>[e.id,e]));
const labels={cet4:"四级默认",extension:"扩展"};
const clean=s=>String(s??"").replaceAll("|","/").replaceAll("\n"," ");
const pending=baseline.entries.filter(e=>["unmatched","case-review"].includes(e.category));
if(pending.length!==305||pending.some(e=>!decisions.has(e.word)))throw Error("Unreviewed original item");
const table=items=>["| 原词头 | 现词头 | 范围 | 逐项结论 |","|---|---|---|---|",...items.map(old=>{
 const e=current.get(review.aliases[old.id]??old.id), decision=decisions.get(old.word);
 return `| ${clean(old.word)} | ${clean(e.word)} | ${labels[e.scope]} | ${clean(decision.reason)} |`;
})].join("\n");
const six=review.entries.filter(e=>e.kind==="cet6");
const text=`# 词库范围与逐词核查记录

2026-10-28 更新。对照[教育考试院《全国大学英语四、六级考试大纲（2016年修订版）》](${review.source.url})整理。大纲用 ★ 标出六级词；同列词族随所在词头行归类。

## 当前学习范围

| 范围 | 词数 | 内容 |
|---|---:|---|
| 默认四级词库 | ${review.counts.cet4.toLocaleString()} | 大纲四级词、列出的词族/变体，以及经人工审定的基础补充 |
| 扩展词库 | ${review.counts.extension} | ${review.counts.cet6} 个六级词及同列词族，${review.counts.outside} 个大纲外补充 |
| 全部 | ${review.counts.total.toLocaleString()} | 每个词均有插画，两个学习范围不重叠 |

默认的新词、到期复习、测验干扰选项、拼写及听写均限定在当前选定词库内。首页、图鉴和练习页可以切换到扩展词库，默认设置为四级词库。未答完的旧练习若混入另一个范围，不再继续该队列；已保存的答题卡记录保留。

“大纲四级”与“四级基础补充”在词卡上分别标注。后者包括常见规则派生词、数词变化、国家和语言名称、基础生活词等，是本站的学习编排决定，不表示官方词表逐一列出了它们。大纲外补充也不等于这些词绝不出现在四级文章中，更不意味着每个词的难度都高于四级。

## 拼写、重复和误合并

- 修正 accommodatio → accommodation、inser → insert、recommendati → recommendation、reservior → reservoir，并合并更正后重复的词条。
- 将 systematic(al) 归一为 systematic 并合并；reflexion 是 reflection 的英式异拼，归一合并，不当作另一个新词。
- outskirt 归一为城郊常用的复数 outskirts，world-wide 归一为 worldwide；Jew、Jewish 改正大小写；a.m. / p.m. 统一时间缩写。
- forbid 与误标词头的 forbidden 分开，恢复原表第 1549 条对应的过去分词/形容词。
- 6 个合并前 ID 的对应关系保存在 data/vocabulary-review.json 和公开索引中；旧词卡链接仍可打开。
- 原始 4,449 条提取记录逐条保留，未将校订后的内容写回原始转录稿。

## 305 个原待核项的逐项处理

每项均作了人工词形/语义审定，规则派生词核对了对应大纲基础词；不是通过“未匹配就删除”的规则处理。字典只用于核对词形、意义和语域，不以 CEFR 等级替代 CET 范围。

其中 systematical 的复核补充：[Collins](https://www.collinsdictionary.com/dictionary/english/systematical) 将其对应到 systematic 的生物分类学义，本次移入扩展，并修订原词书提供的泛化释义。[Merriam-Webster](https://www.merriam-webster.com/dictionary/reflexion) 将 reflexion 列为 reflection 的英式拼写，因此合并而非视为错造词。ought 的搭配参考 [American Heritage](https://ahdictionary.com/word/search.html?q=ought)。专业词和正式词的语义复核例子包括 [astrophysics](https://dictionary.cambridge.org/dictionary/english/astrophysics)、[heterogeneity](https://www.oxfordlearnersdictionaries.com/us/definition/english/heterogeneity)、[remonstrate](https://dictionary.cambridge.org/dictionary/english/remonstrate)。

${table(pending)}

## 六级标记词及同列词族（${six.length}）

| 词头 | 大纲对应词头 | 书内页码 | PDF 页码 |
|---|---|---:|---:|
${six.map(e=>{const v=e.evidence.find(v=>v.level==="CET6");if(!v)throw Error("No star evidence for "+e.word);return `| ${clean(e.word)} | ${clean(v.headword)} | ${v.page} | ${v.pdfPage} |`;}).join("\n")}

## 可复核数据

- data/vocabulary-review.json：所有 ${review.counts.total} 个现有词条的范围、分类、理由、大纲对应和校订记录。
- data/vocabulary-audit-reference.json：核查基准及相关词根证据；大纲和第三方词书分别注明来源。
- scripts/vocabulary-review-decisions.mjs：305 个待核项的人工处理结论。
- scripts/apply-vocabulary-review.mjs：应用校订和生成发布数据；复用媒体时需要本地原项目素材目录。
- 原 2,607 重点词仍保留来源顺序，两个词库分别重点词优先、组内稳定乱序。第三方 CET4 词书中的六级词不再标为默认四级重点词。

核查范围是词头、词形及默认学习范围，不能替代所有释义、搭配和例句的逐义项审校。
`;
fs.writeFileSync("docs/vocabulary-review.md",text);
console.log(`Wrote ${pending.length} individual decisions and ${six.length} CET6 references.`);
