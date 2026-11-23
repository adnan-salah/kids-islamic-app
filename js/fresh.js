/* =========================================================
   fresh.js: stops the same questions coming up again and again.
   Each child remembers which questions they saw recently in each game
   (child.seen[gameKey], short codes only). freshPick() chooses ones
   they have not seen first, and only repeats once the bank runs out,
   oldest first. Because it is per child, brothers and sisters get
   different questions too.
   ========================================================= */
import { shuffle } from './core.js';

/* A short code for a question, so storage stays small. */
const code = s => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};
const defaultId = x => (typeof x === 'string' ? x : x.q ?? x.prompt ?? x.id ?? JSON.stringify(x));

/** Pick n items from list for this child, unseen ones first. */
export function freshPick(child, key, list, n, idOf = defaultId) {
  if (!child || !list.length) return shuffle(list).slice(0, n);
  child.seen ??= {};
  const seen = (child.seen[key] ??= []);
  const pos = new Map(seen.map((c, i) => [c, i]));
  const withCode = list.map(x => [x, code(String(idOf(x)))]);
  const unseen = shuffle(withCode.filter(([, c]) => !pos.has(c)));
  const old = withCode.filter(([, c]) => pos.has(c)).sort((a, b) => pos.get(a[1]) - pos.get(b[1]));
  const out = [...unseen, ...old].slice(0, n);
  // Remember them: newest at the end, and keep enough that the next game is fresh.
  const used = new Set(out.map(([, c]) => c));
  const keep = seen.filter(c => !used.has(c));
  keep.push(...used);
  const max = Math.max(0, list.length - n);
  child.seen[key] = max ? keep.slice(-max) : [];
  return shuffle(out.map(([x]) => x));
}
