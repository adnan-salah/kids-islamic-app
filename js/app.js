/* =========================================================
   app.js: screens and navigation.
   Screens: Who's playing -> Subjects -> Games in a subject -> Game -> Well done
            plus My levels (levels, tiers, real rewards), the treasure chest, and a Parent area
            behind a hold-and-PIN lock.
   ========================================================= */
import { BANDS, loadState, saveState, resetState, speak, stopSpeech, usePraise, sfx, el, pick, toast, englishVoices, voiceSettings, setVoice, NATURAL, askGrownUp, hasPin, setPin, clearPin, pinPad } from './core.js';
import { GAMES, SUBJECTS } from './games/index.js';
import { kasem, kasemSays, buddy, confetti, recordPlay, streakOf, gamesToday, chestReady, chestOpenedToday, openChest, GAMES_FOR_CHEST, CHEST_STARS, TREASURES } from './fun.js';
import { mathsLevelOf, MATHS_LEVELS } from './games/maths.js';
import { trackGame, totals, daysAgo, today, missedSince } from './stats.js';
import { levelOf, levelProgress, tierOf, tierInfo, titleFor, subjectLevel, starsIn, checkLevels, pendingRewards, rewardFor, DEFAULT_REWARDS, LEVELS_PER_TIER, starsForLevel } from './levels.js';

const app = document.getElementById('app');
let state = loadState();
const applyCalm = () => document.body.classList.toggle('calm', !!state.calm); // parent switch: no bobbing or pulsing
applyCalm();
migrate();

/* Older saves: work out level totals and tiers without giving
   rewards for stars earned before levels existed. */
function migrate() {
  for (const c of state.children) {
    for (const rec of Object.values(c.played || {})) rec.total ??= rec.best * rec.times;
    c.tierSeen ??= tierOf(levelOf(c.stars));
    c.rewardsEarned ??= [];
  }
  saveState(state);
}

const AVATARS = ['🌙', '⭐', '🌸', '🐣', '🦋', '🐢', '🦁', '🐪', '🌻', '🚀', '🐱', '🌈'];

/* A child's picture: their photo if a parent added one, else their emoji. */
function avatarEl(child, cls = 'emoji') {
  return child.photo
    ? el('img', { class: `avatar-photo ${cls}`, src: child.photo, alt: '' })
    : el('span', { class: cls }, child.avatar);
}

/* Let the parent frame a chosen photo: drag to move, pinch or use the
   slider to zoom, then save it as a small square (so it fits in tablet
   storage). Resolves with the picture, or null if they cancel.
   The photo stays on this tablet only. It is never uploaded anywhere. */
function cropPhoto(file, size = 320) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight;
      const view = el('div', { class: 'crop-view' });
      const pic = el('img', { class: 'crop-img', src: url, alt: '', draggable: 'false' });
      view.append(pic, el('div', { class: 'crop-ring' }));
      const slider = el('input', { type: 'range', min: '1', max: '4', step: '0.01', value: '1', class: 'crop-zoom', 'aria-label': 'Zoom' });
      let V = 0, zoom = 1, ox = 0, oy = 0;
      const scale = () => (V / Math.min(W, H)) * zoom;
      function clamp() {
        const s = scale();
        ox = Math.min(0, Math.max(V - W * s, ox));
        oy = Math.min(0, Math.max(V - H * s, oy));
      }
      function draw() {
        clamp();
        const s = scale();
        pic.style.width = `${W * s}px`;
        pic.style.height = `${H * s}px`;
        pic.style.transform = `translate(${ox}px, ${oy}px)`;
      }
      // Zoom around a point in the frame (the centre, or between two fingers).
      function zoomTo(z, cx = V / 2, cy = V / 2) {
        const s0 = scale();
        zoom = Math.min(4, Math.max(1, z));
        const s1 = scale();
        ox = cx - (cx - ox) * (s1 / s0);
        oy = cy - (cy - oy) * (s1 / s0);
        slider.value = String(zoom);
        draw();
      }
      slider.addEventListener('input', () => zoomTo(Number(slider.value)));
      const pts = new Map();
      let pinch = null;
      view.addEventListener('pointerdown', e => { view.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); pinch = null; });
      view.addEventListener('pointermove', e => {
        const prev = pts.get(e.pointerId);
        if (!prev) return;
        const now = { x: e.clientX, y: e.clientY };
        pts.set(e.pointerId, now);
        if (pts.size === 1) { ox += now.x - prev.x; oy += now.y - prev.y; draw(); return; }
        const [a, b] = [...pts.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const r = view.getBoundingClientRect();
        const mid = { x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top };
        if (pinch) zoomTo(pinch.zoom * dist / pinch.dist, mid.x, mid.y);
        else pinch = { dist, zoom };
      });
      const up = e => { pts.delete(e.pointerId); pinch = null; };
      view.addEventListener('pointerup', up);
      view.addEventListener('pointercancel', up);
      view.addEventListener('wheel', e => { e.preventDefault(); zoomTo(zoom * (e.deltaY < 0 ? 1.1 : 0.9)); }, { passive: false });

      const close = result => { overlay.remove(); URL.revokeObjectURL(url); resolve(result); };
      const overlay = el('div', { class: 'crop-overlay' },
        el('div', { class: 'crop-box' },
          el('h2', {}, 'Move and zoom the photo'),
          el('p', { class: 'note' }, 'Drag to move. Pinch or use the slider to zoom.'),
          view,
          el('div', { class: 'crop-zoom-row' }, el('span', {}, '➖'), slider, el('span', {}, '➕')),
          el('div', { class: 'row' },
            el('button', { class: 'big-btn secondary', onclick: () => close(null) }, 'Cancel'),
            el('button', { class: 'big-btn', onclick: () => {
              const s = scale();
              const canvas = el('canvas', { width: size, height: size });
              canvas.getContext('2d').drawImage(img, -ox / s, -oy / s, V / s, V / s, 0, 0, size, size);
              close(canvas.toDataURL('image/jpeg', 0.85));
            } }, '✅ Use photo'))));
      document.body.append(overlay);
      requestAnimationFrame(() => {
        V = view.clientWidth;
        const s = scale();
        ox = (V - W * s) / 2; oy = (V - H * s) / 2;
        draw();
      });
    };
    img.src = url;
  });
}


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
      el('span', { class: 'sub' }, `${tierInfo(tierOf(levelOf(child.stars))).icon} Level ${levelOf(child.stars)}`, streakOf(child) > 1 ? `   🔥 ${streakOf(child)}` : ''),
      pendingRewards(child).length ? el('span', { class: 'badge-new' }, '🎁 Reward!') : null,
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
    pendingRewards(child).length ? el('button', { class: 'chip reward-chip', onclick: () => showReward(child.id) }, '🎁 Reward!') : null,
    levelChip(child),
  );
}

