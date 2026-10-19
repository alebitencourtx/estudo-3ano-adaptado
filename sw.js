// Service Worker para habilitar instalação PWA no Chrome / Android
const CACHE_NAME = 'treino-3ano-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through com fallback de rede
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
