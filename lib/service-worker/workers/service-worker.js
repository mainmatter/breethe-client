const CACHE_NAME = 'breethe-cache-v1';
const JSON_API_CONTENT_TYPE = 'application/vnd.api+json';
const HTML_CONTENT_TYPE = 'text/html';

const PRE_CACHED_ASSETS = [
  '/app.js',
  '/app.css',
  '/index.html',
  'https://fonts.googleapis.com/css?family=Poppins:400,500,700'
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
    })
  );
});

self.addEventListener('activate', function(event) {
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

self.addEventListener('fetch', function(event) {
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

self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').startsWith(HTML_CONTENT_TYPE))) {
    event.respondWith(
      fetch(event.request).catch(error => {
        return caches.match('index.html');
      })
    );
  }
});
