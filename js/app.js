/* =========================================================
   app.js: screens and navigation.
   Screens: Who's playing -> My games -> Game -> Well done
            plus a Parent area behind a hold-and-sum lock.
   ========================================================= */
import { BANDS, loadState, saveState, resetState, speak, stopSpeech, sfx, el, pick, toast, englishVoices, voiceSettings, setVoice, NATURAL } from './core.js';
import { GAMES } from './games/index.js';

const app = document.getElementById('app');
let state = loadState();

const AVATARS = ['🌙', '⭐', '🌸', '🐣', '🦋', '🐢', '🦁', '🐪', '🌻', '🚀', '🐱', '🌈'];

/* Sticker book: one new sticker for every 10 stars. */
const STICKERS = ['🕌', '🌙', '🌴', '🐪', '🏮', '🕋', '📖', '🌸', '🦋', '🌈', '🐎', '🌟'];
const STARS_PER_STICKER = 10;
const stickersFor = stars => Math.min(STICKERS.length, Math.floor(stars / STARS_PER_STICKER));

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
      el('button', { class: 'star-count', onclick: () => showStickers(childId) }, `⭐ ${child.stars}  📒`),
    ),
    el('div', { class: 'tile-grid' }, games.map(game =>
      el('button', { class: 'tile', onclick: () => { sfx.tap(); playGame(childId, game.id); } },
        el('span', { class: 'emoji' }, game.emoji),
        el('span', { class: 'label' }, game.title),
        el('span', { class: 'sub' }, starsFor(child, game.id)),
      ),
    )),
  );
  speak('Assalamu alaikum! Pick a game.');
}

function starsFor(child, gameId) {
  const best = child.played[gameId]?.best || 0;
  return best ? '⭐'.repeat(best) : 'New!';
}

/* ---------- Sticker book ---------- */
function showStickers(childId) {
  const child = findChild(childId);
  const have = stickersFor(child.stars);
  const toNext = STARS_PER_STICKER - (child.stars % STARS_PER_STICKER);
  const text = have >= STICKERS.length
    ? 'MashaAllah! You collected every sticker!'
    : `You have ${have} stickers. ${toNext} more stars for the next one!`;
  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: () => showGames(childId) }, '⬅️'),
      el('h1', {}, `${child.name}’s sticker book`),
    ),
    el('p', { style: 'font-size:1.6rem;margin:0' }, text),
    el('div', { class: 'sticker-grid' }, STICKERS.map((s, i) =>
      el('div', { class: `sticker ${i < have ? '' : 'locked'}` }, i < have ? s : '❔'))),
  );
  speak('Here is your sticker book!');
}

/* ---------- Screen 3: a game ---------- */
function playGame(childId, gameId) {
  const child = findChild(childId);
  const game = GAMES.find(g => g.id === gameId);
  const root = el('div', { style: 'display:flex;flex-direction:column;gap:1.25rem;flex:1' });
  let finished = false;

  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: () => { finished = true; stopSpeech(); showGames(childId); } }, '🏠'),
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
      const before = stickersFor(child.stars);
      child.stars += stars;
      const newSticker = stickersFor(child.stars) > before ? STICKERS[stickersFor(child.stars) - 1] : null;
      const rec = child.played[gameId] || { best: 0, times: 0 };
      rec.best = Math.max(rec.best, stars);
      rec.times += 1;
      child.played[gameId] = rec;
      saveState(state);
      showDone(childId, gameId, stars, message, newSticker);
    },
  });
}

/* ---------- Screen 4: Well done! ---------- */
function showDone(childId, gameId, stars, message, newSticker) {
  const child = findChild(childId);
  const praise = pick(['MashaAllah!', 'Alhamdulillah!', 'Well done!']);
  sfx.win();
  speak([praise, message, `You got ${stars} stars.`, newSticker ? 'You unlocked a new sticker!' : null]);
  app.replaceChildren(
    el('div', { class: 'done-screen' },
      el('h2', {}, praise),
      el('div', { class: 'stars' }, [1, 2, 3].map(n =>
        el('span', { class: n <= stars ? '' : 'dim', style: `animation-delay:${n * 0.25}s` }, '⭐'))),
      el('p', { style: 'font-size:1.8rem;margin:0' }, message),
      newSticker ? el('p', { style: 'font-size:1.8rem;margin:0' }, `New sticker: ${newSticker}`) : null,
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
    voicePanel(),
    el('div', {},
      el('button', { class: 'big-btn secondary', onclick: () => {
        if (confirmReset()) { resetState(); state = loadState(); showParent(); }
      } }, 'Reset all progress')),
  );
}

/* Voice settings: pick any English voice on the tablet, plus speed and pitch. */
function voicePanel() {
  const SAMPLE = 'Assalamu alaikum! Let’s learn together. MashaAllah, great job!'; // also recorded as a clip
  const voices = englishVoices();
  // Android loads its voices a moment after the page opens: redraw when ready.
  if (!voices.length && 'speechSynthesis' in window) {
    speechSynthesis.addEventListener('voiceschanged', () => document.querySelector('[aria-label=Voice]') && showParent(), { once: true });
  }
  const current = voices.find(v => v.name === voiceSettings.name)?.name
    || voices.find(v => v.lang === 'en-AU')?.name || voices[0]?.name;
  const nice = v => `${v.name.replace(/^(Google|Samsung|Microsoft)\s*/i, '')} (${v.lang})`;
  const natural = el('option', { value: NATURAL }, 'Miriam (natural voice, recommended)');
  if (voiceSettings.name === NATURAL) natural.selected = true;
  const select = el('select', { 'aria-label': 'Voice' }, natural,
    voices.map(v => {
      const o = el('option', { value: v.name }, `Tablet voice: ${nice(v)}`);
      if (voiceSettings.name !== NATURAL && v.name === current) o.selected = true;
      return o;
    }));
  select.addEventListener('change', () => { setVoice({ name: select.value }); speak(SAMPLE); });

  const slider = (label, key, min, max) => {
    const input = el('input', { type: 'range', min, max, step: 0.05, value: voiceSettings[key], style: 'flex:1;min-width:8rem' });
    input.addEventListener('change', () => { setVoice({ [key]: Number(input.value) }); speak(SAMPLE); });
    return el('label', { style: 'display:flex;align-items:center;gap:.6rem;flex:1;font-size:1.2rem' }, label, input);
  };

  return el('div', { class: 'parent-row', style: 'flex-direction:column;align-items:stretch' },
    el('strong', { style: 'font-size:1.4rem' }, '🔊 Voice for instructions'),
    el('div', { style: 'display:flex;gap:.8rem;flex-wrap:wrap;align-items:center' },
      select,
      el('button', { class: 'big-btn secondary', style: 'padding:.6rem 1.4rem;font-size:1.3rem', onclick: () => speak(SAMPLE) }, '▶️ Test')),
    el('div', { style: 'display:flex;gap:1.5rem;flex-wrap:wrap' },
      slider('Speed', 'rate', 0.6, 1.3),
      slider('Pitch', 'pitch', 0.7, 1.5)),
    el('p', { class: 'note', style: 'margin:0' },
      'Speed and pitch change tablet voices only. Maths questions always use a tablet voice. More tablet voices: on a Samsung tablet this is usually Settings › General management › Text-to-speech › Preferred engine (Google) › ⚙️ › Install voice data › English. Then reopen this page.'));
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
