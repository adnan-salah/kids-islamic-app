/* =========================================================
   Game: Kasem's Catch
   A fast moving game. Things fall from the sky; slide Kasem
   left and right to catch the right ones in his basket.
   Bands:
     little   - catch the fruit (not the socks and boots).
     explorer - catch the words that rhyme (e.g. with cat).
     champion - catch the sums that make a number (e.g. 20).
   Catch 8 right ones to win. Catching a wrong one just makes
   Kasem shake his head: no losing.
   ========================================================= */
import { el, speak, sfx, toast, shuffle, pick, PRAISE } from '../core.js';
import { kasem, confetti } from '../fun.js';

const GOAL = 8;
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

const RHYMES = [
  { word: 'cat', yes: ['hat', 'bat', 'mat', 'rat', 'sat', 'fat', 'pat'] },
  { word: 'dog', yes: ['log', 'frog', 'fog', 'jog', 'hog'] },
  { word: 'sun', yes: ['fun', 'run', 'bun', 'spun', 'one'] },
  { word: 'cake', yes: ['lake', 'bake', 'snake', 'make', 'rake'] },
];
const OTHER_WORDS = ['pig', 'bed', 'cup', 'tree', 'ball', 'fish', 'book', 'car', 'moon', 'sock', 'hen', 'box'];

/* A sum that equals n, written in words a 9-year-old reads quickly. */
function sumFor(n) {
  const kind = rand(1, 4);
  if (kind === 1) { const a = rand(1, n - 1); return `${a} + ${n - a}`; }
  if (kind === 2) { const b = rand(1, 15); return `${n + b} − ${b}`; }
  const f = [2, 3, 4, 5, 6].filter(x => n % x === 0);
  if (kind === 3 && f.length) { const a = pick(f); return `${a} × ${n / a}`; }
  const a = rand(1, n - 1); return `${n - a} + ${a}`;
}

/* Work out "a + b", "a − b" or "a × b". */
function solve(text) {
  const [a, op, b] = text.split(' ');
  return op === '+' ? +a + +b : op === '−' ? a - b : a * b;
}

function makeRule(band) {
  if (band === 'little') {
    const yes = ['🍎', '🍌', '🍓', '🍇', '🍊', '🍉'];
    const no = ['🧦', '🥾', '🪣', '🔑', '🧱'];
    return { text: 'Catch the fruit!', item: () => (Math.random() < 0.6 ? pick(yes) : pick(no)), isRight: l => yes.includes(l), big: true };
  }
  if (band === 'explorer') {
    const r = pick(RHYMES);
    const others = OTHER_WORDS.filter(w => !r.yes.includes(w));
    return { text: `Catch the words that rhyme with ${r.word}!`, item: () => (Math.random() < 0.5 ? pick(r.yes) : pick(others)), isRight: l => r.yes.includes(l) };
  }
  const n = pick([20, 24, 36]);
  return {
    text: `Catch the sums that make ${n}!`,
    item: () => (Math.random() < 0.5 ? sumFor(n) : sumFor(n + pick([-3, -2, -1, 1, 2, 3]))),
    isRight: l => solve(l) === n,
  };
}

export default {
  id: 'catch',
  title: 'Kasem’s Catch',
  emoji: '🧺',
  bands: ['little', 'explorer', 'champion'],
  noBuddy: true, // Kasem is already in the game

  start(ctx) {
    const { root, band } = ctx;
    const rule = makeRule(band);
    const speed = { little: 120, explorer: 140, champion: 150 }[band];  // pixels per second
    const every = { little: 1500, explorer: 1500, champion: 1700 }[band]; // ms between items
    let caught = 0, mistakes = 0, done = false;

    const count = el('span', { class: 'pop-count' });
    const catcher = el('div', { class: 'catcher' }, el('span', { class: 'basket' }, '🧺'), kasem('hi', 'catcher-kasem'));
    const field = el('div', { class: 'field' }, catcher);
    const showCount = () => { count.textContent = `🧺 ${caught} / ${GOAL}`; };
    showCount();
    root.replaceChildren(
      el('div', { class: 'prompt' },
        el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak([rule.text, 'Slide Kasem left and right.']) }, '🔊'),
        el('p', {}, rule.text), count),
      field);
    speak([rule.text, 'Slide Kasem left and right.']);

    // Kasem follows your finger anywhere in the field.
    let kx = 0;
    const placeKasem = () => { catcher.style.transform = `translateX(${kx}px)`; };
    const follow = e => {
      const r = field.getBoundingClientRect();
      kx = Math.max(0, Math.min(r.width - catcher.offsetWidth, e.clientX - r.left - catcher.offsetWidth / 2));
      placeKasem();
    };
    field.addEventListener('pointerdown', e => { field.setPointerCapture(e.pointerId); follow(e); });
    field.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') follow(e); });
    requestAnimationFrame(() => { kx = (field.clientWidth - catcher.offsetWidth) / 2; placeKasem(); });

    const items = new Set();
    let wrongRun = 0;
    function drop() {
      // Never more than 2 wrong ones in a row, so there is always something to get.
      let label = rule.item();
      for (let i = 0; i < 20 && wrongRun >= 2 && !rule.isRight(label); i++) label = rule.item();
      wrongRun = rule.isRight(label) ? 0 : wrongRun + 1;
      const it = el('div', { class: `falling ${rule.big ? 'big' : ''}` }, label);
      field.append(it);
      it.dataset.x = String(Math.random() * Math.max(10, field.clientWidth - it.offsetWidth));
      it.dataset.y = String(-it.offsetHeight);
      it.dataset.label = label;
      items.add(it);
    }

    function land(it) {
      items.delete(it);
      const label = it.dataset.label;
      if (rule.isRight(label)) {
        caught++;
        sfx.pop();
        sfx.right();
        const r = catcher.getBoundingClientRect();
        confetti({ count: 25, from: { x: r.left + r.width / 2, y: r.top } });
        showCount();
        if (caught % 3 === 0 && caught < GOAL) toast(pick(PRAISE));
        if (caught >= GOAL) {
          done = true;
          setTimeout(() => ctx.finish(mistakes <= 2 ? 3 : 2, 'You caught them all!'), 900);
        }
      } else {
        mistakes++;
        sfx.tryAgain();
        catcher.classList.remove('nope'); void catcher.offsetWidth; catcher.classList.add('nope');
      }
      it.classList.add('caught');
      setTimeout(() => it.remove(), 250);
    }

    let last = performance.now(), since = every - 300;
    function frame(now) {
      if (!root.isConnected || done) { items.forEach(i => i.remove()); return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      since += dt * 1000;
      if (since >= every) { since = 0; drop(); }
      const catchY = field.clientHeight - catcher.offsetHeight + 10;
      for (const it of items) {
        const y = Number(it.dataset.y) + speed * dt;
        it.dataset.y = String(y);
        const x = Number(it.dataset.x);
        it.style.transform = `translate(${x}px, ${y}px)`;
        const bottom = y + it.offsetHeight;
        if (bottom >= catchY && bottom <= catchY + 40) {
          const mid = x + it.offsetWidth / 2;
          if (mid > kx - 10 && mid < kx + catcher.offsetWidth + 10) { land(it); continue; }
        }
        if (y > field.clientHeight) { items.delete(it); it.remove(); }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(t => { last = t; frame(t); });
  },
};
