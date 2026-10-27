import { useEffect, useState } from "react";

export interface NoteSection {
  seq: number;
  word: string;
  unit: number;
  ipa: string;
  meaning: string;
  blocks: { kind: string; label: string; text: string }[];
  methods: string[];
}
export interface MemoryNote {
  id: number;
  word: string;
  atlasId?: string;
  sections: NoteSection[];
  related: { word: string; atlasId?: string }[];
}
export interface NoteSummary {
  id: number;
  word: string;
  meaning: string;
  atlasId?: string;
  chunk: number;
  units: number[];
  methods: string[];
  related: string[];
}
export interface KnowledgeCatalog {
  title: string;
  source: string;
  sourceSha256: string;
  revision: string;
  stats: { sourceEntries: number; notes: number; matchedMainWords: number; linkedAtlasWords: number; memoryNotes: number; examExamples: number; examples: number; derivatives: number };
  units: { id: number; title: string }[];
  lookup: Record<string, number[]>;
  notes: NoteSummary[];
}

const base = `${import.meta.env.BASE_URL}atlas/knowledge/`;
let catalog: KnowledgeCatalog | null = null;
let catalogRequest: Promise<KnowledgeCatalog> | null = null;
const notes = new Map<number, MemoryNote>();
const chunks = new Map<number, Promise<void>>();

async function readJson<T>(path: string): Promise<T> {
  const r = await fetch(base + path);
  if (!r.ok) throw Error("记忆笔记暂时未能加载，请重试。");
  return r.json() as Promise<T>;
}
export function loadKnowledge() {
  if (catalog) return Promise.resolve(catalog);
  return catalogRequest ??= readJson<KnowledgeCatalog>("index.json").then(data => (catalog = data)).catch(error => {
    catalogRequest = null;
    throw error;
  });
}
async function loadNotes(ids: number[]) {
  const index = await loadKnowledge();
  const wanted = new Set(ids);
  const chunkIds = new Set(index.notes.filter(n => wanted.has(n.id)).map(n => n.chunk));
  await Promise.all([...chunkIds].map(id => {
    if (!chunks.has(id)) chunks.set(id, readJson<MemoryNote[]>(`entries/${id}.json?v=${index.revision}`).then(rows => {
      rows.forEach(n => notes.set(n.id, n));
    }).catch(error => { chunks.delete(id); throw error; }));
    return chunks.get(id);
  }));
  return ids.map(id => notes.get(id)).filter((n): n is MemoryNote => !!n);
}
export function useKnowledgeCatalog() {
  const [data, setData] = useState(catalog);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setError("");
    loadKnowledge().then(value => { if (live) setData(value); }, () => { if (live) setError("记忆笔记暂时未能加载，请重试。"); });
    return () => { live = false; };
  }, [attempt]);
  return { data, error, retry: () => setAttempt(a => a + 1) };
}
export function useKnowledgeNotes(ids: number[]) {
  const key = ids.join(",");
  const [data, setData] = useState<MemoryNote[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setData(null);
    setError("");
    loadNotes(key.split(",").filter(Boolean).map(Number)).then(value => { if (live) setData(value); }, () => { if (live) setError("记忆笔记暂时未能加载，请重试。"); });
    return () => { live = false; };
  }, [key, attempt]);
  return { data, error, retry: () => setAttempt(a => a + 1) };
}
