const CACHE_NAME = 'icpworldmemepad-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/generated/icpworldmemepad-logo-transparent.dim_200x200.png',
  '/assets/generated/pwa-icon.dim_192x192.png',
  '/assets/generated/pwa-splash.dim_512x512.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching essential assets');
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('Failed to cache some assets:', error);
          // Don't fail installation if some assets fail to cache
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache).catch((error) => {
              console.warn('Failed to cache:', event.request.url, error);
            });
          });

        return response;
      })
      .catch((error) => {
        console.log('Fetch failed, trying cache:', event.request.url);
        // Network failed, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If not in cache and it's a navigation request, return index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Otherwise, throw the error
            throw error;
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
