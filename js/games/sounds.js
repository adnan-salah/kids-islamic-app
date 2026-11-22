/* =========================================================
   Game: Sounds & Rhymes
   Teaches: the English alphabet, first sounds and rhyming
   (early reading skills).
   Bands:
     little   - "Which one starts with B?" (2 pictures).
     explorer - first letters and rhyming words (3 choices).
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

export default {
  id: 'sounds',
  title: 'Sounds & Rhymes',
  emoji: '🔠',
  bands: ['little', 'explorer'],

  start(ctx) {
    const { root, band } = ctx;
    const questions = band === 'little'
      ? Array.from({ length: 5 }, () => startsWith(2))
      : shuffle([startsWith(3), startsWith(3), firstLetter(), firstLetter(), rhyme(), rhyme()]);
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You know your sounds and rhymes!'));
  },
};
