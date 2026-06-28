/* Archaeosweeper — Service Worker
   Cache-first strategy: game loads instantly offline after first visit.
   Bump CACHE_NAME to force update when you push a new version. */

const CACHE_NAME = 'archaeosweeper-v2';

const PRECACHE = [
  '/archaeosweeper.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap',
];

// Install: pre-cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached) return cached;
      return fetch(event.request).then(response => {
        // only cache same-origin and Google Fonts
        if(
          response.ok &&
          (event.request.url.startsWith(self.location.origin) ||
           event.request.url.includes('fonts.googleapis.com') ||
           event.request.url.includes('fonts.gstatic.com'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // offline fallback: return cached game page if available
      if(event.request.destination === 'document') {
        return caches.match('/archaeosweeper.html');
      }
    })
  );
});
