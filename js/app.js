/* =========================================================
   app.js: screens and navigation.
   Screens: Who's playing -> Subjects -> Games in a subject -> Game -> Well done
            plus the sticker book, the treasure chest, and a Parent area
            behind a hold-and-PIN lock.
   ========================================================= */
import { BANDS, loadState, saveState, resetState, speak, stopSpeech, usePraise, sfx, el, pick, toast, englishVoices, voiceSettings, setVoice, NATURAL, askGrownUp, hasPin, setPin, clearPin, pinPad } from './core.js';
import { GAMES, SUBJECTS } from './games/index.js';
import { kasem, kasemSays, buddy, confetti, recordPlay, streakOf, gamesToday, chestReady, chestOpenedToday, openChest, GAMES_FOR_CHEST, CHEST_STARS, TREASURES } from './fun.js';

const app = document.getElementById('app');
let state = loadState();

const AVATARS = ['🌙', '⭐', '🌸', '🐣', '🦋', '🐢', '🦁', '🐪', '🌻', '🚀', '🐱', '🌈'];

/* A child's picture: their photo if a parent added one, else their emoji. */
function avatarEl(child, cls = 'emoji') {
  return child.photo
    ? el('img', { class: `avatar-photo ${cls}`, src: child.photo, alt: '' })
    : el('span', { class: cls }, child.avatar);
}

/* Shrink a chosen photo to a small square, so it fits in tablet storage.
   The photo stays on this tablet only. It is never uploaded anywhere. */
function photoToDataUrl(file, size = 320) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = el('canvas', { width: size, height: size });
      canvas.getContext('2d').drawImage(img,
        (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

/* Sticker book: one new sticker for every 10 stars. */
const STICKERS = ['🕌', '🌙', '🌴', '🐪', '🏮', '🕋', '📖', '🌸', '🦋', '🌈', '🐎', '🌟'];
const STARS_PER_STICKER = 10;
const stickersFor = stars => Math.min(STICKERS.length, Math.floor(stars / STARS_PER_STICKER));

/* Each screen sets a background picture (img/art/bg-*.jpg) via CSS. */
const setBg = name => { document.body.dataset.bg = name; };

/* Pop tiles in one after another. */
const stagger = (nodes, step = 60) => nodes.forEach((n, i) => { n.style.animationDelay = `${i * step}ms`; });

/* ---------- Screen 1: Who's playing? ---------- */
function showWho() {
  setBg('home');
  const tiles = state.children.map(child =>
    el('button', { class: 'tile pop-in', onclick: () => { sfx.tap(); showGames(child.id); } },
      avatarEl(child),
      el('span', { class: 'label' }, child.name),
      el('span', { class: 'sub' }, `⭐ ${child.stars}`, streakOf(child) > 1 ? `   🔥 ${streakOf(child)}` : ''),
    ));
  stagger(tiles);
  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('h1', {}, 'Who’s playing?'),
      parentButton(),
    ),
    kasemSays('hi', 'Hi! I’m Kasem the Koala. Who’s playing today?', 'hero'),
    el('div', { class: 'tile-grid' }, tiles),
  );
}

/* The top bar on a child's screens: back, name, streak, treasure progress, stars. */
function childBar(child, onBack, backIcon = '🏠') {
  const streak = streakOf(child);
  const n = Math.min(gamesToday(child), GAMES_FOR_CHEST);
  const chest = chestReady(child)
    ? el('button', { class: 'chip chest-chip ready', onclick: () => showChest(child.id) }, '🎁 Open!')
    : el('span', { class: 'chip', title: 'Treasure chest' }, chestOpenedToday(child) ? '🎁 ✓' : `🎁 ${n}/${GAMES_FOR_CHEST}`);
  return el('div', { class: 'topbar' },
    el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: onBack }, backIcon),
    el('h1', { class: 'with-avatar' }, avatarEl(child, 'avatar-small'), child.name),
    streak > 1 ? el('span', { class: 'chip streak' }, `🔥 ${streak} days`) : null,
    chest,
    el('button', { class: 'star-count', onclick: () => showStickers(child.id) }, `⭐ ${child.stars}  📒`),
  );
}

