/* =========================================================
   Game: Globe Explorer
   A real spinning globe. Drag to spin, pinch to zoom, tap a country.
   Modes:
     Explore  - tap any country to hear its name, flag, capital and a
                fun fact. Every new country is saved to "My world".
     Find a country - "Find Brazil!" Spin the globe and tap the right country.
                Little Stars: the country is shown in red to help.
                Explorers:   well known countries.
                Champions:   harder countries, and "find the country
                             whose capital is Nairobi".
                After a wrong guess: a clue (the continent, then which
                way to go from the country they tapped). After 2 misses
                (3 for Champions) the country is shown in red.
     Find a place   - continents, regions (the Middle East, Scandinavia…),
                oceans and seas, with a clue after each wrong guess.
   Each child gets places they have not found lately first (fresh.js).
   ========================================================= */
import { el, speak, speakThen, sfx, toast, shuffle, pick, praiseFor } from '../core.js';
import { createGlobe, byId, theName, centreOf } from '../globe.js';
import { freshPick } from '../fresh.js';
import { PLACES, landOf, waterAt, OCEAN_OF, centreOfWater } from '../../data/places.js';
import { confetti, kasemSays } from '../fun.js';
import { FACTS, NO_CAPITAL_Q } from '../../data/geo-facts.js';
import { CONTINENTS, COUNTRIES } from '../../data/world.js';

const ROUNDS = { little: 5, explorer: 6, champion: 8 };
const MAX_LEVEL = { little: 1, explorer: 2, champion: 3 };

