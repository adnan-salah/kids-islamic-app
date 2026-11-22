/* =========================================================
   Game: Maths Fun
   Teaches: counting, adding, taking away, times tables, money and
   word problems, with everyday themes (and a little Islam).
   Bands:
     little   - count 1 to 5 things.
     explorer - add and take away up to 20, plus rakah sums.
     champion - times tables and word problems.
     harder   - (Explorer set to harder maths in the parent area)
                adding and taking away to 100, 2, 5 and 10 times tables,
                missing numbers, doubles and halves, change from $10.
   Questions are made up fresh each game, so it never gets stale.
   Rakah counts used (fard): Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, Isha 4.
   ========================================================= */
import { shuffle, pick } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

const dollars = n => '$' + n;
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const NAMES = ['Yusuf', 'Maryam', 'Bilal', 'Aisha', 'Ibrahim', 'Khadijah', 'Zayd', 'Fatimah', 'Hamza', 'Safiyyah'];
const RAKAH = { Fajr: 2, Dhuhr: 4, Asr: 4, Maghrib: 3, Isha: 4 };

/* Three answer choices: the right one and two nearby wrong ones. */
function choices(answer, spread = 3, min = 0) {
  spread = Math.max(1, Math.round(spread));
  const set = new Set([answer]);
  while (set.size < 3) {
    const n = answer + rand(-spread, spread);
    if (n >= min && n !== answer) set.add(n);
  }
  return shuffle([...set]).map(String);
}

function littleQuestion() {
  const things = pick([['🍎', 'apples'], ['🦆', 'ducks'], ['⭐', 'stars'], ['🚗', 'cars'], ['⚽', 'balls'], ['🐪', 'camels']]);
  const n = rand(1, 5);
  return {
    prompt: `How many ${things[1]}?`,
    pic: things[0].repeat(n), picClass: 'count',
    options: choices(n, 2, 1),
    answer: String(n),
    explain: `Yes, ${n}!`,
  };
}

function explorerQuestion() {
  const name = pick(NAMES);
  const kind = rand(1, 5);
  if (kind === 1) {
    const a = rand(2, 10), b = rand(1, 9);
    return { prompt: `${name} has ${a} apples and picks ${b} more. How many apples now?`, pic: '🍎', options: choices(a + b), answer: String(a + b) };
  }
  if (kind === 2) {
    const a = rand(6, 20), b = rand(1, a - 1);
    return { prompt: `There are ${a} people on a bus. ${b} get off. How many are left on the bus?`, pic: '🚌', options: choices(a - b), answer: String(a - b) };
  }
  if (kind === 3) {
    const [p1, p2] = shuffle(Object.keys(RAKAH)).slice(0, 2);
    const total = RAKAH[p1] + RAKAH[p2];
    return { prompt: `${p1} has ${RAKAH[p1]} rakah and ${p2} has ${RAKAH[p2]} rakah. How many rakah altogether?`, pic: '🕌', options: choices(total, 2, 2), answer: String(total) };
  }
  if (kind === 4) {
    const a = rand(2, 10), b = rand(1, 8);
    return { prompt: `${name} has ${dollars(a)} and gets ${dollars(b)} pocket money. How much now?`, pic: '💰', options: choices(a + b).map(Number).map(dollars), answer: dollars(a + b) };
  }
  const a = rand(3, 12), b = rand(2, 8);
  return { prompt: `${name} reads ${a} pages of a book on Saturday and ${b} pages on Sunday. How many pages altogether?`, pic: '📖', options: choices(a + b), answer: String(a + b) };
}

