/* =========================================================
   Game: Maths Fun
   Pitched about one school year ahead of each child's age
   (Australian Curriculum year levels in brackets).
   Bands:
     little   (age 3, pre-school to Foundation) - count to 10,
              add and take away within 5 using pictures, more or less.
     explorer (ages 6-7, Year 2-3) - add and take away to 100,
              2, 3, 5 and 10 times tables, halves and quarters,
              missing numbers, money and word problems.
     harder   (Explorer set to "harder" in the parent area, Year 3-4) -
              add and take away to 1,000, all tables to 10, sharing
              (division), fractions of amounts, perimeter.
     champion (age 9, Year 5-6) - multiplying and dividing bigger
              numbers, remainders, fractions, decimals, percentages,
              area, negative numbers, factors, primes, order of operations.
   Questions are made up fresh each game, so it never gets stale.
   Rakah counts used (fard): Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, Isha 4.
   ========================================================= */
import { shuffle, pick } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

const dollars = n => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const NAMES = ['Yusuf', 'Maryam', 'Bilal', 'Aisha', 'Ibrahim', 'Khadijah', 'Zayd', 'Fatimah', 'Hamza', 'Safiyyah'];
const RAKAH = { Fajr: 2, Dhuhr: 4, Asr: 4, Maghrib: 3, Isha: 4 };

/* n answer choices: the right one and nearby wrong ones. */
function choices(answer, spread = 3, min = 0, n = 3) {
  spread = Math.max(2, Math.round(spread));
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < n && guard++ < 200) {
    const x = answer + rand(-spread, spread);
    if (x >= min && x !== answer) set.add(x);
  }
  return shuffle([...set]).map(String);
}
const q = (prompt, pic, answer, spread, min = 0, n = 3, explain) =>
  ({ prompt, pic, options: choices(answer, spread, min, n), answer: String(answer), explain });
/* Choices for answers that are not whole numbers (decimals, fractions). */
const qText = (prompt, pic, answer, wrong, explain) =>
  ({ prompt, pic, options: shuffle([answer, ...new Set(wrong.filter(w => w !== answer))]), answer, explain });

/* ---------- Little Stars ---------- */
const THINGS = [['🍎', 'apples'], ['🦆', 'ducks'], ['⭐', 'stars'], ['🚗', 'cars'], ['⚽', 'balls'], ['🐪', 'camels'], ['🐟', 'fish'], ['🌸', 'flowers']];
function littleQuestion() {
  const [e, name] = pick(THINGS);
  const kind = rand(1, 4);
  if (kind <= 2) {
    const n = rand(3, 10);
    return { prompt: `How many ${name}?`, pic: e.repeat(n), picClass: 'count', options: choices(n, 2, 1), answer: String(n), explain: `Yes, ${n}!` };
  }
  if (kind === 3) {
    const a = rand(1, 3), b = rand(1, 2);
    return { prompt: `${a} ${name} and ${b} more. How many altogether?`, pic: `${e.repeat(a)} ➕ ${e.repeat(b)}`, picClass: 'count', options: choices(a + b, 2, 1), answer: String(a + b), explain: `${a} and ${b} make ${a + b}!` };
  }
  const a = rand(3, 6), b = rand(1, 3);
  return { prompt: `There are ${a} ${name}. ${b} go away. How many are left?`, pic: e.repeat(a), picClass: 'count', options: choices(a - b, 2, 0), answer: String(a - b), explain: `${a} take away ${b} is ${a - b}.` };
}

