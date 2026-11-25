/* Willow Woods: the one config that controls each age version (brief, section 5.3). */
export const WOODS_BANDS = {
  T: { name: 'Tiny (3-4)',     ages: [3, 4],  minTarget: 88, input: 'tap',      showText: false,       voice: 'always', idleGlowSec: 0,  hintAfterFails: 0, canFail: false },
  A: { name: 'Junior (5-6)',   ages: [5, 6],  minTarget: 72, input: 'tap-drag', showText: 'short',     voice: 'always', idleGlowSec: 10, hintAfterFails: 3, canFail: true },
  B: { name: 'Builder (7-8)',  ages: [7, 8],  minTarget: 56, input: 'full',     showText: 'sentences', voice: 'button', idleGlowSec: 0,  hintAfterFails: 3, canFail: true },
  C: { name: 'Inventor (9-11)', ages: [9, 11], minTarget: 48, input: 'full',    showText: 'full',      voice: 'button', idleGlowSec: 0,  hintAfterFails: 3, canFail: true },
};

/* Whole years old today, from a birth month like "2020-03". Month precision only, as the parent enters it. */
export function ageFrom(birth, now = new Date()) {
  const m = /^(\d{4})-(\d{2})$/.exec(birth || '');
  if (!m) return null;
  const months = (now.getFullYear() - +m[1]) * 12 + (now.getMonth() + 1 - +m[2]);
  return months < 0 ? null : Math.floor(months / 12);
}

/* Which version a child plays: the parent's override, else their age, else a guess from their Noor age group. */
export function woodsBand(child, now = new Date()) {
  if (WOODS_BANDS[child.woodsBand]) return child.woodsBand;
  const age = ageFrom(child.birth, now);
  if (age != null) return age <= 4 ? 'T' : age <= 6 ? 'A' : age <= 8 ? 'B' : 'C';
  return { little: 'T', explorer: 'B', champion: 'C' }[child.band] || 'A';
}
