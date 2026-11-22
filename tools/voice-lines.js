/* =========================================================
   Lists every fixed line the app speaks, so each can be recorded
   once as a natural-voice clip. Run in a browser (see tools/README).
   If you add a new spoken line to a game, add it here too.
   ========================================================= */
import { PRAISE } from '../js/core.js';
import { STEPS, QUIZ } from '../js/games/wudu.js';
import { PILLARS, HARD } from '../js/games/pillars.js';
import { LETTERS } from '../js/games/letters.js';
import { SCENES } from '../js/games/manners.js';
import { DUAS } from '../js/games/duas.js';
import { STORIES } from '../js/games/stories.js';

export function allLines() {
  const L = [];
  const add = (...xs) => xs.flat().forEach(x => x && L.push(x));

  // App screens and the "Well done" screen
  add('Assalamu alaikum! Let’s learn together. MashaAllah, great job!',
      'Assalamu alaikum! Pick a game.', 'Here is your sticker book!',
      'MashaAllah!', 'Alhamdulillah!', 'Well done!',
      'You got 3 stars.', 'You got 2 stars.', 'You unlocked a new sticker!');
  add(PRAISE);
  // Finishing messages from each game
  add('You know how to make wudu!', 'You built the house of Islam!', 'You know your Arabic letters!',
      'You have beautiful manners!', 'You learned 3 duas!', 'You are a maths star!',
      'You earned your surah badge!', 'You practised your surah!');
  STORIES.forEach(s => add(`You learned the story of ${s.title}!`));

  // Wudu
  add('Let’s make wudu! Tap the step that is glowing.', 'Put the wudu steps in the right order. What comes first?', 'What comes next?');
  add(STEPS.map(s => s.say), QUIZ.map(q => q.q));

  // Pillars
  const forVoice = t => t.replace(/ﷺ/g, ', peace be upon him,');
  add(PILLARS.map(p => (p.say || p.describe) + ' Which pillar is this?'));
  add(PILLARS.map(p => `You built the pillar of ${p.short}.`));
  add(Object.values(HARD).flat().map(q => forVoice(q.q)));
  add('MashaAllah! You built all five pillars of Islam!');

  // Letters
  add('Find the same shape!', 'What is this letter called?');
  add(LETTERS.map(l => `That is ${l.name}.`), LETTERS.map(l => `Find the letter ${l.name}.`));

  // Manners
  Object.values(SCENES).flat().forEach(s => add(s.q, s.why));

  // Duas
  add('Pick a time of day to learn its dua.', '3 more to go!', '2 more to go!', '1 more to go!');
  add(DUAS.map(d => `${d.when}, we say: ${d.dua}. It means: ${d.meaning}`));

  // Stories
  add('Pick a story to hear.');
  STORIES.forEach(s => add(s.pages.map(p => p[1]), s.questions.map(q => q.prompt)));

  // Quran
  add('Pick a surah to practise.', 'MashaAllah! Ask a grown-up to listen and give you your badge.');

  // Maths (little ones only: counting)
  ['camels', 'moons', 'stars', 'masjids', 'apples'].forEach(t => add(`How many ${t}?`));
  [1, 2, 3, 4, 5].forEach(n => add(`Yes, ${n}!`));

  return [...new Set(L)];
}
