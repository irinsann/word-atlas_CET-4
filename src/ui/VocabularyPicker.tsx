import { useAtlas } from "../atlas/context";
import { store } from "../store/store";

export function VocabularyPicker() {
  const atlas = useAtlas();
  const all = atlas.allWords ?? atlas.words;
  const extension = all.filter(w => w.learningScope === "extension").length;
  if (!extension) return null;
  const current = atlas.scope ?? "cet4";
  return <div className="vocabulary-picker">
    <div className="segmented" role="group" aria-label="学习词库">
      <button aria-pressed={current === "cet4"} className={current === "cet4" ? "is-on" : ""}
        onClick={() => store.settings({ vocabularyScope: "cet4" })}>四级词库 <small>{(all.length-extension).toLocaleString()}</small></button>
      <button aria-pressed={current === "extension"} className={current === "extension" ? "is-on" : ""}
        onClick={() => store.settings({ vocabularyScope: "extension" })}>扩展词库 <small>{extension}</small></button>
    </div>
    <p className="muted">{current === "cet4" ? "大纲四级词与基础补充，重点词在前。" : "六级词和大纲外补充，想多学一点时再来。"}</p>
  </div>;
}