/* ---------- Screen 2: pick a subject ---------- */
function showGames(childId) {
  const child = findChild(childId);
  document.body.dataset.band = child.band;
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
    el('div', { class: 'home-row' },
      kasemSays('hi', `Hi ${child.name}! What shall we learn?`),
      keepPlaying(child)),
    el('div', { class: 'subject-grid' }, cards),
  );
  speak('Pick a subject!');
}

/* The last two games this child played, one tap from the home screen. */
function keepPlaying(child) {
  const recent = (child.recent || []).map(id => GAMES.find(g => g.id === id)).filter(g => g && g.bands.includes(child.band));
  if (!recent.length) return null;
  return el('div', { class: 'keep-playing' },
    el('span', { class: 'kp-label' }, '▶️ Keep playing'),
    recent.map(g => el('button', { class: 'kp-btn', 'aria-label': `Keep playing ${g.title}`, onclick: () => { sfx.tap(); playGame(child.id, g.id); } },
      el('span', { class: 'kp-emoji' }, g.emoji), el('span', { class: 'kp-title' }, g.title))));
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
  // Say the subject's name too, for a child who can't read the heading yet.
  speak([subject.name, 'Pick a game.']);
}

function starsFor(child, gameId) {
  const best = child.played[gameId]?.best || 0;
  return best ? '⭐'.repeat(best) : 'New!';
}

/* The level chip in the top bar: a mini progress bar. Tap for My levels. */
function levelChip(child) {
  const { level, frac } = levelProgress(child.stars);
  const tier = tierInfo(tierOf(level));
  return el('button', { class: 'level-chip', onclick: () => showLevels(child.id), 'aria-label': `Level ${level}. My levels` },
    el('span', { class: 'level-badge', style: `--tc:${tier.colour}` }, String(level)),
    el('span', { class: 'level-mini' }, el('span', { style: `width:${Math.round(frac * 100)}%` })),
    el('span', { class: 'level-stars' }, `⭐ ${child.stars}`));
}

/* A progress bar. */
const bar = (frac, cls = '') => el('div', { class: `bar ${cls}` }, el('span', { style: `width:${Math.max(3, Math.round(frac * 100))}%` }));

/* ---------- My levels ----------
   Replaces the sticker book: overall level, the tier path with its real
   rewards, a knowledge level for every subject, and treasures. */
