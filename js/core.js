/* =========================================================
   core.js: small shared helpers used by the app and every game.
   - storage (progress saved on this tablet only)
   - speech (reads instructions aloud)
   - sounds (made in code, no audio files needed)
   - tiny DOM helpers
   ========================================================= */

/* ---------- Age bands ----------
   Every game says which bands it supports, and adapts to the band. */
export const BANDS = {
  little:   { name: 'Little Stars', ages: 'Age 3' },
  explorer: { name: 'Explorers',    ages: 'Ages 6–7' },
  champion: { name: 'Champions',    ages: 'Age 9' },
};

/* ---------- Storage ----------
   Everything lives in localStorage on the tablet. Nothing is sent anywhere. */
const KEY = 'noor-learning:v1';

const DEFAULT_STATE = {
  children: [
    { id: 'c1', name: 'Child 1', avatar: '🌙', band: 'champion', stars: 0, played: {} },
    { id: 'c2', name: 'Child 2', avatar: '⭐', band: 'explorer', stars: 0, played: {} },
    { id: 'c3', name: 'Child 3', avatar: '🌸', band: 'explorer', stars: 0, played: {} },
    { id: 'c4', name: 'Child 4', avatar: '🐣', band: 'little',   stars: 0, played: {} },
  ],
};

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Array.isArray(saved.children)) return saved;
  } catch { /* corrupted or missing: fall back to defaults */ }
  return structuredClone(DEFAULT_STATE);
}

export function saveState(state) {
  // A full tablet must never crash a game: keep playing and try again next save.
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full */ }
}

export function resetState() {
  localStorage.removeItem(KEY);
}

/* ---------- Speech ----------
   Two kinds of voice:
   1. Natural voice (default): pre-recorded clips of every fixed line, in
      audio/*.mp3, listed in audio/voice.json as { "exact text": "file" }.
   2. The tablet's built-in voices, chosen in the parent area.
   speak() takes one line or a list of lines and says them in order.
   A line with no recorded clip falls back to the tablet voice
   (e.g. maths questions, which change every game). */
const VOICE_KEY = 'noor-learning:voice';
export const NATURAL = '__natural__';
export let voiceSettings = { name: NATURAL, rate: 0.9, pitch: 1.1 };
try { Object.assign(voiceSettings, JSON.parse(localStorage.getItem(VOICE_KEY)) || {}); } catch { /* defaults */ }

let clips = {};
fetch('audio/voice.json').then(r => (r.ok ? r.json() : {})).then(m => { clips = m; setTimeout(saveClipsForOffline, 30000); }).catch(() => {});

/* Quietly save every voice clip on the tablet, a few at a time, so the
   voice still works with no wifi. The service worker keeps each clip it
   sees. Skipped on data-saver connections; picks up where it left off. */
async function saveClipsForOffline() {
  if (!('caches' in window) || !navigator.serviceWorker?.controller || navigator.connection?.saveData) return;
  try {
    const cache = await caches.open('noor-v1');
    const have = new Set((await cache.keys()).map(r => new URL(r.url).pathname.split('/').pop()));
    // A clip that was re-recorded is listed in audio/rev.json with a number. If the
    // number is new to this tablet, throw the saved copy away so it is fetched again.
    const rev = await fetch('audio/rev.json').then(r => (r.ok ? r.json() : {})).catch(() => ({}));
    const seen = JSON.parse(localStorage.getItem('noor-clip-rev') || '{}');
    for (const [f, n] of Object.entries(rev)) {
      if (seen[f] === n || !navigator.onLine) continue;
      await cache.delete(new URL(`audio/${f}`, location.href).href);
      const res = await fetch(`audio/${f}`, { cache: 'reload' }).catch(() => null);
      if (res?.ok) { seen[f] = n; have.add(f); }
    }
    localStorage.setItem('noor-clip-rev', JSON.stringify(seen));
    const todo = [...new Set(Object.values(clips))].filter(f => !have.has(f));
    for (let i = 0; i < todo.length; i += 3) {
      if (!navigator.onLine) return;
      await Promise.all(todo.slice(i, i + 3).map(f => fetch(`audio/${f}`).catch(() => {})));
      await new Promise(r => setTimeout(r, 250));
    }
  } catch { /* try again next time the app opens */ }
}

