const CACHE_NAME = 'persimmon-adventure-v21';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css?v=21',
  './js/main.js?v=21',
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
  './js/minigames/whackMoleGame.js',
  './js/minigames/shootingGalleryGame.js',
  './js/minigames/cloudGliderGame.js',
  './js/minigames/bossParryGame.js',
  './js/minigames/riverRaftGame.js',
  './js/minigames/nightMarketGame.js',
  './js/minigames/iceGliderGame.js',
  './js/minigames/rhythmParryGame.js',
  './js/ui/hud.js',
  './assets/hero_transparent.png',
  './assets/hero_level2.png',
  './assets/hero_level3.png',
  './assets/hero_level4.png',
  './assets/hero_level5.png',
  './assets/hero_level6.png',
  './assets/hero_level7.png',
  './assets/hero_level8.png',
  './assets/hero_level9.png',
  './assets/hero_level10.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all game assets v12 with 10 Levels & 10 Mini-Games');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Partial cache error:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First for dynamic / script resources, fallback to cache when offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
