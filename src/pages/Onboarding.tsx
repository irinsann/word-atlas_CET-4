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
  return <div className="onboard" role="dialog" aria-modal="true" aria-label="欢迎使用词光"><div className="onboard-card"><img className="onboard-art" src={`${import.meta.env.BASE_URL}brand/hero.webp`} alt=""/><div className="onboard-body"><p className="eyebrow">词光 / CET–4 EDITION</p><h1 className="display">有些词，<br/>多见几次就熟了。</h1><p className="lede">{atlas.count.toLocaleString()} 个词，可以查词、学习和复习。</p><div className="cet4-welcome-steps"><p><b>查词</b>可以搜单词、中文，也能按首字母和主题筛选。</p><p><b>学新词</b>每轮选 10、20 或 50 个，随时可以暂停。</p><p><b>复习</b>根据答题记录安排时间，在首页就能开始。</p></div><button className="btn btn-primary btn-xl" onClick={()=>store.settings({onboarded:true,startLevel:0})}>翻开词库 <ArrowRight size={19}/></button><p className="muted">不用注册。学习记录会保存在当前浏览器，可在「我的」备份。</p></div></div></div>;
}
