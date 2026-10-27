/** Irregular forms that a stem match would miss ("teach" → "taught"). */
const IRREGULAR = new Map(
  "arise arose arisen|awake awoke awoken|bear bore borne born|beat beat beaten|become became|begin began begun beginn|bend bent|bet bet|bind bound|bite bit bitten|bleed bled|blow blew blown|break broke broken|breed bred|bring brought|broadcast broadcast|build built|burn burnt burned|burst burst|buy bought|catch caught|choose chose chosen|cling clung|come came|cost cost|creep crept|cut cut cutt|deal dealt|dig dug|do did done does|draw drew drawn|dream dreamt dreamed|drink drank drunk|drive drove driven|eat ate eaten|fall fell fallen|feed fed|feel felt|fight fought|find found|flee fled|fling flung|fly flew flown flies|forbid forbade forbidden|forget forgot forgotten|forgive forgave forgiven|freeze froze frozen|get got gotten gett|give gave given|go went gone goes|grind ground|grow grew grown|hang hung|have had has|hear heard|hide hid hidden|hit hit hitt|hold held|hurt hurt|keep kept|kneel knelt|know knew known|lay laid|lead led|lean leant leaned|leap leapt leaped|learn learnt learned|leave left|lend lent|let let|lie lay lain|light lit|lose lost|make made|mean meant|meet met|pay paid|prove proved proven|put put putt|quit quit|read read|ride rode ridden|ring rang rung|rise rose risen|run ran runn|say said|see saw seen|seek sought|sell sold|send sent|set set|sew sewed sewn|shake shook shaken|shed shed|shine shone|shoot shot|show showed shown|shrink shrank shrunk|shut shut|sing sang sung|sink sank sunk|sit sat sitt|sleep slept|slide slid|sling slung|speak spoke spoken|speed sped|spend spent|spill spilt spilled|spin spun spinn|spy spied spies|mislead misled|spit spat|split split|spread spread|spring sprang sprung|stand stood|steal stole stolen|stick stuck|sting stung|stink stank stunk|stride strode|strike struck|string strung|strive strove striven|swear swore sworn|sweep swept|swell swelled swollen|swim swam swum swimm|swing swung|take took taken|teach taught|tear tore torn|tell told|think thought|throw threw thrown|tread trod trodden|understand understood|undertake undertook undertaken|upset upset|wake woke woken|wear wore worn|weave wove woven|weep wept|win won winn|wind wound|withdraw withdrew withdrawn|write wrote written|be was were been is are am|child children|man men|woman women|foot feet|tooth teeth|mouse mice|person people|good better best|bad worse worst|far further farther furthest"
    .split("|")
    .map((row) => row.split(" "))
    .map(([base, ...forms]) => [base, forms] as const),
);

const SPELLINGS = [
  "colour color",
  "favour favor",
  "labour labor",
  "honour honor",
  "neighbour neighbor",
  "centre center",
  "theatre theater",
  "metre meter",
  "catalogue catalog",
  "dialogue dialog",
  "humour humor",
  "programme program",
  "organise organize",
  "recognise recognize",
  "analyse analyze",
].map((s) => s.split(" "));
const CASE_DISTINCT = new Set([
  "China",
  "china",
  "Polish",
  "polish",
  "Angle",
  "angle",
  "Grant",
  "grant",
]);
const COMPARABLE = new Set(
  "big small great hard long short high low fast slow young old new nice large wide safe fine close hot cold dark light easy early happy heavy busy healthy funny strong weak deep cheap rich poor clean clear quick bright thin thick tall late neat soft tough warm cool dry wet fit sad mad quiet clever simple gentle narrow shallow".split(
    " ",
  ),
);

/** Explicit inflections, never an arbitrary stem suffix: art cannot match artist/article. */
export function headwordForms(word: string) {
  const w = word.trim();
  const base = w.toLowerCase();
  const forms = new Set([w]);
  if (/\s/.test(w)) return [...forms];
  const bases = new Set([w]);
  for (const pair of SPELLINGS)
    if (pair.includes(base)) pair.forEach((s) => bases.add(s));
  if (/\([a-z]+\)/i.test(w)) {
    bases.add(w.replace(/[()]/g, ""));
    bases.add(w.replace(/\([a-z]+\)/gi, ""));
  }
  for (const b of bases) {
    forms.add(b);
    if (
      !/^[a-z]+$/i.test(b) ||
      (CASE_DISTINCT.has(w) && w[0] !== w[0].toLowerCase())
    )
      continue;
    const irregular = IRREGULAR.get(b.toLowerCase());
    for (const f of irregular ?? []) if (f !== b + b.slice(-1)) forms.add(f);
    if (b.length < 3) continue;
    if (/[^aeiou]y$/i.test(b)) {
      forms.add(b.slice(0, -1) + "ies");
      forms.add(b.slice(0, -1) + "ied");
    } else forms.add(b + (/(?:s|sh|ch|x|z)$/i.test(b) ? "es" : "s"));
    if (!irregular) forms.add(b + (/e$/i.test(b) ? "d" : "ed"));
    forms.add(
      /ie$/i.test(b)
        ? b.slice(0, -2) + "ying"
        : /[^eoy]e$/i.test(b)
          ? b.slice(0, -1) + "ing"
          : b + "ing",
    );
    if (b.length <= 6 && /[^aeiou][aeiou][bdgmnprt]$/i.test(b)) {
      forms.add(b + b.slice(-1) + "ing");
      if (!irregular) forms.add(b + b.slice(-1) + "ed");
    }
    if (COMPARABLE.has(b.toLowerCase())) {
      const stem = /[^aeiou]y$/i.test(b)
        ? b.slice(0, -1) + "i"
        : /e$/i.test(b)
          ? b.slice(0, -1)
          : /^[^aeiou]*[aeiou][bdgmnprt]$/i.test(b)
            ? b + b.slice(-1)
            : b;
      forms.add(stem + "er");
      forms.add(stem + "est");
    }
  }
  return [...forms];
}

/** Find a complete headword or one of its listed inflections in a sentence. */
export function headwordPattern(word: string) {
  const esc = (s: string) =>
    s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’]");
  const forms = headwordForms(word)
    .sort((a, b) => b.length - a.length)
    .map((s) => s.split(/\s+/).map(esc).join("\\s+"));
  return new RegExp(
    `(?<![A-Za-z])(${forms.join("|")})(?![A-Za-z])`,
    CASE_DISTINCT.has(word) ? "" : "i",
  );
}

export function splitHighlight(
  sentence: string,
  word: string,
): [string, string, string] | null {
  const m = headwordPattern(word).exec(sentence);
  if (!m) return null;
  return [
    sentence.slice(0, m.index),
    m[0],
    sentence.slice(m.index + m[0].length),
  ];
}

export function gap(sentence: string, word: string) {
  const parts = splitHighlight(sentence, word);
  return parts ? { before: parts[0], hidden: parts[1], after: parts[2] } : null;
}

export const normalize = (s: string) =>
  s
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export function shuffle<T>(xs: T[], seed = Math.random() * 2 ** 31): T[] {
  const out = [...xs];
  let x = Math.floor(seed) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    x = (Math.imul(1664525, x) + 1013904223) >>> 0;
    const j = x % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Collocations are stored as "english｜中文". */
export const splitPair = (s: string) => {
  const [en, zh] = s.split(/[｜|]/);
  return { en: (en || "").trim(), zh: (zh || "").trim() };
};

export const plural = (n: number) => n.toLocaleString("en-US");
