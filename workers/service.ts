const CACHE_NAME: string = 'breethe-cache-v1';
const CACHED_FILES = ['']

self.addEventListener('activate', function(event: ExtendableEvent) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        // delete old caches
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event: FetchEvent) {
  if (event.request.url.startsWith(self.location.origin) && event.request.mode !== 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request.clone()).then(function(response) {
              if (response.status < 400) {
                cache.put(event.request, response.clone());
              }
              return response;
            });
          }
        }).catch(function(error) {
          throw error;
        });
      })
    );
  }
});
