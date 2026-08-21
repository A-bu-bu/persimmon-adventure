const CACHE_NAME = 'persimmon-adventure-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css?v=6',
  './js/main.js?v=6',
  './js/pwa.js',
  './js/engine/audio.js',
  './js/engine/input.js',
  './js/engine/camera.js',
  './js/engine/physics.js',
  './js/engine/particles.js',
  './js/engine/saveManager.js',
  './js/entities/player.js',
  './js/entities/bullet.js',
  './js/entities/enemy.js',
  './js/entities/boss.js',
  './js/world/tilemap.js',
  './js/world/levelData.js',
  './js/world/objects.js',
  './js/minigames/pawStompGame.js',
  './js/minigames/catchCoinsGame.js',
  './js/ui/hud.js',
  './assets/hero_transparent.png',
  './assets/hero_level2.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all game assets v6');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Partial cache error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First Strategy (Always fetch latest, fallback to cache offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
