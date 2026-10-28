import { ArrowUpRight, Database, Github, Heart } from "lucide-react";
import { REPO_URL, UPSTREAM_REPO_URL } from "../config";
import knowledgeSummary from "../generated/knowledge-summary.json";
import paperSummary from "../generated/paper-summary.json";
import vocabulary from "../generated/vocabulary-scope.json";

const BASE = import.meta.env.BASE_URL;

export function About() {
  return (
    <div className="page about">
      <header className="about-hero">
        <img src={`${BASE}brand/og.webp`} alt="" />
        <div>
          <p className="eyebrow">关于词光</p>
          <h1 className="display">关于词光</h1>
          <p className="lede">
            这是一个免费的四级单词学习网站。默认词库有 {vocabulary.cet4.toLocaleString()} 个词，包含大纲四级词和基础补充，重点词排在前面。
            另有 {vocabulary.extension} 个扩展词，包含 {vocabulary.cet6} 个六级词及同列词族、{vocabulary.outside} 个大纲外补充，想多学一点时可以主动切换。
            可以自己选每轮学多少，也可以随时查词、复习。
          </p>
          <p className="lede">
            网站基于 Word Atlas 改编，无需注册。代码使用 MIT 许可，复用的插画、音频和例句遵循 CC BY 4.0，并保留原作者署名。
          </p>
          <div className="about-actions">
            <a
              className="btn btn-primary"
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} /> 在 GitHub 上查看
            </a>
            <a
              className="btn btn-ghost"
              href={`${UPSTREAM_REPO_URL}/tree/main/data`}
              target="_blank"
              rel="noreferrer"
            >
              <Database size={18} /> 查看原项目词库
            </a>
          </div>
        </div>
      </header>

      <div className="about-grid">
        <section className="panel">
          <h3 className="eyebrow">四级范围怎样划分</h3>
          <p className="muted">
            词库对照教育考试院《全国大学英语四、六级考试大纲（2016年修订版）》整理。六级标记词及其同列词族已移入扩展词库，默认的新词、复习、选项和打字练习分别从当前词库选取。
            大纲没有逐个列出所有派生词。常见派生词、国家名和生活基础词经核对后保留，并标为「四级基础补充」，与「大纲四级」区分。
          </p>
          <p className="muted">扩展词也可能出现在四级文章里。这里划分的是学习范围，不是断言某个词绝不会出现在考试中。</p>
          <a className="link" href={`${REPO_URL}/blob/main/docs/vocabulary-review.md`} target="_blank" rel="noreferrer">查看逐词核查记录 <ArrowUpRight size={14} /></a>
        </section>
        <section className="panel">
          <h3 className="eyebrow">例句与真题出处</h3>
          <p className="muted">
            例句选自 {paperSummary.documents} 份四级试卷和听力原文，覆盖{" "}
            {paperSummary.replacedWords.toLocaleString()} 个词，共有{" "}
            {paperSummary.genuineExamples.toLocaleString()}{" "}
            条引用，有些词会用到同一句。点开例句下方的出处，可以查看考试时间、套数、题型，以及原文件的位置。引文只整理了换行和空格。
          </p>
          <p className="muted">
            没找到真题例句的词，会保留原项目例句，并注明尚未找到真题出处。中文由 AI 翻译，做过抽查修订，供学习参考，不是官方译文。朗读使用设备语音，不是原题录音。题库来自转录稿，个别文字可能有误。
          </p>
        </section>
        <section className="panel">
          <h3 className="eyebrow">记忆笔记</h3>
          <p className="muted">
            笔记整理自《英语四级，你还在背单词吗？》，共
            {knowledgeSummary.notes.toLocaleString()}{" "}
            份，包含谐音、联想、词根词缀、易混词和例句。
            {knowledgeSummary.linkedAtlasWords.toLocaleString()}{" "}
            个单词可以在词卡里直接查看笔记，其余内容可到笔记页搜索。笔记保留原文单元和编号，部分扫描文字和音标可能有误。
          </p>
          <a className="link" href="#/knowledge">
            浏览记忆笔记 <ArrowUpRight size={14} />
          </a>
        </section>
        <section className="panel">
          <h3 className="eyebrow">可以怎么学</h3>
          <ul className="feature-list">
            <li>
              <b>看词卡。</b>
              查看释义、插画和发音。借用其他单词图片的词卡会标注「场景联想」。
            </li>
            <li>
              <b>做练习。</b>选择词义、看图补句、听音选词，也可以练拼写。
            </li>
            <li>
              <b>复习。</b>网站用 FSRS 根据答题记录安排下次复习，你可以在首页选择学新词或复习。
            </li>
            <li>
              <b>看结果。</b>
              正确率只算第一次作答，答错后重做不计分。
            </li>
            <li>
              <b>保存记录。</b>
              学习记录保存在浏览器里，可在「我的」导出备份。
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
            初始词表来自 Words_all.md 和 CET4_Core_2607_Vocabulary.md；后者与 RealKai42/qwerty-learner 的 CET4 词书对应，属于第三方词书。现已修正发现的残缺拼写、合并更正后重复的词，并按考试大纲复核学习范围。范围核查不等于所有释义和搭配都已经逐义项审校。
            搭配、插画和单词录音主要沿用原项目，缺少的插画由 AI 补充，缺少录音的词使用设备语音。借用其他词的插画不会改变本词的释义和发音。
          </p>
          <p className="muted">
            原项目：designfuchen/word-atlas，原作者 yangleiocx3。感谢原作者提供的代码和内容。
          </p>
        </section>

        <section className="panel">
          <h3 className="eyebrow">给开发者</h3>
          <p className="muted">
            <code>data/word-atlas.json</code> 是去重词库，
            <code>cet4-source/Words_all.md</code> 是原始记录；
            <code>public/atlas</code> 保存网站使用的词条、插画与录音。词表去重记录见 <code>data/source-import.json</code>，图片与录音来源见 <code>data/media-provenance.json</code>，新图提示词见 <code>data/image-generation-prompts.json</code>。各类内容的许可见 <code>CONTENT_LICENSE.md</code>。
          </p>
          <a
            className="link"
            href={`${REPO_URL}#readme`}
            target="_blank"
            rel="noreferrer"
          >
            阅读文档 <ArrowUpRight size={14} />
          </a>
        </section>
      </div>
      <p className="colophon">
        <Heart size={14} /> 词光 · 免费开源
      </p>
    </div>
  );
}
