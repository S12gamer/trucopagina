const CACHE_NAME = 'tpftest-cache-v2';
const ASSETS = [
  '/trucopagina/TPF/testzone/TPF.html',
  '/trucopagina/TPF/testzone/genformevs.html',
  '/trucopagina/TPF/testzone/SPYidle.html',
  '/trucopagina/TPF/testzone/manifest.json'
];

// Instalar el Service Worker y almacenar los archivos en la caché local
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar y remover versiones antiguas de la caché
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First: Intenta cargar desde internet para ver cambios; si no hay red, usa la caché
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});