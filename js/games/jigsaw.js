/* =========================================================
   Game: Jigsaw Fun
   Teaches: shapes, patience and problem solving.
   Pick a picture, then drag the pieces onto the board.
   A faint copy of the picture shows where each piece goes.
   Bands:
     little   - 9 pieces (3 x 3).
     explorer - 16 pieces (4 x 4).
   The pictures are original cartoons, made for this app,
   saved in img/puzzles/.
   ========================================================= */
import { el, speak, sfx, toast, wiggle, shuffle, pick, PRAISE } from '../core.js';

export const PUZZLES = [
  { id: 'p01', name: 'Kitten house' },
  { id: 'p02', name: 'Shark family' },
  { id: 'p03', name: 'Masjid at night' },
  { id: 'p04', name: 'Camel' },
  { id: 'p05', name: 'Sea turtle' },
  { id: 'p06', name: 'Bunny garden' },
  { id: 'p07', name: 'Ducks' },
  { id: 'p08', name: 'Elephant' },
  { id: 'p09', name: 'Little red car' },
  { id: 'p10', name: 'Puppy and kitten' },
  { id: 'p11', name: 'Owl at night' },
  { id: 'p12', name: 'Cat’s bedroom' },
];
const src = p => `img/puzzles/${p.id}.jpg`;

export default {
  id: 'jigsaw',
  title: 'Jigsaw Fun',
  emoji: '🧩',
  bands: ['little', 'explorer'],

  start(ctx) {
    const { root, band } = ctx;
    const N = band === 'little' ? 3 : 4;
    menu();

    function menu() {
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('Pick a picture!') }, '🔊'),
          el('p', {}, 'Pick a picture!')),
        el('div', { class: 'puzzle-pick' }, PUZZLES.map(p =>
          el('button', { class: 'puzzle-thumb', 'aria-label': p.name, onclick: () => { sfx.tap(); play(p); } },
            el('img', { src: src(p), alt: '' })))));
      speak('Pick a picture!');
    }

    function play(p) {
      let placed = 0, mistakes = 0;
      const url = `url("${src(p)}")`;
      const tile = i => ({
        backgroundImage: url,
        backgroundSize: `${N * 100}% ${N * 100}%`,
        backgroundPosition: `${(i % N) * 100 / (N - 1)}% ${Math.floor(i / N) * 100 / (N - 1)}%`,
      });

      // The board: faint picture behind, one empty cell per piece.
      const cells = Array.from({ length: N * N }, (_, i) => el('div', { class: 'jig-cell', 'data-i': i }));
      const ghostPic = el('div', { class: 'jig-ghost' });
      ghostPic.style.backgroundImage = url;
      const board = el('div', { class: 'jig-board', style: `grid-template-columns:repeat(${N},1fr)` }, ghostPic, cells);

      // The tray: the same pieces, mixed up.
      const pieces = shuffle(cells.map((_, i) => i)).map(i => {
        const piece = el('div', { class: 'jig-piece', 'data-i': i });
        Object.assign(piece.style, tile(i));
        piece.addEventListener('pointerdown', e => drag(e, piece));
        return piece;
      });
      const tray = el('div', { class: `jig-tray n${N}` }, pieces);

      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('Put the pieces in the right places.') }, '🔊'),
          el('p', {}, 'Put the pieces in the right places.')),
        el('div', { class: 'jig-area' }, board, tray));
      speak('Put the pieces in the right places.');

      function drag(e, piece) {
        if (piece.classList.contains('placed')) return;
        e.preventDefault();
        piece.setPointerCapture(e.pointerId);
        const size = board.getBoundingClientRect().width / N; // drag at board size
        const ghost = piece.cloneNode();
        Object.assign(ghost.style, { position: 'fixed', width: `${size}px`, height: `${size}px`, zIndex: 30, pointerEvents: 'none' });
        ghost.classList.add('dragging');
        document.body.append(ghost);
        piece.classList.add('lifted');
        const move = ev => {
          ghost.style.left = `${ev.clientX - size / 2}px`;
          ghost.style.top = `${ev.clientY - size / 2}px`;
        };
        move(e);
        const up = ev => {
          piece.removeEventListener('pointermove', move);
          piece.removeEventListener('pointerup', up);
          piece.removeEventListener('pointercancel', up);
          ghost.remove();
          piece.classList.remove('lifted');
          const target = document.elementsFromPoint(ev.clientX, ev.clientY).find(n => n.classList?.contains('jig-cell'));
          if (!target) return; // dropped elsewhere: piece goes back to the tray
          if (target.dataset.i === piece.dataset.i && !target.firstChild) {
            sfx.right();
            const done = el('div', { class: 'jig-fill' });
            Object.assign(done.style, tile(Number(piece.dataset.i)));
            target.append(done);
            piece.classList.add('placed');
            placed++;
            if (placed === N * N) finish();
            else if (placed % 3 === 0) toast(pick(PRAISE));
          } else {
            mistakes++;
            sfx.tryAgain();
            wiggle(piece);
          }
        };
        piece.addEventListener('pointermove', move);
        piece.addEventListener('pointerup', up);
        piece.addEventListener('pointercancel', up);
      }

      function finish() {
        board.classList.add('complete');
        sfx.win();
        setTimeout(() => ctx.finish(band === 'little' || mistakes <= 3 ? 3 : 2, 'You finished the puzzle!'), 1800);
      }
    }
  },
};
