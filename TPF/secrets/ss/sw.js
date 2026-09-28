// Bóveda del Nodo — service worker
// Cachea el "shell" de la app (HTML/CSS/JS/íconos) para que abra sin conexión.
// Los datos (Realtime Database/Storage) los maneja el SDK de Firebase, que
// tiene su propia caché y reintentos; este service worker no intercepta
// esas peticiones (solo las del propio origen).
//
// IMPORTANTE: cada vez que edites CUALQUIER archivo del proyecto (sobre todo
// js/config.js), sube este sw.js de nuevo también y sube el número de
// VERSION de abajo. Eso obliga a que todos los navegadores que ya tenían la
// app instalada bajen la versión nueva en vez de seguir usando una copia
// vieja en caché. Si solo cambias config.js pero no subes un sw.js con
// VERSION distinta, algunos navegadores podrían tardar en notar el cambio.

const VERSION = 'boveda-v4';
const SHELL_CACHE = `boveda-shell-${VERSION}`;

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/config.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './offline.html'
];

// Archivos que cambian seguido y que SIEMPRE deben pedirse a la red primero
// (config.js sobre todo: si quedara en caché desde antes de configurar
// Firebase, la app mostraría para siempre el aviso de "falta configurar"
// aunque ya esté todo correcto). Solo se usa la copia en caché si no hay
// conexión.
const NETWORK_FIRST = ['/js/config.js', '/js/app.js', '/index.html', '/'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('boveda-shell-') && k !== SHELL_CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isShellRequest(url) {
  // Solo intervenimos peticiones al propio origen (nuestros archivos).
  // Todo lo demás (Firebase, Realtime Database, Storage, Google APIs,
  // fuentes, Stack Overflow) pasa directo a la red.
  return url.origin === self.location.origin;
}
function isNetworkFirst(pathname) {
  return NETWORK_FIRST.some(p => pathname.endsWith(p)) || pathname === '/';
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (!isShellRequest(url)) return; // deja pasar Firebase y todo lo externo

  const networkFirst = req.mode === 'navigate' || isNetworkFirst(url.pathname);

  if (networkFirst) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) { const copy = res.clone(); caches.open(SHELL_CACHE).then(c => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./offline.html') : undefined)))
    );
    return;
  }

  // Resto de archivos estáticos (íconos, manifest, css): caché primero,
  // red de respaldo, y actualización silenciosa en segundo plano.
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.ok) caches.open(SHELL_CACHE).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
