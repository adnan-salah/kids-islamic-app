/* =========================================================
   Game: Draw & Paint
   Teaches: creativity, pencil control and writing shapes.
   Two ways to play:
     Free draw - a blank page with colours, a rainbow brush,
                 brush sizes, an eraser and picture stamps.
                 Done saves the drawing to My pictures.
     Trace     - draw over a big grey shape, number or letter.
                 When most of it is covered, on to the next one.
                 5 to trace, then the game is finished.
   Bands:
     little   - trace shapes and numbers 1 to 5, wide brush.
     explorer / champion - trace capital and small letters and 0 to 9.
   No hearts: a wobbly line is never a wrong answer.
   ========================================================= */
import { el, speak, sfx, toast, wiggle, shuffle, pick, PRAISE } from '../core.js';
import { COLOURS, showGallery, saveCanvas } from '../art.js';

const STAMPS = ['⭐', '❤️', '🌸', '🐱', '🦋', '🚗', '⚽', '🌙', '☀️', '🐟', '🌈', '🎈'];
const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const SHAPE_LIST = SHAPES;

/** The 5 things to trace this round. */
function traceList(band) {
  if (band === 'little') {
    const shapes = shuffle(SHAPES).slice(0, 3).map(s => ({ kind: 'shape', value: s, say: `Trace the ${s}.` }));
    const nums = shuffle(['1', '2', '3', '4', '5']).slice(0, 2).map(n => ({ kind: 'text', value: n, say: `Trace the number ${n}.` }));
    return shuffle([...shapes, ...nums]);
  }
  const big = shuffle(LETTERS).slice(0, 2).map(l => ({ kind: 'text', value: l, say: `Trace the big letter ${l}.` }));
  const small = shuffle(LETTERS).slice(0, 2).map(l => ({ kind: 'text', value: l.toLowerCase(), say: `Trace the small letter ${l.toLowerCase()}.` }));
  const num = { kind: 'text', value: pick('0123456789'.split('')), say: '' };
  num.say = `Trace the number ${num.value}.`;
  return shuffle([...big, ...small, num]);
}

