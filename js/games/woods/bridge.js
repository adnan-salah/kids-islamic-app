/* =========================================================
   Smartspace activity 1: Bridge for Bunny (length and fitting).
   Pieces go into places, then the child tries it. Three rounds.
   Nothing here can be lost: a build that does not work does
   something funny and the piece comes back.
   ========================================================= */
import { el, speak } from '../../core.js';
import { makePuzzle, check, spansOf } from './bridge-puzzles.js';
import { play } from './sfx.js';

const ROUNDS = 3;
const SAY = {
  T: ['Bunny wants the carrots. Put the log across!', 'Which one makes a bridge?', 'Which log is long enough?'],
  A: ['Bunny needs a bridge. Count the steps!', 'The stream is wider now. Count again!', 'Wider again! Which plank fits?'],
  B: ['No plank is long enough. Use the rocks to help.', 'Pick planks that fit between the rocks.', 'Three gaps this time. Some planks do not fit.'],
  C: ['Bunny, Duck and Bear all need to cross. Bear is heavy!', 'Put rocks in the stream, then lay your planks.', 'The widest stream yet. Can you do it with three pieces?'],
};
const SHOW_A = ['Count the steps!', 'Count again!', 'Which plank fits?']; // ages 5-6: five words at most on screen
const PROBLEM = {
  gap: 'There is still a gap.', short: 'Too short! Splash!', long: 'Too long! It wobbles.',
  bend: 'The plank bends under Bear. He steps back.', leaf: 'Oops! The leaf floated away.',
};
const WIN = { T: 'Hop, hop, hop! Bunny made it!', A: 'Well done! Bunny can cross.', B: 'Well done! Bunny can cross.', C: 'Well done! Everyone can cross.' };
const HINT = 'Try this one.', SHOW_ME = 'Watch. This one goes here.', CLUE = 'Long planks bend. Try a strong plank or a shorter one.';
const THANKS = 'Thank you for helping Bunny. Helping a friend is a good deed.';
/** Every line this activity speaks, for the voice clip list. */
export const BRIDGE_LINES = [...Object.values(SAY).flat(), ...Object.values(PROBLEM), ...new Set(Object.values(WIN)), HINT, SHOW_ME, CLUE, THANKS];

const wait = ms => new Promise(r => setTimeout(r, ms));

