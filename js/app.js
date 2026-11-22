/* =========================================================
   app.js: screens and navigation.
   Screens: Who's playing -> My games -> Game -> Well done
            plus a Parent area behind a hold-and-sum lock.
   ========================================================= */
import { BANDS, loadState, saveState, resetState, speak, sfx, el, pick, toast } from './core.js';
import { GAMES } from './games/index.js';

const app = document.getElementById('app');
let state = loadState();

const AVATARS = ['🌙', '⭐', '🌸', '🐣', '🦋', '🐢', '🦁', '🐪', '🌻', '🚀', '🐱', '🌈'];

/* ---------- Screen 1: Who's playing? ---------- */
function showWho() {
  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('h1', {}, 'Assalamu alaikum! Who’s playing?'),
      parentButton(),
    ),
    el('div', { class: 'tile-grid' }, state.children.map(child =>
      el('button', { class: 'tile', onclick: () => { sfx.tap(); showGames(child.id); } },
        el('span', { class: 'emoji' }, child.avatar),
        el('span', { class: 'label' }, child.name),
        el('span', { class: 'sub' }, `⭐ ${child.stars}`),
      ),
    )),
  );
}

/* ---------- Screen 2: My games ---------- */
function showGames(childId) {
  const child = findChild(childId);
  const games = GAMES.filter(g => g.bands.includes(child.band));
  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: showWho }, '🏠'),
      el('h1', {}, `${child.avatar} ${child.name}`),
      el('span', { class: 'star-count' }, `⭐ ${child.stars}`),
    ),
    el('div', { class: 'tile-grid' }, games.map(game =>
      el('button', { class: 'tile', onclick: () => { sfx.tap(); playGame(childId, game.id); } },
        el('span', { class: 'emoji' }, game.emoji),
        el('span', { class: 'label' }, game.title),
        el('span', { class: 'sub' }, starsFor(child, game.id)),
      ),
    )),
  );
  speak(`Hello ${child.name}! Pick a game.`);
}

function starsFor(child, gameId) {
  const best = child.played[gameId]?.best || 0;
  return best ? '⭐'.repeat(best) : 'New!';
}

/* ---------- Screen 3: a game ---------- */
function playGame(childId, gameId) {
  const child = findChild(childId);
  const game = GAMES.find(g => g.id === gameId);
  const root = el('div', { style: 'display:flex;flex-direction:column;gap:1.25rem;flex:1' });
  let finished = false;

  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: () => { finished = true; speechSynthesis?.cancel(); showGames(childId); } }, '🏠'),
      el('h1', {}, `${game.emoji} ${game.title}`),
    ),
    root,
  );

  game.start({
    root,
    child,
    band: child.band,
    finish(stars, message) {
      if (finished) return; // child left the game early
      finished = true;
      // Save progress: add the stars, remember the best score for this game.
      child.stars += stars;
      const rec = child.played[gameId] || { best: 0, times: 0 };
      rec.best = Math.max(rec.best, stars);
      rec.times += 1;
      child.played[gameId] = rec;
      saveState(state);
      showDone(childId, gameId, stars, message);
    },
  });
}

/* ---------- Screen 4: Well done! ---------- */
function showDone(childId, gameId, stars, message) {
  const child = findChild(childId);
  const praise = pick(['MashaAllah!', 'Alhamdulillah!', 'Well done!']);
  sfx.win();
  speak(`${praise} ${message} You got ${stars} stars.`);
  app.replaceChildren(
    el('div', { class: 'done' },
      el('h2', {}, praise),
      el('div', { class: 'stars' }, [1, 2, 3].map(n =>
        el('span', { class: n <= stars ? '' : 'dim', style: `animation-delay:${n * 0.25}s` }, '⭐'))),
      el('p', { style: 'font-size:1.8rem;margin:0' }, message),
      el('p', { class: 'note', style: 'font-size:1.4rem' }, `${child.name} has ${child.stars} stars altogether.`),
      el('div', { class: 'row' },
        el('button', { class: 'big-btn', onclick: () => playGame(childId, gameId) }, 'Play again'),
        el('button', { class: 'big-btn secondary', onclick: () => showGames(childId) }, 'More games'),
      ),
    ),
  );
}