function showLevels(childId) {
  const child = findChild(childId);
  setBg('home');
  const { level, frac, toNext } = levelProgress(child.stars);
  const tier = tierOf(level);
  const nextTierLevel = (tier + 1) * LEVELS_PER_TIER;
  const subjects = SUBJECTS.filter(s => s.games.some(g => g.bands.includes(child.band)));
  const path = [];
  for (let t = 1; t <= Math.max(6, tier + 2); t++) {
    const info = tierInfo(t), got = t <= tier;
    const r = (child.rewardsEarned || []).find(x => x.tier === t);
    path.push(el('div', { class: `tier-step ${got ? 'got' : ''}`, style: `--tc:${info.colour}` },
      el('span', { class: 'tier-icon' }, got ? info.icon : '🔒'),
      el('strong', {}, info.name),
      el('span', { class: 'sub' }, `Level ${t * LEVELS_PER_TIER}`),
      el('span', { class: 'tier-reward' }, r?.given ? '✅ Reward given' : got ? '🎁 Show Mum or Dad!' : `🎁 ${rewardFor(state, t)}`)));
  }
  const found = child.treasures || [];
  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: () => showGames(childId) }, '⬅️'),
      el('h1', {}, `${child.name}’s levels`),
    ),
    el('div', { class: 'book levels' },
      el('div', { class: 'level-hero' },
        el('div', { class: 'level-big', style: `--tc:${tierInfo(tier).colour}` },
          el('span', { class: 'n' }, String(level)), el('span', { class: 'l' }, 'LEVEL')),
        el('div', { class: 'level-text' },
          el('h2', {}, `${tierInfo(tier).icon} ${titleFor(level)}`),
          bar(frac, 'big'),
          el('p', {}, `⭐ ${toNext} more stars to reach level ${level + 1}.`),
          el('p', { class: 'sub' }, `Reach level ${nextTierLevel} for a real reward: ${rewardFor(state, tier + 1)}`))),
      el('h2', { class: 'book-title' }, '🏆 Reward path'),
      el('div', { class: 'tier-path' }, path),
      el('h2', { class: 'book-title' }, '🧠 What I know'),
      el('div', { class: 'subject-levels' }, subjects.map(sub => {
        const st = starsIn(child, sub.games);
        const sl = subjectLevel(st);
        return el('div', { class: 'subject-level' },
          el('span', { class: 'emoji' }, sub.emoji),
          el('div', {}, el('strong', {}, `${sub.name}: ${sl.icon} ${sl.name}`), bar(sl.frac),
            el('span', { class: 'sub' }, sl.toNext ? `${sl.toNext} star${sl.toNext === 1 ? '' : 's'} to the next level` : 'Top level!')));
      })),
      el('p', { class: 'book-line small' }, `🌍 Countries found on the globe: ${(child.found || []).length}`),
      el('h2', { class: 'book-title' }, `🎁 Treasures found: ${found.length} of ${TREASURES.length}`),
      el('p', { class: 'book-line small' }, 'Play 3 games in a day to open the treasure chest.'),
      el('div', { class: 'sticker-grid small' }, TREASURES.map(t =>
        el('div', { class: `sticker ${found.includes(t) ? '' : 'locked'}` }, found.includes(t) ? t : '❔')))),
  );
  speak('Here are your levels! Keep earning stars to level up.');
}

/* ---------- Real-life reward ----------
   The child shows this to a grown-up, who gives the reward and
   marks it as given (behind the PIN). */
function showReward(childId) {
  const child = findChild(childId);
  const r = pendingRewards(child)[0];
  if (!r) return showGames(childId);
  setBg('home');
  const info = tierInfo(r.tier);
  setTimeout(() => confetti({ count: 200 }), 200);
  sfx.win();
  app.replaceChildren(
    el('div', { class: 'done-screen reward-screen' },
      el('img', { class: 'big-kasem jump-in', src: 'img/art/kasem-trophy.png', alt: '' }),
      el('h2', {}, `${info.icon} ${info.name} reward!`),
      el('p', { class: 'done-msg' }, `${child.name} reached level ${r.tier * LEVELS_PER_TIER}!`),
      el('div', { class: 'reward-card', style: `--tc:${info.colour}` },
        el('span', { class: 'sub' }, 'Your real reward:'),
        el('strong', {}, rewardFor(state, r.tier))),
      el('p', { class: 'big-note' }, '👋 Show this to Mum or Dad!'),
      el('div', { class: 'row' },
        el('button', { class: 'big-btn', onclick: () => askGrownUp('Grown-up: did you give the reward?').then(ok => {
          if (!ok) return showReward(childId);
          r.given = true;
          r.givenDate = new Date().toLocaleDateString('en-CA');
          saveState(state);
          toast('Reward given ✅', 2000);
          pendingRewards(child).length ? showReward(childId) : showGames(childId);
        }) }, '✅ Grown-up: reward given'),
        el('button', { class: 'big-btn secondary', onclick: () => showGames(childId) }, 'Later'))));
  speak([`Amazing! You reached the ${info.name} level!`, 'You earned a real reward!', 'Show this to Mum or Dad!']);
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
    const before = child.stars;
    const found = openChest(child);
    const lv = checkLevels(child, before);
    saveState(state);
    if (lv.newTier) setTimeout(() => showReward(childId), 3500);
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
        el('button', { class: 'big-btn secondary', onclick: () => showLevels(childId) }, '🏆 My levels'))));
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
  child.recent = [gameId, ...(child.recent || []).filter(id => id !== gameId)].slice(0, 2);
  saveState(state);
  setBg(subject.id);
  usePraise(subject.id === 'islam');
  const root = el('div', { class: 'stage' });
  document.body.dataset.band = child.band;
  missed = [];
  let finished = false;
  // Hearts: the older children get 3 tries per game; the 3-year-old never loses.
  lives = child.band !== 'little' && !game.noLives
    ? { left: MAX_LIVES, box: el('div', { class: 'hearts', 'aria-label': `${MAX_LIVES} hearts` }), lose: () => {
        if (finished) return;
        finished = true;
        trackGame(null);
        showLost(childId, gameId);
      } }
    : null;
  if (lives) drawHearts();

  app.replaceChildren(...[
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: () => { finished = true; lives = null; trackGame(null); stopSpeech(); showSubject(childId, subject.id); } }, '⬅️'),
      el('h1', { class: 'game-title' }, `${game.emoji} ${game.title}`),
      lives ? lives.box : null,
    ),
    root,
    game.noBuddy ? null : buddy(),
  ].filter(Boolean));

  trackGame(child, game, state);
  if (!game.noFit) fitStage(root);
  game.start({
    root,
    child,
    band: mathsBand(child, subject, gameId),
    harder: subject.id === 'maths' && child.band !== 'little' && mathsLevelOf(child) === 3,
    finish(stars, message) {
      if (finished) return; // child left the game early
      finished = true;
      lives = null;
      trackGame(null);
      // Save progress: add the stars, remember the best score for this game.
      const before = child.stars;
      child.stars += stars;
      const rec = child.played[gameId] || { best: 0, times: 0, total: 0 };
      rec.best = Math.max(rec.best, stars);
      rec.times += 1;
      rec.total = (rec.total || 0) + stars;
      const lv = checkLevels(child, before);
      child.played[gameId] = rec;
      recordPlay(child);
      saveState(state);
      showDone(childId, gameId, stars, message, lv, before);
    },
  });
}

