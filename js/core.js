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
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(KEY);
}

/* ---------- Speech ----------
   Uses the tablet's built-in voice. Prefers an Australian or British
   English voice when the tablet has one. Later, a parent's own recordings
   can replace this. */
let voice = null;
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  voice =
    voices.find(v => v.lang === 'en-AU') ||
    voices.find(v => v.lang === 'en-GB') ||
    voices.find(v => v.lang.startsWith('en')) ||
    null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel(); // never talk over ourselves
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice ? voice.lang : 'en-AU';
  u.rate = 0.9;   // a little slower for young listeners
  u.pitch = 1.1;
  speechSynthesis.speak(u);
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

export const sfx = {
  tap()     { tone(660, 0, 0.12, 'triangle', 0.1); },
  right()   { tone(784, 0, 0.18); tone(1047, 0.12, 0.3); },
  tryAgain(){ tone(330, 0, 0.2, 'triangle', 0.12); tone(294, 0.15, 0.25, 'triangle', 0.12); },
  win()     { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.4)); },
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
  }
  return node;
}

/** A short message at the bottom of the screen, e.g. "Try again!" */
export function toast(text, ms = 1400) {
  document.querySelector('.toast')?.remove();
  const t = el('div', { class: 'toast' }, text);
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

/** Kind words for a right answer, chosen at random. */
export const PRAISE = ['MashaAllah!', 'Well done!', 'Great job!', 'Excellent!', 'Alhamdulillah!'];

/* ---------- Grown-up check ----------
   A pop-over sum (e.g. 7 × 8). Resolves true if answered right.
   Used where a parent needs to approve something, like a surah badge. */
export function askGrownUp(message = 'Grown-ups only') {
  return new Promise(resolve => {
    const a = 6 + Math.floor(Math.random() * 7);
    const b = 5 + Math.floor(Math.random() * 8);
    const input = el('input', { type: 'number', inputmode: 'numeric', class: 'gate-input' });
    const close = ok => { overlay.remove(); resolve(ok); };
    const overlay = el('div', { class: 'overlay' },
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
