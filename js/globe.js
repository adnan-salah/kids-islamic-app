/* =========================================================
   globe.js: a spinning 3D globe, like the one in Baba's office.
   Drag to spin, pinch or use + and − to zoom, tap a country.
   Uses d3-geo (vendor/d3-geo.js, ISC licence) and data/world.js.

   const g = createGlobe({ onTap(country), size })
     g.el                      - the element to put on the page
     g.spinTo(id, zoom)        - turn smoothly to face a country
     g.mark(id, kind)          - colour a country: 'target' | 'right' | 'wrong' | 'found' | null
     g.clearMarks()
     g.label(id)               - show a name label on a country (null to hide)
     g.autoSpin(on)            - slowly turn by itself
   ========================================================= */
import { geoOrthographic, geoPath, geoContains, geoCentroid, geoGraticule10, geoInterpolate, geoArea } from '../vendor/d3-geo.js';
import { COUNTRIES } from '../data/world.js';
import { CAPITAL_FIX } from '../data/geo-facts.js';
import { el } from './core.js';

for (const c of COUNTRIES) if (CAPITAL_FIX[c.id]) c.capital = CAPITAL_FIX[c.id];

/* Soft colours by continent, like a children's globe. */
const LAND = { AF: '#f6c453', AS: '#f59e7b', EU: '#9bd17a', NA: '#f7a8c9', OC: '#c9a7f5', SA: '#7fd3c4' };
const MARK = { target: '#ef2b5b', right: '#16a34a', wrong: '#94a3b8' };

/* GeoJSON features, made once and shared by every globe. */
let FEATURES = null;
export function features() {
  FEATURES ??= COUNTRIES.map(c => ({
    type: 'Feature', id: c.id, c,
    geometry: { type: 'MultiPolygon', coordinates: c.shape },
  }));
  return FEATURES;
}
export const byId = id => features().find(f => f.id === id);

/* Where to look to see a country well (its biggest piece, so France is
   not pulled into the ocean by its islands). */
export function centreOf(id) {
  const f = byId(id);
  if (!f) return [0, 0];
  let best = null, area = -1;
  for (const poly of f.c.shape) {
    const a = geoArea({ type: 'Polygon', coordinates: poly });
    if (a > area) { area = a; best = poly; }
  }
  return geoCentroid({ type: 'Polygon', coordinates: best });
}