/* ---------- Parent area ----------
   Locked: hold the ⚙️ button for 2 seconds, then answer a sum.
   A 3-year-old won't get through; a 9-year-old might, which is fine. */
function parentButton() {
  let timer;
  const btn = el('button', { class: 'icon-btn', 'aria-label': 'Parent area (hold)', style: 'touch-action:none' }, '⚙️');
  const start = e => { e.preventDefault(); timer = setTimeout(showGate, 2000); };
  const stop = () => clearTimeout(timer);
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', stop);
  btn.addEventListener('pointerleave', stop);
  btn.addEventListener('contextmenu', e => e.preventDefault());
  return btn;
}

function showGate() {
  const a = 6 + Math.floor(Math.random() * 7);
  const b = 5 + Math.floor(Math.random() * 8);
  const input = el('input', { type: 'number', inputmode: 'numeric', style: 'font-size:2rem;width:8rem;text-align:center;border-radius:16px;border:3px solid #cbd5e1;padding:.5rem' });
  const check = () => (Number(input.value) === a * b ? showParent() : showWho());
  app.replaceChildren(
    el('div', { class: 'math-gate' },
      el('p', { class: 'note' }, 'Grown-ups only'),
      el('div', { class: 'q' }, `${a} × ${b} = ?`),
      input,
      el('div', { class: 'row', style: 'display:flex;gap:1rem' },
        el('button', { class: 'big-btn', onclick: check }, 'Enter'),
        el('button', { class: 'big-btn secondary', onclick: showWho }, 'Cancel')),
    ),
  );
  input.focus();
}

function showParent() {
  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Done', onclick: () => { saveState(state); showWho(); } }, '✅'),
      el('h1', {}, 'Parent area'),
    ),
    el('p', { class: 'note' }, 'Change names, pictures and age groups. Changes save straight away. Progress is stored on this tablet only.'),
    el('div', { class: 'parent-list' }, state.children.map(child => {
      const avatarBtn = el('button', { class: 'avatar-btn', 'aria-label': 'Change picture' }, child.avatar);
      avatarBtn.addEventListener('click', () => {
        child.avatar = AVATARS[(AVATARS.indexOf(child.avatar) + 1) % AVATARS.length];
        avatarBtn.textContent = child.avatar;
        saveState(state);
      });
      const name = el('input', { value: child.name, maxlength: 20, 'aria-label': 'Name' });
      name.addEventListener('input', () => { child.name = name.value.trim() || 'Child'; saveState(state); });
      const band = el('select', { 'aria-label': 'Age group' },
        Object.entries(BANDS).map(([id, b]) => {
          const o = el('option', { value: id }, `${b.name} (${b.ages})`);
          if (id === child.band) o.selected = true;
          return o;
        }));
      band.addEventListener('change', () => { child.band = band.value; saveState(state); });
      return el('div', { class: 'parent-row' },
        avatarBtn, name, band, el('span', { class: 'note' }, `⭐ ${child.stars}`));
    })),
    el('div', {},
      el('button', { class: 'big-btn secondary', onclick: () => {
        if (confirmReset()) { resetState(); state = loadState(); showParent(); }
      } }, 'Reset all progress')),
  );
}

/* A two-tap reset, so nobody wipes the stars by accident.
   (Avoids a browser pop-up, which can freeze a kiosk-style tablet app.) */
let resetArmed = 0;
function confirmReset() {
  if (Date.now() - resetArmed < 4000) return true;
  resetArmed = Date.now();
  toast('Tap again to reset everything');
  return false;
}

function findChild(id) {
  return state.children.find(c => c.id === id);
}

showWho();
