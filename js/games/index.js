/* =========================================================
   The list of games. To add a new game:
   1. Create js/games/my-game.js exporting { id, title, emoji, bands, start(ctx) }
   2. Import it here and add it to a subject in SUBJECTS.
   start(ctx) gets:
     ctx.root    - the element to draw the game into
     ctx.band    - 'little' | 'explorer' | 'champion'
     ctx.child   - the child playing
     ctx.finish(stars, message) - call once when the game is done
   ========================================================= */
import quran from './quran.js';
import wudu from './wudu.js';
import duas from './duas.js';
import manners from './manners.js';
import stories from './stories.js';
import pillars from './pillars.js';
import letters from './letters.js';
import maths from './maths.js';
import sports from './sports.js';
import jigsaw from './jigsaw.js';
import words from './words.js';
import sounds from './sounds.js';
import world from './world.js';
import clock from './clock.js';
import memory from './memory.js';
import house from './house.js';

// The My games screen shows one section per subject, in this order.
export const SUBJECTS = [
  { id: 'english', name: 'English', emoji: '📚', games: [sounds, words] },
  { id: 'maths', name: 'Maths', emoji: '🔢', games: [maths, sports, clock] },
  { id: 'world', name: 'Science & the world', emoji: '🌏', games: [world] },
  { id: 'life', name: 'Life skills', emoji: '🏡', games: [house, manners] },
  { id: 'islam', name: 'Islam', emoji: '🕌', games: [quran, wudu, duas, pillars, stories, letters] },
  { id: 'fun', name: 'Puzzles', emoji: '🧩', games: [jigsaw, memory] },
];

export const GAMES = SUBJECTS.flatMap(s => s.games);
