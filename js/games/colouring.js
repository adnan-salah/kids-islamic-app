/* =========================================================
   Game: Colour In
   Teaches: colours, numbers, fine motor skills and creativity.
   Pick a line picture, pick a colour, tap a part to fill it.
   Bands:
     little   - free colouring with big colour buttons.
     explorer / champion - choose free colouring or colour-by-number
                (each part shows a number; match it to the colour).
   No hearts: colouring is never "wrong" enough to lose a game.
   Finished pictures are saved to the child's My pictures.
   ========================================================= */
import { el, speak, sfx, toast, wiggle, pick, PRAISE } from '../core.js';
import { COLOURS, showGallery, saveCanvas } from '../art.js';
import { PICTURES } from './colouring-pics.js';

const NS = 'http://www.w3.org/2000/svg';
const SPECIALS = [
  { id: 'rainbow', label: 'Rainbow', fill: 'url(#cl-rainbow)' },
  { id: 'gold', label: 'Gold', fill: 'url(#cl-gold)' },
];
const DEFS = `<defs>
  <linearGradient id="cl-rainbow" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ef4444"/><stop offset=".2" stop-color="#fb923c"/><stop offset=".4" stop-color="#facc15"/>
    <stop offset=".6" stop-color="#22c55e"/><stop offset=".8" stop-color="#3b82f6"/><stop offset="1" stop-color="#a855f7"/>
  </linearGradient>
  <linearGradient id="cl-gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fde68a"/><stop offset=".45" stop-color="#f59e0b"/><stop offset=".55" stop-color="#fef3c7"/><stop offset="1" stop-color="#d97706"/>
  </linearGradient>
</defs>`;

