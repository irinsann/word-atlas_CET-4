import { ArrowRight, BookOpen, RotateCcw, Sparkles } from "lucide-react";
import { useAtlas } from "../atlas/context";
import { go, openWord } from "../lib/router";
import { buildSession, todayPlan } from "../store/session";
import { store, useStore } from "../store/store";
import { Illustration } from "../ui/Illustration";
import { Ring } from "../ui/Ring";

export function Study() {
  const atlas = useAtlas();
  const progress = useStore((s) => s.progress);
  const settings = useStore((s) => s.settings);
  const plan = todayPlan(atlas, progress, settings);
  const active =
    progress.session && !progress.session.finished ? progress.session : null;
  const learned = atlas.words.filter((w) => progress.cards[w.id]).length;
  const preview = plan.fresh.slice(0, 6).map((id) => atlas.byId.get(id)!);
  const start = (reviewOnly = false) => {
    if (!active) {
      const session = buildSession(atlas, progress, settings, {
        reviewOnly,
        newOnly: !reviewOnly,
      });
      if (!session.steps.length) return;
      store.progress((p) => ({ ...p, session }));
    }
    go({ page: "learn" });
  };
  return (
    <div className="page cet4-home">
      <header className="cet4-heading">
        <div>
          <p className="eyebrow">WORD ATLAS / CET–4 EDITION</p>
          <h1 className="display">四级词库，自由探索。</h1>
          <p className="lede">
            {atlas.count.toLocaleString()} 个独立词条，按自己的节奏认识与复习。
          </p>
        </div>
        <span className="edition-stamp">
          大学英语四级<b>YOUR OWN PACE</b>
        </span>
      </header>
      <section className="cet4-hero">
        <img
          src={`${import.meta.env.BASE_URL}brand/hero.webp`}
          alt="通往知识星空的旅程"
          className="cet4-hero-art"
          fetchPriority="high"
        />
        <div className="cet4-hero-copy">
          <p className="eyebrow eyebrow-light">
            A WORD AT A TIME <span>从 A 到 Z · 自由学习</span>
          </p>
          <h2>
            每一次相遇，
            <br />
            都由你决定。
          </h2>
          <p className="cet4-hero-lede">
            没有固定天数或每日配额。选一小组新词，或者重逢快要遗忘的词。
          </p>
          <div className="cet4-hero-stats">
            <span>
              <b>{learned.toLocaleString()}</b> 已学
            </span>
            <i />
            <span>
              <b>{(atlas.count - learned).toLocaleString()}</b> 未学
            </span>
            <i />
            <span>
              <b>{plan.due.length}</b> 待复习
            </span>
          </div>
          {!active && plan.fresh.length > 0 && (
            <div className="cet4-round-picker">
              <span>每轮新学</span>
              <div className="segmented" role="group" aria-label="每轮新词数量">
                {[10, 20, 50].map((n) => (
                  <button
                    key={n}
                    className={settings.roundNew === n ? "is-on" : ""}
                    aria-pressed={settings.roundNew === n}
                    onClick={() => store.settings({ roundNew: n })}
                  >
                    {n} 词
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="journey-actions">
            <button
              className="btn btn-primary btn-xl"
              disabled={!active && !plan.fresh.length}
              onClick={() => start()}
            >
              {active
                ? "继续上次练习"
                : plan.fresh.length
                  ? `新学 ${plan.fresh.length} 个词`
                  : "新词已全部学过"}
              <ArrowRight size={19} />
            </button>
            {!active && (
              <button
                className="btn btn-glass btn-xl"
                disabled={!plan.due.length}
                onClick={() => start(true)}
              >
                <RotateCcw size={16} />
                {plan.due.length
                  ? `复习到期 ${plan.due.length} 词`
                  : "暂无到期复习"}
              </button>
            )}
          </div>
          <p className="cet4-hero-note">随时暂停 · 自动保存 · 从词库自由浏览</p>
        </div>
      </section>
      <div className="cet4-overview">
        <div>
          <Sparkles size={19} />
          <span>
            已点亮 <b>{learned.toLocaleString()}</b> /{" "}
            {atlas.count.toLocaleString()} 颗星
          </span>
        </div>
        <div className="cet4-total-bar">
          <span style={{ width: `${(learned / atlas.count) * 100}%` }} />
        </div>
        <button
          className="link"
          onClick={() => go({ page: "atlas", view: "galaxy" })}
        >
          看看我的星图 <ArrowRight size={16} />
        </button>
      </div>
      <section className="cet4-browse">
        <div className="cet4-section-head">
          <div>
            <p className="eyebrow">BROWSE THE COLLECTION</p>
            <h2>从一个字母开始</h2>
          </div>
          <button className="link" onClick={() => go({ page: "atlas" })}>
            打开全部词库 <ArrowRight size={16} />
          </button>
        </div>
        <div className="alphabet-links" aria-label="按首字母浏览">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <button
              key={letter}
              onClick={() => go({ page: "atlas", letter })}
              aria-label={`浏览 ${letter} 开头的词`}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>
      <div className="cet4-bottom-grid">
        <section className="panel cet4-word-preview">
          <div className="panel-head">
            <h3 className="eyebrow">下一次相遇 · 词汇预览</h3>
            <button className="link" onClick={() => go({ page: "atlas" })}>
              自由浏览 <ArrowRight size={15} />
            </button>
          </div>
          <div className="cet4-preview-grid">
            {preview.map((w) => (
              <button key={w.id} onClick={() => openWord(w.id)}>
                <Illustration
                  src={atlas.img(w, "thumb")}
                  word={w.word}
                  topic={w.topic}
                />
                <span>
                  <small>原表 #{w.sourceSeq ?? w.order + 1}</small>
                  <b lang="en">{w.word}</b>
                  <em>{w.zh}</em>
                </span>
              </button>
            ))}
          </div>
          {!preview.length && (
            <p className="muted">
              全部词条都已认识，可以去图鉴回顾，或复习到期的词。
            </p>
          )}
        </section>
        <section className="panel cet4-notes">
          <Ring
            value={learned / atlas.count}
            size={100}
            stroke={6}
            tone="terra"
          >
            <b>{Math.round((learned / atlas.count) * 100)}%</b>
            <small>词库进度</small>
          </Ring>
          <h3>自己的节奏，也能走得很远。</h3>
          <p>
            每轮数量只决定这次练几个词。今天想学多少、什么时候复习，都由你选择。
          </p>
          <button
            className="btn btn-ghost"
            onClick={() => go({ page: "practice" })}
          >
            <BookOpen size={17} />
            练习与错词本
          </button>
          <small>词表去重时保留不同释义和原始来源编号。</small>
        </section>
      </div>
    </div>
  );
}
