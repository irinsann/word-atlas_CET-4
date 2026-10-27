# 参与贡献 / Contributing

谢谢你愿意让词光变得更好。

## 修正词条

最有价值的贡献是纠错。请在 Issue 中写明词条 `id`、问题和建议的改法，或直接提交 PR：

1. 修改词库前，请先看 [词库说明](data/README.md) 与 [生成流程](README.md#构建与校验)。词表来源保存在 `cet4-source/Words_all.md`；去重规则在 `scripts/read-word-list.mjs`，修正时请保留原编号、不同释义及读音。图片映射维护在 `scripts/cet4-image-map.mjs` 与 `scripts/words-image-map.mjs`，媒体来源记录在 `data/media-provenance.json`。
2. 运行 `npm run check:atlas` 和 `npm test`。
3. 在 PR 里说明修改理由，必要时附权威词典链接。

## 代码

- TypeScript 严格模式，React 函数组件，不引入状态管理或 UI 框架依赖。
- 保持“无账号、本地优先、无追踪”的方向。
- 视觉改动请同时检查浅色、深色和 375px 手机宽度。
- 提交前运行 `npm test`、`npm run check:atlas`、`npm run build`。

## 新素材

新增图片、录音或文本时，请写明来源与授权，只接受可以按 CC BY 4.0 再分发的内容。

## 安全

不要在 Issue、PR、截图或日志中粘贴任何 API key。生成脚本只从环境变量或仓库外的文件读取凭据，见 [SECURITY.md](SECURITY.md)。
