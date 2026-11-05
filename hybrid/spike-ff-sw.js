/* FRANKENFIT hybrid — offline shell. Cache-first for the app + its assets.
   Relative paths so the same file works at doc root (LAN) and under any
   Pages subpath. Bump the version to force a refresh after edits. */
const VERSION = 'ff-v3';
const ASSETS = [
  'spike-clone-hybrid.html',
  'spike-clone-hybrid.webmanifest',
  'spike-ff-icons/180.png',
  'spike-ff-icons/192.png',
  'spike-ff-icons/512.png',
  'img/today.jpg',
  'img/dream-body.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(resp => {
      if (resp.ok && new URL(e.request.url).origin === location.origin) {
        const copy = resp.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return resp;
    }).catch(() => caches.match('spike-clone-hybrid.html')))
  );
});
