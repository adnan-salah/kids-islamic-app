/* Service worker: lets Noor Learning install as an app and keep working with weak wifi.
   - Pages, code and data: try the network first (so updates arrive), fall back to the saved copy.
   - Voice clips, pictures and fonts: use the saved copy first (they never change), save new ones as they are used.
   - Other websites (Quran recitation audio) are left alone. */
const CACHE = 'noor-v1';
const CORE = ['./', 'index.html', 'css/style.css', 'js/app.js', 'manifest.webmanifest', 'img/icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/\.(mp3|png|jpe?g|webp|woff2?|ttf)$/i.test(url.pathname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('./'))));
});
