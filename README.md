# 词光 · 四级自由词库

基于 [designfuchen/word-atlas](https://github.com/designfuchen/word-atlas) 改编，由 [irinsann](https://github.com/irinsann) 独立维护，与原项目维护者及考试机构无隶属或背书关系。

![四级版首页](docs/assets/cet4-home.jpg)

## 词表与去重

基础词表由 `Words_all.pdf` 提取，原始 4,449 条记录保存在 `cet4-source/Words_all.md`；后补入第三方重点词书的 403 个词。经拼写校订、重复合并及范围复核，当前共 **4,843 个词**：默认四级词库 **4,558 个**，扩展词库 **285 个**。

范围以教育考试院《全国大学英语四、六级考试大纲（2016年修订版）》为主。默认范围含大纲四级和标明来源的基础补充；扩展范围含 **211 个六级词及同列词族、74 个大纲外补充**。原来未直接匹配的 305 项均有逐项结论，见[词库核查记录](docs/vocabulary-review.md)。第三方词书的“四级”分类不等于考试院的官方分类。

- 初次去重合并 communism / Communism、Kingdom / kingdom、present 等重复记录；后将误合并的 forbid / forbidden 分开。
- 合并后保留每条原始释义、读音和来源编号；例如 present 的两种读音都可在词卡中查看。
- angle / Angle、China / china、grant / Grant、polish / Polish 因大小写改变含义而分别保留。
- 已修正 accommodatio、inser、recommendati、reservior 等提取异常，合并更正后重复项；原始提取文字独立保留以便追溯。原表未提供 a.m. 的音标。
- 去重明细位于 `data/source-import.json`，所有来源编号均可追溯。图鉴编号对应原表，合并后会有正常的编号间隔。

## 自由学习

已移除旧的固定天数、每日新词与昨日复习分配，也不再使用旧的按天筛选。

- 首页可选择每轮新学 10、20 或 50 个词，先学重点词，再学其余新词；两组内部各自保持稳定乱序。顺序在刷新后保持稳定，每轮数量不构成每日配额，可反复开始新轮。
- 复习依据 FSRS 记忆记录与到期时间，用户可单独选择复习或新学。
- 图鉴支持 A–Z 首字母、主题、难度、学习状态与中英文搜索，自由浏览词卡。
- 首页、图鉴和练习页可在四级词库与扩展词库之间切换。新词、到期复习、测验干扰选项、拼写和听写均限定在当前词库；扩展词需主动选择。
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

例句优先匹配用户提供的本地 `Paper` 题库：179 份试卷和听力原文，为 **4,056 个词**收录 **7,577 条真题例句**（4,043 条不同原句，同一句可用于不同词）。每个词最多两句，尽量选自不同文件。只截取完整原句并合并空白，排除指令、选择题选项、未填空句和残缺引语；命中原词或明确词形，避免将 artist、article 当作 art。

词卡、补句、拼写与打字练习均展示出处：年份、月份、套数、阅读／听力、章节、原文件路径、行号及文件 SHA-256。点击例句下方的来源可展开。引用记录见 `data/paper-example-import.json`，题库文件清单及校验值见 `data/paper-example-sources.json`。完整题库和原题音频保留在本地，不随网站公开。题库为用户提供的转录稿，未另行逐题核对官方试卷。

剩余 792 个词未找到可靠原句，其中 570 个词保留 1,140 条原项目学习示例并明确标为未核验，222 个词不编造例句。7,577 条真题例句已补充对应中文，4,043 句不同原文各有唯一译文。译文由同级 Codex 大模型根据英文原句分批逐句翻译，再统一校核和抽查修订；本次译文不采用翻译接口或本地小模型初稿，标为「参考译文」，不声称属于题库原文或官方译文。英文与出处保持不变；不沿用原项目不同句子的译文或录音。朗读使用设备语音，界面标明并非原题录音。插画用于词义联想，不声称描绘真题场景。

译文及生成方式记录在 `data/paper-translations.json`。使用完整英文的 SHA-256 关联译文，同一句用于多个词时共用译文，避免按词条或数组位置错配。正常构建及上线均不调用翻译服务；重建真题例句时会自动复用已有译文。修改译文目录后，运行 `npm run apply:paper-translations` 可同步运行时分块并更新缓存版本。

本轮校核修订及转录疑点说明保留在 `data/paper-self-translation-revisions.json`，导入与同步时优先应用；旧的 `data/paper-translation-revisions.json` 仅为历史修订记录，不参与当前译文生成。分批直译断点存于忽略的 `output/self-translations/`，只有完整覆盖全部引文、英文校验值一致且无重复时，`node scripts/import-self-translations.mjs` 才会导入。随后运行 `npm run apply:paper-translations` 同步网站数据。网页不调用翻译接口。

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

### 重点词顺序

用户提供的 `CET4_Core_2607_Vocabulary.md` 与 RealKai42/qwerty-learner 的 CET4 词书逐项对应，共 2,607 词。初次补入 403 个缺词；拼写校订后合并了部分重复项。目前其中 2,504 个位于默认四级词库，103 个位于扩展词库。各自范围内重点词优先，组内稳定乱序。

原补充词表及校验值见 `data/core-vocabulary-supplement.json`；匹配结果见 `data/core-priority-import.json`，优先顺序见 `src/generated/core-priority.json`。校订合并的 ID 对应与逐词范围见 `data/vocabulary-review.json`。旧词卡链接可按合并别名打开；不再继续含其他词库单词或选项的旧队列。

新增词复用 277 张同词插画、124 张标明“场景联想”的相关图片，以及 2 张项目中已有的生成插画。266 个新词匹配到网站已经收录并翻译的真题引文，英文、译文及出处保留。其余词保留同词的原项目例句，或暂不提供例句，不借用其他词的句子和录音。

重新构建基础词库和补充词后，必须执行 `node --import tsx scripts/apply-vocabulary-review.mjs` 应用校订与学习范围，再运行 `npm run import:core`，最后导入记忆笔记。已有核查基准和人工结论保存在仓库中；媒体复制步骤需原项目素材目录。核查文档可用 `node scripts/write-vocabulary-review.mjs` 更新。
