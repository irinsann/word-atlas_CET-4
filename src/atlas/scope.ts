import type { Atlas, VocabularyScope } from "./types";
import type { ActiveSession } from "../store/store";

/** Share entries/media and progress identities, but isolate every learning pool. */
export function scopeAtlas(atlas: Atlas, scope: VocabularyScope): Atlas {
  const allWords = atlas.allWords ?? atlas.words;
  const words = allWords.filter(w => (w.learningScope ?? "cet4") === scope).map((w, order) => ({ ...w, order }));
  return {
    ...atlas, scope, allWords, allById: atlas.allById ?? atlas.byId,
    totalCount: allWords.length, count: words.length, words,
    byId: new Map(words.map(w => [w.id, w])),
  };
}

export function sessionInScope(session: ActiveSession | null, atlas: Atlas): boolean {
  if (!session || (session.vocabularyScope ?? "cet4") !== (atlas.scope ?? "cet4")) return false;
  return session.steps.every(step => atlas.byId.has(step.id) &&
    (!("options" in step) || !step.options || step.options.every(id => atlas.byId.has(id))));
}
