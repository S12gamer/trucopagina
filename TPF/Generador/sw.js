/**
 * sw.js
 * ─────────────────────────────────────────────────────────
 * Service Worker de la app. Objetivo: que TODO — abrir la app,
 * ver el formulario, generar y descargar el .docx — funcione
 * sin conexión después de la primera visita.
 *
 * Para lograrlo hay que precachear no solo el "app shell"
 * (HTML/CSS/JS/manifest) sino también:
 *   - las librerías por CDN (Quill, FileSaver, PizZip, JSZip)
 *   - la plantilla .docx que la app descarga de GitHub en
 *     tiempo de ejecución (sin esto, generar offline fallaría
 *     aunque el resto de la app cargara bien)
 * ─────────────────────────────────────────────────────────
 */

// Sube este número cada vez que cambies archivos precacheados
// para forzar que los usuarios reciban la versión nueva.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `reportes-app-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './pwa.js',
  './manifest.webmanifest',
];

const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css',
  'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
  'https://unpkg.com/pizzip@3.1.4/dist/pizzip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
];

// La plantilla real que descarga generarDocumento()/la vista previa.
// Si en tu app.js agregas más materias con su propio archivo en
// githubUrls, añade también esas URLs aquí para que también queden
// disponibles offline.
const TEMPLATE_ASSETS = [
  'https://raw.githubusercontent.com/s12gamer/gxdasnz/main/Formato%20vacio%20form2.docx',
];

const PRECACHE_URLS = [...APP_SHELL, ...CDN_ASSETS, ...TEMPLATE_ASSETS];

/* ── INSTALL: precachea todo lo de arriba ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // cache.addAll() es "todo o nada": si UN solo recurso falla
      // (ej. un ícono que todavía no subiste), se cae el precache
      // completo. Por eso cacheamos uno por uno y solo avisamos en
      // consola si alguno falla, sin tumbar la instalación.
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            // mode:'no-cors' para los recursos cross-origin que no
            // mandan cabeceras CORS (CDN de scripts/estilos). Para
            // la plantilla de GitHub y los archivos propios, el modo
            // por defecto ('cors'/'same-origin') funciona porque
            // raw.githubusercontent.com sí manda Access-Control-Allow-Origin.
            const isCrossOriginCDN = CDN_ASSETS.includes(url);
            const req = isCrossOriginCDN ? new Request(url, { mode: 'no-cors' }) : url;
            const res = await fetch(req);
            await cache.put(url, res);
          } catch (err) {
            console.warn('[SW] No se pudo precachear:', url, err);
          }
        })
      );

      self.skipWaiting();
    })()
  );
});

/* ── ACTIVATE: limpia caches de versiones anteriores ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('reportes-app-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      self.clients.claim();
    })()
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo interceptamos GET; todo lo demás (si alguna vez hay POST a
  // un backend propio, por ejemplo) pasa directo a la red.
  if (request.method !== 'GET') return;

  // Navegación (abrir/recargar index.html): network-first, con
  // fallback al cache para que la app siga abriendo sin conexión.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Todo lo demás (CSS/JS propios, CDN, la plantilla .docx, fuentes):
  // cache-first + actualización en segundo plano (stale-while-revalidate).
  // Esto es lo que hace posible generar el documento estando offline:
  // si ya se descargó una vez la plantilla, sale del cache al instante.
  event.respondWith(staleWhileRevalidate(event));
});

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || caches.match('./index.html');
  }
}

async function staleWhileRevalidate(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      // Solo guardamos respuestas válidas (200 normales, u "opacas"
      // de recursos CDN cross-origin sin CORS).
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  // Mantiene vivo al SW hasta que la actualización en segundo plano
  // termine, aunque ya hayamos respondido con la versión en cache.
  event.waitUntil(networkFetch);

  // Si ya está en cache, respondemos al instante (offline-friendly).
  // Si no está, esperamos la red (primera visita a ese recurso).
  return cached || (await networkFetch) || cached;
}