/* Explorer+: for a 6 or 7 year old who finds Explorer maths too easy. */
function harderQuestion() {
  const name = pick(NAMES);
  const kind = rand(1, 8);
  if (kind === 1) {
    const a = rand(15, 59), b = rand(12, 39);
    return { prompt: `${a} + ${b} = ?`, pic: '➕', options: choices(a + b, 10, 1), answer: String(a + b) };
  }
  if (kind === 2) {
    const a = rand(35, 99), b = rand(12, a - 10);
    return { prompt: `${a} − ${b} = ?`, pic: '➖', options: choices(a - b, 10, 1), answer: String(a - b) };
  }
  if (kind === 3) {
    const t = pick([2, 5, 10]), n = rand(2, 12);
    return { prompt: `${n} × ${t} = ?`, pic: '✖️', options: choices(n * t, t === 2 ? 4 : t, 1), answer: String(n * t) };
  }
  if (kind === 4) {
    const a = rand(4, 15), b = rand(5, 15);
    return { prompt: `? + ${a} = ${a + b}. What is the missing number?`, pic: '❓', options: choices(b, 3, 1), answer: String(b) };
  }
  if (kind === 5) {
    const n = rand(6, 25);
    return Math.random() < 0.5
      ? { prompt: `What is double ${n}?`, pic: '👯', options: choices(2 * n, 4, 1), answer: String(2 * n) }
      : { prompt: `What is half of ${2 * n}?`, pic: '🍰', options: choices(n, 3, 1), answer: String(n) };
  }
  if (kind === 6) {
    const price = rand(2, 9);
    return { prompt: `${name} buys a ball for ${dollars(price)} with a ${dollars(10)} note. How much change?`, pic: '💵', options: choices(10 - price, 2, 1).map(Number).map(dollars), answer: dollars(10 - price) };
  }
  if (kind === 7) {
    const packs = rand(2, 6), each = pick([2, 5, 10]);
    return { prompt: `There are ${packs} packs of stickers with ${each} stickers in each pack. How many stickers?`, pic: '⭐', options: choices(packs * each, 4, 1), answer: String(packs * each) };
  }
  const a = rand(18, 45), b = rand(11, 30);
  return { prompt: `${name}'s team scores ${a} points, then ${b} more. How many points altogether?`, pic: '🏀', options: choices(a + b, 10, 1), answer: String(a + b) };
}

function championQuestion() {
  const name = pick(NAMES);
  const kind = rand(1, 6);
  if (kind === 1) {
    const rows = rand(3, 12), chairs = rand(4, 12);
    return { prompt: `The school hall has ${rows} rows with ${chairs} chairs in each row. How many chairs?`, pic: '🪑', options: choices(rows * chairs, 6, 1), answer: String(rows * chairs) };
  }
  if (kind === 2) {
    const a = rand(2, 12), b = rand(2, 12);
    return { prompt: `${a} × ${b} = ?`, pic: '✖️', options: choices(a * b, 5, 1), answer: String(a * b) };
  }
  if (kind === 3) {
    const days = rand(2, 7);
    return { prompt: `There are 17 fard rakah each day. How many in ${days} days?`, pic: '🧎', options: choices(17 * days, 10, 1), answer: String(17 * days) };
  }
  if (kind === 4) {
    const done = rand(2, 9);
    return { prompt: `A school term is 10 weeks long. ${name} has finished ${done} weeks. How many weeks are left?`, pic: '🏫', options: choices(10 - done, 2, 0), answer: String(10 - done) };
  }
  if (kind === 5) {
    const price = rand(3, 17);
    return { prompt: `${name} buys a toy for ${dollars(price)} with a ${dollars(20)} note. How much change?`, pic: '💵', options: choices(20 - price, 3, 1).map(Number).map(dollars), answer: dollars(20 - price) };
  }
  const friends = pick([2, 3, 4, 6]), each = rand(2, 6);
  return { prompt: `${friends * each} slices of pizza are shared equally between ${friends} friends. How many slices each?`, pic: '🍕', options: choices(each, 3, 1), answer: String(each) };
}

export default {
  id: 'maths',
  title: 'Maths Fun',
  emoji: '🔢',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    const make = band === 'explorer' && ctx.harder ? harderQuestion
      : { little: littleQuestion, explorer: explorerQuestion, champion: championQuestion }[band];
    const count = band === 'little' ? 5 : ctx.harder ? 10 : 8;
    const questions = Array.from({ length: count }, make);
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You are a maths star!'), { shuffleOptions: false });
  },
};