/* ---------- Explorers (Year 2-3) ---------- */
function explorerQuestion() {
  const name = pick(NAMES);
  switch (rand(1, 11)) {
    case 1: { const a = rand(15, 59), b = rand(12, 39); return q(`${a} + ${b} = ?`, '➕', a + b, 10, 1); }
    case 2: { const a = rand(35, 99), b = rand(12, a - 10); return q(`${a} − ${b} = ?`, '➖', a - b, 10, 1); }
    case 3: { const t = pick([2, 3, 5, 10]), n = rand(2, 12); return q(`${n} × ${t} = ?`, '✖️', n * t, Math.max(3, t), 1); }
    case 4: { const a = rand(4, 25), b = rand(5, 30); return q(`? + ${a} = ${a + b}. What is the missing number?`, '❓', b, 4, 1); }
    case 5: { const n = rand(6, 40); return Math.random() < 0.5 ? q(`What is double ${n}?`, '👯', 2 * n, 5, 1) : q(`What is half of ${2 * n}?`, '🍰', n, 4, 1); }
    case 6: { const n = 4 * rand(2, 10); return q(`What is a quarter of ${n}?`, '🍕', n / 4, 3, 1, 3, `A quarter means 4 equal parts. ${n} ÷ 4 = ${n / 4}.`); }
    case 7: { const price = rand(3, 17); return { ...q(`${name} buys a toy for ${dollars(price)} with a $20 note. How much change?`, '💵', 20 - price, 3, 1), options: choices(20 - price, 3, 1).map(Number).map(dollars), answer: dollars(20 - price) }; }
    case 8: { const packs = rand(3, 8), each = pick([2, 3, 5, 10]); return q(`There are ${packs} packs with ${each} stickers in each. How many stickers?`, '⭐', packs * each, 5, 1); }
    case 9: { const [p1, p2, p3] = shuffle(Object.keys(RAKAH)).slice(0, 3); const t = RAKAH[p1] + RAKAH[p2] + RAKAH[p3]; return q(`${p1} has ${RAKAH[p1]} rakah, ${p2} has ${RAKAH[p2]} and ${p3} has ${RAKAH[p3]}. How many rakah altogether?`, '🕌', t, 3, 3); }
    case 10: { const n = rand(120, 899); const place = pick(['hundreds', 'tens', 'ones']); const d = place === 'hundreds' ? Math.floor(n / 100) : place === 'tens' ? Math.floor(n / 10) % 10 : n % 10; return q(`In the number ${n}, what digit is in the ${place} place?`, '🔢', d, 3, 0); }
    default: { const start = rand(2, 9) * 10 + pick([0, 5]), step = pick([5, 10, 2]); return q(`Count on: ${start}, ${start + step}, ${start + 2 * step}, … What comes next?`, '👣', start + 3 * step, step, 0); }
  }
}

/* ---------- Harder Explorers (Year 3-4) ---------- */
function harderQuestion() {
  const name = pick(NAMES);
  switch (rand(1, 11)) {
    case 1: { const a = rand(120, 650), b = rand(110, 340); return q(`${a} + ${b} = ?`, '➕', a + b, 30, 1); }
    case 2: { const a = rand(400, 999), b = rand(120, a - 100); return q(`${a} − ${b} = ?`, '➖', a - b, 30, 1); }
    case 3: { const a = rand(3, 10), b = rand(3, 10); return q(`${a} × ${b} = ?`, '✖️', a * b, 6, 1); }
    case 4: { const b = rand(3, 10), ans = rand(3, 10); return q(`${b * ans} ÷ ${b} = ?`, '➗', ans, 3, 1); }
    case 5: { const d = pick([3, 4, 5, 10]), n = d * rand(3, 10); return q(`What is 1/${d} of ${n}?`, '🍰', n / d, 4, 1, 3, `Share ${n} into ${d} equal groups: ${n / d} in each.`); }
    case 6: { const w = rand(3, 12), h = rand(2, 9); return q(`A rectangle is ${w} cm long and ${h} cm wide. What is its perimeter (all the way around)?`, '▭', 2 * (w + h), 6, 4, 3, `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.`); }
    case 7: { const kids = pick([3, 4, 5, 6]), each = rand(3, 9); return q(`${name} shares ${kids * each} lollies equally between ${kids} friends. How many does each friend get?`, '🍬', each, 3, 1); }
    case 8: { const h = rand(1, 5), m = pick([10, 15, 20, 30, 40]), len = pick([25, 30, 35, 45]); const t = (hh, mm) => `${hh + Math.floor(mm / 60)}:${String(mm % 60).padStart(2, '0')}`; return qText(`Soccer training starts at ${t(h, m)} and lasts ${len} minutes. What time does it finish?`, '⏰', t(h, m + len), [t(h, m + len + 10), t(h, m + len - 5), t(h + 1, m)]); }
    case 9: { const n = rand(1, 9) * 100 + rand(1, 9) * 10 + rand(1, 9); return q(`Round ${n} to the nearest ten.`, '🎯', Math.round(n / 10) * 10, 20, 0); }
    case 10: { const days = rand(2, 6); return q(`There are 17 fard rakah each day. How many in ${days} days?`, '🧎', 17 * days, 8, 1); }
    default: { const cars = rand(3, 9), wheels = 4; return q(`A car park has ${cars} cars. How many wheels altogether?`, '🚗', cars * wheels, 6, 1); }
  }
}

