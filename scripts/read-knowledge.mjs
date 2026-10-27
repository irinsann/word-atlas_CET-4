const LABELS = { "真题": "exam", "例句": "example", "记忆法": "memory", "派生": "derived", "短语": "phrase", "词形": "forms", "其他拼写": "spelling" };

export function wordKey(word) {
  return word.normalize("NFKC").replace(/[’‘]/g, "'").replace(/[‐‑–—]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
}

export function memoryMethods(blocks) {
  const memory = blocks.filter(b => b.kind === "memory").map(b => b.text).join(" ");
  const methods = [];
  if (/谐音|发音|读音|读成|读作|音似|音译|拟声/.test(memory)) methods.push("sound");
  if (/联想|想象|想成|拆分|拆为|拆成|故事/.test(memory)) methods.push("association");
  if (/词根|词缀|前缀|后缀/.test(memory)) methods.push("roots");
  if (/形近|形似|对照|对比|比较|区别|区分|相似/.test(memory)) methods.push("contrast");
  if (blocks.some(b => b.kind === "exam" || b.kind === "example")) methods.push("context");
  return methods;
}

/** Read numbered headings and labeled paragraphs as data; never interpret HTML or instructions. */
export function readKnowledge(text) {
  const units = [];
  const records = [];
  let unit = 0;
  let current = null;
  let block = null;
  for (const line of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const unitHeading = /^## 第[^\s]+单元[：:]\s*(.+)$/.exec(line);
    const heading = /^### (\d+)\.\s+(.+?)\s*$/.exec(line);
    const label = /^\*\*([^*：:]+)[：:]\*\*\s*(.*)$/.exec(line);
    if (unitHeading) {
      unit = units.length + 1;
      units.push({ id: unit, title: unitHeading[1] });
      current = null;
      block = null;
    } else if (heading) {
      current = { seq: Number(heading[1]), word: heading[2], unit, intro: [], blocks: [] };
      records.push(current);
      block = null;
    } else if (current && label) {
      block = { kind: LABELS[label[1]] ?? "note", label: label[1], text: label[2] };
      current.blocks.push(block);
    } else if (current && !/^\s*<a\b/.test(line)) {
      if (block) block.text += "\n" + line;
      else current.intro.push(line);
    }
  }
  for (const [i, record] of records.entries()) {
    if (record.seq !== i + 1 || !record.unit) throw Error(`Invalid knowledge heading #${record.seq}`);
    const intro = record.intro.map(s => s.trim()).filter(Boolean);
    record.ipa = intro[0]?.startsWith("/") ? intro.shift() : "";
    record.meaning = intro.join("\n");
    delete record.intro;
    record.blocks.forEach(b => { b.text = b.text.trim(); });
    // Seven restored headings place the definition after a forms / spelling label.
    if (!record.meaning && ["forms", "spelling"].includes(record.blocks[0]?.kind)) {
      const first = record.blocks[0];
      const paragraphs = first.text.split(/\n\s*\n/);
      if (paragraphs.length > 1) {
        first.text = paragraphs.shift();
        record.meaning = paragraphs.join("\n\n");
      }
    }
    record.methods = memoryMethods(record.blocks);
  }
  return { units, records };
}

export function groupKnowledge(records) {
  const grouped = new Map();
  for (const record of records) {
    const key = wordKey(record.word);
    let note = grouped.get(key);
    if (!note) {
      note = { id: record.seq, word: record.word, sections: [] };
      grouped.set(key, note);
    }
    note.sections.push(record);
  }
  return [...grouped.values()];
}

/** Only an explicit derived-form or alternate-spelling heading creates a relationship. */
export function relatedWords(note) {
  const words = [];
  for (const section of note.sections) {
    for (const b of section.blocks) {
      if (!["derived", "spelling", "forms"].includes(b.kind)) continue;
      const match = /^([A-Za-z][A-Za-z'-]*(?:\([A-Za-z]+\))?)/.exec(b.text);
      if (match) {
        const word = match[1];
        if (/\([a-z]+\)/i.test(word)) {
          words.push(word.replace(/[()]/g, ""), word.replace(/\([a-z]+\)/gi, ""));
        } else words.push(word);
        const alternate = /[（(]([A-Za-z][A-Za-z'-]*)[）)]/.exec(b.text.split(/\n/)[0]);
        if (alternate) words.push(alternate[1]);
        if (b.kind === "forms") {
          for (const form of b.text.split(/[,，]/).slice(1)) {
            const other = /^\s*([A-Za-z][A-Za-z'-]*)/.exec(form);
            if (other) words.push(other[1]);
          }
        }
      }
    }
  }
  return [...new Set(words)];
}
