/* =========================================================
   The list of games. To add a new game:
   1. Create js/games/my-game.js exporting { id, title, emoji, bands, start(ctx) }
   2. Import it here and add it to GAMES.
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

// Shown on the My games screen in this order.
export const GAMES = [quran, wudu, duas, manners, stories, pillars, letters, maths];
