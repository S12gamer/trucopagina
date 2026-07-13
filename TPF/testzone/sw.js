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
// 3. Intercepción Inteligente (Aquí ocurre la magia para PyScript y Monaco)
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Si la petición va hacia PyScript o el CDN de Monaco Editor
  if (url.includes('pyscript.net') || url.includes('jsdelivr.net')) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        // Si ya lo tenemos guardado en el teléfono, lo entrega al instante sin usar internet
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si no lo tiene, lo descarga de internet, lo clona y lo guarda en la caché para la próxima vez
        return fetch(e.request).then((networkResponse) => {
          return caches.open('tpf-external-libs').then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // Si falla internet y no está en caché, devuelve un error limpio
          return new Response('Error de red offline', { status: 503 });
        });
      })
    );
  } else {
    // Para tus archivos locales normales (Estrategia habitual)
    e.respondWith(
      fetch(e.request).catch(() => {
        return caches.match(e.request);
      })
    );
  }
});