/* Service worker: lets Noor Learning install as an app and keep working with weak wifi.
   - Pages, code and data: try the network first (so updates arrive), fall back to the saved copy.
   - Voice clips, pictures and fonts: use the saved copy first, save new ones as they are used.
     Pictures are also refreshed in the background, so a replaced picture arrives next time.
   - Other websites (Quran recitation audio) are left alone. */
const CACHE = 'noor-v1';
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'audio/voice.json',
  'data/geo-facts.js',
  'data/places.js',
  'data/quran.js',
  'data/world.js',
  'fonts/amiri-quran-arabic-400-normal.woff2',
  'fonts/fredoka-latin-400-normal.woff2',
  'fonts/fredoka-latin-600-normal.woff2',
  'fonts/fredoka-latin-700-normal.woff2',
  'img/thumb/bg-art.jpg',
  'img/thumb/bg-english.jpg',
  'img/thumb/bg-fun.jpg',
  'img/thumb/bg-geo.jpg',
  'img/thumb/bg-home.jpg',
  'img/thumb/bg-islam.jpg',
  'img/thumb/bg-life.jpg',
  'img/thumb/bg-maths.jpg',
  'img/thumb/bg-world.jpg',
  'img/thumb/p01.jpg',
  'img/thumb/p02.jpg',
  'img/thumb/p03.jpg',
  'img/thumb/p04.jpg',
  'img/thumb/p05.jpg',
  'img/thumb/p06.jpg',
  'img/thumb/p07.jpg',
  'img/thumb/p08.jpg',
  'img/thumb/p09.jpg',
  'img/thumb/p10.jpg',
  'img/thumb/p11.jpg',
  'img/thumb/p12.jpg',
  'img/art/bg-art.jpg',
  'img/art/bg-english.jpg',
  'img/art/bg-fun.jpg',
  'img/art/bg-geo.jpg',
  'img/art/bg-home.jpg',
  'img/art/bg-islam.jpg',
  'img/art/bg-life.jpg',
  'img/art/bg-maths.jpg',
  'img/art/bg-world.jpg',
  'img/art/chest.png',
  'img/art/kasem-ball.png',
  'img/art/kasem-car.png',
  'img/art/kasem-cheer.png',
  'img/art/kasem-globe.png',
  'img/art/kasem-hi.png',
  'img/art/kasem-oops.png',
  'img/art/kasem-read.png',
  'img/art/kasem-think.png',
  'img/art/kasem-trophy.png',
  'img/art/kasem.png',
  'js/app.js',
  'js/art.js',
  'js/core.js',
  'js/fresh.js',
  'js/fun.js',
  'js/games/balloons.js',
  'js/games/catch.js',
  'js/games/clock.js',
  'js/games/colouring-pics.js',
  'js/games/colouring.js',
  'js/games/drawing.js',
  'js/games/duas.js',
  'js/games/experiments.js',
  'js/games/flags.js',
  'js/games/globe-game.js',
  'js/games/grammar.js',
  'js/games/house.js',
  'js/games/index.js',
  'js/games/jigsaw.js',
  'js/games/woods/index.js',
  'js/games/woods/bands.js',
  'js/games/woods/bridge.js',
  'js/games/woods/bridge-puzzles.js',
  'js/games/woods/sfx.js',
  'img/art/woods-bunny.png',
  'audio/sfx/pop-bubble.wav',
  'audio/sfx/tap-light.wav',
  'audio/sfx/select-item.wav',
  'audio/sfx/whoosh-short.wav',
  'audio/sfx/success-warm-chime.wav',
  'js/games/letters.js',
  'js/games/lunchbox.js',
  'js/games/manners.js',
  'js/games/maths.js',
  'js/games/memory.js',
  'js/games/pillars.js',
  'js/games/quran.js',
  'js/games/safety.js',
  'js/games/shop.js',
  'js/games/sorting.js',
  'js/games/sounds.js',
  'js/games/sports.js',
  'js/games/stories.js',
  'js/games/words.js',
  'js/games/world-quiz.js',
  'js/games/world.js',
  'js/games/wudu.js',
  'js/globe.js',
  'js/levels.js',
  'js/quiz.js',
  'js/stats.js',
  'vendor/d3-geo.js',
  'img/icons/icon-192.png',
];

/* Save the whole app up front (code, fonts, Kasem and the backgrounds), so it
   opens and plays with no wifi. One missing file must not stop the rest. */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(CORE.map(f => c.add(f))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/\.(mp3|wav|png|jpe?g|webp|woff2?|ttf)$/i.test(url.pathname)) {
    const fresh = () => fetch(req).then(res => {
      if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    });
    // Pictures: show the saved copy straight away, and quietly fetch a newer one for next time.
    const isPicture = /\.(png|jpe?g|webp)$/i.test(url.pathname);
    e.respondWith(caches.match(req).then(hit => {
      if (hit && isPicture) e.waitUntil(fresh().catch(() => {}));
      return hit || fresh();
    }));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('./'))));
});