/* What we say about a country when it is tapped. */
export function aboutCountry(c) {
  const f = FACTS[c.id];
  // One line per country, so it can be a single recorded clip.
  if (f) return `${c.name}. The capital city is ${c.capital.replace(/\.$/, '')}. ${f.fact}`;
  return [`${c.name}.`, c.capital ? `The capital city is ${c.capital}.` : null, CONTINENTS[c.cont] ? `It is in ${CONTINENTS[c.cont]}.` : null];
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
            el('span', { class: 'emoji' }, '🎯'), el('span', { class: 'label' }, 'Find a country')),
          el('button', { class: 'tile', onclick: () => { sfx.tap(); findPlace(); } },
            el('span', { class: 'emoji' }, '🌊'), el('span', { class: 'label' }, band === 'little' ? 'Find a continent' : 'Find a place'))),
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
        speak(aboutCountry(c));
      }
    }

    /* ---------- Find it ---------- */
    function findIt() {
      const max = MAX_LEVEL[band];
      const pool = Object.entries(FACTS).filter(([, f]) => f.level <= max).map(([id]) => id).filter(byId);
      // Champions get mostly the harder ones.
      const targets = band === 'champion'
        ? [...freshPick(child, 'globe-hard', pool.filter(id => FACTS[id].level >= 2), ROUNDS.champion - 2), ...freshPick(child, 'globe-easy', pool.filter(id => FACTS[id].level === 1), 2)]
        : freshPick(child, `globe-${band}`, pool, ROUNDS[band]);
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
        prompt.textContent = capitalQ ? `Find the country whose capital is ${c.capital}!` : `Find ${theName(c)}!`;
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
          speakThen([praise, `That is ${theName(c)}.`], 1500).then(() => {
            if (!root.isConnected) return;
            if (round < rounds.length) next();
            else ctx.finish(mistakes <= rounds.length / 2 ? 3 : 2, 'You are a globe expert!');
          });
        } else {
          mistakes++; misses++;
          sfx.tryAgain();
          globe.label(tapped.id);
          const c = byId(want).c;
          if (misses >= 2 && band !== 'champion' || misses >= 3) {
            // Help: turn the globe to show where it is.
            globe.mark(want, 'target');
            globe.spinTo(want, Math.max(globe.zoomLevel, 1.3));
            speak([`That is ${theName(tapped)}.`, 'Look for the red country!']);
          } else {
            // Clue: first the continent, then which way to go.
            const inCont = misses === 1 && tapped.cont !== c.cont;
            const dir = direction(tapped.id, want);
            toast(inCont ? `Clue: it is in ${CONTINENTS[c.cont]}.` : `Clue: go ${dir} from ${theName(tapped)}.`, 3000);
            speak([`That is ${theName(tapped)}.`, inCont ? `It is in ${CONTINENTS[c.cont]}.` : `Go ${dir}.`]);
          }
        }
      }
    }

    /* ---------- Find a place: continents, regions, oceans, seas ---------- */
    function findPlace() {
      const max = MAX_LEVEL[band];
      const pool = PLACES.filter(p => p.level <= max && p.clue && (band !== 'little' || p.kind === 'continent'));
      const n = { little: 4, explorer: 6, champion: 8 }[band];
      const rounds = band === 'champion'
        ? [...freshPick(child, 'places-hard', pool.filter(p => p.level >= 2), n - 2, p => p.id), ...freshPick(child, 'places-easy', pool.filter(p => p.level === 1), 2, p => p.id)]
        : freshPick(child, `places-${band}`, pool, n, p => p.id);
      let round = 0, mistakes = 0, misses = 0;
      const prompt = el('p', {});
      const dots = el('div', { class: 'dots' });
      const globe = createGlobe({ size: 620, onTap });
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(prompt.dataset.say) }, '🔊'),
          prompt),
        globe.el, dots);
      next();

      function land(p) { return landOf(p, COUNTRIES); }
      function show(p) {
        if (p.boxes) { const ll = centreOfWater(p); globe.spot(ll); globe.spinTo(ll, 1); }
        else { for (const id of land(p)) globe.mark(id, 'target'); globe.spinTo(land(p)[0], 1); }
      }

      function next() {
        misses = 0;
        globe.clearMarks(); globe.label(null); globe.spot(null);
        const p = rounds[round];
        const line = `Find ${p.name}! ${p.boxes ? 'Tap the water.' : 'Tap any country in it.'}`;
        prompt.textContent = `${p.emoji} ${line}`;
        prompt.dataset.say = line;
        dots.replaceChildren(...rounds.map((_, i) => el('span', { class: i < round ? 'dot done' : i === round ? 'dot now' : 'dot' })));
        if (band === 'little') show(p);
        speak(line);
      }

      function onTap(tapped, ll) {
        const p = rounds[round];
        if (!ll) return;
        const water = tapped ? null : waterAt(ll);
        const ok = p.boxes
          ? !!water && (water.id === p.id || OCEAN_OF[water.id] === p.id)
          : !!tapped && land(p).includes(tapped.id);
        if (ok) {
          sfx.right({ q: `Find ${p.name}` });
          if (tapped) { globe.label(tapped.id); for (const id of land(p)) globe.mark(id, 'right'); }
          else globe.spot(ll);
          confetti({ count: 60 });
          const praise = praiseFor(p.name);
          toast(`${praise} ${p.emoji}`);
          round++;
          speakThen([praise, `That is ${p.name}.`], 1500).then(() => {
            if (!root.isConnected) return;
            if (round < rounds.length) next();
            else ctx.finish(mistakes <= rounds.length / 2 ? 3 : 2, 'You know your way around the world!');
          });
          return;
        }
        mistakes++; misses++;
        sfx.tryAgain({ q: `Find ${p.name}`, answer: p.name.replace(/^the /, '') });
        let said;
        if (tapped) { globe.label(tapped.id); said = `That is ${theName(tapped)}.`; }
        else { globe.label(null); said = water ? `That is ${water.name}.` : 'That is the sea.'; }
        if (misses >= 2 && band !== 'champion' || misses >= 3) {
          show(p);
          speak([said, p.boxes ? 'Tap near the red circle!' : 'Look for the red countries!']);
        } else {
          toast(`Clue: ${p.clue}`, 3500);
          speak([said, p.clue]);
        }
      }
    }

    /* Which way to go from one country to another: "north-east". */
    function direction(fromId, toId) {
      const [x1, y1] = centreOf(fromId), [x2, y2] = centreOf(toId);
      let dx = x2 - x1; if (dx > 180) dx -= 360; if (dx < -180) dx += 360;
      const dy = y2 - y1;
      const ns = Math.abs(dy) > 8 ? (dy > 0 ? 'north' : 'south') : '';
      const ew = Math.abs(dx) > 8 ? (dx > 0 ? 'east' : 'west') : '';
      return ns && ew ? `${ns}-${ew}` : ns || ew || 'a little further';
    }
  },
};
