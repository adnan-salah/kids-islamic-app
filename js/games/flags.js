/* =========================================================
   Game: Flag Quest
   Teaches: flags of the world.
   Bands:
     little   - find the same flag (matching), famous countries.
     explorer - which country has this flag? (3 choices)
     champion - harder flags, 4 choices, and "which is the flag of …?"
   ========================================================= */
import { el, shuffle, pick } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';
import { byId } from '../globe.js';
import { FACTS } from '../../data/geo-facts.js';

const flagOf = id => byId(id).c.flag;
const nameOf = id => byId(id).c.name;

function pool(max) {
  return Object.keys(FACTS).filter(id => FACTS[id].level <= max && byId(id));
}

export default {
  id: 'flags',
  title: 'Flag Quest',
  emoji: '🚩',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    let questions;
    if (band === 'little') {
      const ids = pool(1);
      questions = shuffle(ids).slice(0, 6).map(id => ({
        prompt: 'Find the same flag!',
        picNode: el('div', { class: 'flag-big' }, flagOf(id)),
        options: [flagOf(id), ...shuffle(ids.filter(x => x !== id)).slice(0, 2).map(flagOf)],
        answer: flagOf(id),
        optionClass: 'flag-option',
        explain: `That is the flag of ${nameOf(id)}.`,
      }));
    } else {
      const max = band === 'champion' ? 3 : 2;
      const ids = pool(max);
      const n = band === 'champion' ? 4 : 3;
      const chosen = band === 'champion'
        ? shuffle(ids.filter(id => FACTS[id].level >= 2)).slice(0, 10)
        : shuffle(ids).slice(0, 10);
      questions = chosen.map((id, i) => {
        const others = shuffle(ids.filter(x => x !== id)).slice(0, n - 1);
        const fact = FACTS[id]?.fact;
        if (band === 'champion' && i % 3 === 2) {
          return {
            prompt: `Which is the flag of ${nameOf(id)}?`,
            pic: FACTS[id]?.pic || '🚩',
            options: [flagOf(id), ...others.map(flagOf)],
            answer: flagOf(id),
            optionClass: 'flag-option',
            explain: fact,
          };
        }
        return {
          prompt: 'Which country has this flag?',
          picNode: el('div', { class: 'flag-big' }, flagOf(id)),
          options: [nameOf(id), ...others.map(nameOf)],
          answer: nameOf(id),
          explain: fact,
        };
      });
    }
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You know your flags!'));
  },
};