/* ---------- Screen 2: pick a subject ---------- */
function showGames(childId) {
  const child = findChild(childId);
  setBg('home');
  const subjects = SUBJECTS.filter(s => s.games.some(g => g.bands.includes(child.band)));
  const cards = subjects.map(subject => {
    const games = subject.games.filter(g => g.bands.includes(child.band));
    const fresh = games.filter(g => !child.played[g.id]).length;
    return el('button', { class: `subject-card pop-in s-${subject.id}`, onclick: () => { sfx.tap(); showSubject(childId, subject.id); } },
      el('span', { class: 'subject-pic', style: `background-image:url(img/art/bg-${subject.id}.jpg)` }),
      el('span', { class: 'subject-emoji' }, subject.emoji),
      el('span', { class: 'label' }, subject.name),
      el('span', { class: 'sub' }, `${games.length} game${games.length > 1 ? 's' : ''}`),
      fresh ? el('span', { class: 'badge-new' }, `${fresh} new`) : null);
  });
  stagger(cards, 70);
  app.replaceChildren(
    childBar(child, showWho),
    kasemSays('hi', `Hi ${child.name}! What shall we learn?`),
    el('div', { class: 'subject-grid' }, cards),
  );
  speak('Pick a subject!');
}

/* ---------- Screen 2b: the games in one subject ---------- */
function showSubject(childId, subjectId) {
  const child = findChild(childId);
  const subject = SUBJECTS.find(s => s.id === subjectId);
  setBg(subject.id);
  const games = subject.games.filter(g => g.bands.includes(child.band));
  const tiles = games.map(game =>
    el('button', { class: `tile pop-in ${child.played[game.id] ? '' : 'is-new'}`, onclick: () => { sfx.tap(); playGame(childId, game.id); } },
      el('span', { class: 'emoji' }, game.emoji),
      el('span', { class: 'label' }, game.title),
      el('span', { class: 'sub' }, starsFor(child, game.id)),
    ));
  stagger(tiles);
  app.replaceChildren(
    childBar(child, () => showGames(childId), '⬅️'),
    el('h2', { class: 'subject-heading' }, `${subject.emoji} ${subject.name}`),
    el('div', { class: 'tile-grid' }, tiles),
  );
  speak('Pick a game.');
}

function starsFor(child, gameId) {
  const best = child.played[gameId]?.best || 0;
  return best ? '⭐'.repeat(best) : 'New!';
}

/* ---------- Sticker book ---------- */
function showStickers(childId) {
  const child = findChild(childId);
  setBg('home');
  const have = stickersFor(child.stars);
  const toNext = STARS_PER_STICKER - (child.stars % STARS_PER_STICKER);
  const text = have >= STICKERS.length
    ? 'You collected every sticker!'
    : `You have ${have} stickers. ${toNext} more stars for the next one!`;
  const found = child.treasures || [];
  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: () => showGames(childId) }, '⬅️'),
      el('h1', {}, `${child.name}’s sticker book`),
    ),
    el('div', { class: 'book' },
      el('p', { class: 'book-line' }, text),
      el('div', { class: 'sticker-grid' }, STICKERS.map((s, i) =>
        el('div', { class: `sticker ${i < have ? '' : 'locked'}` }, i < have ? s : '❔'))),
      el('h2', { class: 'book-title' }, `🎁 Treasures found: ${found.length} of ${TREASURES.length}`),
      el('p', { class: 'book-line small' }, 'Play 3 games in a day to open the treasure chest.'),
      el('div', { class: 'sticker-grid small' }, TREASURES.map(t =>
        el('div', { class: `sticker ${found.includes(t) ? '' : 'locked'}` }, found.includes(t) ? t : '❔')))),
  );
  speak('Here is your sticker book!');
}

