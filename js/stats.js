/* =========================================================
   Progress tracking: right and wrong answers for each child.
   Every game already plays sfx.right() / sfx.tryAgain(); core.js
   turns those into an 'answer' event. While a game is being played,
   this file counts them per day and per game, and remembers which
   questions were missed, so the parent area can show:
     - how many questions and how accurate, this week vs last week
     - each subject and game, so a parent can see where a child struggles
     - the questions missed most often
   Saved inside the child (child.stats), on this tablet only.
   ========================================================= */
import { saveState } from './core.js';

const KEEP_DAYS = 180;      // older days are dropped
const KEEP_MISSES = 40;     // per game

let current = null;         // { child, game, state }

/** Called when a game starts and when it ends (null). */
export function trackGame(child, game, state) {
  current = child && game && !game.noStats ? { child, game, state } : null;
  if (current) bump(0, 0, 1);
}

const dayKey = (d = new Date()) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD, local time

function statsOf(child) {
  child.stats ??= { days: {}, missed: {} };
  return child.stats;
}

function bump(right, wrong, plays) {
  const s = statsOf(current.child);
  const day = (s.days[dayKey()] ??= {});
  const rec = (day[current.game.id] ??= [0, 0, 0]); // [right, wrong, games started]
  rec[0] += right; rec[1] += wrong; rec[2] += plays;
  // Drop very old days so storage stays small.
  const keys = Object.keys(s.days);
  if (keys.length > KEEP_DAYS) keys.sort().slice(0, keys.length - KEEP_DAYS).forEach(k => delete s.days[k]);
}

/* What was on screen when a mistake happened: the question text, plus a
   short picture/word shown with it (e.g. the letter or sum). */
function questionOnScreen() {
  const p = document.querySelector('.stage .prompt p')?.textContent?.trim() || '';
  const pic = document.querySelector('.stage .question-pic')?.textContent?.trim() || '';
  return [p, pic.length && pic.length <= 40 ? pic : ''].filter(Boolean).join(' ').slice(0, 140);
}

document.addEventListener('answer', e => {
  if (!current) return;
  const { ok, info } = e.detail;
  if (ok) bump(1, 0, 0);
  else {
    bump(0, 1, 0);
    const q = info?.q || questionOnScreen();
    if (q) {
      const s = statsOf(current.child);
      const list = (s.missed[current.game.id] ??= {});
      const m = (list[q] ??= { n: 0 });
      m.n++;
      m.last = dayKey();
      if (info?.answer != null) m.answer = String(info.answer);
      const keys = Object.keys(list);
      if (keys.length > KEEP_MISSES) {
        keys.sort((a, b) => (list[a].last || '').localeCompare(list[b].last || '') || list[a].n - list[b].n);
        keys.slice(0, keys.length - KEEP_MISSES).forEach(k => delete list[k]);
      }
    }
  }
  saveState(current.state);
});

/* ---------- Reading the numbers back (for the parent area) ---------- */

/** Totals per game between two dates (inclusive), as { gameId: [right, wrong, plays] }. */
export function totals(child, from, to) {
  const out = {};
  for (const [d, games] of Object.entries(child.stats?.days || {})) {
    if (d < from || d > to) continue;
    for (const [g, [r, w, p]] of Object.entries(games)) {
      const t = (out[g] ??= [0, 0, 0]);
      t[0] += r; t[1] += w; t[2] += p;
    }
  }
  return out;
}

/** Date string n days before today. */
export const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return dayKey(d); };
export const today = () => dayKey();

/** Missed questions since a date, most missed first: [{ gameId, q, n, answer, last }]. */
export function missedSince(child, from) {
  const out = [];
  for (const [gameId, list] of Object.entries(child.stats?.missed || {})) {
    for (const [q, m] of Object.entries(list)) if ((m.last || '') >= from) out.push({ gameId, q, ...m });
  }
  return out.sort((a, b) => b.n - a.n || (b.last || '').localeCompare(a.last || ''));
}
