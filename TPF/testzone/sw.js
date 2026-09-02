/* ═══ OneSignal: combinamos su Service Worker con el nuestro ═══
   Esto hace que OneSignal maneje sus propios eventos push/notificationclick
   dentro de este mismo archivo, sin necesidad de un segundo Service Worker
   (que causaría conflicto de "scope" con el nuestro). */
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

/* ════════════════════════════════════════════════════════════════
   SERVICE WORKER — Centro de Recursos Académicos (CDRA App)
   Objetivo: que la PWA funcione lo más completo posible sin conexión:
     1) El "app shell" (TPF.html, genformevs.html, SPYidle.html, manifest, íconos)
     2) El motor de Python de SPYidle (PyScript + Pyodide + paquetes numpy/matplotlib/sympy)
     3) El editor de código Monaco (SPYidle) y el editor de texto Quill (genformevs)
     4) El motor de generación/vista previa de .docx (PizZip, JSZip, FileSaver)
     5) La plantilla .docx que normalmente se descarga de GitHub en cada generación
     6) Las tipografías de Google Fonts
   ════════════════════════════════════════════════════════════════ */

const CACHE_VERSION   = 'v5';
const APP_SHELL_CACHE = `tpf-app-shell-${CACHE_VERSION}`;
const CDN_CACHE       = `tpf-cdn-libs-${CACHE_VERSION}`;
const TEMPLATE_CACHE  = `tpf-plantillas-${CACHE_VERSION}`;
const RUNTIME_CACHE   = `tpf-runtime-${CACHE_VERSION}`;

const TODAS_LAS_CACHES = [APP_SHELL_CACHE, CDN_CACHE, TEMPLATE_CACHE, RUNTIME_CACHE];

// Carpeta donde vive la app (debe coincidir con "scope" del manifest.json)
const BASE = '/trucopagina/TPF/testzone/';

// 1) Archivos propios de la app. Se guardan uno por uno: si falta un ícono
//    (por ejemplo porque aún no lo subiste al servidor) NO debe romper la
//    instalación de todo el Service Worker.
const APP_SHELL = [
  BASE,
  BASE + 'TPF.html',
  BASE + 'genformevs.html',
  BASE + 'SPYidle.html',
  BASE + 'manifest.json',
  BASE + 'CDA icon.png',
  BASE + 'CRDA icon.png'
];

// 2) Plantilla(s) .docx que normalmente se piden a GitHub en cada clic de
//    "Generar documento". Al precachearlas, la primera vez que el usuario
//    abre la app (con internet) quedan guardadas para siempre offline.
const PLANTILLAS_DOCX = [
  'https://raw.githubusercontent.com/s12gamer/gxdasnz/main/Formato%20vacio%20form2.docx'
];

// 3) Hosts de CDN de los que dependen los "motores" de la app:
//    - pyscript.net              → motor de Python (PyScript) usado en SPYidle
//    - cdn.jsdelivr.net          → Pyodide/paquetes de Python, Monaco Editor, Quill
//    - unpkg.com                 → PizZip (motor del generador de .docx)
//    - cdnjs.cloudflare.com      → JSZip y FileSaver (motor del generador de .docx)
//    - fonts.googleapis.com/gstatic.com → tipografías
//    - pypi.org / files.pythonhosted.org → por si Pyodide/PyScript llegan a
//      resolver paquetes de Python desde ahí
const CDN_HOSTS = [
  'pyscript.net',
  'pyscript.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'pypi.org',
  'files.pythonhosted.org'
];

/* ────────────────────────────────────────────
   INSTALACIÓN: precachea todo lo anterior
──────────────────────────────────────────── */
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const shellCache = await caches.open(APP_SHELL_CACHE);
    await Promise.all(APP_SHELL.map(async (url) => {
      try { await shellCache.add(new Request(url, { cache: 'reload' })); }
      catch (err) { console.warn('[SW] No se pudo precachear (app shell):', url, err); }
    }));

    const templateCache = await caches.open(TEMPLATE_CACHE);
    await Promise.all(PLANTILLAS_DOCX.map(async (url) => {
      try { await templateCache.add(new Request(url, { mode: 'cors' })); }
      catch (err) { console.warn('[SW] No se pudo precachear plantilla:', url, err); }
    }));

    self.skipWaiting();
  })());
});

/* ────────────────────────────────────────────
   ACTIVACIÓN: limpia cachés viejas y toma control
──────────────────────────────────────────── */
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => !TODAS_LAS_CACHES.includes(k)).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/* ────────────────────────────────────────────
   Utilidades
──────────────────────────────────────────── */
function esPlantillaDocx(url) {
  return url.includes('raw.githubusercontent.com');
}

function esCDN(url) {
  try {
    const host = new URL(url).host;
    return CDN_HOSTS.some((h) => host.includes(h));
  } catch (_) {
    return false;
  }
}

