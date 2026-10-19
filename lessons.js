// All 26 letters. Each row: letter, name hint, sound hint, word1, emoji1, word2, emoji2.
// Levels are made automatically: 3 letters each (A-C, D-F ... V-X), the last level is Y, Z.
const COLORS = ["#ff5c8a", "#2f8fe0", "#2fbf71", "#f59e0b", "#8b5cf6", "#14b8a6"];
const ALPHA = [
  ["A", "ay", "ah", "apple", "🍎", "ant", "🐜"],
  ["B", "bee", "buh", "ball", "⚽", "bus", "🚌"],
  ["C", "see", "kuh", "cat", "🐱", "cup", "🥤"],
  ["D", "dee", "duh", "dog", "🐶", "duck", "🦆"],
  ["E", "ee", "eh", "egg", "🥚", "elephant", "🐘"],
  ["F", "ef", "fff", "fish", "🐟", "frog", "🐸"],
  ["G", "jee", "guh", "goat", "🐐", "grapes", "🍇"],
  ["H", "aych", "huh", "hat", "🎩", "horse", "🐴"],
  ["I", "eye", "ih", "igloo", "🧊", "insect", "🐛"],
  ["J", "jay", "juh", "jam", "🫙", "jug", "🏺"],
  ["K", "kay", "kuh", "kite", "🪁", "key", "🔑"],
  ["L", "el", "lll", "lion", "🦁", "lemon", "🍋"],
  ["M", "em", "mmm", "moon", "🌙", "monkey", "🐵"],
  ["N", "en", "nnn", "nest", "🪹", "nose", "👃"],
  ["O", "oh", "aw", "orange", "🍊", "octopus", "🐙"],
  ["P", "pee", "puh", "pig", "🐷", "pen", "🖊️"],
  ["Q", "kyoo", "kwuh", "queen", "👸", "quilt", "🛏️"],
  ["R", "ar", "rrr", "rabbit", "🐰", "rain", "🌧️"],
  ["S", "ess", "sss", "sun", "☀️", "snake", "🐍"],
  ["T", "tee", "tuh", "tiger", "🐯", "tree", "🌳"],
  ["U", "yoo", "uh", "umbrella", "☂️", "uncle", "👨"],
  ["V", "vee", "vvv", "van", "🚐", "violin", "🎻"],
  ["W", "double yoo", "wuh", "watch", "⌚", "worm", "🪱"],
  ["X", "eks", "ks", "xylophone", "🎶", "x-ray", "🩻"],
  ["Y", "wye", "yuh", "yo-yo", "🪀", "yak", "🐂"],
  ["Z", "zee", "zzz", "zebra", "🦓", "zip", "🤐"]
];

const ALL_LETTERS = ALPHA.map((r, i) => ({
  U: r[0], l: r[0].toLowerCase(), color: COLORS[i % COLORS.length],
  nameSay: r[1], soundSay: r[2], hint: r[0].toLowerCase() + " as in " + r[3],
  words: [{ w: r[3], e: r[4] }, { w: r[5], e: r[6] }]
}));

const LESSONS = [];
for (let i = 0; i < ALL_LETTERS.length; i += 3) {
  const ls = ALL_LETTERS.slice(i, i + 3);
  LESSONS.push({ id: "english-" + (LESSONS.length + 1), title: "Letters " + ls.map(x => x.U).join(", "), letters: ls });
}