let voice = null;
/** English voices installed on this tablet. */
export function englishVoices() {
  return 'speechSynthesis' in window
    ? speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith('en'))
    : [];
}
function pickVoice() {
  const voices = englishVoices();
  voice =
    voices.find(v => v.name === voiceSettings.name) ||
    voices.find(v => v.lang === 'en-AU') ||
    voices.find(v => v.lang === 'en-GB') ||
    voices[0] ||
    null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

/** Save a new voice choice: { name, rate, pitch } (any of them). */
export function setVoice(changes) {
  Object.assign(voiceSettings, changes);
  localStorage.setItem(VOICE_KEY, JSON.stringify(voiceSettings));
  pickVoice();
}

const clipPlayer = new Audio();
let speakRun = 0; // bumps on every new speak() so old ones stop
let endClip = null; // finishes the clip that is playing, if it gets stopped

/** Stop anything being said right now. */
export function stopSpeech() {
  firstLine = null;
  speakRun++;
  clipPlayer.pause();
  endClip?.();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

/** True if a recorded clip exists for this exact line. */
export const hasClip = line => Boolean(clips[line]);

function playClip(file) {
  return new Promise(done => {
    const resolve = () => { if (endClip === resolve) endClip = null; done(); };
    endClip = resolve;
    clipPlayer.src = `audio/${file}`;
    clipPlayer.playbackRate = 1;
    clipPlayer.onended = resolve;
    // Could not load (no wifi and not saved yet): report it so the tablet voice can step in.
    const failed = () => { if (endClip === resolve) endClip = null; done(false); };
    clipPlayer.onerror = failed;
    clipPlayer.play().catch(e => (e?.name === 'NotSupportedError' ? failed() : resolve()));
  });
}

function sayWithTablet(text) {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : 'en-AU';
    u.rate = voiceSettings.rate;
    u.pitch = voiceSettings.pitch;
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

/** Say one line, or several lines in order: speak('Hi') or speak(['Well done!', 'Next one.']) */
export async function speak(lines) {
  const lead = firstLine;
  stopSpeech();
  const run = speakRun;
  for (const line of [lead].concat(lines).filter(Boolean)) {
    if (run !== speakRun) return;
    if (voiceSettings.name === NATURAL && clips[line]) {
      const played = await playClip(clips[line]);
      if (played === false && run === speakRun) await sayWithTablet(line);
    } else await sayWithTablet(line);
  }
}

/* A line to say before whatever is spoken next (a game's name, for a child
   who can't read the tile). If nothing else is said soon, it is said alone. */
let firstLine = null;
export function sayFirst(line) {
  firstLine = line;
  setTimeout(() => { if (firstLine === line) speak([]); }, 700);
}

/**
 * Say the lines, then resolve once they have finished, plus a short pause.
 * Games wait on this before moving on, so Miriam is never cut off mid-sentence.
 * minMs: wait at least this long in total. Gives up after 20 seconds just in case.
 */
export function speakThen(lines, minMs = 1200) {
  const t0 = performance.now();
  const spoken = Promise.race([speak(lines), new Promise(r => setTimeout(r, 20000))]);
  return spoken.then(() => new Promise(r =>
    setTimeout(r, Math.max(400, minMs - (performance.now() - t0)))));
}

/* ---------- Sounds ----------
   Gentle tones made with the Web Audio API, so there are no sound files. */
let audioCtx = null;
function tone(freq, start, length, type = 'sine', volume = 0.18) {
  audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
  const t = audioCtx.currentTime + start;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + length);
}

/* "right" and "try again" also tell Kasem (the corner buddy) to react. */
const mood = m => document.dispatchEvent(new CustomEvent('kasem', { detail: m }));
/* Every right or wrong answer is also an 'answer' event, which stats.js counts. */
const answered = (ok, info) => document.dispatchEvent(new CustomEvent('answer', { detail: { ok, info } }));

/* A quick upward or downward slide in pitch (for pops and whooshes). */
function slide(from, to, length, type = 'sine', volume = 0.15) {
  audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + length);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + length);
}

