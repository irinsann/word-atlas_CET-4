# 词光 · 四级自由词库

基于 [designfuchen/word-atlas](https://github.com/designfuchen/word-atlas) 改编，由 [irinsann](https://github.com/irinsann) 独立维护，与原项目维护者及考试机构无隶属或背书关系。

![四级版首页](docs/assets/cet4-home.jpg)

## 词表与去重

唯一词表来源为 `cet4-source/Words_all.md`，由用户提供的 `Words_all.pdf` 提取。原表有 **4,449 条**，去重后为 **4,445 个独立词条**。

- 合并 communism / Communism、forbid、Kingdom / kingdom、present 四组重复记录。
- 合并后保留每条原始释义、读音和来源编号；例如 present 的两种读音都可在词卡中查看。
- angle / Angle、China / china、grant / Grant、polish / Polish 因大小写改变含义而分别保留。
- 保留原 PDF 的拼写和释义，不擅自校订；accommodatio、inser、recommendati、reservior 等提取异常在词卡中注明。原表未提供 a.m 的音标。
- 去重明细位于 `data/source-import.json`，所有来源编号均可追溯。图鉴编号对应原表，合并后会有正常的编号间隔。

## 自由学习

已移除旧的固定天数、每日新词与昨日复习分配，也不再使用旧的按天筛选。

- 首页可选择每轮新学 10、20 或 50 个词，按原表顺序认识尚未学过的词。每轮数量不构成每日配额，可反复开始新轮。
- 复习依据 FSRS 记忆记录与到期时间，用户可单独选择复习或新学。
- 图鉴支持 A–Z 首字母、主题、难度、学习状态与中英文搜索，自由浏览词卡。
- 拼写、例句与听写练习支持全部词库、最近学过、收藏与错词本；抽词范围覆盖全部词库。
- 练习可随时暂停，刷新后继续，首次作答才计入正确率。
- 新词库使用独立的数据集标识；旧编号的学习记录不会套用到新单词。旧词库的浏览器备份不自动导入新词库，也不会被主动删除。
- 进度保存在当前浏览器，在「我的」可导出与恢复备份。备份不包含练习中间步骤；当前浏览器中的会话会自动保存。

## 打开使用

Windows 双击 **start-cet4.cmd**。需要 Node.js 20+；首次启动会安装依赖。也可以运行：

```powershell
npm ci
npm run dev
```

打开 **http://127.0.0.1:5194/**。固定使用同一浏览器和地址，localhost 与 127.0.0.1 的存储相互独立。

## 图片、例句与发音

匹配的单词复用原项目插画、录音、例句和搭配；无同词图的词使用注明来源的关联场景，少数词使用内置 image_gen 新增插画。关联图片不会带入其他单词的释义、例句或录音。

逐词媒体记录在 `data/media-provenance.json`；新增插画位于 `public/generated/`，完整提示词在 `data/image-generation-prompts.json`。无原录音时使用设备英美语音合成，效果取决于设备；原表没有提供例句的词不编造例句。

原表只提供一列音标，保留在词卡中；匹配原项目时补充原项目美音。未匹配词的难度与关联主题仅用于浏览整理。

## 构建与校验

```powershell
npm test
npm run check:atlas
npm run build
npm run preview
```

`dist/` 是静态网站，需通过 HTTP 服务器打开。子路径部署可设置 `ATLAS_BASE=/words/` 后构建。

如需重新生成词库，先将完整原仓库解压至 `source/word-atlas-main/`，运行 `npm run build:cet4`。也可指定 Markdown 文件：`node scripts/build-cet4.mjs "C:/path/Words_all.md"`。生成脚本会去重、保留来源、裁剪运行时媒体，并且不生成任何按天分配。

## 署名与授权

原项目：[designfuchen/word-atlas](https://github.com/designfuchen/word-atlas)。代码沿用 MIT；复用媒体、例句等保留 **Word Atlas contributors — CC BY 4.0** 署名。见 `LICENSE` 与 `CONTENT_LICENSE.md`。

用户提供的 Words_all 来源材料单独保存在 `cet4-source/`，不将其归为原项目作者原创。AI 新图来源与复用媒体分别记录。
