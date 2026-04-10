self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Intentionally no fetch handler.
// This service worker exists only to replace stale/broken workers that may
// still be registered on localhost scope from previous runs/projects.
