# 词光 · 四级 14 天版

基于 [designfuchen/word-atlas](https://github.com/designfuchen/word-atlas) 开源版改编，保留原项目的插画词卡、英美发音、练习、词汇星图、深浅主题与本地进度备份。

本四级衍生版由 [irinsann](https://github.com/irinsann) 独立维护，与原项目维护者及考试机构无隶属或背书关系。原项目提供应用基础及大部分媒体，本版本新增四级词库适配、14 天滚动学习路线、关联场景映射与 7 张 AI 插画。

![四级版首页](docs/assets/cet4-home.jpg)

## 打开使用

双击本目录的 **start-cet4.cmd**，会打开浏览器。首次需要 Node.js 20+；依赖已安装时可直接运行。

也可以在本目录运行：

```powershell
npm ci
npm run dev
```

浏览器地址：**http://127.0.0.1:5194/**。关闭启动窗口即停止本地服务；学习进度仍保存在该浏览器与地址中。请固定使用同一地址，localhost 与 127.0.0.1 的浏览器存储彼此独立。

## 学习安排

完整导入 Daily_Plans 的 **2,607 个原始词条**，严格保留编号、拼写、英美音标和中文释义。原文档副本位于 `cet4-source/Daily_Plans/`。

| 天数 | 新学 | 复习 |
| --- | --- | --- |
| Day 01 | List 01–02，200 词 | 无 |
| Day 02–12 | 每天后续两个 List，200 词 | 前一天的 200 词 |
| Day 13 | List 25–26，207 词 | Day 12 的 200 词 |
| Day 14 | 无 | List 25–26，207 词 |

- 新词每 10 个一组，先认识再测试；复习在新词之前。
- 选中天数后点击「开始这一程」。暂停、刷新后能继续原会话。
- 每天独立记录复习进度；复习不会被原版 120 词上限截断。
- 图鉴可按天、难度、主题、学习状态筛选，也能搜索中英文、收藏词条。
- 打字练习支持当天路线、已学、收藏、错词；不改动主线学习进度。
- FSRS 记录记忆状态；主线复习严格遵循 14 天原计划。未来复习预测是 FSRS 预测，不等于主线每日任务。
- 「我的」可导出、恢复备份。备份含所选天数和每日复习记录；进行中的会话会在当前浏览器自动保存，但导出备份不包含会话中间步骤。

## 图片、录音和内容来源

全部 2,607 个词均有本地图片：

- **2,177** 个词直接复用原仓库的同词插画、录音、例句和搭配。
- **423** 个词复用词形或关联场景图，词卡显示「场景联想」及来源词；不复制关联词的释义、例句或录音。
- **7** 个词使用内置 `image_gen` 新增插画：camel、dragon、molecule、bracket、newsstand、ax、devil，保存于 `public/generated/`。

新增图片的完整提示词：`data/image-generation-prompts.json`；逐词媒体来源：`data/media-provenance.json`。图片经过 WebP 格式压缩，已接入正式词卡和缩略图。

430 个没有原录音的词使用浏览器/设备的英美语音合成，效果取决于设备语音支持。原词表未提供例句的词保留释义和音标，不编造例句；例句练习只使用有例句的词。原始词表中的过时或有冒犯性的词保留编号，并在词卡中附有用法说明。

## 构建与校验

```powershell
npm test
npm run check:atlas
npm run build
npm run preview
```

`dist/` 是构建好的静态网站，需通过 HTTP 静态服务器打开。支持子路径部署：设置 `ATLAS_BASE=/words/` 后构建。

如需重新从原资料生成词库，先将完整原仓库解压至 `source/word-atlas-main/`，然后运行 `npm run build:cet4`。可传入新的 Daily_Plans 路径：`node scripts/build-cet4.mjs "C:/path/Daily_Plans"`；不传则使用仓库内的副本。新增图已经保存在本项目中，无需再次生图。

## 原项目与授权

原项目：[designfuchen/word-atlas](https://github.com/designfuchen/word-atlas)，原作者 yangleiocx3。应用代码沿用 MIT，原项目插画、录音和例句遵循 CC BY 4.0。见 `LICENSE` 与 `CONTENT_LICENSE.md`，本改编保留原署名。用户提供的四级词表来源单独保存在 `cet4-source/`，不将其错误归为原作者创作。
