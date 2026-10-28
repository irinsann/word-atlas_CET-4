import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleBookmark, useStore } from "../store/store";
export function BookmarkButton({ id, word }: { id: string; word?: string }) {
  const saved = useStore((s) => s.progress.bookmarks.includes(id));
  const label = `${saved ? "取消收藏" : "收藏"}${word ? ` ${word}` : "本词"}`;
  return (
    <button
      type="button"
      className={`icon-btn bookmark-btn ${saved ? "is-on" : ""}`}
      aria-label={label}
      title={label}
      aria-pressed={saved}
      onClick={() => toggleBookmark(id)}
    >
      {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
    </button>
  );
}
