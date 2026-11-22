/* =========================================================
   Game: Globe Explorer
   A real spinning globe. Drag to spin, pinch to zoom, tap a country.
   Modes:
     Explore  - tap any country to hear its name, flag, capital and a
                fun fact. Every new country is saved to "My world".
     Find it  - "Find Brazil!" Spin the globe and tap the right country.
                Little Stars: the country is shown in red to help.
                Explorers:   well known countries; a hint after 2 misses.
                Champions:   harder countries, and "find the country
                             whose capital is Nairobi".
   ========================================================= */
import { el, speak, speakThen, sfx, toast, shuffle, pick, praiseFor } from '../core.js';
import { createGlobe, byId } from '../globe.js';
import { confetti, kasemSays } from '../fun.js';
import { FACTS, NO_CAPITAL_Q } from '../../data/geo-facts.js';
import { CONTINENTS } from '../../data/world.js';

const ROUNDS = { little: 5, explorer: 6, champion: 8 };
const MAX_LEVEL = { little: 1, explorer: 2, champion: 3 };

/* What we say about a country when it is tapped. */
export function aboutCountry(c, band) {
  const lines = [c.name];
  const f = FACTS[c.id];
  if (band !== 'little' && c.capital) lines.push(`The capital city is ${c.capital}.`);
  if (f) lines.push(f.fact);
  else if (band !== 'little' && CONTINENTS[c.cont]) lines.push(`It is in ${CONTINENTS[c.cont]}.`);
  return lines;
}

export default {
  id: 'globe',
  title: 'Globe Explorer',
  emoji: '🌍',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band, child } = ctx;
    child.found ??= [];
    menu();

    function menu() {
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('Spin the globe! Explore, or find a country.') }, '🔊'),
          el('p', {}, 'Spin the globe! Explore, or find a country.')),
        el('div', { class: 'tile-grid' },
          el('button', { class: 'tile', onclick: () => { sfx.tap(); explore(); } },
            el('span', { class: 'emoji' }, '🔍'), el('span', { class: 'label' }, 'Explore')),
          el('button', { class: 'tile', onclick: () => { sfx.tap(); findIt(); } },
            el('span', { class: 'emoji' }, '🎯'), el('span', { class: 'label' }, 'Find it!'))),
        kasemSays('globe', `🌍 You have found ${child.found.length} countries so far. Can you find them all?`),
      );
      speak('Spin the globe! Explore, or find a country.');
    }

    /* ---------- Explore ---------- */
    function explore() {
      let newOnes = 0;
      const info = el('div', { class: 'globe-info' }, el('p', {}, 'Tap a country to learn about it.'));
      const count = el('span', { class: 'pop-count' });
      const showCount = () => { count.textContent = `🌍 ${child.found.length}`; };
      showCount();
      const globe = createGlobe({ size: 620, onTap });
      globe.autoSpin(true);
      for (const id of child.found) globe.mark(id, 'found');
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('Spin the globe and tap a country.') }, '🔊'),
          el('p', {}, 'Spin the globe and tap a country.'), count),
        el('div', { class: 'globe-layout' }, globe.el, info),
        el('div', { class: 'row center' },
          el('button', { class: 'big-btn', onclick: () => {
            const stars = newOnes >= 5 ? 3 : newOnes >= 2 ? 2 : 1;
            ctx.finish(stars, newOnes ? `You found ${newOnes} new ${newOnes === 1 ? 'country' : 'countries'}!` : 'Great exploring!');
          } }, '✅ I’m done')));
      speak('Spin the globe and tap a country.');

      function onTap(c) {
        if (!c) { speak('That is the sea.'); globe.label(null); return; }
        sfx.pop();
        globe.label(c.id);
        const isNew = !child.found.includes(c.id);
        if (isNew) { child.found.push(c.id); newOnes++; showCount(); globe.mark(c.id, 'found'); }
        const f = FACTS[c.id];
        info.replaceChildren(...[
          el('div', { class: 'flag-big' }, c.flag),
          el('h2', {}, c.name),
          isNew ? el('p', { class: 'new-badge' }, '✨ New country!') : null,
          band !== 'little' && c.capital ? el('p', {}, `🏙️ Capital: ${c.capital}`) : null,
          CONTINENTS[c.cont] ? el('p', {}, `🧭 Continent: ${CONTINENTS[c.cont]}`) : null,
          f ? el('p', { class: 'fact' }, `${f.pic} ${f.fact}`) : null].filter(Boolean));
        speak(aboutCountry(c, band));
      }
    }

    /* ---------- Find it ---------- */
    function findIt() {
      const max = MAX_LEVEL[band];
      const pool = Object.entries(FACTS).filter(([, f]) => f.level <= max).map(([id]) => id).filter(byId);
      // Champions get mostly the harder ones.
      const targets = band === 'champion'
        ? [...shuffle(pool.filter(id => FACTS[id].level >= 2)).slice(0, ROUNDS.champion - 2), ...shuffle(pool.filter(id => FACTS[id].level === 1)).slice(0, 2)]
        : shuffle(pool).slice(0, ROUNDS[band]);
      const rounds = shuffle(targets);
      let round = 0, mistakes = 0, misses = 0;
      const prompt = el('p', {});
      const dots = el('div', { class: 'dots' });
      const globe = createGlobe({ size: 620, onTap });
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(prompt.textContent) }, '🔊'),
          prompt),
        globe.el, dots);
      next();

      function next() {
        misses = 0;
        globe.clearMarks(); globe.label(null);
        const c = byId(rounds[round]).c;
        const capitalQ = band === 'champion' && c.capital && !NO_CAPITAL_Q.includes(c.id) && Math.random() < 0.35;
        prompt.textContent = capitalQ ? `Find the country whose capital is ${c.capital}!` : `Find ${c.name}!`;
        dots.replaceChildren(...rounds.map((_, i) => el('span', { class: i < round ? 'dot done' : i === round ? 'dot now' : 'dot' })));
        if (band === 'little') { globe.mark(c.id, 'target'); globe.zoom(1); }
        speak(prompt.textContent);
      }

      function onTap(tapped) {
        const want = rounds[round];
        if (!tapped) return;
        if (tapped.id === want) {
          sfx.right();
          globe.mark(want, 'right'); globe.label(want);
          confetti({ count: 60 });
          const c = tapped, f = FACTS[c.id];
          const praise = praiseFor(c.name);
          toast(`${praise} ${c.flag}`);
          round++;
          globe.spinTo(want);
          speakThen([`${praise} That is ${c.name}.`, f?.fact], 1500).then(() => {
            if (!root.isConnected) return;
            if (round < rounds.length) next();
            else ctx.finish(mistakes <= rounds.length / 2 ? 3 : 2, 'You are a globe expert!');
          });
        } else {
          mistakes++; misses++;
          sfx.tryAgain();
          globe.label(tapped.id);
          if (misses >= 2 && band !== 'champion' || misses >= 3) {
            // Help: turn the globe to show where it is.
            globe.mark(want, 'target');
            globe.spinTo(want, Math.max(globe.zoomLevel, 1.3));
            speak([`That is ${tapped.name}.`, 'Look for the red country!']);
          } else speak([`That is ${tapped.name}.`, 'Try again!']);
        }
      }
    }
  },
};
