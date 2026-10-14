/* Synaps · service worker
   Guarda la aplicación y lo necesario para generar formatos (librerías, plantilla .docx, materias y catálogo)
   para que todo funcione sin conexión. Las llamadas a las APIs de IA siempre van a la red.
   Si cambias index.html, sube el número de VERSION para que los dispositivos se actualicen. */
const VERSION = 'synaps-v4';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
const LIBS = [
  'https://unpkg.com/pizzip@3.1.4/dist/pizzip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];
const DATA = [
  'https://s12gamer.github.io/trucopagina/TPF/app.js',
  'https://s12gamer.github.io/trucopagina/TPF/genformevs.html',
  'https://raw.githubusercontent.com/s12gamer/gxdasnz/main/Formato%20vacio%20form2.docx'
];
const DATA_HOSTS = ['s12gamer.github.io', 'raw.githubusercontent.com'];
const keyOf = (url) => { const u = new URL(url); return u.origin + u.pathname; };

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await Promise.allSettled([...CORE, ...LIBS, ...DATA].map(async (u) => {
      const r = await fetch(u, { cache: 'reload' });
      if (r.ok) await c.put(keyOf(new URL(u, self.location).href), r);
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const same = u.origin === self.location.origin;
  const isLib = LIBS.some((l) => keyOf(l) === keyOf(req.url));
  const isData = DATA_HOSTS.includes(u.hostname);
  if (!(same || isLib || isData)) return;           // APIs de IA y demás: siempre a la red
  const key = keyOf(req.url);

  if (isLib) {                                       // librerías: primero la copia guardada
    e.respondWith((async () => {
      const hit = await caches.match(key);
      if (hit) return hit;
      const r = await fetch(req);
      if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(key, cp)); }
      return r;
    })());
    return;
  }

  e.respondWith((async () => {                       // lo demás: red primero, copia guardada si no hay internet
    try {
      const r = await fetch(req);
      if (r && r.ok) { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(key, cp)); }
      return r;
    } catch (err) {
      const hit = (await caches.match(key)) ||
        (req.mode === 'navigate' ? (await caches.match(keyOf(new URL('./', self.location).href))) || (await caches.match(keyOf(new URL('index.html', self.location).href))) : null);
      return hit || new Response('Sin conexión', { status: 503, statusText: 'Offline' });
    }
  })());
});