/* ---------- Champions (Year 5-6) ---------- */
function championQuestion() {
  const name = pick(NAMES);
  const N = 4; // four choices for Champions
  switch (rand(1, 16)) {
    case 1: { const a = rand(12, 49), b = rand(3, 9); return q(`${a} × ${b} = ?`, '✖️', a * b, 12, 1, N); }
    case 2: { const a = rand(11, 25), b = rand(11, 19); return q(`${a} × ${b} = ?`, '✖️', a * b, 20, 1, N); }
    case 3: { const b = rand(3, 9), ans = rand(12, 45); return q(`${b * ans} ÷ ${b} = ?`, '➗', ans, 6, 1, N); }
    case 4: { const b = rand(3, 9), whole = rand(4, 12), r = rand(1, b - 1); return qText(`${b * whole + r} ÷ ${b} = ?`, '➗', `${whole} r ${r}`, [`${whole} r ${r === 1 ? 2 : r - 1}`, `${whole + 1} r ${r}`, `${whole - 1} r ${b - 1}`], 'r means remainder: what is left over.'); }
    case 5: { const d = pick([5, 6, 8, 10, 12]), a = rand(1, d - 2), b = rand(1, d - a - 1); return qText(`${a}/${d} + ${b}/${d} = ?`, '🍕', `${a + b}/${d}`, [`${a + b}/${2 * d}`, `${a * b}/${d}`, `${a + b + 1}/${d}`], 'When the bottom numbers match, add the top numbers.'); }
    case 6: { const d = pick([2, 4, 5, 10]), n = d * rand(4, 20), t = rand(1, d - 1); return q(`What is ${t}/${d} of ${n}?`, '🍰', n / d * t, 10, 1, N, `${n} ÷ ${d} × ${t} = ${n / d * t}.`); }
    case 7: { const a = rand(11, 89) / 10, b = rand(11, 59) / 10; const ans = (a + b).toFixed(1); return qText(`${a.toFixed(1)} + ${b.toFixed(1)} = ?`, '🔟', ans, [(a + b + 1).toFixed(1), (a + b - 0.1).toFixed(1), (a + b + 0.2).toFixed(1)]); }
    case 8: { const p = pick([10, 25, 50, 20, 75]), n = pick([40, 60, 80, 100, 120, 200]); return q(`What is ${p}% of ${n}?`, '💯', n * p / 100, 10, 1, N, `${p}% means ${p} out of every 100.`); }
    case 9: { const w = rand(4, 15), h = rand(3, 12); return q(`A garden is ${w} m long and ${h} m wide. What is its area?`, '🟩', w * h, 12, 1, N, `Area = length × width = ${w} × ${h} = ${w * h} square metres.`); }
    case 10: { const t = rand(2, 9), drop = rand(t + 2, t + 9); return q(`It is ${t}°C in Canberra. Overnight it drops by ${drop} degrees. What is the temperature now?`, '🌡️', t - drop, 4, -20, N, `${t} − ${drop} = ${t - drop}°C. Below zero is negative.`); }
    case 11: { const n = pick([12, 18, 20, 24, 30, 36]); const f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i); return q(`How many factors does ${n} have?`, '🧮', f.length, 3, 1, N, `The factors of ${n} are ${f.join(', ')}.`); }
    case 12: { const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]; const p = pick(primes.slice(3)); const not = shuffle([9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51]).slice(0, 3); return qText('Which number is a prime number?', '🔍', String(p), not.map(String), `${p} can only be divided by 1 and itself.`); }
    case 13: { const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9); return q(`${a} + ${b} × ${c} = ?`, '🧠', a + b * c, 8, 1, N, `Times comes first: ${b} × ${c} = ${b * c}, then add ${a}.`); }
    case 14: { const n = rand(10, 99) * 1000 + rand(0, 999); return q(`Round ${n.toLocaleString('en-AU')} to the nearest thousand.`, '🎯', Math.round(n / 1000) * 1000, 2000, 0, N); }
    case 15: { const price = rand(4, 19) + pick([0.5, 0.25, 0.75, 0.2]); const ans = 50 - price; return qText(`${name} spends ${dollars(price)} at the shop and pays with a $50 note. How much change?`, '💵', dollars(ans), [dollars(ans + 1), dollars(ans - 0.5), dollars(ans + 0.1)]); }
    default: { const days = rand(3, 7); return q(`There are 17 fard rakah each day. How many in ${days} weeks?`, '🧎', 17 * 7 * days, 20, 1, N, `17 × 7 = 119 each week. 119 × ${days} = ${119 * days}.`); }
  }
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
    const count = band === 'little' ? 6 : band === 'champion' ? 12 : 10;
    // Never the same question twice in one game.
    const seen = new Set(), questions = [];
    for (let i = 0; questions.length < count && i < 200; i++) {
      const x = make();
      if (!seen.has(x.prompt)) { seen.add(x.prompt); questions.push(x); }
    }
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You are a maths star!'), { shuffleOptions: false });
  },
};