export const sfx = {
  tap()     { tone(660, 0, 0.12, 'triangle', 0.1); },
  right(info)   { tone(784, 0, 0.18); tone(1047, 0.12, 0.3); mood('right'); answered(true, info); },
  tryAgain(info){ tone(330, 0, 0.2, 'triangle', 0.12); tone(294, 0.15, 0.25, 'triangle', 0.12); mood('wrong'); answered(false, info); },
  win()     { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.4)); },
  pop()     { slide(900, 1800, 0.08, 'square', 0.06); tone(1400, 0.03, 0.12, 'sine', 0.08); },
  whoosh()  { slide(300, 1200, 0.35, 'sawtooth', 0.04); },
  chest()   { [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, i * 0.09, 0.5, 'triangle', 0.12)); },
  // Noor Learning's own opening jingle: a bright rising chime that lands on a sparkle.
  intro()   {
    [[523, 0], [659, .12], [784, .24], [1047, .36], [988, .56], [1175, .68], [1568, .86]].forEach(([f, t], i) =>
      tone(f, t, i === 6 ? 1.1 : 0.45, 'triangle', 0.13));
    [2093, 2637, 3136].forEach((f, i) => tone(f, 1.0 + i * 0.07, 0.6, 'sine', 0.05));
    slide(400, 1600, 0.5, 'sine', 0.05);
  },
  boing()   { slide(220, 520, 0.18, 'triangle', 0.12); },
};

/* ---------- DOM helpers ---------- */

/** Create an element: el('button', {class: 'x', onclick: fn}, 'text', childEl) */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue; // skip empty attributes
    if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    // Mark Arabic text as Arabic, for screen readers and the right letter shapes.
    if (typeof c === 'string' && /[\u0600-\u06FF]/.test(c) && !/[A-Za-z]/.test(c) && !node.lang) node.lang = 'ar';
  }
  return node;
}

/** A short message at the bottom of the screen, e.g. "Try again!" */
export function toast(text, ms = 1400, cls = '') {
  document.querySelector('.toast')?.remove();
  const t = el('div', { class: `toast ${cls}` }, text);
  document.body.append(t);
  setTimeout(() => t.remove(), ms);
}

/** Shake an element gently (used for a wrong tap, never a buzzer). */
export function wiggle(node) {
  node.classList.remove('wiggle');
  void node.offsetWidth; // restart the animation
  node.classList.add('wiggle');
}

/** Return a shuffled copy of an array. */
export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Random pick from an array. */
export const pick = list => list[Math.floor(Math.random() * list.length)];

/** Kind words for a right answer, chosen at random.
    MashaAllah and Alhamdulillah are only used in the Islam games (see usePraise). */
const GENERAL_PRAISE = ['Well done!', 'Great job!', 'Excellent!', 'Amazing!'];
const ISLAMIC_PRAISE = ['MashaAllah!', 'Alhamdulillah!', 'Well done!', 'Great job!'];
export const PRAISE = [...GENERAL_PRAISE];
/** Called when a game starts: islamic = true for the Islam subject. */
export function usePraise(islamic) {
  PRAISE.splice(0, PRAISE.length, ...(islamic ? ISLAMIC_PRAISE : GENERAL_PRAISE));
}

