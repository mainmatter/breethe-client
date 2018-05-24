const CACHE_NAME: string = 'breethe-cache-v1';
const JSON_API_CONTENT_TYPE: string = 'application/vnd.api+json';

const PRE_CACHED_ASSETS: string[] = [
  '/app.js',
  '/app.css'
];

self.addEventListener('install', function(event) {
  let now = Date.now();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      let cachePromises = PRE_CACHED_ASSETS.map(function(asset) {
        var url = new URL(asset, location.href);
        var request = new Request(url, { mode: 'no-cors' });
        return fetch(request).then(function(response) {
          if (response.status >= 400) {
            throw new Error('prefetch failed!');
          }
          return cache.put(asset, response);
        });
      });

      return Promise.all(cachePromises);
    });
  });
});

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
              let contentType = response.headers.get('content-type') || '';
              if (response.status < 400 && !contentType.startsWith(JSON_API_CONTENT_TYPE)) {
                cache.put(event.request, response.clone());
              }
              return response;
            });
          }
        });
      })
    );
  }
});
