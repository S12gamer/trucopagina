/* Service worker · Generador de Portafolios (generado por build.py) */
const CACHE = 'portafolios-824cc47ae5';
const PRECACHE = [
  "./",
  "fonts/dm-mono-latin-400-normal.woff2",
  "fonts/dm-mono-latin-500-normal.woff2",
  "fonts/dm-sans-latin-300-normal.woff2",
  "fonts/dm-sans-latin-400-normal.woff2",
  "fonts/dm-sans-latin-500-normal.woff2",
  "fonts/dm-sans-latin-600-normal.woff2",
  "fonts/dm-sans-latin-700-normal.woff2",
  "fonts/fonts.css",
  "fonts/playfair-display-latin-400-italic.woff2",
  "fonts/playfair-display-latin-400-normal.woff2",
  "fonts/playfair-display-latin-700-normal.woff2",
  "fonts/playfair-display-latin-900-normal.woff2",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "index.html",
  "libs/FileSaver.min.js",
  "libs/jszip.min.js",
  "libs/pdf-lib.min.js",
  "libs/pdf.min.js",
  "libs/pdf.worker.min.js",
  "libs/pizzip.min.js",
  "manifest.webmanifest",
  "plantilla.js"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('portafolios-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    if (hit) return hit;
    return fetch(req).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error());
  }));
});
