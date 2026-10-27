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

- 首页可选择每轮新学 10、20 或 50 个词，按打散后的词序认识尚未学过的词。乱序在刷新后保持稳定，每轮数量不构成每日配额，可反复开始新轮。
- 复习依据 FSRS 记忆记录与到期时间，用户可单独选择复习或新学。
- 图鉴支持 A–Z 首字母、主题、难度、学习状态与中英文搜索，自由浏览词卡。
- 拼写、例句与听写练习支持全部词库、最近学过、收藏与错词本；抽词范围覆盖全部词库。
- 练习可随时暂停，刷新后继续，首次作答才计入正确率。
- 新词库使用独立的数据集标识；旧编号的学习记录不会套用到新单词。旧词库的浏览器备份不自动导入新词库，也不会被主动删除。
- 进度保存在当前浏览器，在「我的」可导出与恢复备份。备份不包含练习中间步骤；当前浏览器中的会话会自动保存。

## 打开使用

在线使用：[打开四级词汇图鉴](https://words.irin.im/)。无需安装或注册，学习进度保存在当前浏览器，可在「我的」导出备份。

## 文档知识与记忆笔记

新增[记忆笔记](https://words.irin.im/#/knowledge)，整合用户提供的《英语四级，你还在背单词吗？》编号文档。2,080 条主词记录合并为 2,075 份笔记，保留十个单元、原文编号、1,579 段记忆法、1,875 条原文标注真题、365 条其他例句、690 条派生内容，以及短语和词形补充。

- 1,533 个主词直接匹配现有词卡；连同明确的派生、词形与其他拼写关系，共关联 1,868 个网站词条。
- 未匹配的笔记仍可在笔记页按单元、内容标签、单词、派生词或释义检索；单词卡中可展开对应补充内容。
- 原词表、音频和测验例句保持独立。文档记忆线索不视为严格词源，扫描文字与原文真题年份未逐条校订，来源授权单列于 `CONTENT_LICENSE.md`。
- 笔记按需分块加载，折叠展示，不增加内嵌滚动区域。

导入记录与源文件 SHA-256 位于 `data/knowledge-import.json`。使用同一编号文档可重建运行时笔记：

```powershell
npm run import:knowledge -- "C:/path/四级你还在背单词吗_编号版.md"
```

默认词序在浏览器加载时打散，分块读取仍按原始文件位置定位；原表编号、图片和发音不会随展示顺序改变。

### 本地运行

Windows 双击 **start-cet4.cmd**。需要 Node.js 20+；首次启动会安装依赖。也可以运行：

```powershell
npm ci
npm run dev
```

打开 [http://127.0.0.1:5194/](http://127.0.0.1:5194/)。固定使用同一浏览器和地址，localhost 与 127.0.0.1 的存储相互独立。本地版与在线版的进度也分别保存，需要时可手动导出、导入备份。

## 图片、例句与发音

例句优先匹配用户提供的本地 `Paper` 题库：179 份试卷和听力原文，为 **3,790 个词**收录 **7,129 条真题例句**（4,043 条不同原句，同一句可用于不同词）。每个词最多两句，尽量选自不同文件。只截取完整原句并合并空白，排除指令、选择题选项、未填空句和残缺引语；命中原词或明确词形，避免将 artist、article 当作 art。

词卡、补句、拼写与打字练习均展示出处：年份、月份、套数、阅读／听力、章节、原文件路径、行号及文件 SHA-256。点击例句下方的来源可展开。引用记录见 `data/paper-example-import.json`，题库文件清单及校验值见 `data/paper-example-sources.json`。完整题库和原题音频保留在本地，不随网站公开。题库为用户提供的转录稿，未另行逐题核对官方试卷。

剩余 655 个词未找到可靠原句，其中 493 个词保留 986 条原项目学习示例并明确标为未核验，162 个词不编造例句。7,129 条真题例句已补充对应中文，4,043 句不同原文各有唯一译文。译文使用 Google Translate 生成初稿并抽查修订，标为「参考译文」，不声称属于题库原文或官方译文。英文与出处保持不变；不沿用原项目不同句子的译文或录音。朗读使用设备语音，界面标明并非原题录音。插画用于词义联想，不声称描绘真题场景。

译文及生成方式记录在 `data/paper-translations.json`。使用完整英文的 SHA-256 关联译文，同一句用于多个词时共用译文，避免按词条或数组位置错配。正常构建及上线均不调用翻译服务；重建真题例句时会自动复用已有译文。修改译文目录后，运行 `npm run apply:paper-translations` 可同步运行时分块并更新缓存版本。

抽查修订保留在 `data/paper-translation-revisions.json`，导入与同步时优先应用。初稿生成工具 `scripts/fetch-public-paper-sentences.mjs` 会先核验选句已经在公开仓库上线，`scripts/translate-public-paper-sentences.mjs --google` 仅处理这些公开英文，断点记录留在忽略的 `output/` 中。上述联网工具需单独运行，页面访问不会调用它们。

可使用本地题库重建，导入时会核对每句确实存在于标注的原文行内：

```powershell
npm run import:papers -- "C:/path/to/CET-4/Paper"
```

匹配的单词复用原项目插画、单词录音和搭配；无同词图的词使用注明来源的关联场景，少数词使用内置 image_gen 新增插画。关联图片不会带入其他单词的释义、例句或录音。

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

GitHub Pages 由 `.github/workflows/pages.yml` 自动发布：推送到 `main` 或手动运行工作流后，先执行测试和词库校验，再构建并部署 `dist/`。仓库 Pages 的发布来源需设为 GitHub Actions；构建路径根据 Pages 设置自动适配仓库子目录或自定义域名根目录。

如需重新生成词库，先将完整原仓库解压至 `source/word-atlas-main/`，运行 `npm run build:cet4`。也可指定 Markdown 文件：`node scripts/build-cet4.mjs "C:/path/Words_all.md"`。生成脚本会去重、保留来源、裁剪运行时媒体，并且不生成任何按天分配。

## 署名与授权

原项目：[designfuchen/word-atlas](https://github.com/designfuchen/word-atlas)。代码沿用 MIT；复用媒体、例句等保留 **Word Atlas contributors — CC BY 4.0** 署名。见 `LICENSE` 与 `CONTENT_LICENSE.md`。

用户提供的 Words_all 来源材料单独保存在 `cet4-source/`，不将其归为原项目作者原创。AI 新图来源与复用媒体分别记录。