export function createGlobe({ onTap, size = 520, controls = true } = {}) {
  const canvas = el('canvas', { class: 'globe-canvas', 'aria-label': 'Globe. Drag to spin it.' });
  const wrap = el('div', { class: 'globe-wrap' }, canvas);
  const ctx = canvas.getContext('2d');
  const proj = geoOrthographic().clipAngle(90).precision(0.6);
  const path = geoPath(proj, ctx);
  const grat = geoGraticule10();
  const feats = features();

  let rot = [-134, 25, 0]; // start looking at Australia and Asia
  let zoom = 1, spin = false, labelId = null, alive = true;
  let vel = 0; // spin speed after a flick (degrees per frame)
  const marks = new Map();
  let w = size, dpr = 1;

  function resize() {
    w = Math.max(220, Math.min(wrap.clientWidth || size, size));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = canvas.height = w * dpr;
    canvas.style.width = canvas.style.height = `${w}px`;
    draw();
  }

  function draw() {
    const r = (w / 2 - 6) * zoom;
    proj.scale(r).translate([w / 2, w / 2]).rotate(rot);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, w);
    // Ocean with a soft light from the top left.
    const g = ctx.createRadialGradient(w / 2 - r * 0.35, w / 2 - r * 0.35, r * 0.1, w / 2, w / 2, r);
    g.addColorStop(0, '#7cc8f8'); g.addColorStop(1, '#1e6fbf');
    ctx.beginPath(); ctx.arc(w / 2, w / 2, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); path(grat); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; ctx.stroke();
    for (const f of feats) {
      ctx.beginPath(); path(f);
      const m = marks.get(f.id);
      ctx.fillStyle = MARK[m] || LAND[f.c.cont] || '#ddd';
      ctx.fill();
      // Countries the child has found get a gold edge.
      ctx.strokeStyle = m === 'target' ? '#fff' : m === 'found' ? '#b45309' : 'rgba(80,60,40,0.45)';
      ctx.lineWidth = m === 'target' ? 2.5 : m === 'found' ? 1.6 : 0.6;
      ctx.stroke();
    }
    // Small countries are hard to see: give marked ones a ring.
    for (const [id, m] of marks) {
      const f = byId(id);
      if (!f || !MARK[m]) continue;
      const [[x0, y0], [x1, y1]] = path.bounds(f);
      if (!isFinite(x0) || (x1 - x0) * (y1 - y0) > 400) continue;
      const p = proj(centreOf(id));
      if (!p || !visible(centreOf(id))) continue;
      ctx.beginPath(); ctx.arc(p[0], p[1], 14, 0, Math.PI * 2);
      ctx.strokeStyle = MARK[m]; ctx.lineWidth = 4; ctx.stroke();
    }
    // Shine on the edge, so it looks round.
    const s = ctx.createRadialGradient(w / 2, w / 2, r * 0.75, w / 2, w / 2, r);
    s.addColorStop(0, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,20,60,0.25)');
    ctx.beginPath(); ctx.arc(w / 2, w / 2, r, 0, Math.PI * 2); ctx.fillStyle = s; ctx.fill();
    if (labelId) drawLabel(labelId);
  }

  const visible = ll => {
    const [l, p] = [-rot[0], -rot[1]];
    const rad = Math.PI / 180;
    const cos = Math.sin(p * rad) * Math.sin(ll[1] * rad) + Math.cos(p * rad) * Math.cos(ll[1] * rad) * Math.cos((ll[0] - l) * rad);
    return cos > 0.05;
  };

  function drawLabel(id) {
    const f = byId(id);
    const c = centreOf(id);
    if (!f || !visible(c)) return;
    const [x, y] = proj(c);
    const text = `${f.c.flag} ${f.c.name}`;
    ctx.font = '600 18px Fredoka, sans-serif';
    const tw = ctx.measureText(text).width + 20;
    const bx = Math.max(4, Math.min(w - tw - 4, x - tw / 2)), by = Math.max(4, y - 46);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(bx, by, tw, 32, 16); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1e293b'; ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + 10, by + 16);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = '#1e293b'; ctx.fill();
  }

  /* ---------- Touch: drag to spin, pinch to zoom, tap to pick ---------- */
  const pts = new Map();
  let start = null, moved = 0, pinch = null, lastX = 0, lastT = 0;
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, [e.offsetX, e.offsetY]);
    spin = false; vel = 0; anim = null;
    if (pts.size === 1) { start = { x: e.offsetX, y: e.offsetY, rot: [...rot] }; moved = 0; lastX = e.offsetX; lastT = performance.now(); }
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), zoom }; }
  });
  canvas.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, [e.offsetX, e.offsetY]);
    if (pts.size === 2 && pinch) {
      const [a, b] = [...pts.values()];
      setZoom(pinch.zoom * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d);
      moved = 99;
      return;
    }
    if (!start) return;
    const dx = e.offsetX - start.x, dy = e.offsetY - start.y;
    moved = Math.max(moved, Math.hypot(dx, dy));
    const k = 180 / ((w / 2) * zoom * Math.PI) * 1.1;
    rot = [start.rot[0] + dx * k, Math.max(-80, Math.min(80, start.rot[1] - dy * k)), 0];
    const now = performance.now();
    vel = (e.offsetX - lastX) * k / Math.max(8, now - lastT) * 16;
    lastX = e.offsetX; lastT = now;
    draw();
  });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (pts.size === 0) {
      if (moved < 8 && start) tap(e.offsetX, e.offsetY);
      else if (Math.abs(vel) > 0.3) coast();
      start = null;
    }
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  function tap(x, y) {
    const ll = proj.invert([x, y]);
    const r = (w / 2 - 6) * zoom;
    if (!ll || Math.hypot(x - w / 2, y - w / 2) > r) return;
    let hit = feats.find(f => geoContains(f, ll));
    // Tiny countries (a few pixels on screen): accept a tap close to them.
    if (!hit) {
      let best = 16;
      for (const f of feats) {
        const c = centreOf(f.id);
        if (!visible(c)) continue;
        const [[x0, y0], [x1, y1]] = path.bounds(f);
        if ((x1 - x0) * (y1 - y0) > 250) continue;
        const p = proj(c);
        const d = Math.hypot(p[0] - x, p[1] - y);
        if (d < best) { best = d; hit = f; }
      }
    }
    onTap?.(hit ? hit.c : null, ll);
  }

  /* ---------- Movement ---------- */
  let anim = null;
  function coast() {
    const step = () => {
      if (!alive || anim || pts.size) return;
      vel *= 0.95;
      rot = [rot[0] + vel, rot[1], 0];
      draw();
      if (Math.abs(vel) > 0.05) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function spinTo(id, toZoom = zoom) {
    const [lon, lat] = centreOf(id);
    const from = [-rot[0], -rot[1]];
    const interp = geoInterpolate(from, [lon, lat]);
    const z0 = zoom, t0 = performance.now(), ms = 1200;
    spin = false; vel = 0;
    return new Promise(done => {
      const a = anim = {};
      const step = now => {
        if (anim !== a || !alive) return done();
        const t = Math.min(1, (now - t0) / ms);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const [l, p] = interp(e);
        rot = [-l, -Math.max(-70, Math.min(70, p)), 0];
        zoom = z0 + (toZoom - z0) * e;
        draw();
        if (t < 1) requestAnimationFrame(step); else { anim = null; done(); }
      };
      requestAnimationFrame(step);
    });
  }

  function setZoom(z) { zoom = Math.max(0.8, Math.min(6, z)); draw(); }

  let seen = false; // stops once the globe has been on screen and is then removed
  function loop() {
    if (!alive) return;
    if (wrap.isConnected && !seen) { seen = true; resize(); }
    if (!wrap.isConnected && seen) { alive = false; window.removeEventListener('resize', resize); return; }
    if (spin && !pts.size && !anim) { rot = [rot[0] + 0.15, rot[1], 0]; draw(); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(() => { resize(); loop(); });
  window.addEventListener('resize', resize);

  if (controls) {
    wrap.append(el('div', { class: 'globe-zoom' },
      el('button', { class: 'icon-btn', 'aria-label': 'Zoom in', onclick: () => setZoom(zoom * 1.4) }, '➕'),
      el('button', { class: 'icon-btn', 'aria-label': 'Zoom out', onclick: () => setZoom(zoom / 1.4) }, '➖')));
  }

  return {
    el: wrap,
    spinTo,
    mark(id, kind) { if (kind) marks.set(id, kind); else marks.delete(id); draw(); },
    clearMarks() { marks.clear(); draw(); },
    label(id) { labelId = id; draw(); },
    autoSpin(on) { spin = on; },
    zoom: setZoom,
    get zoomLevel() { return zoom; },
    redraw: draw,
  };
}