export default {
  id: 'colouring',
  noFit: true, // sizes itself; touches are measured on its own surface
  title: 'Colour In',
  emoji: '🖍️',
  noStats: true, // no right or wrong answers to count
  noLives: true,
  noBuddy: true,
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band, child } = ctx;
    const canNumber = band !== 'little';
    menu();

    function menu() {
      const thumbs = PICTURES.map(pic => {
        const box = el('button', { class: 'colour-thumb', 'aria-label': pic.name, onclick: () => { sfx.tap(); chooseMode(pic); } });
        box.innerHTML = svgMarkup(pic, true);
        return box;
      });
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('Pick a picture to colour!') }, '🔊'),
          el('p', {}, 'Pick a picture to colour!'),
          el('button', { class: 'big-btn secondary art-gallery-btn', onclick: () => { sfx.tap(); showGallery(child.id); } }, '🖼️ My pictures')),
        el('div', { class: 'colour-pick' }, thumbs));
      speak('Pick a picture to colour!');
    }

    function chooseMode(pic) {
      if (!canNumber) return play(pic, false);
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('How do you want to colour?') }, '🔊'),
          el('p', {}, 'How do you want to colour?')),
        el('div', { class: 'art-modes' },
          el('button', { class: 'tile pop-in', onclick: () => { sfx.tap(); play(pic, false); } },
            el('span', { class: 'art-mode-emoji' }, '🎨'), el('span', { class: 'label' }, 'My own colours')),
          el('button', { class: 'tile pop-in', onclick: () => { sfx.tap(); play(pic, true); } },
            el('span', { class: 'art-mode-emoji' }, '🔢'), el('span', { class: 'label' }, 'Colour by number'))));
      speak('How do you want to colour?');
    }

    function play(pic, byNumber) {
      const holder = el('div', { class: 'colour-pic' });
      holder.innerHTML = svgMarkup(pic, false);
      const svg = holder.firstElementChild;
      const regions = [...svg.querySelectorAll('.rg')];
      const history = [];
      let current = 1;
      let left = regions.length;
      let wrongs = 0;

      // Colour buttons
      const swatches = [];
      const used = byNumber ? [...new Set(pic.regions.map(rg => rg[1]))].sort((a, b) => a - b) : null;
      const palette = el('div', { class: `colour-palette${band === 'little' ? ' big' : ''}` });
      COLOURS.forEach((col, n) => {
        if (!col || (used && !used.includes(n))) return;
        const b = el('button', { class: 'swatch', 'aria-label': col.name, style: `background:${col.hex}`, onclick: () => choose(n, b) },
          byNumber ? el('span', { class: 'swatch-num' }, n) : null);
        b.dataset.fill = col.hex;
        swatches.push(b);
        palette.append(b);
      });
      if (!byNumber) SPECIALS.forEach(s => {
        const b = el('button', { class: `swatch special ${s.id}`, 'aria-label': s.label, onclick: () => choose(s.fill, b) });
        b.dataset.fill = s.fill;
        swatches.push(b);
        palette.append(b);
      });
      choose(byNumber ? used[0] : 1, swatches[0], true);

      function choose(n, btn, quiet) {
        if (!quiet) sfx.tap();
        current = n;
        swatches.forEach(s => s.classList.toggle('on', s === btn));
      }
      const fillOf = n => (typeof n === 'number' ? COLOURS[n].hex : n);

      // Number labels for colour-by-number
      const labels = document.createElementNS(NS, 'g');
      labels.setAttribute('class', 'cl-labels');
      svg.append(labels);

      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(intro) }, '🔊'),
          el('p', {}, byNumber ? 'Match the numbers!' : 'Tap a colour, then tap the picture.'),
          el('button', { class: 'icon-btn', 'aria-label': 'Undo', onclick: undo }, '↩️'),
          byNumber ? null : el('button', { class: 'big-btn art-done', onclick: done }, '✅ Done')),
        el('div', { class: 'colour-area' }, holder, palette));
      const intro = byNumber ? 'Colour by number! Match each number to its colour.' : 'Tap a colour, then tap the picture.';
      speak(intro);

      if (byNumber) {
        regions.forEach(g => {
          const i = +g.dataset.i;
          const at = pic.regions[i][2];
          const b = g.getBBox();
          const [x, y] = at || [b.x + b.width / 2, b.y + b.height / 2];
          const size = pic.regions[i][3] || Math.max(13, Math.min(30, Math.min(b.width, b.height) * 0.55));
          const t = document.createElementNS(NS, 'text');
          Object.entries({ x, y, 'font-size': size, 'text-anchor': 'middle', 'dominant-baseline': 'central' }).forEach(([k, v]) => t.setAttribute(k, v));
          t.textContent = g.dataset.n;
          g.label = t;
          labels.append(t);
        });
      }

      regions.forEach(g => g.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        if (byNumber) {
          if (g.dataset.done) return;
          if (+g.dataset.n !== current) {
            sfx.boing();
            wiggle(palette);
            if (wrongs++ % 3 === 0) speak('Look at the number, then pick that colour.');
            return;
          }
          g.dataset.done = '1';
          g.label?.remove();
          left--;
        }
        const before = g.getAttribute('fill');
        const after = fillOf(current);
        if (before === after) return;
        history.push([g, before]);
        g.setAttribute('fill', after);
        g.classList.remove('pop'); void g.getBBox(); g.classList.add('pop');
        sfx.pop();
        if (byNumber && left === 0) {
          sfx.win();
          toast(pick(PRAISE));
          setTimeout(() => finish('You coloured it all in!'), 1300);
        }
      }));

      function undo() {
        const last = history.pop();
        if (!last) return;
        sfx.tap();
        const [g, before] = last;
        g.setAttribute('fill', before);
        if (byNumber && g.dataset.done) {
          delete g.dataset.done;
          labels.append(g.label);
          left++;
        }
      }

      function done() {
        if (!history.length) { toast('Colour something first!'); wiggle(palette); return; }
        sfx.win();
        finish('What a beautiful picture!');
      }

      async function finish(message) {
        await savePicture(svg);
        ctx.finish(3, message);
      }
    }

    // Draw the coloured picture on a canvas and save it to My pictures.
    async function savePicture(svg) {
      try {
        const copy = svg.cloneNode(true);
        copy.querySelector('.cl-labels')?.remove();
        copy.setAttribute('width', 480);
        copy.setAttribute('height', 480);
        const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
        const img = new Image();
        await new Promise((ok, fail) => { img.onload = ok; img.onerror = fail; img.src = url; });
        const canvas = Object.assign(document.createElement('canvas'), { width: 480, height: 480 });
        canvas.getContext('2d').drawImage(img, 0, 0, 480, 480);
        URL.revokeObjectURL(url);
        saveCanvas(child.id, canvas);
      } catch { /* saving is a bonus; never block the finish */ }
    }
  },
};

/* The picture as SVG markup. Each colourable part is a <g class="rg">. */
function svgMarkup(pic, thumb) {
  const parts = pic.regions.map(([shape, n], i) =>
    `<g class="rg" data-i="${i}" data-n="${n}" fill="${thumb ? COLOURS[n].hex : '#ffffff'}">${shape}</g>`).join('');
  return `<svg xmlns="${NS}" viewBox="0 0 400 400" stroke="#1f2937" stroke-width="${thumb ? 6 : 5}" stroke-linejoin="round" stroke-linecap="round">${DEFS}${parts}<g fill="none" pointer-events="none">${pic.details}</g></svg>`;
}
