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
import { EASY, HARD as HARD_WORDS, SENTENCES, READING } from '../js/games/words.js';
import { ROOMS } from '../js/games/house.js';
import { ABC, RHYMES } from '../js/games/sounds.js';
import { LEVEL1, LEVEL2, LEVEL3 } from '../js/games/world.js';
import { LETTERS as ABC_CAPS, SHAPE_LIST } from '../js/games/drawing.js';

export function allLines() {
  const L = [];
  const add = (...xs) => xs.flat().forEach(x => x && L.push(x));

  // App screens and the "Well done" screen
  add('Assalamu alaikum! Let’s learn together. MashaAllah, great job!',
      'Assalamu alaikum! Pick a game.', 'Here is your sticker book!',
      'MashaAllah!', 'Alhamdulillah!', 'Well done!',
      'You got 3 stars.', 'You got 2 stars.', 'You unlocked a new sticker!');
  add(PRAISE);
  // Art games: Colour In and Draw & Paint
  add('Pick a picture to colour!', 'How do you want to colour?', 'Colour by number! Match each number to its colour.',
      'Tap a colour, then tap the picture.', 'Look at the number, then pick that colour.',
      'What a beautiful picture!', 'You coloured it all in!',
      'What do you want to do?', 'Draw anything you like!', 'What a lovely drawing!', 'Super tracing!',
      SHAPE_LIST.map(s => `Trace the ${s}.`), '0123456789'.split('').map(n => `Trace the number ${n}.`),
      ABC_CAPS.map(l => `Trace the big letter ${l}.`), ABC_CAPS.map(l => `Trace the small letter ${l.toLowerCase()}.`));
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
  ['apples', 'ducks', 'stars', 'cars', 'balls', 'camels'].forEach(t => add(`How many ${t}?`));
  [1, 2, 3, 4, 5].forEach(n => add(`Yes, ${n}!`));

  // Finishing messages for the newer games
  add('You won the race!', 'You finished the race!', 'You finished the puzzle!', 'You are a Word Star!',
      'The kittens love their new house!', 'You know your sounds and rhymes!', 'You are a World Explorer!',
      'You can tell the time and count money!', 'You have a super memory!');
  [0, 1, 2, 3, 4, 5].forEach(n => add(`You scored ${n} out of 5!`));

  // Sports Maths (questions are random, so only the fixed lines)
  add('Pick a game: race or penalties.', 'Ready, set, go!', 'Goal!', 'Saved by the keeper!');

  // Jigsaw
  add('Pick a picture!', 'Put the pieces in the right places.');

  // Word Star
  add('Spell the word!', 'Put the words in the right order.', 'Read the story, then tap Ready.');
  add(EASY.map(w => w[0]), HARD_WORDS.map(w => w[0]), HARD_WORDS.map(w => `Spell the word that means: ${w[1]}`));
  add(SENTENCES);
  READING.forEach(r => add(r.text, r.questions.map(q => q.q)));

  // My Little House
  add('Tap a room to help the kittens move in!', 'Tap another room!');
  ROOMS.forEach(r => r.qs.forEach(q => add(q.q, q.why)));

  // Sounds & Rhymes
  ABC.forEach(x => {
    const L1 = x.letter.toUpperCase();
    add(`Which one starts with ${L1}?`, `${L1} is for ${x.word}!`,
        `What letter does ${x.word} start with?`, `${x.word} starts with ${L1}.`);
  });
  RHYMES.forEach(([a, b]) => add(`Which word rhymes with ${a[0]}?`, `Which word rhymes with ${b[0]}?`,
    `${a[0]} and ${b[0]} rhyme!`, `${b[0]} and ${a[0]} rhyme!`));

  // World Explorer
  [...LEVEL1, ...LEVEL2, ...LEVEL3].forEach(q => add(q.q, q.why));

  // Time & Money and Memory Match
  add('What time does the clock show?', 'How much money is this?', 'Find the matching pairs!');

  return [...new Set(L)];
}
