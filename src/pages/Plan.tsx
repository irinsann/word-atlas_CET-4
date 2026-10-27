import { ArrowRight, Check, BookOpen, RotateCcw, Sparkles } from "lucide-react";
import { useAtlas } from "../atlas/context";
import { go, openWord } from "../lib/router";
import { cet4Plan } from "../store/cet4";
import { buildSession } from "../store/session";
import { store, useStore } from "../store/store";
import { Illustration } from "../ui/Illustration";
import { Ring } from "../ui/Ring";

export function Plan() {
  const atlas = useAtlas();
  const progress = useStore(s => s.progress);
  const settings = useStore(s => s.settings);
  const day = settings.planDay;
  const plan = cet4Plan(atlas, progress, day);
  const active = progress.session && !progress.session.finished ? progress.session : null;
  const learned = atlas.words.filter(w => progress.cards[w.id]).length;
  const allDays = Array.from({ length: 14 }, (_, i) => cet4Plan(atlas, progress, i + 1));
  const completed = allDays.filter(p => p.done === p.total).length;
  const start = (reviewOnly = false) => {
    if (!active) {
      const session = buildSession(atlas, progress, settings, { reviewOnly });
      if (!session.steps.length) return;
      store.progress(p => ({ ...p, session }));
    }
    go({ page: "learn" });
  };
  const preview = [...plan.all.review, ...plan.all.fresh];
  return <div className="page cet4-home">
    <header className="cet4-heading"><div><p className="eyebrow">WORD ATLAS / CET–4 EDITION</p><h1 className="display">十四天，让单词有画面。</h1><p className="lede">先温故，再知新。把 2,607 个四级词，点亮成自己的星空。</p></div><span className="edition-stamp">大学英语四级<b>14 DAY JOURNEY</b></span></header>
    <section className="cet4-hero">
      <img src={`${import.meta.env.BASE_URL}brand/hero.webp`} alt="通往知识星空的旅程" className="cet4-hero-art" fetchPriority="high" />
      <div className="cet4-hero-copy"><p className="eyebrow eyebrow-light">YOUR DAILY EXPEDITION <span>第 {String(day).padStart(2,"0")} / 14 天</span></p>
        <h2>{day === 1 ? <>第一颗星，<br/>从今天点亮。</> : day === 14 ? <>最后一程，<br/>让记忆扎根。</> : <>昨日的相遇，<br/>今天的回响。</>}</h2>
        <p className="cet4-hero-lede">{day === 1 ? "初次见面，认识 List 01 & 02 的 200 个新朋友。" : day === 14 ? "复习 List 25 & 26 的 207 个词，完成这次旅程。" : `先复习昨日 ${plan.all.review.length} 词，再认识今日 ${plan.all.fresh.length} 词。`}</p>
        <div className="cet4-hero-stats"><span><b>{plan.due.length}</b> 待复习</span><i/><span><b>{plan.fresh.length}</b> 待新学</span><i/><span><b>{plan.done}</b> 已完成</span></div>
        <div className="journey-actions">{active || plan.due.length + plan.fresh.length > 0 ? <button className="btn btn-primary btn-xl" onClick={() => start()}>{active ? `继续第 ${active.planDay ?? day} 天的旅程` : "开始这一程"}<ArrowRight size={19}/></button> : <button className="btn btn-primary btn-xl" onClick={() => day < 14 ? store.settings({ planDay: day + 1 }) : go({ page: "practice" })}>{day < 14 ? "前往下一天" : "完成旅程 · 巩固练习"}<ArrowRight size={19}/></button>}
        {!active && plan.due.length > 0 && plan.fresh.length > 0 && <button className="btn btn-glass" onClick={() => start(true)}><RotateCcw size={16}/>先复习昨日</button>}</div>
        <p className="cet4-hero-note">新词每 10 个一组 · 随时暂停 · 自动保存进度</p>
      </div>
    </section>
    <div className="cet4-overview"><div><Sparkles size={19}/><span>已点亮 <b>{learned.toLocaleString()}</b> / 2,607 颗星</span></div><div className="cet4-total-bar"><span style={{width:`${learned / 2607 * 100}%`}}/></div><span>已完成 {completed} / 14 天</span><button className="link" onClick={() => go({page:"atlas",view:"galaxy"})}>看看我的星图 <ArrowRight size={16}/></button></div>
    <section className="cet4-route-section"><div className="cet4-section-head"><div><p className="eyebrow">THE LEARNING PATH</p><h2>你的十四天路线</h2></div><p>按原词表顺序 · 第 13 天新学 207 词 · 第 14 天收尾复习</p></div>
      <div className="cet4-days">{allDays.map((p, i) => <button key={i} className={`cet4-day ${i + 1 === day ? "is-selected" : ""} ${p.done === p.total ? "is-complete" : ""}`} onClick={() => store.settings({ planDay: i + 1 })} aria-pressed={i + 1 === day}>
        <div className="cet4-day-top"><span>DAY <b>{String(i+1).padStart(2,"0")}</b></span>{p.done === p.total ? <Check size={17}/> : <span className="cet4-day-dot"/>}</div><strong>{i === 13 ? "收尾复习" : `List ${String(i*2+1).padStart(2,"0")} & ${String(i*2+2).padStart(2,"0")}`}</strong><p>{p.all.fresh.length ? `新学 ${p.all.fresh.length}` : "不加新词"} <span>·</span> 复习 {p.all.review.length}</p><div className="cet4-day-bar"><span style={{width:`${p.done / p.total * 100}%`}}/></div><small>{p.done === p.total ? "已完成" : p.done ? `已完成 ${p.done} / ${p.total}` : i + 1 === day ? "这一程，等你出发" : "点击查看"}</small>
      </button>)}</div>
    </section>
    <div className="cet4-bottom-grid"><section className="panel cet4-word-preview"><div className="panel-head"><h3 className="eyebrow">第 {day} 天 · 词汇预览</h3><button className="link" onClick={() => go({page:"atlas",day:String(day)})}>查看本日全部 <ArrowRight size={15}/></button></div><div className="cet4-preview-grid">{preview.slice(0,6).map(w => <button key={w.id} onClick={() => openWord(w.id)}><Illustration src={atlas.img(w,"thumb")} word={w.word} topic={w.topic}/><span><small>№ {String(w.order+1).padStart(4,"0")}</small><b lang="en">{w.word}</b><em>{w.zh}</em></span></button>)}</div></section>
    <section className="panel cet4-notes"><Ring value={learned / 2607} size={100} stroke={6} tone="terra"><b>{Math.round(learned / 2607 * 100)}%</b><small>词库进度</small></Ring><h3>记得住，比赶得快更重要。</h3><p>每天先复习昨日的词，再学习新词。遇到卡壳的词，练习会再带你见一面。</p><button className="btn btn-ghost" onClick={() => go({page:"practice"})}><BookOpen size={17}/>去练习与错词本</button><small>进度保存在当前浏览器，可在「我的」导出备份。</small></section></div>
  </div>;
}
