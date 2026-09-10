/**
 * pwa.js
 * ─────────────────────────────────────────────────────────
 * Todo el comportamiento "PWA" de la app, separado de app.js:
 *   1. Registra el Service Worker (offline real, incluida la
 *      plantilla .docx que se descarga de GitHub).
 *   2. Captura beforeinstallprompt apenas carga la página, SIN
 *      mostrar nada todavía (lo guarda para usarlo después).
 *   3. Muestra un banner de "atención" nada más abrir la app.
 *   4. Ofrece instalar justo cuando el usuario está por generar
 *      (o generando) su documento — que es el momento de mayor
 *      intención de uso, y por eso el mejor momento para pedirlo.
 * ─────────────────────────────────────────────────────────
 */

let deferredPrompt = null;
let installOfferShown = false; // para no repetir el banner en la misma sesión

/**
 * Llamar una sola vez, en el DOMContentLoaded de app.js.
 */
export function initPWA() {
  registerServiceWorker();
  captureInstallPrompt();
  showAttentionBanner();
}

/* ── Service Worker ── */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.info('[PWA] Service worker registrado.', reg.scope);
    }).catch((err) => {
      console.error('[PWA] No se pudo registrar el service worker:', err);
    });
  });
}

/* ── Captura temprana del evento de instalación ── */
function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    console.info('[PWA] Instalación disponible (esperando el momento oportuno para ofrecerla).');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallBanner();
    console.info('[PWA] App instalada.');
  });
}

/* ─────────────────────────────────────────────────────────
   BANNER DE ATENCIÓN AL ABRIR
   Un mensaje breve, no bloqueante, que aparece a los pocos
   segundos de abrir la app y se retira solo. No pide instalar
   todavía — solo presenta el "modo offline" como beneficio.
   ───────────────────────────────────────────────────────── */
function showAttentionBanner() {
  const banner = document.getElementById('attention_banner');
  if (!banner) return;

  // Ya se instaló o ya se mostró en una sesión anterior reciente -> no molestar
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  setTimeout(() => {
    banner.classList.add('show');
  }, 1200);

  const closeBtn = banner.querySelector('[data-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => banner.classList.remove('show'));
  }

  // Se retira solo si el usuario no interactúa
  setTimeout(() => banner.classList.remove('show'), 9000);
}

/* ─────────────────────────────────────────────────────────
   OFERTA DE INSTALACIÓN AL GENERAR
   Se llama desde generarDocumento() en app.js, justo cuando el
   usuario ya validó el formulario y está a punto de/está generando
   el documento — el momento de mayor intención de uso.
   ───────────────────────────────────────────────────────── */
export function offerInstall() {
  if (installOfferShown) return;       // ya se ofreció en esta sesión
  if (!deferredPrompt) return;         // el navegador no dio el evento (ya instalada / no soportado)

  installOfferShown = true;

  const banner = document.getElementById('install_banner');
  if (!banner) return;

  // Pequeño delay para no pisar el banner de "Descargando plantilla..."
  setTimeout(() => banner.classList.add('show'), 1500);

  const installBtn = banner.querySelector('[data-install]');
  const dismissBtn = banner.querySelector('[data-dismiss]');

  installBtn?.addEventListener('click', async () => {
    hideInstallBanner();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.info(`[PWA] Usuario respondió a la instalación: ${outcome}`);
    deferredPrompt = null;
  }, { once: true });

  dismissBtn?.addEventListener('click', hideInstallBanner, { once: true });
}

function hideInstallBanner() {
  const banner = document.getElementById('install_banner');
  if (banner) banner.classList.remove('show');
}
