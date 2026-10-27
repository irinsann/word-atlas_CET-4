import { ArrowUpRight, Database, Github, Heart } from "lucide-react";
import { useAtlas } from "../atlas/context";
import { REPO_URL, UPSTREAM_REPO_URL } from "../config";

const BASE = import.meta.env.BASE_URL;

export function About() {
  const atlas = useAtlas();
  return (
    <div className="page about">
      <header className="about-hero">
        <img src={`${BASE}brand/og.webp`} alt="" />
        <div>
          <p className="eyebrow">关于词光</p>
          <h1 className="display">十四天，点亮四级词汇。</h1>
          <p className="lede">
            四级版以本地 Daily_Plans 的 {atlas.count.toLocaleString()} 个词为准，完整保留编号、英美音标和中文释义。前 13 天学习新词，第 14 天收尾复习；从第 2 天起，先复习前一天的词。
          </p>
          <p className="lede">基于 Word Atlas 开源版改编，无需注册。原项目代码遵循 MIT，复用插画、音频与例句遵循 CC BY 4.0，原作者署名保留。</p>
          <div className="about-actions">
            <a className="btn btn-primary" href={REPO_URL} target="_blank" rel="noreferrer">
              <Github size={18} /> 在 GitHub 上查看
            </a>
            <a className="btn btn-ghost" href={`${UPSTREAM_REPO_URL}/tree/main/data`} target="_blank" rel="noreferrer">
              <Database size={18} /> 查看原项目词库
            </a>
          </div>
        </div>
      </header>

      <div className="about-grid">
        <section className="panel">
          <h3 className="eyebrow">为什么记得住</h3>
          <ul className="feature-list">
            <li>
              <b>先看见。</b>优先复用同词插画；关联场景标注「场景联想」，缺少的图由内置生图补齐。
            </li>
            <li>
              <b>再想起。</b>选义、看图补句、听音辨词、拼写，从认得走到会写。
            </li>
            <li>
              <b>昨日重逢。</b>14 天路线固定复习前一天的词；FSRS 另外记录每个词的记忆稳定度和预计复习时间。
            </li>
            <li>
              <b>分数诚实。</b>只算第一次作答。答错的词会换个题型再见一面，但不会抬高正确率。
            </li>
            <li>
              <b>进度只属于你。</b>没有账号，没有服务器，数据存在你的浏览器里，随时能导出。
            </li>
          </ul>
        </section>

        <section className="panel">
          <h3 className="eyebrow">快捷键</h3>
          <dl className="keys">
            <div>
              <dt>
                <kbd>⌘</kbd>
                <kbd>K</kbd> 或 <kbd>/</kbd>
              </dt>
              <dd>搜索任何词</dd>
            </div>
            <div>
              <dt>
                <kbd>1</kbd>–<kbd>4</kbd>
              </dt>
              <dd>选择答案</dd>
            </div>
            <div>
              <dt>
                <kbd>Enter</kbd>
              </dt>
              <dd>确认 / 继续</dd>
            </div>
            <div>
              <dt>
                <kbd>←</kbd> <kbd>→</kbd>
              </dt>
              <dd>词卡里切换上一个、下一个</dd>
            </div>
            <div>
              <dt>
                <kbd>Esc</kbd>
              </dt>
              <dd>关闭弹窗</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <h3 className="eyebrow">内容从哪里来</h3>
          <p className="muted">
            词条与学习安排来自你提供的 Daily_Plans。匹配的词复用原项目的例句、搭配、插画和录音；没有原录音的词使用设备的英美语音朗读，没有原例句的词只显示词表内容。关联图片不复制其他词的释义或录音。详细来源记录在 data/media-provenance.json，新图提示词记录在 data/image-generation-prompts.json。
          </p>
          <p className="muted">内容与原项目署名：designfuchen/word-atlas，原作者 yangleiocx3。四级版学习进度独立保存在当前设备中。</p>
        </section>

        <section className="panel">
          <h3 className="eyebrow">给开发者</h3>
          <p className="muted">
            <code>data/word-atlas.json</code> 和 <code>.csv</code> 是完整词库；<code>public/atlas</code> 里是网页用的分块数据、插画和音频。拿去做 Anki 牌组、背词小程序、浏览器插件，或者 AI 应用的评测集，署名即可。
          </p>
          <a className="link" href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer">
            阅读文档 <ArrowUpRight size={14} />
          </a>
        </section>
      </div>
      <p className="colophon">
        <Heart size={14} /> 做给每一个在背单词的人。
      </p>
    </div>
  );
}
