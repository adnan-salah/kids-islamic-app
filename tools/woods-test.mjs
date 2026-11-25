// Checks for the Smartspace age versions. Run: node tools/woods-test.mjs
import assert from 'node:assert';
import { ageFrom, woodsBand } from '../js/games/woods/bands.js';
const now = new Date(2026, 10, 25); // 25 Nov 2026
assert.equal(woodsBand({ birth: '2022-11' }, now), 'T');          // born 4 years ago
assert.equal(woodsBand({ birth: '2021-10' }, now), 'A');          // one month past 5th birthday
assert.equal(woodsBand({ birth: '2021-12' }, now), 'T');          // 5th birthday next month
assert.equal(woodsBand({ birth: '2019-06' }, now), 'B');          // 7
assert.equal(woodsBand({ birth: '2017-01' }, now), 'C');          // 9
assert.equal(woodsBand({ birth: '2019-06', woodsBand: 'A' }, now), 'A'); // parent override wins
assert.equal(woodsBand({ band: 'little' }, now), 'T');            // no birth date: guess from age group
assert.equal(ageFrom('2030-01', now), null);                      // future date ignored
assert.equal(ageFrom('rubbish', now), null);
assert.equal(woodsBand({ birth: '2021-11' }, now), 'A');          // the month of the 5th birthday
assert.equal(woodsBand({ band: 'explorer' }, now), 'B');
assert.equal(woodsBand({ band: 'champion' }, now), 'C');
assert.equal(woodsBand({ band: 'champion', woodsBand: 'Z' }, now), 'C'); // rubbish override ignored
assert.equal(woodsBand({ birth: '', band: 'little' }, now), 'T');
assert.equal(woodsBand({ birth: '2010-01' }, now), 'C');          // older than 11 stays on the top version
console.log('woods bands ok');

// Bridge for Bunny: every puzzle must be solvable by its own answer, and the traps must fail.
import { makePuzzle, check, spansOf } from '../js/games/woods/bridge-puzzles.js';
for (const band of ['T', 'A', 'B', 'C']) for (let round = 0; round < 3; round++) for (let n = 0; n < 200; n++) {
  const p = makePuzzle(band, round);
  assert.ok(check(p, p.answer.rocks, p.answer.planks).ok, `${band}${round} answer works`);
  assert.equal(new Set(p.pieces.map(x => x.id)).size, p.pieces.length);
  assert.ok(p.answer.planks.every(x => p.pieces.includes(x)), 'answer uses pieces from the tray');
  if (band === 'B') assert.ok(p.pieces.every(x => x.len < p.gap) && p.rocks.every(r => r > 0 && r < p.gap), 'no plank reaches across');
  if (band === 'C') {
    assert.ok(p.answer.rocks.length + p.answer.planks.length <= 3, 'a three-piece build exists');
    const trap = p.pieces.find(x => !x.strong && x.len === p.answer.planks[1].len);
    assert.equal(check(p, p.answer.rocks, [p.answer.planks[0], trap]).problem, 'bend');
  }
}
const a = makePuzzle('A', 1);
assert.equal(check(a, [], [a.pieces.find(x => x.len === 2)]).problem, 'short');
assert.equal(check(a, [], [a.pieces.find(x => x.len === 4)]).problem, 'long');
assert.equal(check(a, [], [null]).problem, 'gap');
assert.deepEqual(spansOf(8, [5, 3]), [[0, 3], [3, 5], [5, 8]]);
console.log('bridge puzzles ok');
