// Checks for Willow Woods's age versions. Run: node tools/spark-test.mjs
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
console.log('woods bands ok');
