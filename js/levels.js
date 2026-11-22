/* =========================================================
   levels.js: levels, tiers and real-life rewards.
   - Every star a child earns counts towards their level.
   - Each level needs a few more stars than the last.
   - Every 5 levels is a new tier (Bronze, Silver, Gold ...).
     Reaching a tier earns a REAL reward from Mum or Dad. The child
     shows the grown-up, who marks it as given in the app.
   - Each subject also has its own knowledge level, from the stars
     earned in that subject's games.
   ========================================================= */

/* Stars needed to reach a level (level 1 needs 0). */
export const starsForLevel = n => 5 * (n - 1) * n / 2 + 10 * (n - 1);

export function levelOf(stars) {
  let n = 1;
  while (starsForLevel(n + 1) <= stars) n++;
  return n;
}

/* How far through the current level, 0 to 1, and stars still needed. */
export function levelProgress(stars) {
  const n = levelOf(stars);
  const lo = starsForLevel(n), hi = starsForLevel(n + 1);
  return { level: n, frac: (stars - lo) / (hi - lo), toNext: hi - stars };
}

export const LEVELS_PER_TIER = 5;
export const TIERS = [
  { name: 'Bronze', icon: '🥉', colour: '#cd7f32' },
  { name: 'Silver', icon: '🥈', colour: '#9ca3af' },
  { name: 'Gold', icon: '🥇', colour: '#f59e0b' },
  { name: 'Diamond', icon: '💎', colour: '#38bdf8' },
  { name: 'Crown', icon: '👑', colour: '#a855f7' },
  { name: 'Legend', icon: '🌟', colour: '#ef4444' },
];
/* Tier number for a level: 0 = no tier yet, 1 = Bronze (level 5), 2 = Silver (level 10) ... */
export const tierOf = level => Math.floor(level / LEVELS_PER_TIER);
/* Tiers past Legend repeat as Legend 2, Legend 3 ... */
export function tierInfo(t) {
  if (t <= 0) return { name: 'Starter', icon: '🌱', colour: '#16a34a' };
  const base = TIERS[Math.min(t, TIERS.length) - 1];
  const extra = t - TIERS.length;
  return extra > 0 ? { ...base, name: `${base.name} ${extra + 1}` } : base;
}

/* What a child is called at each level band. */
const TITLES = ['Little Learner', 'Curious Cub', 'Bright Spark', 'Brave Explorer', 'Clever Thinker',
  'Super Scholar', 'Wise Owl', 'Knowledge Knight', 'World Expert', 'Grand Master'];
export const titleFor = level => TITLES[Math.min(TITLES.length - 1, Math.floor((level - 1) / 3))];

/* Knowledge level in one subject, from the stars earned in it. */
const SUBJECT_STEPS = [
  { at: 0, name: 'Beginner', icon: '🌱' },
  { at: 15, name: 'Learner', icon: '📗' },
  { at: 40, name: 'Explorer', icon: '🧭' },
  { at: 80, name: 'Expert', icon: '🏅' },
  { at: 150, name: 'Master', icon: '🏆' },
];
export function subjectLevel(stars) {
  let i = 0;
  while (i + 1 < SUBJECT_STEPS.length && stars >= SUBJECT_STEPS[i + 1].at) i++;
  const next = SUBJECT_STEPS[i + 1];
  return {
    ...SUBJECT_STEPS[i], step: i + 1, of: SUBJECT_STEPS.length,
    frac: next ? (stars - SUBJECT_STEPS[i].at) / (next.at - SUBJECT_STEPS[i].at) : 1,
    toNext: next ? next.at - stars : 0,
  };
}

/* Stars a child has earned in a list of games. */
export const starsIn = (child, games) => games.reduce((n, g) => n + (child.played[g.id]?.total || 0), 0);

/* Default real-life reward ideas. Grown-ups change these in the Parent area. */
export const DEFAULT_REWARDS = [
  'A special treat of your choice',
  'A trip to the park or the beach',
  'Pick what we have for dinner',
  'A new book or toy',
  'A day out together',
  'A big surprise!',
];
export const rewardFor = (state, t) => (state.rewards?.[t - 1] || DEFAULT_REWARDS[Math.min(t, DEFAULT_REWARDS.length) - 1]);

/* Call after stars are added. Returns { levelUp, newTier } and records any
   real-life reward the child has just earned. */
export function checkLevels(child, before) {
  const was = levelOf(before), now = levelOf(child.stars);
  child.rewardsEarned ??= [];
  child.tierSeen ??= tierOf(was);
  let newTier = 0;
  for (let t = child.tierSeen + 1; t <= tierOf(now); t++) {
    child.rewardsEarned.push({ tier: t, date: new Date().toLocaleDateString('en-CA'), given: false });
    newTier = t;
  }
  child.tierSeen = Math.max(child.tierSeen, tierOf(now));
  return { levelUp: now > was ? now : 0, newTier };
}

export const pendingRewards = child => (child.rewardsEarned || []).filter(r => !r.given);
