import type { Atlas } from "../atlas/types";
import type { Progress } from "./store";

export function dayWords(atlas: Atlas, day: number) {
  const fresh = day === 14 ? [] : atlas.words.slice((day - 1) * 200, day === 13 ? 2607 : day * 200);
  const review = day === 1 ? [] : atlas.words.slice((day - 2) * 200, day === 14 ? 2607 : (day - 1) * 200);
  return { fresh, review };
}

export function cet4Plan(atlas: Atlas, p: Progress, day: number) {
  const all = dayWords(atlas, day);
  const reviewed = new Set(p.planReviews?.[day] ?? []);
  const fresh = all.fresh.filter(w => !p.cards[w.id]).map(w => w.id);
  const due = all.review.filter(w => !reviewed.has(w.id)).map(w => w.id);
  const total = all.fresh.length + all.review.length;
  return { fresh, due, total, done: total - fresh.length - due.length, minutes: Math.max(1, Math.round(due.length * .25 + fresh.length * .9)), all };
}
