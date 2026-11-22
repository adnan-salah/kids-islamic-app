/* =========================================================
   Game: Masjid Maths
   Teaches: counting, adding, taking away, times tables and word
   problems, all with Islamic themes.
   Bands:
     little   - count 1 to 5 things.
     explorer - add and take away up to 20, plus rakah sums.
     champion - times tables and word problems.
   Questions are made up fresh each game, so it never gets stale.
   Rakah counts used (fard): Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, Isha 4.
   ========================================================= */
import { shuffle, pick } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

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
  const things = pick([['🐪', 'camels'], ['🌙', 'moons'], ['⭐', 'stars'], ['🕌', 'masjids'], ['🍎', 'apples']]);
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
  const kind = rand(1, 4);
  if (kind === 1) {
    const a = rand(2, 10), b = rand(1, 9);
    return { prompt: `${name} has ${a} dates and gets ${b} more. How many dates now?`, pic: '🌴', options: choices(a + b), answer: String(a + b) };
  }
  if (kind === 2) {
    const a = rand(6, 20), b = rand(1, a - 1);
    return { prompt: `There are ${a} shoes on the masjid shelf. ${b === 1 ? '1 person takes their shoes and goes home' : `${b} people take theirs and go home`}. How many shoes are left?`, pic: '👟', options: choices(a - b), answer: String(a - b) };
  }
  if (kind === 3) {
    const [p1, p2] = shuffle(Object.keys(RAKAH)).slice(0, 2);
    const total = RAKAH[p1] + RAKAH[p2];
    return { prompt: `${p1} has ${RAKAH[p1]} rakah and ${p2} has ${RAKAH[p2]} rakah. How many rakah altogether?`, pic: '🕌', options: choices(total, 2, 2), answer: String(total) };
  }
  const a = rand(3, 12), b = rand(2, 8);
  return { prompt: `${name} reads ${a} pages of Quran on Saturday and ${b} pages on Sunday. How many pages altogether?`, pic: '📖', options: choices(a + b), answer: String(a + b) };
}

function championQuestion() {
  const name = pick(NAMES);
  const kind = rand(1, 6);
  if (kind === 1) {
    const rows = rand(3, 12), people = rand(4, 12);
    return { prompt: `The masjid has ${rows} rows with ${people} people in each row. How many people are praying?`, pic: '🕌', options: choices(rows * people, 6, 1), answer: String(rows * people) };
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
    const fasted = rand(10, 28);
    return { prompt: `Ramadan has 30 days this year. ${name} has fasted ${fasted} days. How many are left?`, pic: '🌙', options: choices(30 - fasted, 3, 0), answer: String(30 - fasted) };
  }
  if (kind === 5) {
    const savings = pick([40, 80, 120, 200, 400, 1000]);
    const zakah = savings / 40; // 2.5% = one fortieth
    return { prompt: `Zakah is 2.5% (one fortieth). How much Zakah on $${savings}?`, pic: '🤝', options: choices(zakah, Math.max(2, zakah / 2), 1).map(v => `$${v}`), answer: `$${zakah}` };
  }
  const boxes = rand(3, 9), dates = rand(6, 12), friends = pick([2, 3, 4, 6]);
  const total = boxes * dates;
  // Make sure it shares evenly.
  const share = Math.floor(total / friends);
  const even = share * friends;
  return { prompt: `${name} has ${even} dates to share equally between ${friends} friends for iftar. How many does each friend get?`, pic: '🌴', options: choices(share, 3, 1), answer: String(share) };
}

export default {
  id: 'maths',
  title: 'Masjid Maths',
  emoji: '🔢',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    const make = { little: littleQuestion, explorer: explorerQuestion, champion: championQuestion }[band];
    const count = band === 'little' ? 5 : 8;
    const questions = Array.from({ length: count }, make);
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You are a maths star!'), { shuffleOptions: false });
  },
};
