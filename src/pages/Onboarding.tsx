import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useAtlas } from "../atlas/context";
import { store } from "../store/store";
export function Onboarding() {
  const atlas=useAtlas();
  useEffect(() => {
    const root = document.documentElement;
    const wasLocked = root.classList.contains("is-locked");
    root.classList.add("is-locked");
    return () => {
      if (!wasLocked) root.classList.remove("is-locked");
    };
  }, []);
  return <div className="onboard" role="dialog" aria-modal="true" aria-label="欢迎来到四级自由词库"><div className="onboard-card"><img className="onboard-art" src={`${import.meta.env.BASE_URL}brand/hero.webp`} alt=""/><div className="onboard-body"><p className="eyebrow">词光 / CET–4 EDITION</p><h1 className="display">从一个词，<br/>打开一片星空。</h1><p className="lede">{atlas.count.toLocaleString()} 个去重词条，按自己的节奏学习。</p><div className="cet4-welcome-steps"><p><b>自由探索</b>按 A–Z、主题或搜索找到想认识的词。</p><p><b>一小组</b>每轮选 10、20 或 50 词，不设每日配额。</p><p><b>记忆重逢</b>根据学习记录复习，随时暂停和继续。</p></div><button className="btn btn-primary btn-xl" onClick={()=>store.settings({onboarded:true,startLevel:0})}>开始自由探索 <ArrowRight size={19}/></button><p className="muted">无需注册。进度自动保存在浏览器，可在「我的」导出备份。</p></div></div></div>;
}
