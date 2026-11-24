/* =========================================================
   Game: Sounds & Rhymes
   Teaches: the English alphabet, first sounds and rhyming
   (early reading skills).
   Bands:
     little   - "Which one starts with B?" and "what letter does it start with?" (3 pictures).
     explorer - (made harder 24 Nov 2026: the 6-year-old found it too easy)
                rhymes spelled differently (eight/gate), the odd one out,
                same first sound with different letters (fish/phone),
                silent letters and longer words to clap out. Words only.
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

function syllables(pool = SYLLABLES) {
  const [word, n, emoji] = pick(pool);
  return {
    prompt: `Clap it out! How many syllables (beats) in “${word}”?`,
    say: `Clap it out! How many beats in ${word}?`,
    pic: emoji,
    options: ['1', '2', '3', '4'],
    answer: String(n),
    explain: `${word} has ${n} beat${n > 1 ? 's' : ''}.`,
  };
}

/* ---------- Explorer (ages 6-7): harder rounds, words only, no picture clues ----------
   Rhymes that are spelled differently, with look-alike words that do NOT rhyme as the traps.
   Every prompt and explain line below has a voice clip, so keep the wording exactly as built here. */
const HARD_RHYMES = [
  ['eight', 'gate', ['eat', 'egg', 'night']], ['blue', 'shoe', ['blow', 'bull', 'shop']],
  ['bear', 'chair', ['beard', 'ear', 'bean']], ['night', 'kite', ['nine', 'knit', 'neat']],
  ['said', 'bed', ['sad', 'paid', 'seed']], ['snow', 'toe', ['now', 'snap', 'cow']],
  ['fly', 'pie', ['flea', 'fill', 'pin']], ['whale', 'snail', ['wheel', 'wall', 'while']],
  ['four', 'door', ['fur', 'foot', 'hour']], ['bread', 'head', ['bead', 'break', 'broom']],
  ['light', 'bite', ['lit', 'late', 'lift']], ['two', 'zoo', ['toe', 'tow', 'twin']],
  ['rain', 'plane', ['ran', 'ring', 'pan']], ['cheese', 'bees', ['chess', 'chase', 'choose']],
  ['bone', 'phone', ['one', 'gone', 'done']], ['come', 'drum', ['home', 'comb', 'dome']],
  ['word', 'bird', ['lord', 'cord', 'ward']],
];
// Three words that rhyme and one that only looks like it does.
const ODD_ONE_OUT = [
  [['bear', 'chair', 'hair'], 'here'], [['blue', 'shoe', 'two'], 'toe'], [['night', 'kite', 'white'], 'wait'],
  [['snow', 'toe', 'go'], 'cow'], [['said', 'bed', 'head'], 'bead'], [['rain', 'plane', 'train'], 'ran'],
  [['four', 'door', 'more'], 'flour'], [['moon', 'spoon', 'June'], 'sun'],
];
// Same first sound, different first letters.
const SAME_START = [
  ['fish', 'phone', ['pin', 'hat', 'thin']], ['net', 'knee', ['king', 'kite', 'key']],
  ['rabbit', 'write', ['wet', 'win', 'water']], ['jam', 'giraffe', ['goat', 'game', 'girl']],
  ['sun', 'city', ['cat', 'cup', 'cake']], ['shoe', 'sugar', ['sock', 'star', 'seed']],
];
const SILENT = [['knee', 'K'], ['lamb', 'B'], ['write', 'W'], ['comb', 'B'], ['hour', 'H']];
const PLAIN = ['dog', 'frog', 'hat', 'jump', 'milk', 'sand', 'drum', 'flag'];

const hardRhyme = ([word, match, traps]) => ({
  prompt: `Which word rhymes with ${word}?`,
  pic: word, picClass: 'abc-big word',
  options: [match, ...traps],
  answer: match,
  explain: `${word} and ${match} rhyme!`,
});
const oddOneOut = ([trio, odd]) => ({
  prompt: 'Which word does not rhyme with the others?',
  options: [...trio, odd],
  answer: odd,
  explain: `${odd} does not rhyme with ${trio[0]}, ${trio[1]} and ${trio[2]}.`,
});
const sameStart = ([word, match, traps]) => ({
  prompt: `Which word starts with the same sound as ${word}?`,
  pic: word, picClass: 'abc-big word',
  options: [match, ...traps],
  answer: match,
  explain: `${match} starts with the same sound as ${word}.`,
});
const silentLetter = ([word, letter]) => ({
  prompt: 'Which word has a silent letter?',
  options: [word, ...shuffle(PLAIN).slice(0, 3)],
  answer: word,
  explain: `The ${letter} in ${word} is silent.`,
});
const longSyllables = () => syllables(SYLLABLES.filter(w => w[1] >= 2));
const some = (list, n) => shuffle(list).slice(0, n);
const explorerRound = () => shuffle([
  ...some(HARD_RHYMES, 3).map(hardRhyme),
  oddOneOut(pick(ODD_ONE_OUT)),
  ...some(SAME_START, 2).map(sameStart),
  silentLetter(pick(SILENT)),
  longSyllables(),
]);
// Every spoken line of the harder rounds, for the voice clip list.
export const EXPLORER_LINES = [
  ...HARD_RHYMES.map(hardRhyme), ...ODD_ONE_OUT.map(oddOneOut), ...SAME_START.map(sameStart), ...SILENT.map(silentLetter),
].flatMap(q => [q.prompt, q.explain]);

export default {
  id: 'sounds',
  title: 'Sounds & Rhymes',
  emoji: '🔠',
  bands: ['little', 'explorer'],

  start(ctx) {
    const { root, band } = ctx;
    const questions = band === 'little'
      ? shuffle([startsWith(3), startsWith(3), startsWith(3), startsWith(3), firstLetter(), firstLetter()])
      : explorerRound();
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You know your sounds and rhymes!'));
  },
};
