import { Bookmark, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAtlas } from "../atlas/context";
import { canonicalBookmarks, exportFavorites } from "../lib/favorites";
import { openWord } from "../lib/router";
import { dayKey, useStore } from "../store/store";
import { BookmarkButton } from "../ui/BookmarkButton";
import { Illustration } from "../ui/Illustration";
import { toast } from "../ui/Toast";

export function Favorites() {
  const atlas = useAtlas();
  const bookmarks = useStore((s) => s.progress.bookmarks);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [limit, setLimit] = useState(50);
  const [busy, setBusy] = useState(false);
  const all = useMemo(() => {
    const byId = atlas.allById ?? atlas.byId;
    return canonicalBookmarks(bookmarks).flatMap((id) => {
      const w = byId.get(id);
      return w ? [w] : [];
    });
  }, [atlas, bookmarks]);
  const list = useMemo(
    () =>
      all.filter(
        (w) =>
          (scope === "all" || w.learningScope === scope) &&
          `${w.word} ${w.zh}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [all, scope, query],
  );
  const download = async (format: "csv" | "md") => {
    setBusy(true);
    try {
      const entries = await Promise.all(list.map((w) => atlas.entry(w.id)));
      const blob = new Blob([exportFavorites(entries, format)], {
        type:
          format === "csv"
            ? "text/csv;charset=utf-8"
            : "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `词光收藏-${dayKey()}.${format}`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast(`已导出 ${entries.length} 个收藏词`);
    } catch {
      toast("导出没能完成，请检查网络后重试。", "warn");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page favorites">
      <header className="page-head">
        <p className="eyebrow">我的收藏 · {all.length} 词</p>
        <h1 className="display">想多看一眼的词。</h1>
        <p className="lede">
          在词卡或学习页点一下书签，就会留在这里。两个词库的收藏放在一起，最近收藏的在前。
        </p>
      </header>
      <section className="panel favorites-tools">
        <label className="search">
          <Search size={18} />
          <input
            type="search"
            aria-label="搜索收藏"
            placeholder="搜索单词或释义"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(50);
            }}
          />
        </label>
        <div className="segmented" role="group" aria-label="收藏范围">
          {[
            ["all", "全部收藏"],
            ["cet4", "四级词库"],
            ["extension", "扩展词库"],
          ].map(([key, label]) => (
            <button
              key={key}
              aria-pressed={scope === key}
              className={scope === key ? "is-on" : ""}
              onClick={() => {
                setScope(key);
                setLimit(50);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="favorites-export">
          <span className="muted">
            {list.length} 个结果 ·
            导出当前筛选，包含释义、英美音标、例句和出处。
          </span>
          <div>
            <button
              className="btn btn-ghost"
              disabled={busy || !list.length}
              onClick={() => download("csv")}
            >
              <Download size={17} />
              {busy ? "正在整理…" : "导出 CSV"}
            </button>
            <button
              className="btn btn-ghost"
              disabled={busy || !list.length}
              onClick={() => download("md")}
            >
              导出 Markdown
            </button>
          </div>
        </div>
      </section>
      {!list.length ? (
        <div className="empty">
          <Bookmark size={36} />
          <p>
            {all.length
              ? "没有匹配的收藏，换个搜索词或范围试试。"
              : "还没有收藏。遇到想留下的词，点一下书签。"}
          </p>
        </div>
      ) : (
        <>
          <ul className="favorites-list">
            {list.slice(0, limit).map((w) => (
              <li key={w.id}>
                <button
                  className="favorite-word"
                  onClick={() => openWord(w.id)}
                >
                  <Illustration
                    src={atlas.img(w, "thumb")}
                    word={w.word}
                    topic={w.topic}
                  />
                  <span>
                    <b lang="en">{w.word}</b>
                    <small>
                      {w.learningScope === "extension"
                        ? "扩展词库"
                        : "四级词库"}
                    </small>
                    <em>{w.zh}</em>
                  </span>
                </button>
                <BookmarkButton id={w.id} word={w.word} />
              </li>
            ))}
          </ul>
          {list.length > limit && (
            <button
              className="btn btn-ghost"
              onClick={() => setLimit((n) => n + 50)}
            >
              再显示 50 个
            </button>
          )}
        </>
      )}
      <p className="muted favorites-note">
        收藏保存在当前浏览器。导出文件用于查阅；如需换设备恢复收藏，可在「我的」导出整份学习备份。
      </p>
    </div>
  );
}
