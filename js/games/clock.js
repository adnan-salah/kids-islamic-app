/* =========================================================
   Game: Time & Money
   Teaches: reading a clock, and counting Australian coins.
   Bands:
     explorer - (Year 2-3) quarter past/to and 5-minute times;
                adding up coins and working out change.
     champion - (Year 5) 5-minute times, 24-hour time, how long
                between two times, and change from $20 and $50.
   Questions are made fresh each game, so they use the tablet voice.
   ========================================================= */
import { el, shuffle, pick } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const NS = 'http://www.w3.org/2000/svg';

/* A simple analogue clock as an SVG element. */
function clockFace(h, m) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('class', 'clock');
  const add = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.append(n);
    return n;
  };
  add('circle', { cx: 100, cy: 100, r: 94, fill: '#fff', stroke: '#0f766e', 'stroke-width': 8 });
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * 2 * Math.PI;
    const t = add('text', { x: 100 + 72 * Math.sin(a), y: 100 - 72 * Math.cos(a) + 8, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#1e293b' });
    t.textContent = i;
  }
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const a = (i / 60) * 2 * Math.PI;
    add('circle', { cx: 100 + 88 * Math.sin(a), cy: 100 - 88 * Math.cos(a), r: 1.6, fill: '#94a3b8' });
  }
  const hand = (angle, len, width, colour) => add('line', {
    x1: 100, y1: 100, x2: 100 + len * Math.sin(angle), y2: 100 - len * Math.cos(angle),
    stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round',
  });
  hand((((h % 12) + m / 60) / 12) * 2 * Math.PI, 45, 9, '#1e293b');   // hour hand: short and thick
  hand((m / 60) * 2 * Math.PI, 70, 5, '#ea580c');                     // minute hand: long and orange
  add('circle', { cx: 100, cy: 100, r: 7, fill: '#1e293b' });
  return svg;
}

const hourName = h => String(((h - 1 + 12) % 12) + 1);
function timeWords(h, m) {
  if (m === 0) return `${hourName(h)} o'clock`;
  if (m === 30) return `half past ${hourName(h)}`;
  if (m === 15) return `quarter past ${hourName(h)}`;
  if (m === 45) return `quarter to ${hourName(h + 1)}`;
  return `${hourName(h)}:${String(m).padStart(2, '0')}`;
}

const hm = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

/* Champions: 24-hour time and how long between two times. */
function champTimeQuestion() {
  if (Math.random() < 0.5) {
    const h = rand(13, 22), m = 5 * rand(0, 11);
    const answer = `${hm(h - 12, m)} pm`;
    return {
      prompt: `A plane leaves at ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} (24-hour time). What is that in 12-hour time?`,
      pic: '✈️',
      options: shuffle([answer, `${hm(h - 10, m)} pm`, `${hm(h - 12, m)} am`]),
      answer,
      explain: `Take away 12 from the hours after midday: ${h} − 12 = ${h - 12}.`,
    };
  }
  const h = rand(7, 14), m = 5 * rand(0, 11), len = 5 * rand(9, 30);
  const end = h * 60 + m + len;
  const fmt = mins => `${Math.floor(mins / 60)} h ${mins % 60} min`;
  const answer = len >= 60 ? fmt(len) : `${len} min`;
  const alt = d => (len + d >= 60 ? fmt(len + d) : `${len + d} min`);
  const show = t => { const hh = Math.floor(t / 60), mm = t % 60; return `${hh > 12 ? hh - 12 : hh}:${String(mm).padStart(2, '0')}${hh >= 12 ? ' pm' : ' am'}`; };
  return {
    prompt: `The cricket starts at ${show(h * 60 + m)} and ends at ${show(end)}. How long does it last?`,
    pic: '🏏',
    options: shuffle([answer, alt(10), alt(-15)]),
    answer,
    explain: `From ${show(h * 60 + m)} to ${show(end)} is ${answer}.`,
  };
}

function timeQuestion(band) {
  if (band === 'champion' && Math.random() < 0.6) return champTimeQuestion();
  const h = rand(1, 12);
  const m = pick([0, 15, 30, 45, 5 * rand(1, 11), 5 * rand(1, 11)]);
  const answer = timeWords(h, m);
  const wrong = new Set();
  while (wrong.size < 2) {
    const wh = rand(1, 12);
    const wm = pick([0, 15, 30, 45, m, (m + 30) % 60]);
    const w = timeWords(wh, wm);
    if (w !== answer) wrong.add(w);
  }
  return {
    prompt: 'What time does the clock show?',
    say: 'What time does the clock show?',
    picNode: clockFace(h, m),
    options: shuffle([answer, ...wrong]),
    answer,
    explain: `It is ${answer}.`,
  };
}

/* Australian coins, in cents. */
const COINS = [5, 10, 20, 50, 100, 200];
const money = c => (c % 100 === 0 ? `$${c / 100}` : c < 100 ? `${c}c` : `$${(c / 100).toFixed(2)}`);
const coinLabel = c => (c >= 100 ? `$${c / 100}` : `${c}c`);

function coinRow(coins) {
  return el('div', { class: 'coin-row' }, coins.map(c =>
    el('span', { class: `coin ${c >= 100 ? 'gold' : 'silver'} c${c}` }, coinLabel(c))));
}

function moneyQuestion(band) {
  if (Math.random() < 0.5) {
    // Change from a note.
    const note = band === 'champion' ? pick([2000, 5000]) : pick([500, 1000]);
    const price = 5 * rand(10, note / 5 - 10);
    const answer = note - price;
    const wrong = new Set();
    while (wrong.size < 2) { const w = answer + 5 * rand(-6, 6); if (w > 0 && w !== answer) wrong.add(w); }
    return {
      prompt: `A drink costs ${money(price)}. You pay with a ${money(note)} note. How much change?`,
      pic: '🧃',
      options: shuffle([answer, ...wrong]).map(money),
      answer: money(answer),
      explain: `${money(note)} take away ${money(price)} is ${money(answer)}.`,
    };
  }
  const n = band === 'champion' ? rand(5, 7) : rand(3, 5);
  const pool = COINS;
  const coins = Array.from({ length: n }, () => pick(pool)).sort((a, b) => b - a);
  const total = coins.reduce((a, b) => a + b, 0);
  const wrong = new Set();
  while (wrong.size < 2) { const w = total + 10 * rand(-5, 5); if (w > 0 && w !== total) wrong.add(w); }
  return {
    prompt: 'How much money is this?',
    say: 'How much money is this?',
    picNode: coinRow(coins),
    options: shuffle([total, ...wrong]).map(money),
    answer: money(total),
    explain: `That is ${money(total)}.`,
  };
}

export default {
  id: 'clock',
  title: 'Time & Money',
  emoji: '⏰',
  bands: ['explorer', 'champion'],

  start(ctx) {
    const { root } = ctx;
    const band = ctx.harder ? 'champion' : ctx.band; // harder maths gets the Champions' questions
    const questions = shuffle([
      ...Array.from({ length: 5 }, () => timeQuestion(band)),
      ...Array.from({ length: 5 }, () => moneyQuestion(band)),
    ]);
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You can tell the time and count money!'), { shuffleOptions: false });
  },
};