/* ---------- Hearts (older children only) ----------
   Every wrong answer in any game plays sfx.tryAgain(), which sends a
   'kasem' event with 'wrong'. Here that costs a heart. Three wrong
   answers and the game is lost, so the child starts it again. */
const MAX_LIVES = 3;
let lives = null;
// What the child got wrong in this game, to go over on the out-of-hearts screen.
let missed = [];
document.addEventListener('answer', e => {
  const { ok, info } = e.detail;
  if (ok || info?.answer == null) return;
  const q = info.q || document.querySelector('.stage .prompt p')?.textContent;
  if (q && !missed.some(m => m.q === q)) missed.push({ q, answer: String(info.answer) });
});

/* Keep a game on one screen. If what a game draws is taller than the space
   under the top bar, shrink the whole game area just enough to fit (never
   below 70%), so no answer is ever below the fold. Runs again whenever the
   game changes what is on screen. Games that measure touches on a canvas
   opt out with noFit and size themselves. */
function fitStage(root) {
  let frame = 0, timers = [];
  const fit = () => {
    frame = 0;
    if (!root.isConnected) { watcher.disconnect(); removeEventListener('resize', ask); return; }
    root.style.zoom = '';
    const below = parseFloat(getComputedStyle(app).paddingBottom) + parseFloat(getComputedStyle(root).marginBottom);
    const space = innerHeight - (root.getBoundingClientRect().top + scrollY) - below - 2;
    const height = root.offsetHeight;
    if (height > space + 2) root.style.zoom = Math.max(0.7, space / height).toFixed(3);
  };
  const ask = () => { if (!frame) frame = requestAnimationFrame(fit); };
  const watcher = new MutationObserver(() => {
    ask();
    // Pictures and fonts can change the height a moment later.
    timers.forEach(clearTimeout);
    timers = [300, 1200].map(ms => setTimeout(ask, ms));
  });
  watcher.observe(root, { childList: true, subtree: true });
  addEventListener('resize', ask);
  requestAnimationFrame(ask);
}
function drawHearts() {
  if (!lives) return;
  lives.box.replaceChildren(...Array.from({ length: MAX_LIVES }, (_, i) =>
    el('span', { class: i < lives.left ? 'heart' : 'heart gone' }, '❤️')));
  lives.box.setAttribute('aria-label', `${lives.left} hearts left`);
}
document.addEventListener('kasem', e => {
  if (e.detail !== 'wrong' || !lives || !lives.box.isConnected) return;
  lives.left--;
  drawHearts();
  lives.box.classList.remove('hurt'); void lives.box.offsetWidth; lives.box.classList.add('hurt');
  if (lives.left <= 0) {
    const lose = lives.lose;
    lives = null;
    setTimeout(lose, 900);
  }
});

function showLost(childId, gameId) {
  window.scrollTo(0, 0);
  const subject = subjectOf(gameId);
  stopSpeech();
  app.replaceChildren(
    el('div', { class: 'done-screen lost-screen' },
      kasem('think', 'big-kasem jump-in'),
      el('h2', {}, 'Nearly there!'),
      // The hearts fill back up: a fresh start, not a score of zero.
      el('div', { class: 'stars refill' }, [1, 2, 3].map(n => el('span', { style: `animation-delay:${0.2 + n * 0.3}s` }, '❤️'))),
      el('p', { class: 'done-msg' }, 'Your hearts are full again. Have another go!'),
      missed.length ? el('div', { class: 'missed-list' },
        el('strong', {}, 'Remember these:'),
        missed.slice(-2).map(m => el('p', {}, el('span', { class: 'missed-q' }, m.q), el('span', { class: 'missed-a' }, `✅ ${m.answer}`)))) : null,
      el('div', { class: 'row' },
        el('button', { class: 'big-btn', onclick: () => playGame(childId, gameId) }, el('span', { class: 'btn-pic' }, '🔁'), 'Try again'),
        el('button', { class: 'big-btn secondary', onclick: () => showSubject(childId, subject.id) }, el('span', { class: 'btn-pic' }, '🎮'), 'More games'))));
  speak(['Nearly there!', 'Your hearts are full again. Have another go!']);
}

