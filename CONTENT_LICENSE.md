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

本版本基于 https://github.com/designfuchen/word-atlas 改编，保留 `Word Atlas contributors — CC BY 4.0` 署名。原作者为 yangleiocx3。修改包括：按用户提供的四级 Daily_Plans 替换词表及顺序、实现 14 天学习路线、裁剪原媒体至对应词条、使用关联场景复用部分插画、使用内置 image_gen 新增 7 张插画。逐词媒体来源与新图提示词在 `data/media-provenance.json`、`data/image-generation-prompts.json`。

用户提供的 Daily_Plans、原编号、释义和音标属于另行提供的学习资料，其来源保留于 `cet4-source/`，不将其声称为原项目贡献者原创。新增 AI 插画的来源为内置 image_gen，来源记录与原 CC BY 素材分开保存。
