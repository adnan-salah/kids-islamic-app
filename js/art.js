/* =========================================================
   Shared bits for the art games (Colour In, Draw & Paint):
   the colour palette and each child's picture gallery.
   Finished pictures are saved on this tablet only
   (localStorage key noor-art:<childId>), never uploaded.
   ========================================================= */
import { el, sfx, toast } from './core.js';

// Numbered colours. The numbers are used by colour-by-number.
export const COLOURS = [
  null,
  { hex: '#ef4444', name: 'red' },
  { hex: '#fb923c', name: 'orange' },
  { hex: '#facc15', name: 'yellow' },
  { hex: '#22c55e', name: 'green' },
  { hex: '#7dd3fc', name: 'light blue' },
  { hex: '#2563eb', name: 'blue' },
  { hex: '#a855f7', name: 'purple' },
  { hex: '#f9a8d4', name: 'pink' },
  { hex: '#a16207', name: 'brown' },
  { hex: '#9ca3af', name: 'grey' },
  { hex: '#ffffff', name: 'white' },
  { hex: '#1f2937', name: 'black' },
];

const MAX_SAVED = 12;
const key = childId => `noor-art:${childId}`;

export function loadArt(childId) {
  try { return JSON.parse(localStorage.getItem(key(childId))) || []; } catch { return []; }
}

/** Save a finished picture (a JPEG data URL). Oldest pictures drop off after 12. */
export function saveArt(childId, dataUrl) {
  let list = [dataUrl, ...loadArt(childId)].slice(0, MAX_SAVED);
  // If the tablet's storage is full, keep dropping the oldest until it fits.
  while (list.length) {
    try { localStorage.setItem(key(childId), JSON.stringify(list)); return true; } catch { list = list.slice(0, -1); }
  }
  return false;
}

/** A full-screen gallery of the child's saved pictures. */
export function showGallery(childId) {
  const art = loadArt(childId);
  const close = () => { sfx.tap(); overlay.remove(); };
  const big = el('img', { class: 'gallery-big', alt: '' });
  const viewer = el('div', { class: 'gallery-viewer', hidden: true, onclick: () => { viewer.hidden = true; } }, big);
  const overlay = el('div', { class: 'gallery-overlay' },
    el('div', { class: 'gallery-box' },
      el('div', { class: 'gallery-head' },
        el('h2', {}, '🖼️ My pictures'),
        el('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: close }, '✖️')),
      art.length
        ? el('div', { class: 'gallery-grid' }, art.map(src =>
            el('button', { class: 'gallery-thumb', onclick: () => { sfx.tap(); big.src = src; viewer.hidden = false; } },
              el('img', { src, alt: 'My picture' }))))
        : el('p', { class: 'gallery-empty' }, 'No pictures yet. Finish one and it will be saved here!')),
    viewer);
  document.body.append(overlay);
}

/** Turn a canvas into a small JPEG and save it to the gallery. */
export function saveCanvas(childId, canvas, size = 480) {
  const scale = Math.min(1, size / Math.max(canvas.width, canvas.height));
  const out = document.createElement('canvas');
  out.width = Math.round(canvas.width * scale);
  out.height = Math.round(canvas.height * scale);
  const g = out.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, out.width, out.height);
  g.drawImage(canvas, 0, 0, out.width, out.height);
  if (saveArt(childId, out.toDataURL('image/jpeg', 0.8))) toast('🖼️ Saved to My pictures', 1800);
}