/* Each child has their own maths level (games/maths.js), which moves
   up and down by itself and can be set in the parent area. Maths Fun
   uses it directly; Sports Maths and Time & Money follow it too. */
function mathsBand(child, subject, gameId) {
  if (subject.id === 'maths' && child.band !== 'little' && gameId !== 'maths') return mathsLevelOf(child) >= 4 ? 'champion' : 'explorer';
  return child.band;
}

/* ---------- Screen 4: Well done! ---------- */
function showDone(childId, gameId, stars, message, lv = {}, before = 0) {
  window.scrollTo(0, 0);
  const child = findChild(childId);
  const subject = subjectOf(gameId);
  const praise = pick(subject.id === 'islam' ? ['MashaAllah!', 'Well done!', 'Great job!'] : ['Well done!', 'Great job!', 'Amazing!']);
  const ready = chestReady(child);
  sfx.win();
  setTimeout(() => confetti(), 150);
  speak([praise, message, `You got ${stars} star${stars === 1 ? '' : 's'}.`,
    lv.levelUp ? `Level up! You are now on level ${lv.levelUp}!` : null,
    lv.newTier ? 'You earned a real reward!' : null,
    ready ? 'The treasure chest is ready! Tap it to open.' : null]);
  // Level bar fills from where it was to where it is now.
  const p0 = levelProgress(before), p1 = levelProgress(child.stars);
  const fill = el('span', { style: `width:${Math.round((lv.levelUp ? 0 : p0.frac) * 100)}%` });
  setTimeout(() => { fill.style.width = `${Math.max(3, Math.round(p1.frac * 100))}%`; }, 900);
  if (lv.levelUp) setTimeout(() => { sfx.chest(); confetti({ count: 160 }); }, 1600);
  const left = GAMES_FOR_CHEST - gamesToday(child);
  app.replaceChildren(
    el('div', { class: 'done-screen' },
      kasem('cheer', 'big-kasem jump-in'),
      el('h2', {}, praise),
      el('div', { class: 'stars' }, [1, 2, 3].map(n =>
        el('span', { class: n <= stars ? '' : 'dim', style: `animation-delay:${0.3 + n * 0.25}s` }, '⭐'))),
      el('p', { class: 'done-msg' }, message),
      el('div', { class: `done-level ${lv.levelUp ? 'up' : ''}` },
        el('span', { class: 'level-badge', style: `--tc:${tierInfo(tierOf(p1.level)).colour}` }, String(p1.level)),
        el('div', { class: 'bar big' }, fill),
        lv.levelUp ? el('strong', { class: 'level-up' }, '⬆️ LEVEL UP!') : el('span', { class: 'sub' }, `${p1.toNext} ⭐ to level ${p1.level + 1}`)),
      lv.newTier ? el('button', { class: 'big-btn reward-btn', onclick: () => showReward(childId) }, `🎁 You earned a real reward! Tap here`) : null,
      ready
        ? el('button', { class: 'chest-btn small wobble', 'aria-label': 'Open the treasure chest', onclick: () => showChest(childId) },
          el('img', { src: 'img/art/chest.png', alt: '' }), el('span', {}, 'Open the treasure chest!'))
        : left > 0 && !chestOpenedToday(child)
          ? el('p', { class: 'note big-note' }, `🎁 ${left} more game${left > 1 ? 's' : ''} today to open the treasure chest!`)
          : null,
      el('div', { class: 'row' },
        el('button', { class: 'big-btn', onclick: () => playGame(childId, gameId) }, el('span', { class: 'btn-pic' }, '🔁'), 'Play again'),
        el('button', { class: 'big-btn secondary', onclick: () => showSubject(childId, subject.id) }, el('span', { class: 'btn-pic' }, '🎮'), 'More games'),
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
  // A ring fills around the gear while it is held, so a grown-up can see it working.
  const start = e => { e.preventDefault(); btn.classList.add('holding'); timer = setTimeout(() => { btn.classList.remove('holding'); showGate(); }, 2000); };
  const stop = () => { clearTimeout(timer); btn.classList.remove('holding'); };
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', stop);
  btn.addEventListener('pointerleave', stop);
  btn.addEventListener('pointercancel', stop);
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
    hasPin() ? null : el('p', { class: 'pin-nudge' }, '🔒 No parent PIN is set yet, so this area is only protected by a sum. Set a PIN below to keep the children out.'),
    el('p', { class: 'note' }, 'Tap a picture to add a photo. Change names and age groups here too. Changes save straight away. Photos and progress stay on this tablet only.'),
    overviewPanel(),
    el('div', { class: 'parent-list' }, state.children.map(child => {
      // Tap the picture to choose a photo (camera or gallery).
      const file = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
      const avatarBtn = el('button', { class: 'avatar-btn', 'aria-label': 'Choose a photo', onclick: () => file.click() }, avatarEl(child));
      file.addEventListener('change', async () => {
        if (!file.files[0]) return;
        const old = child.photo;
        try {
          const picked = await cropPhoto(file.files[0]);
          file.value = '';
          if (!picked) return; // cancelled: keep the old picture
          child.photo = picked;
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
      const maths = el('select', { 'aria-label': 'Maths level' },
        child.band === 'little' ? [el('option', { value: '1' }, 'Maths: Little Stars')] : Object.entries(MATHS_LEVELS).map(([id, label]) => {
          const o = el('option', { value: id }, `Maths now: ${label}`);
          if (+id === mathsLevelOf(child)) o.selected = true;
          return o;
        }));
      if (child.band === 'little') maths.disabled = true;
      maths.addEventListener('change', () => { child.mathsLevel = +maths.value; child.mathsTrend = 0; saveState(state); });
      return el('div', { class: 'parent-row' },
        avatarBtn, file, name, band, maths, emojiBtn,
        el('button', { class: 'big-btn small-btn', onclick: () => showProgress(child.id) }, '📊 Progress'),
        el('span', { class: 'note' }, `⭐ ${child.stars} · Level ${levelOf(child.stars)}`));
    })),
    rewardsPanel(),
    pinPanel(),
    voicePanel(),
    calmPanel(),
    el('div', {},
      el('button', { class: 'big-btn secondary', onclick: () => {
        if (confirmReset()) { resetState(); state = loadState(); showParent(); }
      } }, 'Reset all progress')),
  );
}

/* ---------- Progress report (parent area) ----------
   Right and wrong answers counted by stats.js, per game and per day.
   "Right" is answers right, "mistakes" is wrong taps, so accuracy is
   right / (right + mistakes). Only games with right/wrong answers count. */
const pct = (r, w) => (r + w ? Math.round((100 * r) / (r + w)) : null);
const sum = obj => Object.values(obj).reduce((t, [r, w, p]) => [t[0] + r, t[1] + w, t[2] + p], [0, 0, 0]);
const gameName = id => { const g = GAMES.find(x => x.id === id); return g ? `${g.emoji} ${g.title}` : id; };

function showProgress(childId) {
  const child = findChild(childId);
  const now = today();
  const thisWeek = totals(child, daysAgo(6), now);
  const lastWeek = totals(child, daysAgo(13), daysAgo(7));
  const month = totals(child, daysAgo(27), now);
  const [tr, tw, tp] = sum(thisWeek), [lr, lw, lp] = sum(lastWeek);
  const tPct = pct(tr, tw), lPct = pct(lr, lw);

  const card = (label, value, sub) => el('div', { class: 'stat-card' },
    el('div', { class: 'stat-label' }, label), el('div', { class: 'stat-value' }, value), sub ? el('div', { class: 'note' }, sub) : null);
  let trend = 'Not enough to compare yet';
  if (tPct != null && lPct != null) {
    const d = tPct - lPct;
    trend = d >= 3 ? `⬆️ Up ${d}% on last week` : d <= -3 ? `⬇️ Down ${-d}% on last week` : '➡️ About the same as last week';
  }
  const summary = el('div', { class: 'stat-cards' },
    card('This week: questions right', String(tr), `${tw} mistakes · ${tp} games played`),
    card('This week: accuracy', tPct == null ? '–' : `${tPct}%`, trend),
    card('Last week', lPct == null ? '–' : `${lPct}%`, `${lr} right · ${lw} mistakes · ${lp} games`));

  // Needs practice / doing well, from the last 4 weeks (games with at least 10 answers).
  const ranked = Object.entries(month).map(([g, [r, w]]) => ({ g, r, w, p: pct(r, w) }))
    .filter(x => x.r + x.w >= 10).sort((a, b) => a.p - b.p);
  const weak = ranked.filter(x => x.p < 80).slice(0, 3);
  const strong = ranked.filter(x => x.p >= 90).reverse().slice(0, 3);
  const chips = (list, cls) => list.map(x => el('span', { class: `chip ${cls}` }, `${gameName(x.g)} ${x.p}%`));
  const focus = el('div', { class: 'parent-row report-box' },
    el('h2', {}, '🎯 Needs practice'),
    el('div', { class: 'chips' }, weak.length ? chips(weak, 'weak') : el('span', { class: 'note' }, ranked.length ? 'Nothing under 80%. Great work!' : 'Needs a few more games first (10+ answers in a game).')),
    el('h2', {}, '🌟 Doing well'),
    el('div', { class: 'chips' }, strong.length ? chips(strong, 'strong') : el('span', { class: 'note' }, 'Nothing at 90% or above yet.')));

  // Each subject and game: last 4 weeks, this week, last week.
  const bar = p => el('div', { class: 'bar' }, el('span', { style: `width:${p ?? 0}%;background:${p == null ? '#cbd5e1' : p >= 85 ? 'var(--green)' : p >= 70 ? 'var(--gold)' : '#ef4444'}` }));
  const cell = (r, w) => { const p = pct(r, w); return p == null ? '–' : `${p}%`; };
  const rows = [];
  for (const sub of SUBJECTS) {
    const ids = sub.games.filter(g => !g.noStats).map(g => g.id);
    const m = ids.map(id => month[id] || [0, 0, 0]);
    const [mr, mw, mp] = m.reduce((t, x) => [t[0] + x[0], t[1] + x[1], t[2] + x[2]], [0, 0, 0]);
    if (!mp && !mr && !mw) continue;
    const tw2 = ids.map(id => thisWeek[id] || [0, 0]).reduce((t, x) => [t[0] + x[0], t[1] + x[1]], [0, 0]);
    const lw2 = ids.map(id => lastWeek[id] || [0, 0]).reduce((t, x) => [t[0] + x[0], t[1] + x[1]], [0, 0]);
    rows.push(el('tr', { class: 'subject-row' }, el('td', {}, `${sub.emoji} ${sub.name}`), el('td', {}, String(mr + mw)),
      el('td', {}, bar(pct(mr, mw)), cell(mr, mw)), el('td', {}, cell(...tw2)), el('td', {}, cell(...lw2))));
    for (const id of ids) {
      const [r, w, p] = month[id] || [0, 0, 0];
      if (!r && !w && !p) continue;
      rows.push(el('tr', {}, el('td', { class: 'game-cell' }, gameName(id)), el('td', {}, String(r + w)),
        el('td', {}, bar(pct(r, w)), cell(r, w)), el('td', {}, cell(...(thisWeek[id] || [0, 0]))), el('td', {}, cell(...(lastWeek[id] || [0, 0])))));
    }
  }
  const table = el('div', { class: 'parent-row report-box' },
    el('h2', {}, '📚 By subject and game (last 4 weeks)'),
    rows.length ? el('table', { class: 'report' },
      el('thead', {}, el('tr', {}, ...['', 'Answers', 'Accuracy', 'This week', 'Last week'].map(h => el('th', {}, h)))),
      el('tbody', {}, rows)) : el('p', { class: 'note' }, 'No games played yet.'));

  // Week by week, last 4 weeks.
  const weeks = [0, 1, 2, 3].map(i => {
    const from = daysAgo(7 * i + 6), to = daysAgo(7 * i);
    const [r, w, p] = sum(totals(child, from, to));
    const label = i === 0 ? 'This week' : i === 1 ? 'Last week' : `${i} weeks ago`;
    return el('tr', {}, el('td', {}, label), el('td', {}, String(p)), el('td', {}, String(r)), el('td', {}, String(w)), el('td', {}, bar(pct(r, w)), cell(r, w)));
  });
  const weekly = el('div', { class: 'parent-row report-box' },
    el('h2', {}, '📅 Week by week'),
    el('table', { class: 'report' },
      el('thead', {}, el('tr', {}, ...['', 'Games', 'Right', 'Mistakes', 'Accuracy'].map(h => el('th', {}, h)))),
      el('tbody', {}, weeks)));

  // Questions missed most (last 4 weeks).
  const missed = missedSince(child, daysAgo(27)).slice(0, 12);
  const missedBox = el('div', { class: 'parent-row report-box' },
    el('h2', {}, '❌ Questions missed most (last 4 weeks)'),
    missed.length ? el('table', { class: 'report' },
      el('thead', {}, el('tr', {}, ...['Question', 'Right answer', 'Missed', 'Game'].map(h => el('th', {}, h)))),
      el('tbody', {}, missed.map(m => el('tr', {}, el('td', {}, m.q), el('td', {}, m.answer ?? '–'), el('td', {}, `${m.n}×`), el('td', { class: 'game-cell' }, gameName(m.gameId))))))
      : el('p', { class: 'note' }, 'No missed questions yet.'));

  app.replaceChildren(
    el('div', { class: 'topbar' },
      el('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: showParent }, '⬅️'),
      el('h1', {}, `📊 ${child.name}'s progress`),
    ),
    el('p', { class: 'note' }, 'Counts every right answer and every mistake in games with questions (not colouring, drawing, jigsaw or memory). Kept on this tablet only.'),
    summary, focus, table, weekly, missedBox,
  );
  app.scrollTop = 0; window.scrollTo(0, 0);
}

/* All the children side by side: this week against last week. Tap a row for the full report. */
function overviewPanel() {
  const now = today();
  const rows = state.children.map(child => {
    const [tr, tw, tp] = sum(totals(child, daysAgo(6), now));
    const [lr, lw] = sum(totals(child, daysAgo(13), daysAgo(7)));
    const tP = pct(tr, tw), lP = pct(lr, lw);
    const d = tP != null && lP != null ? tP - lP : null;
    const trend = d == null ? '–' : d >= 3 ? `⬆️ ${d}%` : d <= -3 ? `⬇️ ${-d}%` : '➡️ same';
    const weak = Object.entries(totals(child, daysAgo(27), now)).map(([g, [r, w]]) => ({ g, n: r + w, p: pct(r, w) }))
      .filter(x => x.n >= 10 && x.p < 80).sort((a, b) => a.p - b.p)[0];
    return el('tr', { class: 'overview-row', onclick: () => showProgress(child.id) },
      el('td', {}, el('strong', {}, child.name)), el('td', {}, String(tp)), el('td', {}, String(tr)),
      el('td', {}, tP == null ? '–' : `${tP}%`), el('td', {}, trend),
      el('td', { class: 'game-cell' }, weak ? `${gameName(weak.g)} ${weak.p}%` : '–'),
      el('td', {}, `Level ${levelOf(child.stars)}`));
  });
  return el('div', { class: 'parent-row report-box' },
    el('h2', {}, '👨‍👩‍👧‍👦 This week at a glance'),
    el('table', { class: 'report' },
      el('thead', {}, el('tr', {}, ...['', 'Games', 'Right', 'Accuracy', 'vs last week', 'Needs practice', ''].map(h => el('th', {}, h)))),
      el('tbody', {}, rows)),
    el('p', { class: 'note', style: 'margin:0' }, 'Last 7 days. Tap a row for the full report.'));
}

/* Calm mode: stops the bobbing, pulsing and wobbling for a child who finds it too much. */
function calmPanel() {
  const box = el('input', { type: 'checkbox', style: 'width:1.8rem;height:1.8rem' });
  box.checked = !!state.calm;
  box.addEventListener('change', () => { state.calm = box.checked; saveState(state); applyCalm(); });
  return el('div', { class: 'parent-row', style: 'flex-direction:column;align-items:stretch' },
    el('strong', { style: 'font-size:1.4rem' }, '🧘 Calm mode'),
    el('label', { style: 'display:flex;align-items:center;gap:.8rem;font-size:1.2rem' }, box, 'Turn off bobbing, pulsing and wobbling on every screen'));
}

/* Real-life rewards: what each tier earns, and who is waiting for theirs. */
function rewardsPanel() {
  state.rewards ??= [];
  const rows = DEFAULT_REWARDS.map((_, i) => {
    const t = i + 1, info = tierInfo(t);
    const input = el('input', { value: rewardFor(state, t), maxlength: 60, 'aria-label': `${info.name} reward`, style: 'flex:1;min-width:12rem' });
    input.addEventListener('input', () => { state.rewards[i] = input.value.trim(); saveState(state); });
    return el('label', { class: 'reward-row' }, el('span', {}, `${info.icon} ${info.name} (level ${t * LEVELS_PER_TIER})`), input);
  });
  const waiting = state.children.flatMap(c => pendingRewards(c).map(r => ({ c, r })));
  return el('div', { class: 'parent-row', style: 'flex-direction:column;align-items:stretch' },
    el('strong', { style: 'font-size:1.4rem' }, '🎁 Real-life rewards'),
    el('p', { class: 'note', style: 'margin:0' }, `Stars build up levels. Every ${LEVELS_PER_TIER} levels is a new tier, and the child earns the reward you set here. Level 5 takes about a week of daily play, level 10 about 3 weeks, level 15 about 6 weeks.`),
    ...rows,
    waiting.length
      ? el('div', {}, el('strong', {}, 'Waiting for their reward:'), ...waiting.map(({ c, r }) =>
        el('div', { class: 'row', style: 'justify-content:space-between' },
          el('span', {}, `${c.name}: ${tierInfo(r.tier).icon} ${rewardFor(state, r.tier)} (earned ${r.date})`),
          el('button', { class: 'big-btn small-btn', onclick: () => { r.given = true; r.givenDate = new Date().toLocaleDateString('en-CA'); saveState(state); showParent(); } }, 'Mark given'))))
      : el('p', { class: 'note', style: 'margin:0' }, 'No rewards waiting right now.'));
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

/* ---------- Opening screen ----------
   Tablets only allow sound after the first tap, so the app opens on
   an animated welcome with one big button. The tap plays Noor
   Learning's own little jingle and Kasem says salam. */
function showSplash() {
  setBg('home');
  const title = 'Noor Learning'.split('').map((ch, i) =>
    el('span', { class: 'splash-letter', style: `animation-delay:${0.5 + i * 0.06}s` }, ch === ' ' ? '\u00a0' : ch));
  const go = el('button', { class: 'big-btn splash-go', 'aria-label': 'Start' }, '▶ Play');
  const screen = el('div', { class: 'splash', onclick: start },
    el('div', { class: 'splash-sparkles' }, Array.from({ length: 14 }, (_, i) =>
      el('span', { style: `left:${(i * 37) % 100}%;top:${(i * 53) % 90}%;animation-delay:${(i % 7) * 0.4}s` }, i % 3 ? '✨' : '⭐'))),
    kasem('hi', 'splash-kasem'),
    el('h1', { class: 'splash-title' }, title),
    go);
  app.replaceChildren(screen);
  let started = false;
  function start() {
    if (started) return;
    started = true;
    sfx.intro();
    screen.classList.add('leaving');
    setTimeout(() => { showWho(); speak('Assalamu alaikum! Who’s playing today?'); }, 900);
  }
}

showSplash();