export default {
  id: 'drawing',
  title: 'Draw & Paint',
  emoji: '✏️',
  noLives: true,
  noBuddy: true,
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band, child } = ctx;
    const little = band === 'little';
    root.classList.add('art-stage');
    menu();

    function menu() {
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('What do you want to do?') }, '🔊'),
          el('p', {}, 'What do you want to do?'),
          el('button', { class: 'big-btn secondary art-gallery-btn', onclick: () => { sfx.tap(); showGallery(child.id); } }, '🖼️ My pictures')),
        el('div', { class: 'art-modes' },
          el('button', { class: 'tile pop-in', onclick: () => { sfx.tap(); board(null); } },
            el('span', { class: 'art-mode-emoji' }, '🎨'), el('span', { class: 'label' }, 'Free draw')),
          el('button', { class: 'tile pop-in', onclick: () => { sfx.tap(); board(traceList(band)); } },
            el('span', { class: 'art-mode-emoji' }, little ? '⭐' : '✍️'), el('span', { class: 'label' }, little ? 'Trace shapes' : 'Trace letters'))));
      speak('What do you want to do?');
    }

    /* The drawing board. traces = list of things to trace, or null for free draw. */
    function board(traces) {
      let step = 0;
      let colour = COLOURS[traces ? 6 : 1].hex, rainbow = false, hue = 0;
      let tool = 'pen';            // 'pen' | 'eraser' | 'stamp'
      let stamp = STAMPS[0];
      let size = little ? 2 : 1;   // 0 small, 1 medium, 2 big
      const undoStack = [];
      let drew = false;

      const guide = el('canvas', { class: 'draw-guide' });
      const ink = el('canvas', { class: 'draw-ink' });
      const wrap = el('div', { class: `draw-wrap${traces ? ' tracing' : ''}` }, guide, ink);
      const gctx = guide.getContext('2d');
      const ictx = ink.getContext('2d', { willReadFrequently: true });
      let dpr = 1, W = 0, H = 0;

      // ----- toolbar -----
      const colourBtns = [];
      const colourBox = el('div', { class: 'draw-colours' });
      COLOURS.forEach((c, n) => {
        if (!c) return;
        const b = el('button', { class: 'swatch', 'aria-label': c.name, style: `background:${c.hex}`, onclick: () => setColour(c.hex, b) });
        colourBtns.push(b);
        colourBox.append(b);
      });
      const rainbowBtn = el('button', { class: 'swatch special rainbow', 'aria-label': 'Rainbow', onclick: () => setColour('rainbow', rainbowBtn) });
      colourBtns.push(rainbowBtn);
      colourBox.append(rainbowBtn);

      const sizeBtns = [0, 1, 2].map(s => el('button', { class: 'draw-size', 'aria-label': ['Thin', 'Medium', 'Thick'][s], onclick: () => setSize(s) },
        el('span', { style: `width:${[8, 16, 28][s]}px;height:${[8, 16, 28][s]}px` })));
      const toolBtns = {
        pen: el('button', { class: 'draw-tool', 'aria-label': 'Pencil', onclick: () => setTool('pen') }, '✏️'),
        eraser: el('button', { class: 'draw-tool', 'aria-label': 'Eraser', onclick: () => setTool('eraser') }, '🧽'),
        stamp: traces ? null : el('button', { class: 'draw-tool', 'aria-label': 'Stickers', onclick: () => setTool('stamp') }, '🌟'),
      };
      const stampRow = el('div', { class: 'draw-stamps', hidden: true }, STAMPS.map(s =>
        el('button', { class: 'draw-stamp', onclick: e => { sfx.tap(); stamp = s; [...stampRow.children].forEach(b => b.classList.toggle('on', b === e.currentTarget)); } }, s)));
      stampRow.firstElementChild.classList.add('on');

      const tools = el('div', { class: 'draw-tools' },
        colourBox,
        traces ? null : el('div', { class: 'draw-row' }, sizeBtns),
        el('div', { class: 'draw-row' }, Object.values(toolBtns).filter(Boolean),
          el('button', { class: 'draw-tool', 'aria-label': 'Undo', onclick: undo }, '↩️'),
          el('button', { class: 'draw-tool', 'aria-label': 'Start again', onclick: clearAll }, '🗑️')),
        stampRow);

      const promptText = el('p', {}, traces ? '' : 'Draw anything you like!');
      const progress = traces ? el('div', { class: 'trace-dots' }, traces.map(() => el('span'))) : null;
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(traces ? traces[step].say : 'Draw anything you like!') }, '🔊'),
          promptText,
          progress,
          traces ? null : el('button', { class: 'big-btn art-done', onclick: done }, '✅ Done')),
        el('div', { class: 'draw-area' }, wrap, tools));

      setColour(colour, colourBtns[traces ? 5 : 0], true);
      setSize(size, true);
      setTool('pen', true);
      fit();
      window.addEventListener('resize', fit);
      const stop = new MutationObserver(() => { if (!wrap.isConnected) { window.removeEventListener('resize', fit); stop.disconnect(); } });
      stop.observe(document.body, { childList: true, subtree: true });

      if (traces) nextTrace(); else speak('Draw anything you like!');

      // ----- settings -----
      function setColour(c, btn, quiet) {
        if (!quiet) sfx.tap();
        rainbow = c === 'rainbow';
        if (!rainbow) colour = c;
        colourBtns.forEach(b => b.classList.toggle('on', b === btn));
        if (tool === 'eraser') setTool('pen', true);
      }
      function setSize(s, quiet) {
        if (!quiet) sfx.tap();
        size = s;
        sizeBtns.forEach((b, i) => b.classList.toggle('on', i === s));
      }
      function setTool(t, quiet) {
        if (!quiet) sfx.tap();
        tool = t;
        Object.entries(toolBtns).forEach(([k, b]) => b?.classList.toggle('on', k === t));
        stampRow.hidden = t !== 'stamp';
      }
      function brushPx() { return traces ? traceWidth() : [6, 14, 28][size] * (little ? 1.3 : 1); }
      function traceWidth() { return Math.min(W, H) * (little ? 0.075 : 0.06); }

      // ----- canvas size -----
      function fit() {
        const r = wrap.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const old = W ? (() => { const c = document.createElement('canvas'); c.width = ink.width; c.height = ink.height; c.getContext('2d').drawImage(ink, 0, 0); return c; })() : null;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = r.width; H = r.height;
        for (const c of [guide, ink]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
        ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
        gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (old) { ictx.save(); ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.drawImage(old, 0, 0, ink.width, ink.height); ictx.restore(); }
        if (traces) drawGuide();
      }

      // ----- drawing -----
      let active = null, last = null;
      ink.addEventListener('pointerdown', e => {
        if (active !== null) return;
        e.preventDefault();
        ink.setPointerCapture(e.pointerId);
        saveUndo();
        const pt = point(e);
        if (tool === 'stamp') {
          const px = [40, 64, 100][size] * (little ? 1.2 : 1);
          ictx.globalCompositeOperation = 'source-over';
          ictx.font = `${px}px "Noto Color Emoji", "Segoe UI Emoji", sans-serif`;
          ictx.textAlign = 'center';
          ictx.textBaseline = 'middle';
          ictx.fillText(stamp, pt.x, pt.y);
          sfx.pop();
          drew = true;
          return;
        }
        active = e.pointerId;
        last = pt;
        dot(pt);
      });
      ink.addEventListener('pointermove', e => {
        if (e.pointerId !== active) return;
        const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        for (const ev of events.length ? events : [e]) {
          const pt = point(ev);
          line(last, pt);
          last = pt;
        }
      });
      const end = e => {
        if (e.pointerId !== active) return;
        active = null;
        if (traces) checkTrace();
      };
      ink.addEventListener('pointerup', end);
      ink.addEventListener('pointercancel', end);

      function point(e) {
        const r = ink.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }
      function brush() {
        ictx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        ictx.lineCap = ictx.lineJoin = 'round';
        ictx.lineWidth = tool === 'eraser' ? brushPx() * 1.8 : brushPx();
        const c = rainbow ? `hsl(${hue = (hue + 4) % 360} 90% 55%)` : colour;
        ictx.strokeStyle = ictx.fillStyle = c;
      }
      function dot(pt) {
        brush();
        ictx.beginPath();
        ictx.arc(pt.x, pt.y, ictx.lineWidth / 2, 0, Math.PI * 2);
        ictx.fill();
        drew = true;
      }
      function line(a, b) {
        brush();
        ictx.beginPath();
        ictx.moveTo(a.x, a.y);
        ictx.lineTo(b.x, b.y);
        ictx.stroke();
        drew = true;
      }
      function saveUndo() {
        undoStack.push(ictx.getImageData(0, 0, ink.width, ink.height));
        if (undoStack.length > 15) undoStack.shift();
      }
      function undo() {
        const img = undoStack.pop();
        if (!img) return;
        sfx.tap();
        ictx.putImageData(img, 0, 0);
      }
      function clearAll() {
        sfx.whoosh();
        saveUndo();
        ictx.clearRect(0, 0, W, H);
      }

      // ----- tracing -----
      function drawGuide() {
        const t = traces[step];
        gctx.clearRect(0, 0, W, H);
        gctx.fillStyle = gctx.strokeStyle = '#d1d5db';
        gctx.lineCap = gctx.lineJoin = 'round';
        const s = Math.min(W, H) * 0.78, cx = W / 2, cy = H / 2;
        if (t.kind === 'text') {
          gctx.font = `700 ${s}px Fredoka, sans-serif`;
          gctx.textAlign = 'center';
          gctx.textBaseline = 'alphabetic';
          const m = gctx.measureText(t.value);
          const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
          gctx.fillText(t.value, cx, cy + h / 2 - m.actualBoundingBoxDescent);
        } else {
          gctx.lineWidth = traceWidth();
          gctx.beginPath();
          const r = s * 0.42;
          if (t.value === 'circle') gctx.arc(cx, cy, r, 0, Math.PI * 2);
          if (t.value === 'square') gctx.rect(cx - r, cy - r, r * 2, r * 2);
          if (t.value === 'triangle') { gctx.moveTo(cx, cy - r); gctx.lineTo(cx + r * 1.1, cy + r * 0.85); gctx.lineTo(cx - r * 1.1, cy + r * 0.85); gctx.closePath(); }
          if (t.value === 'star') for (let i = 0; i <= 10; i++) {
            const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r * 0.45 : r * 1.05;
            gctx[i ? 'lineTo' : 'moveTo'](cx + d * Math.cos(a), cy + d * Math.sin(a));
          }
          if (t.value === 'heart') {
            gctx.moveTo(cx, cy + r);
            gctx.bezierCurveTo(cx - r * 1.6, cy - r * 0.1, cx - r * 0.7, cy - r * 1.25, cx, cy - r * 0.45);
            gctx.bezierCurveTo(cx + r * 0.7, cy - r * 1.25, cx + r * 1.6, cy - r * 0.1, cx, cy + r);
          }
          gctx.stroke();
        }
      }

      function nextTrace() {
        ictx.clearRect(0, 0, W, H);
        undoStack.length = 0;
        drawGuide();
        promptText.textContent = traces[step].say;
        [...progress.children].forEach((d, i) => d.classList.toggle('done', i < step));
        speak(traces[step].say);
      }

      let checking = false;
      function checkTrace() {
        if (checking) return;
        const g = gctx.getImageData(0, 0, guide.width, guide.height).data;
        const k = ictx.getImageData(0, 0, ink.width, ink.height).data;
        const stepPx = Math.max(4, Math.round(6 * dpr));
        let want = 0, hit = 0, stray = 0;
        for (let y = 0; y < guide.height; y += stepPx) {
          for (let x = 0; x < guide.width; x += stepPx) {
            const i = (y * guide.width + x) * 4 + 3;
            const onGuide = g[i] > 40, inked = k[i] > 40;
            if (onGuide) { want++; if (inked) hit++; } else if (inked) stray++;
          }
        }
        if (!want) return;
        const cover = hit / want, mess = stray / want;
        if (cover >= (little ? 0.6 : 0.68) && mess <= (little ? 1.6 : 1.0)) {
          checking = true;
          sfx.right();
          toast(pick(PRAISE));
          wrap.classList.add('traced');
          setTimeout(() => {
            wrap.classList.remove('traced');
            checking = false;
            step++;
            if (step >= traces.length) {
              [...progress.children].forEach(d => d.classList.add('done'));
              sfx.win();
              ctx.finish(3, 'Super tracing!');
            } else nextTrace();
          }, 1300);
        } else if (cover >= 0.5 && mess > (little ? 1.6 : 1.0)) {
          toast('Try to stay on the grey line', 1800);
        }
      }

      // ----- finish (free draw) -----
      function done() {
        if (!drew) { toast('Draw something first!'); wiggle(wrap); return; }
        sfx.win();
        saveCanvas(child.id, ink);
        ctx.finish(3, 'What a lovely drawing!');
      }
    }
  },
};