/* ---------- Treasure chest ---------- */
function showChest(childId) {
  const child = findChild(childId);
  if (!chestReady(child)) return showGames(childId);
  setBg('home');
  const chest = el('button', { class: 'chest-btn wobble', 'aria-label': 'Open the treasure chest' },
    el('img', { src: 'img/art/chest.png', alt: '' }));
  const msg = el('p', { class: 'chest-msg' }, 'Tap the treasure chest to open it!');
  chest.addEventListener('click', () => {
    if (chest.disabled) return;
    chest.disabled = true;
    const found = openChest(child);
    saveState(state);
    sfx.chest();
    chest.classList.remove('wobble');
    chest.classList.add('opened');
    const r = chest.getBoundingClientRect();
    confetti({ from: { x: r.left + r.width / 2, y: r.top + r.height / 3 }, count: 200 });
    chest.replaceChildren(el('span', { class: 'treasure' }, found));
    msg.textContent = `You found a treasure! Plus ${CHEST_STARS} bonus stars!`;
    speak(['You found a treasure!', `Plus ${CHEST_STARS} bonus stars!`]);
    app.querySelector('.after-chest').hidden = false;
  });
  app.replaceChildren(
    el('div', { class: 'done-screen' },
      el('h2', {}, 'Treasure time!'),
      el('div', { class: 'chest-row' }, kasem('cheer', 'bob big-kasem'), chest),
      msg,
      el('div', { class: 'row after-chest', hidden: true },
        el('button', { class: 'big-btn', onclick: () => showGames(childId) }, 'More games'),
        el('button', { class: 'big-btn secondary', onclick: () => showStickers(childId) }, '📒 Sticker book'))));
  speak('Tap the treasure chest to open it!');
}

/* ---------- Screen 3: a game ---------- */
function subjectOf(gameId) {
  return SUBJECTS.find(s => s.games.some(g => g.id === gameId));
}

function playGame(childId, gameId) {
  const child = findChild(childId);
  const game = GAMES.find(g => g.id === gameId);
  const subject = subjectOf(gameId);
  setBg(subject.id);
  usePraise(subject.id === 'islam');
  const root = el('div', { class: 'stage' });
  let finished = false;

  app.replaceChildren(...[
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: () => { finished = true; stopSpeech(); showSubject(childId, subject.id); } }, '⬅️'),
      el('h1', { class: 'game-title' }, `${game.emoji} ${game.title}`),
    ),
    root,
    game.noBuddy ? null : buddy(),
  ].filter(Boolean));

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
      recordPlay(child);
      saveState(state);
      showDone(childId, gameId, stars, message, newSticker);
    },
  });
}

/* ---------- Screen 4: Well done! ---------- */
function showDone(childId, gameId, stars, message, newSticker) {
  const child = findChild(childId);
  const subject = subjectOf(gameId);
  const praise = pick(subject.id === 'islam' ? ['MashaAllah!', 'Well done!', 'Great job!'] : ['Well done!', 'Great job!', 'Amazing!']);
  const ready = chestReady(child);
  sfx.win();
  setTimeout(() => confetti(), 150);
  speak([praise, message, `You got ${stars} stars.`,
    newSticker ? 'You unlocked a new sticker!' : null,
    ready ? 'The treasure chest is ready! Tap it to open.' : null]);
  const left = GAMES_FOR_CHEST - gamesToday(child);
  app.replaceChildren(
    el('div', { class: 'done-screen' },
      kasem('cheer', 'big-kasem jump-in'),
      el('h2', {}, praise),
      el('div', { class: 'stars' }, [1, 2, 3].map(n =>
        el('span', { class: n <= stars ? '' : 'dim', style: `animation-delay:${0.3 + n * 0.25}s` }, '⭐'))),
      el('p', { class: 'done-msg' }, message),
      newSticker ? el('p', { class: 'done-msg' }, `New sticker: ${newSticker}`) : null,
      ready
        ? el('button', { class: 'chest-btn small wobble', 'aria-label': 'Open the treasure chest', onclick: () => showChest(childId) },
          el('img', { src: 'img/art/chest.png', alt: '' }), el('span', {}, 'Open the treasure chest!'))
        : left > 0 && !chestOpenedToday(child)
          ? el('p', { class: 'note big-note' }, `🎁 ${left} more game${left > 1 ? 's' : ''} today to open the treasure chest!`)
          : null,
      el('div', { class: 'row' },
        el('button', { class: 'big-btn', onclick: () => playGame(childId, gameId) }, '🔁 Play again'),
        el('button', { class: 'big-btn secondary', onclick: () => showSubject(childId, subject.id) }, 'More games'),
      ),
    ),
  );
}

/* ---------- Parent area ----------
   Locked: hold the ⚙️ button for 2 seconds, then enter the parent PIN
   (or answer a sum, if no PIN has been set yet). */
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
  askGrownUp('Grown-ups only').then(ok => (ok ? showParent() : showWho()));
}

