/* =========================================================
   Game: Sounds & Rhymes
   Teaches: the English alphabet, first sounds and rhyming
   (early reading skills).
   Bands:
     little   - "Which one starts with B?" and "what letter does it start with?" (3 pictures).
     explorer - (Year 2-3 phonics) sounds like sh, ch, th and ee,
                counting syllables, and rhyming words.
   ========================================================= */
import { shuffle, pick } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

export const ABC = [
  ['a', 'apple', '🍎'], ['b', 'ball', '⚽'], ['c', 'cat', '🐱'], ['d', 'dog', '🐶'],
  ['e', 'egg', '🥚'], ['f', 'fish', '🐟'], ['g', 'goat', '🐐'], ['h', 'hat', '🎩'],
  ['j', 'juice', '🧃'], ['k', 'kite', '🪁'], ['l', 'lion', '🦁'], ['m', 'moon', '🌙'],
  ['n', 'nose', '👃'], ['o', 'octopus', '🐙'], ['p', 'pig', '🐷'], ['r', 'rabbit', '🐰'],
  ['s', 'sun', '☀️'], ['t', 'tree', '🌳'], ['u', 'umbrella', '☂️'], ['v', 'van', '🚐'],
  ['w', 'whale', '🐳'], ['y', 'yo-yo', '🪀'], ['z', 'zebra', '🦓'],
].map(([letter, word, emoji]) => ({ letter, word, emoji, label: `${emoji} ${word}` }));

export const RHYMES = [
  [['cat', '🐱'], ['hat', '🎩']], [['dog', '🐶'], ['frog', '🐸']], [['bee', '🐝'], ['tree', '🌳']],
  [['moon', '🌙'], ['spoon', '🥄']], [['star', '⭐'], ['car', '🚗']], [['cake', '🎂'], ['snake', '🐍']],
  [['bear', '🐻'], ['chair', '🪑']], [['house', '🏠'], ['mouse', '🐭']], [['boat', '⛵'], ['goat', '🐐']],
  [['sock', '🧦'], ['clock', '⏰']], [['fox', '🦊'], ['box', '📦']],
];

function startsWith(nOpts) {
  const target = pick(ABC);
  const others = shuffle(ABC.filter(x => x.letter !== target.letter)).slice(0, nOpts - 1);
  return {
    prompt: `Which one starts with ${target.letter.toUpperCase()}?`,
    pic: `${target.letter.toUpperCase()} ${target.letter}`, picClass: 'abc-big',
    options: [target, ...others].map(x => x.label),
    optionClass: 'pic-opt',
    answer: target.label,
    explain: `${target.letter.toUpperCase()} is for ${target.word}!`,
  };
}

function firstLetter() {
  const target = pick(ABC);
  const others = shuffle(ABC.filter(x => x.letter !== target.letter)).slice(0, 2);
  return {
    prompt: `What letter does ${target.word} start with?`,
    pic: target.emoji,
    options: [target, ...others].map(x => x.letter),
    optionClass: 'abc',
    answer: target.letter,
    explain: `${target.word} starts with ${target.letter.toUpperCase()}.`,
  };
}

function rhyme() {
  const [pair, ...otherPairs] = shuffle(RHYMES);
  const [a, b] = shuffle(pair);
  const others = otherPairs.slice(0, 2).map(p => pick(p)); // one word from each other pair
  const label = w => `${w[1]} ${w[0]}`;
  return {
    prompt: `Which word rhymes with ${a[0]}?`,
    pic: a[1],
    options: [b, ...others].map(label),
    optionClass: 'pic-opt',
    answer: label(b),
    explain: `${a[0]} and ${b[0]} rhyme!`,
  };
}

/* Year 2-3 phonics: words with a sound in them, and words without. */
const DIGRAPHS = [
  { sound: 'sh', yes: [['ship', '🚢'], ['fish', '🐟'], ['shell', '🐚'], ['shoe', '👟']], no: [['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['pen', '🖊️']] },
  { sound: 'ch', yes: [['chair', '🪑'], ['cheese', '🧀'], ['chick', '🐤'], ['peach', '🍑']], no: [['bed', '🛏️'], ['frog', '🐸'], ['kite', '🪁'], ['hat', '🎩']] },
  { sound: 'th', yes: [['three', '3️⃣'], ['thumb', '👍'], ['bath', '🛁'], ['tooth', '🦷']], no: [['bus', '🚌'], ['leaf', '🍃'], ['map', '🗺️'], ['cup', '🥤']] },
  { sound: 'ee', yes: [['tree', '🌳'], ['bee', '🐝'], ['sheep', '🐑'], ['feet', '🦶']], no: [['car', '🚗'], ['box', '📦'], ['moon', '🌙'], ['log', '🪵']] },
  { sound: 'oo', yes: [['moon', '🌙'], ['spoon', '🥄'], ['boot', '🥾'], ['pool', '🏊']], no: [['tree', '🌳'], ['hat', '🎩'], ['fish', '🐟'], ['cake', '🎂']] },
  { sound: 'ai', yes: [['rain', '🌧️'], ['snail', '🐌'], ['train', '🚆'], ['tail', '🐒']], no: [['dog', '🐶'], ['bus', '🚌'], ['bee', '🐝'], ['star', '⭐']] },
];
const SYLLABLES = [['cat', 1, '🐱'], ['rabbit', 2, '🐰'], ['banana', 3, '🍌'], ['elephant', 3, '🐘'], ['butterfly', 3, '🦋'], ['tiger', 2, '🐯'],
  ['caterpillar', 4, '🐛'], ['kangaroo', 3, '🦘'], ['watermelon', 4, '🍉'], ['dog', 1, '🐶'], ['pencil', 2, '✏️'], ['helicopter', 4, '🚁'], ['crocodile', 3, '🐊']];

function hasSound() {
  const d = pick(DIGRAPHS);
  const right = pick(d.yes);
  const wrong = shuffle(d.no).slice(0, 2);
  const label = w => `${w[1]} ${w[0]}`;
  return {
    prompt: `Which word has the “${d.sound}” sound?`,
    say: `Which word has the ${d.sound} sound?`,
    pic: d.sound, picClass: 'abc-big',
    options: [right, ...wrong].map(label), optionClass: 'pic-opt',
    answer: label(right),
    explain: `${right[0]} has the ${d.sound} sound.`,
  };
}

function syllables() {
  const [word, n, emoji] = pick(SYLLABLES);
  return {
    prompt: `Clap it out! How many syllables (beats) in “${word}”?`,
    say: `Clap it out! How many beats in ${word}?`,
    pic: emoji,
    options: ['1', '2', '3', '4'],
    answer: String(n),
    explain: `${word} has ${n} beat${n > 1 ? 's' : ''}.`,
  };
}

export default {
  id: 'sounds',
  title: 'Sounds & Rhymes',
  emoji: '🔠',
  bands: ['little', 'explorer'],

  start(ctx) {
    const { root, band } = ctx;
    const questions = band === 'little'
      ? shuffle([startsWith(3), startsWith(3), startsWith(3), startsWith(3), firstLetter(), firstLetter()])
      : shuffle([hasSound(), hasSound(), hasSound(), syllables(), syllables(), rhyme(), rhyme(), firstLetter()]);
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You know your sounds and rhymes!'));
  },
};