// Cache-first + actualización en segundo plano (stale-while-revalidate).
// Ideal para recursos versionados que casi nunca cambian (librerías, plantilla, fuentes):
// si ya está en caché se entrega al instante y funciona 100% offline.
async function cacheFirstConActualizacion(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cacheado = await cache.match(req, { ignoreVary: true });

  const actualizarEnSegundoPlano = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  if (cacheado) {
    actualizarEnSegundoPlano; // no se espera, se actualiza en segundo plano
    return cacheado;
  }

  const red = await actualizarEnSegundoPlano;
  if (red) return red;

  return new Response('Recurso no disponible sin conexión.', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

// Network-first con respaldo en caché. Ya NO se usa por defecto para las
// páginas de la app (ver más abajo, ahora usan cache-first para abrir más
// rápido), pero la dejamos aquí por si algún día necesitas que una página en
// particular SIEMPRE muestre la versión más nueva antes que la de caché.
async function networkFirstConRespaldo(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cacheado = await cache.match(req, { ignoreSearch: true });
    if (cacheado) return cacheado;

    // Si es una navegación (el usuario abrió/recargó una página) y no hay nada
    // en caché para esa URL exacta, al menos abrimos la app por su entrada principal.
    if (req.mode === 'navigate') {
      const inicio = await cache.match(BASE + 'TPF.html');
      if (inicio) return inicio;
    }

    return new Response('Sin conexión y sin copia guardada de este archivo.', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

/* ────────────────────────────────────────────
   INTERCEPCIÓN DE PETICIONES
──────────────────────────────────────────── */
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Solo interceptamos lecturas (GET). Todo lo demás (POST, etc.) va directo a la red.
  if (req.method !== 'GET') return;

  const url = req.url;

  // 1) Plantilla(s) .docx de GitHub → cache-first: si ya la tenemos guardada,
  //    NUNCA se vuelve a pedir a GitHub salvo para refrescarla en segundo plano.
  if (esPlantillaDocx(url)) {
    e.respondWith(cacheFirstConActualizacion(req, TEMPLATE_CACHE));
    return;
  }

  // 2) Motores/librerías externas: PyScript, Pyodide y sus paquetes de Python,
  //    Monaco Editor, Quill, PizZip, JSZip, FileSaver, Google Fonts.
  if (esCDN(url)) {
    e.respondWith(cacheFirstConActualizacion(req, CDN_CACHE));
    return;
  }

  // 3) Archivos propios de la app (TPF.html, genformevs.html, SPYidle.html, manifest, íconos...)
  //    Cache-first con actualización en segundo plano: la página se abre AL
  //    INSTANTE con la copia guardada (sin esperar a internet), y mientras
  //    tanto se descarga la versión más nueva en silencio para la próxima
  //    vez que se abra. Esto es lo que hace que las variables de
  //    localStorage se pinten de inmediato en vez de esperar la red.
  const esMismoOrigen = url.startsWith(self.location.origin);
  if (esMismoOrigen) {
    e.respondWith(cacheFirstConActualizacion(req, APP_SHELL_CACHE));
    return;
  }

  // 4) Cualquier otro recurso externo (por ejemplo, imágenes o archivos sueltos
  //    que la app llegue a pedir): se intenta guardar también para que, si el
  //    usuario ya lo abrió una vez con internet, quede disponible después.
  e.respondWith(cacheFirstConActualizacion(req, RUNTIME_CACHE));
});

/* ════════════════════════════════════════════════════════════════
   PUSH NOTIFICATIONS — SISTEMA PROPIO (VAPID) — DESACTIVADO
   ─────────────────────────────────────────────────────────────
   Mientras uses OneSignal (ver /backend/README.md para cuándo migrar),
   este bloque debe quedar COMENTADO: OneSignal ya registra sus propios
   listeners "push" y "notificationclick" (los trae el importScripts de
   arriba). Si activas ambos a la vez, cada notificación push se mostraría
   DOBLE (una vez por cada listener) y con formatos distintos.

   Para migrar de OneSignal a tu propio backend VAPID más adelante:
     1) Quita la línea "importScripts(...OneSignalSDK.sw.js...)" de arriba.
     2) Descomenta todo este bloque.
     3) Sigue /backend/README.md para desplegar tu backend propio.
     4) En cada HTML, quita el <script> de OneSignal y usa de nuevo el
        bloque "PUSH NOTIFICATIONS: suscripción del navegador" con VAPID.
   ════════════════════════════════════════════════════════════════

// Endpoint de tu backend para re-registrar la suscripción si el navegador
// la invalida (poco frecuente, pero es buena práctica manejarlo).
// Reemplaza esta URL por la de tu backend cuando lo despliegues.
const NOTIFY_BACKEND_URL = 'https://TU-BACKEND.vercel.app';

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { title: 'Centro de Recursos Académicos', body: event.data ? event.data.text() : '' };
  }

  const titulo = data.title || 'Centro de Recursos Académicos';
  const opciones = {
    body: data.body || '',
    icon: data.icon || (BASE + 'CDA icon.png'),
    badge: data.badge || (BASE + 'CDA icon.png'),
    image: data.image || undefined,
    tag: data.tag || 'cdra-notificacion',
    renotify: !!data.tag,
    data: { url: data.url || (BASE + 'TPF.html') },
    actions: Array.isArray(data.actions) ? data.actions : []
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', (event) => {
  const accion = event.action; // '' si se hizo clic en el cuerpo, o el id del botón
  event.notification.close();

  if (accion === 'cerrar') return; // el usuario solo quería descartarla

  const destino = (event.notification.data && event.notification.data.url) || (BASE + 'TPF.html');

  event.waitUntil((async () => {
    const clientesAbiertos = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clientesAbiertos) {
      if (c.url.startsWith(self.location.origin) && 'focus' in c) {
        await c.focus();
        if ('navigate' in c) return c.navigate(destino);
        return;
      }
    }
    return clients.openWindow(destino);
  })());
});

// Si el navegador invalida la suscripción (raro, pero ocurre), se re-suscribe
// automáticamente y avisa al backend para que actualice sus datos.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    try {
      const nuevaSub = await self.registration.pushManager.subscribe(event.oldSubscription.options);
      await fetch(NOTIFY_BACKEND_URL + '/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaSub)
      });
    } catch (err) {
      console.warn('[SW] No se pudo renovar la suscripción push:', err);
    }
  })());
});

════════════════════════════════════════════════════════════════ */