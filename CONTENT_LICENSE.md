# 内容授权 / Content license

## 代码 / Code

源代码与界面设计采用 [MIT License](LICENSE)。依赖包保留各自授权；Fraunces 字体为 SIL Open Font License 1.1。

Source code and UI design are under the [MIT License](LICENSE). Dependencies keep their own licenses; the Fraunces typeface is under the SIL Open Font License 1.1.

## 词库内容、插画与录音 / Dataset, illustrations and recordings

以下内容以 **[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)** 提供，在项目维护者能够授予的权利范围内：

- `data/` 下的词库文件，以及 `public/atlas/index.json`、`public/atlas/entries/` 中的释义、英文释义、例句、译文、搭配、词族、近反义词、提示、分级与分类；
- `public/atlas/img/`、`public/atlas/thumb/`、`public/brand/` 中的插画；
- `public/atlas/audio/` 中的发音与例句录音。

The material above is offered under CC BY 4.0, to the extent of the rights the maintainers can grant.

**署名 / Attribution:** `Word Atlas contributors — CC BY 4.0`，并附授权链接，说明是否做过修改。

### 说明 / Notes

- 单个英文单词与通用词表本身不主张专有权。This project claims no exclusive rights over English words or the bare headword list.
- 内容由 AI 模型按项目规范生成（文本：大语言模型；插画：图像模型；录音：ElevenLabs 合成语音），经过自动校验，未逐条人工审校，按现状提供，不作准确性担保。Content was generated with AI models under the project's specifications, checked automatically, not proofread entry by entry, and is provided as-is without warranty.
- 录音授权只涉及这些完成的音频文件，不包含底层声音模型、声音身份或任何人的肖像、人格权，也不表示声音提供方为本项目背书。英音声音为 ElevenLabs “Alice”，美音为 “Sarah”。The recording license covers the finished audio files only, not the underlying voice models or voice identities, and implies no endorsement. Voices: ElevenLabs "Alice" (UK) and "Sarah" (US).
- 不是官方雅思（IELTS）词表，与雅思考试主办方无关。Not an official IELTS list and not affiliated with the IELTS partners.

## 四级改编说明

本版本基于 https://github.com/designfuchen/word-atlas 改编，保留 Word Atlas contributors — CC BY 4.0 署名。修改包括：以用户提供的 Words_all.md 替换词表，合并重复记录并保留原始释义与读音，提供自由学习、首字母浏览与 FSRS 复习，裁剪原媒体并补充 AI 插画。逐词媒体来源与新图提示词在 data/media-provenance.json、data/image-generation-prompts.json。

Words_all.md 来自用户提供的 PDF 提取材料，其来源单独保留在 cet4-source/，不将其声称为原项目贡献者原创。AI 新图由内置 image_gen 生成，与原 CC BY 素材分别记录。

## 文档记忆笔记

`public/atlas/knowledge/` 的补充释义、记忆法、真题／例句、派生与短语，整理自用户提供的《英语四级，你还在背单词吗？》编号转录文档，原文署名“晓艳老师”。保留原文单元、编号及文件校验值，见 `data/knowledge-import.json`。这些来源内容单独标记，不纳入上文对 Word Atlas 原始素材的 CC BY 4.0 授权声明。文档扫描文字、音标及真题年份未逐条校订，谐音与拆词仅作为记忆线索。

## 真题例句引用

`source.kind = "cet4-paper"` 的例句摘自用户提供的本地 `Paper` 真题转录库，保留原句、年份、月份、套数、题型、文件路径、行号与原文件 SHA-256。引用清单见 `data/paper-example-import.json`，原文件元数据见 `data/paper-example-sources.json`。仅公开所选句子和出处，不发布完整题库、全文段落或原题录音。原文权利归相应权利人，不将其列为 Word Atlas 贡献者原创，也不纳入以上 CC BY 4.0 授权声明。转录稿未逐题核对官方原件。

`source.kind = "legacy-generated"` 的例句为原项目学习示例，未在本次题库中核验；其原项目署名与授权继续保留。真题新例句的朗读由设备合成，不复用不同句子的旧录音。

真题例句的中文参考译文由本项目补充，采用 Google Translate 生成初稿并抽查修订；生成方法、完整英文校验值及逐句译文见 `data/paper-translations.json`。参考译文不属于真题原文，也不声称为考试机构提供的官方译文；不套用原项目不同句子的旧译文。参考译文与英文原句的出处分别记录，不改变英文原句的权利归属。
