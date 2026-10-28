// Manual adjudication of every previously unmatched spelling. Absence from the
// outline alone does not make a regular derivative or a basic proper name advanced.
export const decisions = new Map();
function add(words, scope, kind, reason, roots = []) {
  for (const word of words.split(/\s+/).filter(Boolean)) {
    if (decisions.has(word)) throw Error(`Repeated review: ${word}`);
    decisions.set(word, { scope, kind, reason, roots });
  }
}
function derived(word, root, explanation) {
  add(word, "cet4", "derived", `${explanation}；保留作四级基础补充，不声称大纲单列此词。`, [root]);
}
const derivations = {
  absolutely:"absolute", announcer:"announce", awfully:"awful", beginner:"begin", bitterly:"bitter", broken:"break", childhood:"child",
  closely:"close", commonly:"common", completely:"complete", conversely:"converse", deepen:"deep", directly:"direct", disadvantage:"advantage",
  dishonour:"honour", displease:"please", dissatisfy:"satisfy", dramatization:"drama", exactly:"exact", exclusively:"exclusive", extremely:"extreme",
  fertilize:"fertile", fortunately:"fortunate", freely:"free", frequently:"frequent", gaseous:"gas", gently:"gentle", greatly:"great", heavily:"heavy",
  incorrect:"correct", indirect:"direct", inefficient:"efficient", inexpensive:"expensive", instantly:"instant", insufficient:"sufficient", keeper:"keep",
  lessen:"less", lighten:"light", lightly:"light", mainly:"main", married:"marry", mechanically:"mechanical", miner:"mine", murderer:"murder",
  needless:"need", newly:"new", practically:"practical", previously:"previous", properly:"proper", purely:"pure", quicken:"quick", quickly:"quick",
  rapidly:"rapid", regularly:"regular", relatively:"relative", reliability:"reliable", remains:"remain", robber:"rob", sadly:"sad", safely:"safe",
  sandy:"sand", secondly:"second", seller:"sell", separately:"separate", seriously:"serious", severely:"severe", sharply:"sharp", sickness:"sick",
  similarly:"similar", slowly:"slow", smoothly:"smooth", softly:"soft", specially:"special", strictly:"strict", strongly:"strong", successfully:"successful",
  sufficiently:"sufficient", surely:"sure", surprising:"surprise", surprisingly:"surprise", thickness:"thick", thirdly:"third", transformer:"transform",
  turning:"turn", unable:"able", unbearable:"bear", uncomfortable:"comfortable", unconscious:"conscious", unexpected:"expect", unfair:"fair",
  unfortunate:"fortunate", unfortunately:"fortunate", unhappy:"happy", unjust:"just", unkind:"kind", unknown:"know", unlike:"like", unlikely:"likely",
  unload:"load", unlucky:"lucky", unnecessary:"necessary", unpleasant:"pleasant", unsatisfactory:"satisfactory", unstable:"stable", unsuitable:"suitable",
  unusual:"usual", unusually:"usual", unwilling:"willing", westward:"west", widely:"wide", multicultural:"cultural", rebuild:"build", adoptive:"adopt",
  owing:"owe", fourfold:"four", providing:"provide", succeeding:"succeed", popularize:"popular", evidently:"evident", surrounding:"surround",
};
for (const [word, root] of Object.entries(derivations)) derived(word, root, `核对为 ${root} 的派生词、规则构词或动词变形`);
for (const [word, root] of Object.entries({fourth:"four",sixth:"six",seventh:"seven",tenth:"ten",eleventh:"eleven"}))
  derived(word, root, `序数词，属于 ${root} 对应的基础数词体系`);
add("Africa African America American Arabian Asia Asian Atlantic Australia Australian Brazil Brazilian Britain British Canada Canadian Chinese England English Europe European France French German Germany Greek India Indian Italian Italy Japan Japanese Latin Mediterranean Oceania Portugal Portuguese Roman Russian Soviet Spanish Swiss China Polish",
  "cet4", "foundation", "国家、地区、语言、民族或地理名称，保留为基础专名；不以大小写相似的普通名词充当大纲收录证据。");
add("jew jewish", "cet4", "foundation", "民族/宗教名称的基础专名；规范拼写分别为 Jew、Jewish，首字母大写。");
add("AI", "cet4", "abbreviation", "artificial intelligence 的缩写；按人工智能的基础缩写保留，不将缩写误写成大纲单列词。", ["artificial","intelligence"]);
add("a.m P.M. B.C. esp. etc. o'clock oh", "cet4", "foundation", "时间、纪年、常用书面缩写或日常表达；保留作基础补充。a.m 规范为 a.m.，P.M. 统一为 p.m.。");
add("ought", "cet4", "variant", "大纲列的是 ought to；词头 ought 是情态动词，常与 to 连用，保留并提示搭配。", ["oughtto"]);
add("according", "cet4", "variant", "大纲列的是 according to；当前词头单独保留时应明确其在 according to 中的用法。", ["accordingto"]);
add("outskirt", "cet4", "variant", "表示城郊通常用复数 outskirts；改为大纲所列的常用词形 outskirts。", ["outskirts"]);
add("world-wide", "cet4", "variant", "worldwide 的带连字符写法；归一为大纲所列 worldwide。", ["worldwide"]);
add("reflexion", "cet4", "variant", "reflection 的异体拼写；归一为现代常用的 reflection，合并重复词条。", ["reflection"]);
add("systematical", "extension", "outside", "Collins 将此词对应到 systematic 的生物分类学义；不是默认学习的常规词形。日常“有系统的”优先学习大纲所列 systematic。", ["systematic"]);
add("accommodatio inser recommendati", "cet4", "correction", "PDF 提取造成词尾残缺；分别修正为 accommodation、insert、recommendation，再按正确词形对应大纲。");
add("reservior", "extension", "correction", "reservoir 的错拼；修正并合并到正确词条。reservoir 在大纲带六级标记。");
add("systematic(al)", "cet4", "correction", "括号合写不是学习时应输入的单词；归一到 systematic 并合并重复条目。", ["systematic"]);
add("father-in-law footstep haircut hillside lifetime loudspeaker pipeline seaman seaport shopkeeper snowstorm springtime timetable upside-down waterfall workman newsstand handbag",
  "cet4", "foundation", "已逐项核对为常见生活复合词，保留为基础补充；不将拆分词素等同于官方收录证明。");
