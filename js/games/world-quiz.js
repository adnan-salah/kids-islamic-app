/* =========================================================
   Game: World Quiz
   Teaches: continents, oceans, capitals and big facts about the world.
   Continent questions show a little globe turned to the country.
   Bands:
     little   - easy world questions, 2 choices.
     explorer - continents (with the globe), capitals of famous
                countries, and world facts. 10 questions.
     champion - harder capitals and continents, latitude, hemispheres,
                seasons. 12 questions.
   ========================================================= */
import { shuffle, pick } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';
import { createGlobe, byId, theName } from '../globe.js';
import { FACTS, WORLD_QS, NO_CAPITAL_Q, NO_CONTINENT_Q } from '../../data/geo-facts.js';
import { CONTINENTS } from '../../data/world.js';

const LEVEL = { little: 1, explorer: 2, champion: 3 };

function worldQ(q, n) {
  return { prompt: q.q, pic: q.pic, options: [q.a, ...shuffle(q.w).slice(0, n - 1)], answer: q.a, explain: q.why };
}

function continentQ(id, n) {
  const c = byId(id).c;
  const right = CONTINENTS[c.cont];
  const wrong = shuffle(Object.values(CONTINENTS).filter(x => x !== right)).slice(0, n - 1);
  const globe = createGlobe({ size: 240, controls: false });
  globe.mark(id, 'target');
  globe.spinTo(id, 1.5);
  return {
    prompt: `${c.name.replace(/^United/, 'The United')} is the red country. Which continent is it in?`,
    picNode: globe.el,
    options: [right, ...wrong],
    answer: right,
    explain: FACTS[id]?.fact,
  };
}

function capitalQ(id, n, ids) {
  const c = byId(id).c;
  const wrong = shuffle(ids.filter(x => x !== id && !NO_CAPITAL_Q.includes(x)).map(x => byId(x).c.capital).filter(Boolean)).slice(0, n - 1);
  return {
    prompt: `What is the capital city of ${theName(c)}?`,
    pic: c.flag,
    options: [c.capital, ...wrong],
    answer: c.capital,
    explain: `${c.capital} is the capital of ${theName(c)}.`,
  };
}

export default {
  id: 'worldquiz',
  title: 'World Quiz',
  emoji: '🧭',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    const max = LEVEL[band];
    let questions;
    if (band === 'little') {
      questions = shuffle(WORLD_QS.filter(q => q.level === 1)).slice(0, 5).map(q => worldQ(q, 2));
    } else {
      const n = band === 'champion' ? 4 : 3;
      const ids = Object.keys(FACTS).filter(id => FACTS[id].level <= max && byId(id));
      const contIds = shuffle(ids.filter(id => !NO_CONTINENT_Q.includes(id) && (band === 'champion' || FACTS[id].level <= 2)));
      const capIds = shuffle(ids.filter(id => !NO_CAPITAL_Q.includes(id) && byId(id).c.capital
        && (band === 'champion' ? FACTS[id].level >= 2 : FACTS[id].level === 1 || Math.random() < 0.3)));
      const facts = shuffle(WORLD_QS.filter(q => q.level <= max && (band !== 'champion' || q.level >= 2)));
      const count = band === 'champion' ? 12 : 10;
      const mix = [];
      for (let i = 0; mix.length < count; i++) {
        const kind = i % 3;
        if (kind === 0 && contIds.length) mix.push(continentQ(contIds.pop(), n));
        else if (kind === 1 && capIds.length) mix.push(capitalQ(capIds.pop(), n, ids));
        else if (facts.length) mix.push(worldQ(facts.pop(), Math.min(n, 3)));
        if (i > 60) break;
      }
      questions = mix;
    }
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You know so much about the world!'));
  },
};
