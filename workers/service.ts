const CACHE_NAME: string = 'breethe-cache-v1';
const JSON_API_CONTENT_TYPE: string = 'application/vnd.api+json';

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
              let contentType = response.headers.get('content-type');
              if (response.status < 400 && !(contentType || '').startsWith(JSON_API_CONTENT_TYPE)) {
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
