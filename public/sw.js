const CACHE_NAME = 'lv-feed-index-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other critical assets like main JS/CSS bundles if their names are static
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        // Optional: return a generic offline page
        // if (event.request.mode === 'navigate') {
        //   return caches.match('/offline.html');
        // }
      });
    })
  );
});
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});