add("cherry handkerchief hare lantern mutton nylon puppet quilt radish razor saucer scarf shampoo silly sparrow squirrel strawberry swan tomb tortoise turnip vase violet zebra",
  "cet4", "foundation", "已逐项核对词义为日常物品、动物、食物或基础描述，保留为基础补充；本版大纲未单列此词形。");
// Each of these is a valid headword, but not a regular inflection of a listed
// CET-4 headword and not needed as a basic name/expression. Keep it accessible.
const extra = {
  aero:"航空相关的旧式缩略词/构词形式", ampere:"电流单位安培", aural:"听觉相关的独立形容词", bosom:"胸部、怀抱及亲密关系的书面词",
  bough:"大树枝", brim:"边沿、帽檐", bristle:"鬃毛、竖起", brittle:"脆的、易折的", brook:"小溪；容忍", brute:"野兽、粗暴的人",
  canon:"准则、经典目录等独立名词，不能与 cannon 混同", cassette:"盒式录音带", circumference:"圆周、周长", Fahrenheit:"华氏温标名称",
  gunpowder:"火药", loft:"阁楼", lumber:"木材、笨重移动", microcomputer:"微型计算机的技术名词", Negro:"过时且可能冒犯的族称，仅作历史阅读识别",
  plaster:"灰泥、石膏、膏药", pluck:"拔、扯、勇气", puff:"一阵气、喷出", queer:"多义且涉及身份/语域的词，需结合语境学习",
  racket:"球拍、喧闹", radium:"化学元素镭", radius:"半径等几何用语", rake:"耙子、耙地", recollect:"回忆；独立词头，不当作 collect 的一般变形",
  reed:"芦苇、簧片", repent:"悔过", robe:"长袍", rotary:"旋转式的，不能借 rotate 的六级词族作为四级证明", saw:"本词条是锯子/锯，不是 see 的过去式",
  semiconductor:"半导体技术名词", shear:"剪切、剪羊毛", shilling:"先令货币旧称", shriek:"尖叫", slit:"狭缝、切开", sly:"狡猾的",
  swarm:"蜂群、涌动", telegram:"电报消息", telegraph:"电报系统、发电报", throng:"人群、挤满", torrent:"激流、倾泻", traitor:"叛徒",
  tramp:"流浪、重步走", treason:"叛国罪", turbine:"涡轮机", twinkle:"闪烁", typhoon:"台风", vex:"使烦恼", vine:"藤、葡萄藤",
  wavelength:"波长及比喻用法", weld:"焊接", whitewash:"粉刷、掩饰", wreath:"花环", sexism:"性别歧视", draught:"多义英式词，和 draft 的对应依语义而定",
  generic:"通用的、非专利的", heterogeneity:"异质性、非均质性等专业/学术名词", chap:"伙计、小伙子等非正式用语", pluralism:"多元主义的社会政治术语",
  invincible:"不可战胜的", criminology:"犯罪学学科名称", internship:"实习期；与 intern 为词族，但本大纲未列该词族", empower:"授权、赋能；独立词头",
  remonstrate:"正式语域的抗议、规劝，非基础 complain 的变形", consultancy:"咨询业务或咨询公司；有专业名词义，不当作 consult 的规则变形",
  astrophysics:"天体物理学学科名称", mainframe:"大型计算机技术名词", misconception:"误解；conception 所在大纲行标为六级，不按四级派生词处理", Angle:"盎格鲁人的历史专名，与 angle（角度）不同", Grant:"男子名/姓氏，与 grant（授予）不同",
};
for (const [word, meaning] of Object.entries(extra)) add(word,"extension","outside",`核对为有效词头：${meaning}；本版大纲未列该词形，放入大纲外补充词，避免标作四级必学。`);
export const dictionaryEvidence = [
  {url:"https://dictionary.cambridge.org/dictionary/english/astrophysics", note:"学科名的语义核对，不用其词典等级推导 CET 等级。"},
  {url:"https://dictionary.cambridge.org/dictionary/english/remonstrate", note:"正式语域的语义核对。"},
  {url:"https://www.oxfordlearnersdictionaries.com/us/definition/english/heterogeneity", note:"学术词头核对。"},
  {url:"https://ahdictionary.com/word/search.html?q=ought", note:"ought 为词头，通常与 to 连用。"},
  {url:"https://www.collinsdictionary.com/dictionary/english/systematical", note:"对应 systematic 的生物分类学义，放入扩展词库。"},
  {url:"https://www.merriam-webster.com/dictionary/reflexion", note:"reflection 的英式异拼，归一合并，不当作另一词。"},
];
