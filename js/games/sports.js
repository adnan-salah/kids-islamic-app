/* =========================================================
   Game: Sports Maths
   Teaches: quick maths, with race cars and soccer.
   Two modes:
     Race      - each right answer moves your car along the track.
                 Beat the rival car to the finish for 3 stars.
     Penalties - 5 penalty kicks. A right answer scores a goal.
   Two levels:
     Normal - Year 2-3: adding and taking away to 100, 2, 3, 5, 10 tables.
     Turbo  - Year 4-6: all tables, 3-digit sums, sharing, 2-digit × 1-digit.
   Champions start on Turbo. Anyone can pick either level.
   Questions are made fresh every game, so they use the tablet voice.
   ========================================================= */
import { el, speak, sfx, toast, wiggle, shuffle, pick, PRAISE } from '../core.js';

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const RACE_STEPS = 8;     // right answers needed to finish the race
const KICKS = 5;          // penalty kicks
const RIVAL_EVERY = { normal: 9000, turbo: 7000 }; // ms between rival moves

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

/* Normal: Year 2-3 (Explorers). */
function normalQuestion() {
  const kind = rand(1, 6);
  if (kind === 1) { const a = rand(15, 60), b = rand(11, 39); return { q: `${a} + ${b} = ?`, answer: a + b, spread: 10 }; }
  if (kind === 2) { const a = rand(40, 99), b = rand(11, a - 10); return { q: `${a} − ${b} = ?`, answer: a - b, spread: 10 }; }
  if (kind === 3) { const t = pick([2, 3, 5, 10]), n = rand(2, 12); return { q: `${n} × ${t} = ?`, answer: n * t, spread: 5 }; }
  if (kind === 4) { const a = rand(8, 30), b = rand(5, 25); return { q: `Your team scores ${a} points, then ${b} more. How many points?`, answer: a + b, spread: 8 }; }
  if (kind === 5) { const laps = rand(20, 60), done = rand(5, laps - 5); return { q: `A race has ${laps} laps. You have done ${done}. How many laps are left?`, answer: laps - done, spread: 8 }; }
  const teams = rand(2, 6), size = pick([5, 10]);
  return { q: `${teams} teams each have ${size} players. How many players?`, answer: teams * size, spread: 6 };
}

/* Turbo: Year 4-6 (Champions, or anyone who wants a challenge). */
function turboQuestion() {
  const kind = rand(1, 7);
  if (kind === 1) { const a = rand(3, 12), b = rand(6, 12); return { q: `${a} × ${b} = ?`, answer: a * b, spread: 8 }; }
  if (kind === 2) { const a = rand(120, 680), b = rand(110, 299); return { q: `${a} + ${b} = ?`, answer: a + b, spread: 30 }; }
  if (kind === 3) { const a = rand(400, 999), b = rand(110, a - 100); return { q: `${a} − ${b} = ?`, answer: a - b, spread: 30 }; }
  if (kind === 4) { const laps = rand(12, 58), km = rand(3, 7); return { q: `Each lap is ${km} km. How far is ${laps} laps?`, answer: laps * km, spread: 15 }; }
  if (kind === 5) { const players = pick([3, 4, 6, 8]), each = rand(6, 15); return { q: `${players * each} oranges are shared equally between ${players} players. How many each?`, answer: each, spread: 4 }; }
  if (kind === 6) { const a = rand(13, 39), b = rand(3, 9); return { q: `${a} × ${b} = ?`, answer: a * b, spread: 15 }; }
  const teams = rand(4, 12), size = 11;
  return { q: `${teams} soccer teams each have ${size} players. How many players?`, answer: teams * size, spread: 11 };
}

