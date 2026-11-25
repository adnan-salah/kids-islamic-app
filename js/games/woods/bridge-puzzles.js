/* Bridge for Bunny: the puzzles and the rule. No screen code here, so it can be checked by tools/woods-test.mjs.
   The stream is `gap` steps wide. Supports are the two banks (0 and gap) and any rocks between them.
   A bridge works when every space between two supports holds one plank of exactly that length. */
const shuffled = (list, rnd) => list.map(v => [rnd(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const plank = (len, strong = false) => ({ kind: 'plank', len, strong });

/** The spaces to bridge: [[from, to], ...] for these rock positions. */
export const spansOf = (gap, rocks) => {
  const s = [0, ...[...rocks].sort((a, b) => a - b), gap];
  return s.slice(1).map((to, i) => [s[i], to]);
};

/** band 'T' | 'A' | 'B' | 'C', round 0..2. `answer` is one build that works. */
export function makePuzzle(band, round, rnd = Math.random) {
  let p;
  if (band === 'T') {
    // Round 1: the log. Round 2: log or leaf. Round 3: long log or short log.
    const log = plank(3);
    p = { gap: 3, rocks: [], pieces: [log, ...[[], [{ kind: 'leaf', len: 1 }], [plank(1)]][round]], answer: { rocks: [], planks: [log] } };
  } else if (band === 'A') {
    const gap = 2 + round, right = plank(gap);
    p = { gap, rocks: [], pieces: [plank(gap - 1), right, plank(gap + 1)], answer: { rocks: [], planks: [right] } };
  } else if (band === 'B') {
    // No plank reaches across. Rocks split the stream into two spaces, then three.
    const gap = 5 + round, n = round < 2 ? 2 : 3;
    let parts;
    do { parts = Array.from({ length: n }, () => 1 + Math.floor(rnd() * 4)); } while (parts.reduce((a, b) => a + b) !== gap);
    const rocks = parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).reduce((a, b) => a + b));
    const good = parts.map(len => plank(len));
    // Decoys: lengths no space needs, so they can never be part of a working bridge.
    const decoys = [1, 2, 3, 4].filter(l => !parts.includes(l)).slice(0, 2).map(len => plank(len));
    p = { gap, rocks, pieces: [...good, ...decoys], answer: { rocks, planks: good } };
  } else {
    // The child places the rocks. Bear is heavy: an ordinary plank of 4 or more bends.
    const gap = 6 + round, long = gap <= 7 ? 4 : 5;
    const strong = plank(long, true), ords = [plank(2), plank(3), plank(3)];
    const short = ords.find(o => o.len === gap - long);
    p = { gap, rocks: [], rockCount: 2, heavy: true, pieces: [...ords, plank(long), strong], answer: { rocks: [gap - long], planks: [short, strong] } };
  }
  p.pieces = shuffled(p.pieces, rnd);
  p.pieces.forEach((piece, i) => { piece.id = i; });
  return p;
}

/** Try a build. placed[i] is the piece on space i (or null). Returns { ok } or { ok: false, problem, at }. */
export function check(p, rocks, placed) {
  const spans = spansOf(p.gap, rocks);
  for (let i = 0; i < spans.length; i++) {
    const need = spans[i][1] - spans[i][0], piece = placed[i];
    const problem = !piece ? 'gap' : piece.kind === 'leaf' ? 'leaf' : piece.len < need ? 'short' : piece.len > need ? 'long'
      : p.heavy && !piece.strong && piece.len >= 4 ? 'bend' : null;
    if (problem) return { ok: false, problem, at: i };
  }
  return { ok: true };
}