function showParent() {
  setBg('none');
  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Done', onclick: () => { saveState(state); showWho(); } }, '✅'),
      el('h1', {}, 'Parent area'),
    ),
    el('p', { class: 'note' }, 'Tap a picture to add a photo. Change names and age groups here too. Changes save straight away. Photos and progress stay on this tablet only.'),
    el('div', { class: 'parent-list' }, state.children.map(child => {
      // Tap the picture to choose a photo (camera or gallery).
      const file = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
      const avatarBtn = el('button', { class: 'avatar-btn', 'aria-label': 'Choose a photo', onclick: () => file.click() }, avatarEl(child));
      file.addEventListener('change', async () => {
        if (!file.files[0]) return;
        const old = child.photo;
        try {
          child.photo = await photoToDataUrl(file.files[0]);
          saveState(state);
          showParent();
        } catch {
          child.photo = old;
          toast('Sorry, that photo didn’t work. Try another one.', 2500);
        }
      });
      // Or use an emoji: each tap shows the next one, and removes the photo.
      const emojiBtn = el('button', { class: 'big-btn secondary small-btn', onclick: () => {
        if (child.photo) delete child.photo;
        else child.avatar = AVATARS[(AVATARS.indexOf(child.avatar) + 1) % AVATARS.length];
        saveState(state);
        showParent();
      } }, child.photo ? 'Use emoji' : `Next emoji`);
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
        avatarBtn, file, name, band, emojiBtn, el('span', { class: 'note' }, `⭐ ${child.stars}`));
    })),
    pinPanel(),
    voicePanel(),
    el('div', {},
      el('button', { class: 'big-btn secondary', onclick: () => {
        if (confirmReset()) { resetState(); state = loadState(); showParent(); }
      } }, 'Reset all progress')),
  );
}

/* Parent PIN: set, change or remove the 4-digit PIN for the parent area. */
function pinPanel() {
  const choose = () => {
    let first = null;
    let overlay;
    const box = pinPad('Enter a new 4-digit PIN', async pin => {
      if (!first) { first = pin; box.setMessage('Enter the same PIN again'); return false; }
      if (pin !== first) { first = null; box.setMessage('They didn’t match. Enter a new 4-digit PIN'); return false; }
      await setPin(pin);
      overlay.remove();
      toast('PIN saved', 2000);
      showParent();
      return true;
    }, () => overlay.remove());
    overlay = el('div', { class: 'overlay' }, box);
    document.body.append(overlay);
  };
  return el('div', { class: 'parent-row', style: 'flex-direction:column;align-items:stretch' },
    el('strong', { style: 'font-size:1.4rem' }, '🔒 Parent PIN'),
    el('p', { class: 'note', style: 'margin:0' }, hasPin()
      ? 'A PIN is set. It is needed to open this area and to give surah badges.'
      : 'No PIN yet, so a times-tables question is used instead. Set a PIN to keep the older kids out.'),
    el('div', { class: 'row', style: 'justify-content:flex-start' },
      el('button', { class: 'big-btn small-btn', onclick: choose }, hasPin() ? 'Change PIN' : 'Set PIN'),
      hasPin() ? el('button', { class: 'big-btn secondary small-btn', onclick: () => {
        if (confirmReset('Tap again to remove the PIN')) { clearPin(); toast('PIN removed', 2000); showParent(); }
      } }, 'Remove PIN') : null));
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
function confirmReset(message = 'Tap again to reset everything') {
  if (Date.now() - resetArmed < 4000) { resetArmed = 0; return true; }
  resetArmed = Date.now();
  toast(message, 2500);
  return false;
}

function findChild(id) {
  return state.children.find(c => c.id === id);
}

/* Forgot the PIN? Open the app with #forgot-pin on the end of the address.
   That removes the PIN. Stars and photos are kept. */
function checkForgotPin() {
  if (location.hash !== '#forgot-pin') return;
  history.replaceState(null, '', location.pathname);
  clearPin();
  toast('PIN removed. Set a new one in the parent area.', 3500);
}
checkForgotPin();
window.addEventListener('hashchange', checkForgotPin);

showWho();
