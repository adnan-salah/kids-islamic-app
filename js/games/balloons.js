/* =========================================================
   Game: Balloon Pop
   A fast tapping game. Balloons float up the screen; pop the
   ones that match the rule. Teaches quick looking and thinking.
   Bands:
     little   - pop the balloons with a picture on them (e.g. stars).
     explorer - pop the balloons with a letter on them (e.g. B).
     champion - pop even numbers, odd numbers, or the 5 times table.
   Pop 8 right balloons to win (10 for the older bands). Balloons start
   quick and speed up with every pop, and only about 1 in 3 is a right one.
   For the 3-year-old a wrong pop just wobbles; older children lose a heart.
   ========================================================= */
import { el, speak, sfx, toast, wiggle, shuffle, pick, PRAISE } from '../core.js';
import { confetti } from '../fun.js';

const GOAL = { little: 8, explorer: 10, champion: 10 };
const COLOURS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4', '#facc15'];

const PICS = [
  { emoji: '⭐', say: 'Pop the stars!' },
  { emoji: '❤️', say: 'Pop the hearts!' },
  { emoji: '🐟', say: 'Pop the fish!' },
  { emoji: '🍎', say: 'Pop the apples!' },
  { emoji: '🐱', say: 'Pop the cats!' },
];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'M', 'P', 'R', 'S', 'T'];
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

/* Each round: what to show on balloons, which are right, and the instruction. */
function makeRule(band) {
  if (band === 'little') {
    const target = pick(PICS);
    const others = PICS.filter(p => p !== target).map(p => p.emoji);
    return { text: target.say, label: () => (Math.random() < 0.3 ? target.emoji : pick(others)), isRight: l => l === target.emoji };
  }
  if (band === 'explorer') {
    const t = pick(LETTERS);
    const others = 'ABCDEFGHIJKLMNOPRSTUW'.split('').filter(c => c !== t);
    return { text: `Pop the letter ${t}!`, label: () => (Math.random() < 0.3 ? t : pick(others)), isRight: l => l === t };
  }
  const kind = pick(['even', 'odd', 'five']);
  if (kind === 'five') {
    return { text: 'Pop the numbers in the 5 times table!', label: () => String(Math.random() < 0.35 ? 5 * rand(1, 12) : pick([3, 7, 8, 12, 13, 18, 22, 27, 33, 41, 44, 52, 58])), isRight: l => Number(l) % 5 === 0 };
  }
  const want = kind === 'even' ? 0 : 1;
  return { text: `Pop the ${kind} numbers!`, label: () => String(rand(1, 50)), isRight: l => Number(l) % 2 === want };
}

export default {
  id: 'balloons',
  noFit: true, // sizes itself; touches are measured on its own surface
  title: 'Balloon Pop',
  emoji: '🎈',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    const rule = makeRule(band);
    const goal = GOAL[band];
    // Pixels per second at the start; every right pop makes them a bit faster.
    const speed0 = { little: 85, explorer: 110, champion: 130 }[band];
    const speedUp = { little: 7, explorer: 9, champion: 10 }[band];
    const every0 = { little: 950, explorer: 800, champion: 680 }[band]; // ms between balloons
    let speed = speed0, every = every0;
    let popped = 0, mistakes = 0, done = false;

    const count = el('span', { class: 'pop-count' });
    const sky = el('div', { class: 'sky' });
    const showCount = () => { count.textContent = `🎈 ${popped} / ${goal}`; };
    showCount();
    root.replaceChildren(
      el('div', { class: 'prompt' },
        el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(rule.text) }, '🔊'),
        el('p', {}, rule.text), count),
      sky);
    speak(rule.text);

    const balloons = new Set();
    let last = performance.now(), sinceSpawn = every;

    let wrongRun = 0;
    function spawn() {
      // Never more than 3 wrong ones in a row, so there is always something to get.
      let label = rule.label();
      for (let i = 0; i < 20 && wrongRun >= 3 && !rule.isRight(label); i++) label = rule.label();
      wrongRun = rule.isRight(label) ? 0 : wrongRun + 1;
      const colour = pick(COLOURS);
      // The outer button moves; the inner body pops and wobbles.
      const b = el('button', { class: 'balloon', style: `--c:${colour}`, 'aria-label': label },
        el('span', { class: 'balloon-body' }, el('span', { class: 'balloon-label' }, label)));
      const w = sky.clientWidth;
      b.dataset.x = String(Math.random() * Math.max(10, w - 120));
      b.dataset.y = String(sky.clientHeight + 10);
      b.dataset.sway = String(Math.random() * Math.PI * 2);
      b.addEventListener('pointerdown', e => { e.preventDefault(); tap(b, label); });
      sky.append(b);
      balloons.add(b);
    }

    function tap(b, label) {
      if (done || b.firstChild.classList.contains('popping')) return;
      if (rule.isRight(label)) {
        sfx.pop();
        sfx.right();
        b.firstChild.classList.add('popping');
        balloons.delete(b);
        const r = b.getBoundingClientRect();
        confetti({ count: 30, from: { x: r.left + r.width / 2, y: r.top + r.height / 3 } });
        setTimeout(() => b.remove(), 300);
        popped++;
        speed = speed0 + speedUp * popped;
        every = Math.max(450, every0 - 35 * popped);
        showCount();
        if (popped % 3 === 0 && popped < goal) toast(pick(PRAISE));
        if (popped >= goal) {
          done = true;
          setTimeout(() => ctx.finish(mistakes <= 2 ? 3 : 2, 'You popped all the balloons!'), 900);
        }
      } else {
        mistakes++;
        sfx.boing();
        sfx.tryAgain();
        wiggle(b.firstChild);
      }
    }

    function frame(now) {
      if (!root.isConnected || done) { balloons.forEach(b => b.remove()); return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sinceSpawn += dt * 1000;
      if (sinceSpawn >= every) { sinceSpawn = 0; spawn(); }
      for (const b of balloons) {
        const y = Number(b.dataset.y) - speed * dt;
        const sway = Number(b.dataset.sway) + dt * 1.6;
        b.dataset.y = String(y);
        b.dataset.sway = String(sway);
        b.style.transform = `translate(${Number(b.dataset.x) + Math.sin(sway) * 14}px, ${y}px)`;
        if (y < -160) { balloons.delete(b); b.remove(); }
      }
      requestAnimationFrame(frame);
    }
    // Start with a few balloons already on the way up.
    requestAnimationFrame(t => { last = t; frame(t); });
  },
};