export default {
  id: 'sports',
  title: 'Sports Maths',
  emoji: '🏎️',
  bands: ['explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    let level = band === 'champion' || ctx.harder ? 'turbo' : 'normal';
    let timer = null;
    // Stop the rival car if the child leaves the game part-way.
    const stopTimer = () => { clearInterval(timer); timer = null; };
    new MutationObserver((_, obs) => { if (!root.isConnected) { stopTimer(); obs.disconnect(); } })
      .observe(document.body, { childList: true, subtree: true });

    menu();

    function menu() {
      stopTimer();
      const levelBtn = (id, label) => el('button', {
        class: `big-btn ${level === id ? '' : 'secondary'}`,
        onclick: () => { level = id; sfx.tap(); menu(); },
      }, label);
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('Pick a game: race or penalties.') }, '🔊'),
          el('p', {}, 'Pick a game: race or penalties.')),
        el('div', { class: 'row' },
          levelBtn('normal', '🙂 Normal'),
          levelBtn('turbo', '🔥 Turbo')),
        el('div', { class: 'tile-grid' },
          el('button', { class: 'tile', onclick: () => { sfx.tap(); race(); } },
            el('span', { class: 'emoji' }, '🏁'),
            el('span', { class: 'label' }, 'Race')),
          el('button', { class: 'tile', onclick: () => { sfx.tap(); penalties(); } },
            el('span', { class: 'emoji' }, '⚽'),
            el('span', { class: 'label' }, 'Penalties'))),
      );
      speak('Pick a game: race or penalties.');
    }

    const make = () => {
      const item = level === 'turbo' ? turboQuestion() : normalQuestion();
      return { ...item, options: choices(item.answer, item.spread || 3, 0) };
    };

    /* Shows a question; calls onRight() or onWrong(). */
    function ask(area, item, onRight, onWrong) {
      const box = el('div', { class: 'options' }, item.options.map(opt => {
        const b = el('button', { class: 'option', onclick: () => {
          if (box.dataset.locked) return;
          if (opt === String(item.answer)) { box.dataset.locked = '1'; b.classList.add('right'); onRight(); }
          else onWrong(b, box);
        } }, opt);
        return b;
      }));
      area.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(item.q) }, '🔊'),
          el('p', {}, item.q)),
        box);
      speak(item.q);
    }

    /* ---------- Race ---------- */
    function race() {
      let me = 0, rival = 0, mistakes = 0, rivalWon = false;
      const myCar = el('img', { class: 'car me kasem-car', src: 'img/art/kasem-car.png', alt: 'Kasem’s car' });
      const rivalCar = el('span', { class: 'car rival' }, '🚙');
      const track = el('div', { class: 'track' },
        el('div', { class: 'lane' }, myCar, el('span', { class: 'flag' }, '🏁')),
        el('div', { class: 'lane' }, rivalCar, el('span', { class: 'flag' }, '🏁')));
      const area = el('div', { class: 'race-q' });
      root.replaceChildren(track, area);
      const place = () => {
        myCar.style.left = `${(me / RACE_STEPS) * 85}%`;
        rivalCar.style.left = `${(rival / RACE_STEPS) * 85}%`;
      };
      place();
      speak('Ready, set, go!');
      timer = setInterval(() => {
        if (rival < RACE_STEPS) { rival++; place(); }
        if (rival >= RACE_STEPS && !rivalWon) { rivalWon = true; stopTimer(); toast('The blue car finished. Keep going!', 2200); }
      }, RIVAL_EVERY[level]);
      next();

      function next() {
        ask(area, make(), () => {
          sfx.right();
          sfx.whoosh();
          me++;
          place();
          if (me >= RACE_STEPS) {
            stopTimer();
            const won = !rivalWon;
            setTimeout(() => ctx.finish(won && mistakes < 3 ? 3 : 2,
              won ? 'You won the race!' : 'You finished the race!'), 1200);
          } else {
            toast(pick(PRAISE));
            setTimeout(next, 700);
          }
        }, b => { mistakes++; sfx.tryAgain(); wiggle(b); toast('Try again!'); });
      }
    }

    /* ---------- Penalties ---------- */
    function penalties() {
      let kick = 0, goals = 0;
      const ball = el('span', { class: 'ball' }, '⚽');
      const keeper = el('span', { class: 'keeper' }, '🧤');
      const pitch = el('div', { class: 'pitch' }, el('div', { class: 'goal' }, keeper), ball);
      const score = el('p', { class: 'score' });
      const area = el('div', { class: 'race-q' });
      root.replaceChildren(score, pitch, area);
      next();

      function showScore() {
        score.textContent = `Kick ${Math.min(kick + 1, KICKS)} of ${KICKS}   ⚽ Goals: ${goals}`;
      }
      function next() {
        showScore();
        pitch.className = 'pitch';
        const item = make();
        ask(area, item, () => {
          goals++;
          sfx.right();
          pitch.classList.add('scored');
          toast('GOAL! ⚽', 1400);
          speak('Goal!');
          after();
        }, (b, box) => {
          box.dataset.locked = '1';
          sfx.tryAgain();
          wiggle(b);
          pitch.classList.add('saved');
          toast(`Saved! The answer was ${item.answer}.`, 2400);
          speak('Saved by the keeper!');
          [...box.children].find(x => x.textContent === String(item.answer))?.classList.add('right');
          after(2600);
        });
      }
      function after(wait = 1500) {
        kick++;
        setTimeout(() => {
          if (kick < KICKS) return next();
          const stars = goals === KICKS ? 3 : 2;
          ctx.finish(stars, `You scored ${goals} out of ${KICKS}!`);
        }, wait);
      }
    }
  },
};