/** band: 'T' | 'A' | 'B' | 'C'. done(stars, message) is called once, after round three. */
export function bridge({ root, band, done }) {
  const little = band === 'T', words = !little;
  let round = 0, totalFails = 0, shownHow = false, mostPieces = 0;
  const alive = () => root.isConnected; // false once the child has left the game

  function playRound() {
    const p = makePuzzle(band, round);
    let rocks = [...p.rocks], placed = [], held = null, glow = null, fails = 0, busy = false, idle = 0;
    const line = SAY[band][round];
    const scene = el('div', { class: 'br-scene' });
    const tray = el('div', { class: 'br-tray' });
    const actions = el('div', { class: 'br-actions' });
    root.replaceChildren(
      el('div', { class: 'prompt' },
        el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(line) }, '🔊'),
        words ? el('p', {}, band === 'A' ? SHOW_A[round] : line) : null, actions),
      tray, scene);
    root.dataset.bridge = band;

    const inTray = piece => !placed.includes(piece);
    const rocksLeft = () => (p.rockCount || 0) - rocks.length;
    // The next right move, for the glow, the hint and "Show me".
    function nextStep() {
      const missing = p.answer.rocks.find(r => !rocks.includes(r));
      if (p.rockCount && missing != null) return { rock: missing };
      const i = p.answer.planks.findIndex((piece, n) => placed[n] !== piece);
      return i < 0 ? null : { piece: p.answer.planks[i], at: i };
    }
    function nudge() { // someone is stuck or idle
      clearTimeout(idle);
      if (little) idle = setTimeout(() => { if (alive() && !busy) { speak(line); nudge(); } }, 8000);
      if (band === 'A') idle = setTimeout(() => { if (alive() && !busy) { glow = nextStep(); draw(); } }, 10000);
    }

    function put(piece, at) {
      if (busy || piece == null) return;
      placed = placed.map(x => (x === piece ? null : x));
      placed[at] = piece; held = null; glow = null;
      if (!little) play('select-item'); // the youngest go straight to the crossing, one sound is enough
      draw(); nudge();
      if (little) tryIt(); // the youngest have no button: the build runs as soon as the piece lands
    }
    function putRock(at) {
      if (busy || rocksLeft() < 1 || rocks.includes(at)) return;
      rocks.push(at); placed = []; held = null; glow = null; // the spaces changed, so planks go back
      play('select-item'); draw();
    }
    function pickUp(piece) {
      if (busy) return;
      const spans = spansOf(p.gap, rocks);
      if (piece !== 'rock' && spans.length === 1) return put(piece, 0); // only one place it can go
      held = held === piece ? null : piece;
      play('tap-light'); draw(); nudge();
    }

    async function tryIt() {
      if (busy) return;
      busy = true; clearTimeout(idle);
      const res = check(p, rocks, placed);
      const empty = !placed.some(Boolean); // pressing Try it with nothing built is not a failed try
      if (!empty) play('whoosh-short');
      if (res.ok) {
        mostPieces = Math.max(mostPieces, rocks.length + placed.filter(Boolean).length);
        scene.classList.add('cross');
        await wait(1700);
        if (!alive()) return;
        play('success-warm-chime');
        await Promise.race([speak(WIN[band]), wait(6000)]);
        if (!alive()) return;
        round++;
        return round < ROUNDS ? playRound() : finish();
      }
      if (!empty) { fails++; totalFails++; }
      scene.dataset.oops = res.problem;
      scene.querySelectorAll('.br-span')[res.at]?.classList.add('oops');
      if (!empty) setTimeout(() => alive() && play('pop-bubble'), 700); // lands with the splash, not the button press
      await Promise.all([wait(1500), Promise.race([speak(PROBLEM[res.problem]), wait(6000)])]);
      if (!alive()) return;
      delete scene.dataset.oops;
      if (res.problem !== 'gap') placed[res.at] = null; // the piece comes back, ready for another go
      busy = false;
      if (little) glow = nextStep();
      draw(); nudge();
    }
    function hint() {
      if (busy) return;
      if (band === 'C' && fails < 5) speak(CLUE); else speak(HINT);
      if (p.rockCount && rocks.some(r => !p.answer.rocks.includes(r))) { rocks = rocks.filter(r => p.answer.rocks.includes(r)); placed = []; } // a rock in the wrong place goes back first
      glow = nextStep() || { go: true }; draw();
    }
    function showMe() {
      if (busy) return;
      const step = nextStep();
      if (!step) { glow = { go: true }; return draw(); }
      shownHow = true; speak(SHOW_ME);
      if (step.rock != null) { rocks = [...p.answer.rocks]; placed = []; draw(); } else put(step.piece, step.at);
    }

    // Drag a piece with a finger; a tap (hardly any movement) selects it instead.
    function draggable(node, piece) {
      let sx, sy, moved = false;
      node.addEventListener('pointerdown', e => { if (busy) return; sx = e.clientX; sy = e.clientY; moved = false; node.setPointerCapture(e.pointerId); nudge(); });
      node.addEventListener('pointermove', e => {
        if (sx == null) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 12) return;
        moved = true; node.classList.add('dragging'); node.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      const drop = e => {
        if (sx == null) return;
        sx = null; node.classList.remove('dragging'); node.style.transform = '';
        if (!moved) return;
        node.style.visibility = 'hidden';
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        node.style.visibility = '';
        const under = hit?.closest('[data-at]');
        if (!under) { if (piece !== 'rock' && hit?.closest('.br-scene') && spansOf(p.gap, rocks).length === 1) put(piece, 0); return; } // one space: anywhere in the picture will do
        if (piece === 'rock') { if (under.classList.contains('br-rockplace')) putRock(+under.dataset.at); }
        else if (under.classList.contains('br-span')) put(piece, +under.dataset.at);
      };
      node.addEventListener('pointerup', drop);
      node.addEventListener('pointercancel', drop);
      node.addEventListener('click', e => { if (moved) { e.stopImmediatePropagation(); moved = false; } }, true);
    }

    const look = (piece, u) => {
      const node = el('span', { class: `br-plank ${piece.kind} ${piece.strong ? 'strong' : ''}`, style: `width:${piece.len * u}px;--u:${u}px` },
        piece.kind === 'leaf' ? '🍃' : null,
        words && band !== 'A' && piece.kind === 'plank' ? el('b', {}, piece.strong ? `${piece.len} strong` : String(piece.len)) : null);
      return node;
    };

    function draw() {
      const W = scene.clientWidth, bank = Math.max(p.heavy ? 240 : 150, (W - p.gap * (little ? 150 : 96)) / 2), u = (W - 2 * bank) / p.gap;
      // pieces wait in the tray at a smaller size, worked out so they always fit on one row
      const steps = p.pieces.reduce((n, piece) => n + piece.len, 0);
      const small = little ? u : Math.min(u * .55, (tray.clientWidth - 60 - p.pieces.length * 24 - (p.rockCount || 0) * 84) / steps);
      const spans = spansOf(p.gap, rocks);
      scene.style.setProperty('--bank', `${bank}px`);
      scene.style.setProperty('--walk', `${W - 2 * bank + 110}px`);
      scene.style.setProperty('--u', `${u}px`);
      const x = n => bank + n * u;
      tray.replaceChildren(
        ...p.pieces.filter(inTray).map(piece => {
          const b = el('button', { class: `br-piece ${held === piece ? 'held' : ''} ${glow?.piece === piece ? 'glow' : ''}`,
            'aria-label': piece.kind === 'leaf' ? 'Leaf' : `${piece.strong ? 'Strong plank' : 'Plank'}, ${piece.len} step${piece.len > 1 ? 's' : ''} long`,
            onclick: () => pickUp(piece) }, look(piece, small));
          draggable(b, piece);
          return b;
        }),
        ...Array.from({ length: Math.max(0, rocksLeft()) }, () => {
          const b = el('button', { class: `br-piece ${held === 'rock' ? 'held' : ''} ${glow?.rock != null ? 'glow' : ''}`, 'aria-label': 'Rock', onclick: () => pickUp('rock') }, el('span', { class: 'br-rockpic' }));
          draggable(b, 'rock');
          return b;
        }));
      scene.replaceChildren(
        el('div', { class: 'br-bank left' }, el('span', { class: `br-animals ${p.heavy ? 'three' : ''}` }, ...(p.heavy ? ['bear', 'duck'] : []).concat('bunny').map(n => el('img', { src: `img/art/woods-${n}.png`, alt: n })))),
        el('div', { class: 'br-bank right' }, el('span', { class: 'br-goal' }, el('img', { src: 'img/art/woods-carrots.png', alt: 'Carrots' }))),
        el('div', { class: 'br-water' }, little ? null : Array.from({ length: p.gap }, (_, i) => el('i', {}, String(i + 1)))),
        ...(p.rockCount ? Array.from({ length: p.gap - 1 }, (_, i) => i + 1).filter(n => !rocks.includes(n)).map(n =>
          el('button', { class: `br-rockplace ${glow?.rock === n || held === 'rock' ? 'glow' : ''}`, 'data-at': n, style: `left:${x(n)}px`, 'aria-label': `Put a rock at step ${n}`,
            onclick: () => putRock(n) })) : []),
        ...rocks.map(n => el(p.rockCount ? 'button' : 'span', { class: 'br-rock', style: `left:${x(n)}px`, 'aria-label': p.rockCount ? `Rock at step ${n}. Take it out` : null,
          onclick: p.rockCount ? () => { if (!busy) { rocks = rocks.filter(r => r !== n); placed = []; play('tap-light'); draw(); } } : null })),
        ...spans.map(([from, to], i) =>
          el('button', { class: `br-span ${glow?.at === i ? 'glow' : ''}`, 'data-at': i, style: `left:${x(from)}px;width:${(to - from) * u}px`,
            'aria-label': placed[i] ? `Space ${i + 1}: take the plank back` : `Space ${i + 1}, ${to - from} step${to - from > 1 ? 's' : ''} wide`,
            onclick: () => { if (busy) return; if (held && held !== 'rock') put(held, i); else if (placed[i]) { placed[i] = null; play('tap-light'); draw(); } else if (glow?.at === i) put(glow.piece, i); } },
            placed[i] ? look(placed[i], u) : null)));
      actions.replaceChildren(...[
        fails >= 5 && !little ? el('button', { class: 'big-btn secondary', onclick: showMe }, el('span', { class: 'btn-pic' }, '👆'), 'Show me') : null,
        fails >= 3 && !little ? el('button', { class: 'big-btn secondary', onclick: hint }, el('span', { class: 'btn-pic' }, '💡'), 'Hint') : null,
        little ? null : el('button', { class: `big-btn br-go ${glow?.go ? 'glow' : ''}`, onclick: tryIt }, el('span', { class: 'btn-pic' }, '▶️'), 'Try it!')].filter(Boolean));
    }

    if (little) glow = nextStep(); // the right piece glows from the start
    draw(); nudge();
    let width = scene.clientWidth; // redraw if the tablet is turned
    new ResizeObserver(() => { if (scene.clientWidth !== width && !busy) { width = scene.clientWidth; draw(); } }).observe(scene);
    speak(line);
  }

  function finish() {
    // 3 for the youngest always; 1 if "Show me" built it; else 2, and 3 for a clever build.
    const clever = band === 'C' ? mostPieces <= 3 : totalFails <= 2;
    const stars = little ? 3 : shownHow ? 1 : clever ? 3 : 2;
    done(stars, THANKS);
  }

  playRound();
}
