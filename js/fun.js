/* =========================================================
   fun.js: the things that make the app feel alive.
   - Kasem the Koala, the app's mascot, in different poses
   - Kasem's corner buddy in games, who reacts to right and wrong taps
   - confetti bursts
   - daily streak and the treasure chest (opens after 3 games a day)
   All art is in img/art/ (made for this app).
   ========================================================= */
import { el, pick } from './core.js';

/* ---------- Kasem ---------- */
export const POSES = ['hi', 'cheer', 'think', 'oops', 'ball', 'read', 'car'];

/** An <img> of Kasem. pose: one of POSES. Falls back to the standing picture. */
export function kasem(pose = 'hi', cls = '') {
  const img = el('img', { class: `kasem ${cls}`, src: `img/art/kasem-${pose}.png`, alt: 'Kasem the Koala', draggable: 'false' });
  img.addEventListener('error', () => {
    if (!img.src.endsWith('img/art/kasem.png')) img.src = 'img/art/kasem.png';
    else img.style.visibility = 'hidden';
  }, { once: false });
  return img;
}

/** Kasem with a speech bubble beside him. */
export function kasemSays(pose, text, cls = '') {
  return el('div', { class: `kasem-says ${cls}` },
    kasem(pose, 'bob'),
    el('div', { class: 'bubble' }, text));
}

/* ---------- Corner buddy ----------
   Shown in every game. Any game that plays the "right" or "try again"
   sound makes Kasem cheer or encourage (see sfx in core.js). */
export function buddy() {
  const img = kasem('think', 'buddy-img');
  const box = el('div', { class: 'buddy', 'aria-hidden': 'true' }, img);
  let reset;
  const set = (pose, ms = 1600) => {
    clearTimeout(reset);
    img.src = `img/art/kasem-${pose}.png`;
    box.classList.remove('jump', 'shake');
    void box.offsetWidth;
    box.classList.add(pose === 'cheer' ? 'jump' : 'shake');
    reset = setTimeout(() => { img.src = 'img/art/kasem-think.png'; }, ms);
  };
  const onMood = e => {
    if (!box.isConnected) { document.removeEventListener('kasem', onMood); return; }
    set(e.detail === 'right' ? 'cheer' : 'oops');
  };
  document.addEventListener('kasem', onMood);
  return box;
}

/* ---------- Confetti ---------- */
const COLOURS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];

/** A burst of confetti over the whole screen. from: {x, y} in px (default: top middle). */
export function confetti({ count = 140, from } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = el('canvas', { class: 'confetti' });
  document.body.append(canvas);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = canvas.width = innerWidth * dpr;
  const H = canvas.height = innerHeight * dpr;
  const ctx = canvas.getContext('2d');
  const ox = (from?.x ?? innerWidth / 2) * dpr;
  const oy = (from?.y ?? innerHeight * 0.35) * dpr;
  const bits = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const v = (6 + Math.random() * 12) * dpr;
    return {
      x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 8 * dpr,
      w: (8 + Math.random() * 8) * dpr, h: (5 + Math.random() * 6) * dpr,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: pick(COLOURS), round: Math.random() < 0.3,
    };
  });
  const start = performance.now();
  (function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, W, H);
    for (const b of bits) {
      b.vy += 0.35 * dpr; b.vx *= 0.985; b.vy *= 0.985;
      b.x += b.vx; b.y += b.vy; b.r += b.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / 2800);
      ctx.translate(b.x, b.y); ctx.rotate(b.r);
      ctx.fillStyle = b.c;
      if (b.round) { ctx.beginPath(); ctx.arc(0, 0, b.h / 1.5, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    if (t < 2800) requestAnimationFrame(frame); else canvas.remove();
  })(start);
}

/* ---------- Streak and treasure chest ---------- */
export const GAMES_FOR_CHEST = 3;
export const CHEST_STARS = 5;
export const TREASURES = ['🐚', '💎', '🧸', '🪁', '🎈', '🏆', '🦜', '🐠', '🚂', '🛼', '🦕', '🐞',
  '🌻', '🔭', '🚁', '⛵', '🎨', '🪀', '🦒', '🍉', '🌵', '🚲', '🐧', '🦉'];

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, tablet's own time zone
const dayGap = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

/** Call when a child finishes a game. Updates their streak and today's count. */
export function recordPlay(child) {
  const d = today();
  child.day ??= { date: d, games: 0, chest: false };
  if (child.day.date !== d) child.day = { date: d, games: 0, chest: false };
  child.day.games++;
  child.streak ??= { last: null, count: 0 };
  if (child.streak.last !== d) {
    child.streak.count = child.streak.last && dayGap(child.streak.last, d) === 1 ? child.streak.count + 1 : 1;
    child.streak.last = d;
  }
}

/** How many days in a row this child has played (0 if the streak is broken). */
export function streakOf(child) {
  const s = child.streak;
  if (!s?.last) return 0;
  return dayGap(s.last, today()) <= 1 ? s.count : 0;
}

/** Games played today (for the chest progress). */
export const gamesToday = child => (child.day?.date === today() ? child.day.games : 0);
export const chestReady = child => gamesToday(child) >= GAMES_FOR_CHEST && !(child.day?.chest);
export const chestOpenedToday = child => child.day?.date === today() && child.day.chest;

/** Open today's chest: bonus stars and a treasure the child doesn't have yet. */
export function openChest(child) {
  child.day.chest = true;
  child.stars += CHEST_STARS;
  child.treasures ??= [];
  const left = TREASURES.filter(t => !child.treasures.includes(t));
  const found = left.length ? pick(left) : pick(TREASURES);
  if (left.length) child.treasures.push(found);
  return found;
}
