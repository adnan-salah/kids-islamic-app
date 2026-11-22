/* =========================================================
   Game: Memory Match
   Teaches: memory, focus and patience.
   Turn over two cards at a time to find the matching pairs.
   Bands:
     little   - 3 pairs (6 cards).
     explorer - 6 pairs (12 cards).
     champion - 8 pairs (16 cards).
   ========================================================= */
import { el, speak, sfx, toast, shuffle, pick, PRAISE } from '../core.js';

const PICTURES = ['🐱', '🐶', '🦁', '🐸', '🐵', '🐼', '🦊', '🐢', '🦋', '🐳', '🍎', '🍌', '🚗', '⚽', '⭐', '🌈', '🌙', '🎈', '🏎️', '🐨', '🦘', '🐪'];

export default {
  id: 'memory',
  title: 'Memory Match',
  emoji: '🃏',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    const pairs = { little: 3, explorer: 6, champion: 8 }[band];
    const pics = shuffle(PICTURES).slice(0, pairs);
    const deck = shuffle([...pics, ...pics]);
    let open = [], found = 0, turns = 0, busy = false;

    const cards = deck.map(pic => {
      const card = el('button', { class: 'mem-card', 'aria-label': 'Card', onclick: () => flip(card) },
        el('span', { class: 'mem-back' }, '❓'),
        el('span', { class: 'mem-front' }, pic));
      card.dataset.pic = pic;
      return card;
    });
    const cols = deck.length <= 6 ? 3 : 4;
    root.replaceChildren(
      el('div', { class: 'prompt' },
        el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('Find the matching pairs!') }, '🔊'),
        el('p', {}, 'Find the matching pairs!')),
      el('div', { class: 'mem-grid', style: `grid-template-columns:repeat(${cols},1fr)` }, cards));
    speak('Find the matching pairs!');

    function flip(card) {
      if (busy || card.classList.contains('up')) return;
      sfx.tap();
      card.classList.add('up');
      open.push(card);
      if (open.length < 2) return;
      turns++;
      const [a, b] = open;
      open = [];
      if (a.dataset.pic === b.dataset.pic) {
        a.classList.add('matched');
        b.classList.add('matched');
        sfx.right();
        found++;
        if (found === pairs) {
          sfx.win();
          setTimeout(() => ctx.finish(band === 'little' || turns <= pairs * 2 ? 3 : 2, 'You have a super memory!'), 1200);
        } else toast(pick(PRAISE));
      } else {
        busy = true;
        setTimeout(() => { a.classList.remove('up'); b.classList.remove('up'); busy = false; }, 900);
      }
    }
  },
};
