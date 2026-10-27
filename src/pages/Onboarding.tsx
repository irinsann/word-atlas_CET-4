import { ArrowRight } from "lucide-react";
import { useAtlas } from "../atlas/context";
import { store } from "../store/store";
export function Onboarding() {
  const atlas = useAtlas();
  return <div className="onboard" role="dialog" aria-modal="true" aria-label="欢迎来到四级十四天计划"><div className="onboard-card"><img className="onboard-art" src={`${import.meta.env.BASE_URL}brand/hero.webp`} alt=""/><div className="onboard-body"><p className="eyebrow">词光 / CET–4 EDITION</p><h1 className="display">十四天，<br/>点亮四级词汇。</h1><p className="lede">把 {atlas.count.toLocaleString()} 个词变成画面，让每次复习都有迹可循。</p><div className="cet4-welcome-steps"><p><b>01—13</b>每天新学 200 词，第 13 天 207 词。</p><p><b>02—14</b>先复习昨日的词，再稳步认识新词。</p><p><b>随时继续</b>每 10 个新词一组，进度自动保存。</p></div><button className="btn btn-primary btn-xl" onClick={() => store.settings({onboarded:true,startLevel:0,planDay:1})}>从第一天出发 <ArrowRight size={19}/></button><p className="muted">无需注册。可自由切换天数，在「我的」备份学习进度。</p></div></div></div>;
}
