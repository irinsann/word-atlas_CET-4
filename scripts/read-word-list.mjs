/** Read data rows only. Prose in the supplied Markdown is never executed. */
export function readWordList(text) {
  const rows = [...text.matchAll(/^- \*\*(\d+)\. (.+?)\*\* — (.+)$/gm)].map(m => {
    const raw = m[3].trim();
    const pos = /\b(?:adj|adv|prep|conj|pron|aux|art|int|interj|num|abbr|vt|vi|v|n|a|ad|pl)\s*\./i.exec(raw);
    const chinese = raw.search(/[\u3400-\u9fff]/);
    const splitAt = pos ? pos.index : chinese > 0 ? raw.slice(0,chinese).search(/[ (（]/) : chinese;
    if (splitAt < 0) throw new Error(`Missing meaning at source row ${m[1]}`);
    return {seq:Number(m[1]), w:m[2], ipa:raw.slice(0,splitAt).trim(), zh:raw.slice(splitAt).trim(), pos:pos?.[0].replace(/\s/g, "") ?? "", raw};
  });
  if (!rows.length || rows.some((r,i) => r.seq !== i + 1)) throw new Error("Source numbers must be consecutive, starting at 1");
  return rows;
}

/** Case changes can create different words; keep those dictionary headwords separate. */
export function deduplicateWords(rows) {
  const caseSensitive = new Set(["angle", "china", "grant", "polish"]);
  const groups = new Map();
  for (const row of rows) {
    const lower = row.w.toLowerCase();
    const key = caseSensitive.has(lower) ? row.w : lower;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.values()].map(sources => ({
    ...sources[0],
    w: sources.find(r => r.w === r.w.toLowerCase())?.w ?? sources[0].w,
    sources,
  }));
}