/* Words that mark a question as Islamic, wherever it appears (manners, maths, etc). */
const ISLAMIC_WORDS = /\b(allah|alhamdulillah|bismillah|bismika|insha'?allah|masha'?allah|subhan|yarhamuk|jazak|assalamu|salam|dua|duas|salah|rakah|wudu|quran|qur'an|prophet|muslims?|mosque|masjid|eid|ramadan|fajr|dhuhr|asr|maghrib|isha|kaaba|makkah|hajj|zakat|sawm)\b/i;

/** Praise for a right answer. Islamic praise if the question is Islamic. */
export function praiseFor(...texts) {
  return pick(ISLAMIC_WORDS.test(texts.filter(Boolean).join(' ')) ? ISLAMIC_PRAISE : PRAISE);
}

/* ---------- Grown-up check ----------
   If a parent PIN is set, asks for it on a number pad.
   If not, asks a sum instead (e.g. 7 × 8).
   Resolves true if answered right.
   It guards the parent area and things a parent must approve, like a surah badge.
   The PIN is never stored itself: only a salted hash is kept, on this tablet only. */
const PIN_KEY = 'noor-learning:pin';
const LOCK_KEY = 'noor-learning:pin-lock';
const MAX_TRIES = 5;          // wrong tries before a short lock-out
const LOCK_MS = 60 * 1000;    // lock-out length

export const hasPin = () => !!localStorage.getItem(PIN_KEY);
export const clearPin = () => localStorage.removeItem(PIN_KEY);

async function hashPin(pin, salt) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function setPin(pin) {
  const salt = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
  localStorage.setItem(PIN_KEY, JSON.stringify({ salt, hash: await hashPin(pin, salt) }));
}
async function pinMatches(pin) {
  try {
    const { salt, hash } = JSON.parse(localStorage.getItem(PIN_KEY));
    return (await hashPin(pin, salt)) === hash;
  } catch { return false; }
}

/** A 4-digit number pad. onDone(pin) gets the digits; return false to clear and shake. */
export function pinPad(message, onDone, onCancel) {
  let digits = '';
  const dots = el('div', { class: 'pin-dots' }, [0, 1, 2, 3].map(() => el('span')));
  const msg = el('p', { class: 'note', style: 'margin:0;text-align:center' }, message);
  const draw = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < digits.length));
  const press = async k => {
    if (k === '⌫') digits = digits.slice(0, -1);
    else if (digits.length < 4) digits += k;
    draw();
    if (digits.length === 4) {
      const ok = await onDone(digits);
      if (ok === false) { wiggle(dots); digits = ''; setTimeout(draw, 300); }
    }
  };
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  const pad = el('div', { class: 'pin-pad' }, keys.map(k =>
    k ? el('button', { class: 'pin-key', 'aria-label': k === '⌫' ? 'Delete' : k, onclick: () => press(k) }, k) : el('span')));
  const box = el('div', { class: 'math-gate panel' }, msg, dots, pad,
    el('button', { class: 'big-btn secondary', onclick: onCancel }, 'Cancel'));
  box.setMessage = text => { msg.textContent = text; };
  return box;
}

export function askGrownUp(message = 'Grown-ups only') {
  return new Promise(resolve => {
    let overlay;
    const close = ok => { overlay.remove(); resolve(ok); };
    if (hasPin()) {
      const box = pinPad(`${message}: enter the parent PIN`, async pin => {
        const lock = JSON.parse(localStorage.getItem(LOCK_KEY) || '{"tries":0,"until":0}');
        if (Date.now() < lock.until) { box.setMessage('Too many tries. Wait a minute and try again.'); return false; }
        if (await pinMatches(pin)) { localStorage.removeItem(LOCK_KEY); close(true); return true; }
        lock.tries++;
        if (lock.tries >= MAX_TRIES) { lock.tries = 0; lock.until = Date.now() + LOCK_MS; box.setMessage('Too many tries. Wait a minute and try again.'); }
        else box.setMessage('Wrong PIN. Try again.');
        localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
        return false;
      }, () => close(false));
      overlay = el('div', { class: 'overlay' }, box);
      document.body.append(overlay);
      return;
    }
    // No PIN yet: a sum that is too hard for the children to do in their heads.
    const a = 13 + Math.floor(Math.random() * 16);
    const b = 13 + Math.floor(Math.random() * 16);
    const input = el('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', class: 'gate-input', 'aria-label': 'Answer' });
    overlay = el('div', { class: 'overlay' },
      el('div', { class: 'math-gate panel' },
        el('p', { class: 'note' }, message),
        el('div', { class: 'q' }, `${a} × ${b} = ?`),
        input,
        el('div', { class: 'row' },
          el('button', { class: 'big-btn', onclick: () => close(Number(input.value) === a * b) }, 'Enter'),
          el('button', { class: 'big-btn secondary', onclick: () => close(false) }, 'Cancel'))));
    document.body.append(overlay);
    input.focus();
  });
}
