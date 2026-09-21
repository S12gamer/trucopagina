/* ══════════════════════════════════════════════════════════════════════
   TPF THEME ENGINE
   Sistema de temas por festividad / estación del año.
   ------------------------------------------------------------------------
   Este archivo es 100% independiente del HTML principal. Solo necesita
   estar incluido con:
       <script src="tpf-theme-engine.js"></script>
   colocado justo ANTES de la etiqueta </body>, después del <script> que
   ya trae el archivo (el que define generarFondo, refreshBackground, etc).

   No requiere que edites el HTML para nada más: colores, partículas
   flotantes (copos, hojas, calaveritas, flores, etc.), el gorrito/insignia
   de esquina, los iconos del fondo animado (#worldcup-bg), una guirnalda
   fina repetida en el borde superior, flourishes grandes y suaves en dos
   esquinas de la pantalla, y una franja inferior ondulada (ola, festón
   tipo papel picado o zigzag de carámbanos, según el tema) se generan y
   agregan al DOM desde aquí.

   CÓMO FORZAR UN TEMA MANUALMENTE (para probarlo sin esperar la fecha):
     1) Por URL:           tusitio.html?tema=navidad
     2) Por consola:       TPFTheme.apply('diademuertos')
     3) Por variable global ANTES de este script:
            <script>window.TPF_THEME_FORCE = 'independencia';</script>
            <script src="tpf-theme-engine.js"></script>
     4) Desactivar cualquier tema:  tusitio.html?tema=ninguno

   Temas incluidos: navidad, anonuevo, diademuertos, halloween, independencia,
   21septiembre, sanvalentin, diadelnino, diamadres, regresoaclases, primavera,
   verano, otono, invierno.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ────────────────────────────────────────────────────────────────────
     1. CONFIGURACIÓN EDITABLE
     Cambia estos valores para ajustar el comportamiento sin tocar lógica.
  ──────────────────────────────────────────────────────────────────── */
  const CONFIG = {
    enabled: true,              // apaga todo el motor si es false
    allowUrlParam: true,        // permite ?tema=xxx en la URL
    urlParamNames: ["tema", "theme"],
    showParticles: true,        // copos / hojas / flores flotantes
    showBadge: true,            // insignia flotante de esquina
    themeBackgroundShapes: true,// reemplaza los iconos del fondo ambient
    showGarland: true,          // franja/guirnalda decorativa arriba de la pantalla
    showCorners: true,          // figuras grandes y suaves en dos esquinas
    showBottomStrip: true,      // franja ondulada/festón decorativa abajo
    showUIAccents: true,        // figuras PEGADAS a la interfaz: logo, tarjetas,
                                 // botones, pie del menú, títulos de sección y
                                 // encabezados de página (no solo el fondo)
    particleCount: 22,          // partículas simultáneas en pantalla
    badgePosition: "bottom-left" // "bottom-left" | "bottom-right"
  };

  if (!CONFIG.enabled) return;

  /* ────────────────────────────────────────────────────────────────────
     2. CATÁLOGO DE TEMAS
     Cada tema define: rango(s) de fecha, paleta de acento, colores de
     los "orbes" ambientales, emojis para las partículas, modo de
     animación de partícula y las figuras SVG para el fondo animado.
  ──────────────────────────────────────────────────────────────────── */

  // Generador de SVG simple, estilo línea, con placeholder COLOR (igual
  // que el patrón que ya usa el archivo original en BG_SHAPES).
  const S = (inner) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const shapeAttrs = 'fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';

  const SHAPES = {
    copoNieve: S(`<g ${shapeAttrs}><line x1="50" y1="10" x2="50" y2="90"/><line x1="15" y1="30" x2="85" y2="70"/><line x1="15" y1="70" x2="85" y2="30"/><line x1="50" y1="10" x2="40" y2="22"/><line x1="50" y1="10" x2="60" y2="22"/><line x1="50" y1="90" x2="40" y2="78"/><line x1="50" y1="90" x2="60" y2="78"/></g>`),
    arbolNavidad: S(`<path d="M50 8 L70 40 L60 40 L78 66 L64 66 L82 92 L18 92 L36 66 L22 66 L40 40 L30 40 Z" ${shapeAttrs}/><rect x="44" y="92" width="12" height="8" ${shapeAttrs}/>`),
    estrella: S(`<path d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z" ${shapeAttrs}/>`),
    regalo: S(`<rect x="14" y="40" width="72" height="52" ${shapeAttrs}/><line x1="14" y1="60" x2="86" y2="60" ${shapeAttrs}/><line x1="50" y1="40" x2="50" y2="92" ${shapeAttrs}/><path d="M50 40 C30 40 30 15 50 22 C70 15 70 40 50 40Z" ${shapeAttrs}/>`),
    fuegoArtificial: S(`<g ${shapeAttrs}><circle cx="50" cy="50" r="6"/><line x1="50" y1="50" x2="50" y2="10"/><line x1="50" y1="50" x2="50" y2="90"/><line x1="50" y1="50" x2="10" y2="50"/><line x1="50" y1="50" x2="90" y2="50"/><line x1="50" y1="50" x2="22" y2="22"/><line x1="50" y1="50" x2="78" y2="78"/><line x1="50" y1="50" x2="22" y2="78"/><line x1="50" y1="50" x2="78" y2="22"/></g>`),
    copaBrindis: S(`<path d="M30 10 H70 L58 42 C58 52 50 52 50 52 C50 52 42 52 42 42 Z" ${shapeAttrs}/><line x1="50" y1="52" x2="50" y2="80" ${shapeAttrs}/><line x1="34" y1="90" x2="66" y2="90" ${shapeAttrs}/><line x1="50" y1="80" x2="50" y2="90" ${shapeAttrs}/>`),
    calavera: S(`<path d="M50 12 C25 12 18 32 18 46 C18 60 26 66 26 74 L34 74 L34 66 L40 74 L48 74 L48 66 L52 66 L52 74 L60 74 L60 66 L66 74 L74 74 C74 66 82 60 82 46 C82 32 75 12 50 12Z" ${shapeAttrs}/><circle cx="36" cy="44" r="7" ${shapeAttrs}/><circle cx="64" cy="44" r="7" ${shapeAttrs}/><path d="M50 48 L45 60 L55 60Z" ${shapeAttrs}/>`),
    florCempasuchil: S(`<circle cx="50" cy="50" r="10" ${shapeAttrs}/><g ${shapeAttrs}><path d="M50 40 C40 25 45 10 50 8 C55 10 60 25 50 40Z"/><path d="M50 60 C40 75 45 90 50 92 C55 90 60 75 50 60Z"/><path d="M40 50 C25 40 10 45 8 50 C10 55 25 60 40 50Z"/><path d="M60 50 C75 40 90 45 92 50 C90 55 75 60 60 50Z"/></g>`),
    vela: S(`<path d="M40 40 C40 20 60 20 60 40 L60 90 L40 90 Z" ${shapeAttrs}/><path d="M50 8 C56 16 56 24 50 30 C44 24 44 16 50 8Z" ${shapeAttrs}/>`),
    campana: S(`<path d="M30 68 C30 30 70 30 70 68 L78 78 L22 78 Z" ${shapeAttrs}/><circle cx="50" cy="86" r="6" ${shapeAttrs}/><line x1="50" y1="14" x2="50" y2="22" ${shapeAttrs}/>`),
    banderaMx: S(`<rect x="14" y="20" width="72" height="48" ${shapeAttrs}/><line x1="38" y1="20" x2="38" y2="68" ${shapeAttrs}/><line x1="62" y1="20" x2="62" y2="68" ${shapeAttrs}/><circle cx="50" cy="44" r="7" ${shapeAttrs}/>`),
    laurel: S(`<g ${shapeAttrs}><path d="M50 10 C30 30 30 70 50 92"/><path d="M50 10 C70 30 70 70 50 92"/><ellipse cx="34" cy="35" rx="7" ry="4"/><ellipse cx="30" cy="55" rx="7" ry="4"/><ellipse cx="66" cy="35" rx="7" ry="4"/><ellipse cx="70" cy="55" rx="7" ry="4"/></g>`),
    flor: S(`<circle cx="50" cy="50" r="9" ${shapeAttrs}/><ellipse cx="50" cy="26" rx="12" ry="16" ${shapeAttrs}/><ellipse cx="50" cy="74" rx="12" ry="16" ${shapeAttrs}/><ellipse cx="26" cy="50" rx="16" ry="12" ${shapeAttrs}/><ellipse cx="74" cy="50" rx="16" ry="12" ${shapeAttrs}/>`),
    mariposa: S(`<line x1="50" y1="20" x2="50" y2="86" ${shapeAttrs}/><path d="M50 30 C20 10 8 40 30 52 C45 58 50 45 50 30Z" ${shapeAttrs}/><path d="M50 30 C80 10 92 40 70 52 C55 58 50 45 50 30Z" ${shapeAttrs}/><path d="M50 55 C28 55 20 78 36 82 C46 82 50 68 50 55Z" ${shapeAttrs}/><path d="M50 55 C72 55 80 78 64 82 C54 82 50 68 50 55Z" ${shapeAttrs}/>`),
    hojaVerde: S(`<path d="M50 10 C85 30 85 70 50 92 C15 70 15 30 50 10Z" ${shapeAttrs}/><line x1="50" y1="18" x2="50" y2="86" ${shapeAttrs}/>`),
    sol: S(`<circle cx="50" cy="50" r="18" ${shapeAttrs}/><g ${shapeAttrs}><line x1="50" y1="6" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="94"/><line x1="6" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="94" y2="50"/><line x1="18" y1="18" x2="28" y2="28"/><line x1="72" y1="72" x2="82" y2="82"/><line x1="18" y1="82" x2="28" y2="72"/><line x1="72" y1="28" x2="82" y2="18"/></g>`),
    ola: S(`<path d="M6 40 C20 25 30 25 44 40 C58 55 68 55 82 40" ${shapeAttrs}/><path d="M6 60 C20 45 30 45 44 60 C58 75 68 75 82 60" ${shapeAttrs}/>`),
    lentesSol: S(`<circle cx="30" cy="52" r="16" ${shapeAttrs}/><circle cx="70" cy="52" r="16" ${shapeAttrs}/><line x1="46" y1="48" x2="54" y2="48" ${shapeAttrs}/><line x1="14" y1="46" x2="4" y2="40" ${shapeAttrs}/><line x1="86" y1="46" x2="96" y2="40" ${shapeAttrs}/>`),
    hojaOtono: S(`<path d="M50 12 C74 26 80 50 60 60 C74 66 66 82 50 76 C34 82 26 66 40 60 C20 50 26 26 50 12Z" ${shapeAttrs}/><line x1="50" y1="30" x2="50" y2="80" ${shapeAttrs}/>`),
    bellota: S(`<ellipse cx="50" cy="62" rx="20" ry="24" ${shapeAttrs}/><path d="M28 46 C28 26 72 26 72 46 C60 38 40 38 28 46Z" ${shapeAttrs}/>`),
    carambano: S(`<path d="M40 10 H60 L58 60 L50 92 L42 60 Z" ${shapeAttrs}/><line x1="46" y1="30" x2="54" y2="30" ${shapeAttrs}/>`),
    // ── Nuevas figuras para los temas añadidos ──
    calabaza: S(`<path d="M50 28 C28 28 20 50 20 64 C20 84 33 94 50 94 C67 94 80 84 80 64 C80 50 72 28 50 28Z" ${shapeAttrs}/><line x1="34" y1="50" x2="34" y2="82" ${shapeAttrs}/><line x1="50" y1="46" x2="50" y2="90" ${shapeAttrs}/><line x1="66" y1="50" x2="66" y2="82" ${shapeAttrs}/><path d="M44 28 C44 12 56 12 56 28" ${shapeAttrs}/>`),
    fantasma: S(`<path d="M28 90 L28 46 C28 24 38 12 50 12 C62 12 72 24 72 46 L72 90 L62 80 L54 90 L46 80 L38 90 L28 90Z" ${shapeAttrs}/><circle cx="40" cy="42" r="3" fill="COLOR" stroke="none"/><circle cx="60" cy="42" r="3" fill="COLOR" stroke="none"/>`),
    murcielago: S(`<path d="M50 40 C44 20 20 16 6 24 C20 26 28 34 32 44 C18 42 6 50 4 62 C18 54 30 56 36 62 C34 70 38 78 50 86 C62 78 66 70 64 62 C70 56 82 54 96 62 C94 50 82 42 68 44 C72 34 80 26 94 24 C80 16 56 20 50 40Z" ${shapeAttrs}/>`),
    telarana: S(`<g ${shapeAttrs}><line x1="50" y1="6" x2="50" y2="94"/><line x1="10" y1="30" x2="90" y2="70"/><line x1="10" y1="70" x2="90" y2="30"/><line x1="6" y1="50" x2="94" y2="50"/><path d="M30 18 Q50 26 70 18"/><path d="M16 38 Q50 50 84 38"/><path d="M16 62 Q50 50 84 62"/><path d="M30 82 Q50 74 70 82"/></g>`),
    corazon: S(`<path d="M50 88 C20 64 8 44 8 28 C8 14 20 6 32 6 C42 6 48 14 50 20 C52 14 58 6 68 6 C80 6 92 14 92 28 C92 44 80 64 50 88Z" ${shapeAttrs}/>`),
    sobre: S(`<rect x="10" y="26" width="80" height="56" ${shapeAttrs}/><path d="M10 26 L50 58 L90 26" ${shapeAttrs}/>`),
    papalote: S(`<path d="M50 6 L80 40 L50 88 L20 40 Z" ${shapeAttrs}/><line x1="50" y1="6" x2="50" y2="88" ${shapeAttrs}/><line x1="20" y1="40" x2="80" y2="40" ${shapeAttrs}/><path d="M50 88 C54 92 46 94 50 98" ${shapeAttrs}/>`),
    globo: S(`<ellipse cx="50" cy="38" rx="26" ry="32" ${shapeAttrs}/><path d="M46 78 C46 86 54 86 54 78" ${shapeAttrs}/><line x1="50" y1="86" x2="50" y2="96" ${shapeAttrs}/>`),
    lapiz: S(`<path d="M22 92 L28 70 L66 18 L82 34 L44 86 Z" ${shapeAttrs}/><line x1="58" y1="26" x2="74" y2="42" ${shapeAttrs}/><path d="M22 92 L34 88 L28 70 Z" ${shapeAttrs}/>`),
    libro: S(`<path d="M50 22 C40 14 20 14 12 20 L12 82 C20 76 40 76 50 84 C60 76 80 76 88 82 L88 20 C80 14 60 14 50 22Z" ${shapeAttrs}/><line x1="50" y1="22" x2="50" y2="84" ${shapeAttrs}/>`),
    mochila: S(`<rect x="22" y="34" width="56" height="58" rx="14" ${shapeAttrs}/><path d="M34 34 C34 16 66 16 66 34" ${shapeAttrs}/><rect x="36" y="50" width="28" height="18" rx="4" ${shapeAttrs}/><line x1="30" y1="34" x2="30" y2="24" ${shapeAttrs}/><line x1="70" y1="34" x2="70" y2="24" ${shapeAttrs}/>`),
    // ── Figuras para el 21 de septiembre ──
    discoBall: S(`<line x1="50" y1="6" x2="50" y2="12" ${shapeAttrs}/><line x1="43" y1="6" x2="57" y2="6" ${shapeAttrs}/><circle cx="50" cy="46" r="32" ${shapeAttrs}/><line x1="18" y1="46" x2="82" y2="46" ${shapeAttrs}/><line x1="50" y1="14" x2="50" y2="78" ${shapeAttrs}/><line x1="27" y1="23" x2="73" y2="69" ${shapeAttrs}/><line x1="27" y1="69" x2="73" y2="23" ${shapeAttrs}/><circle cx="50" cy="46" r="32" ${shapeAttrs} stroke-dasharray="1 9"/>`),
    notaMusical: S(`<circle cx="32" cy="78" r="11" ${shapeAttrs}/><circle cx="70" cy="70" r="11" ${shapeAttrs}/><line x1="43" y1="78" x2="43" y2="18" ${shapeAttrs}/><line x1="81" y1="70" x2="81" y2="12" ${shapeAttrs}/><path d="M43 18 L81 12 L81 32 L43 38 Z" ${shapeAttrs}/>`)
  };

  // Utilidades de color: mezclan el color propio de cada sección
  // (Membretes=teal, Formatos=rust, Instrumentaciones=green, Programas=orange...)
  // con el color ambar del tema activo, para que los botones, etiquetas de
  // tipo de archivo y fondos de tarjeta se sientan parte del tema sin perder
  // su identidad de sección.
  const COLORES_SECCION = {
    teal: "#1B7A6E", rust: "#923A28", green: "#2A6545",
    purple: "#5B3E8F", orange: "#C97C2A"
  };
  // Tu CSS original NO usa var(--teal) etc. en todos lados: el fondo de la
  // miniatura (.thumb-X), la etiqueta de tipo de archivo (.badge-X) y el
  // SEGUNDO color del degradado del botón (.btn-X) están escritos con
  // valores fijos. Por eso, aunque --teal ya se mezcle, esos 3 puntos se
  // seguían viendo con su color original (de ahí el "fundido" en vez de
  // color sólido al poner el peso en 1). Aquí mezclamos también esos 3.
  const COLORES_SECCION_EXTRA = {
    teal:   { btn2: "#23A090", thumbA: "#CCE8E4", thumbB: "#A8D8D3" },
    rust:   { btn2: "#B84E35", thumbA: "#F8E8D4", thumbB: "#F0C89E" },
    green:  { btn2: "#37896B", thumbA: "#C8E8D8", thumbB: "#A8D8C0" },
    orange: { btn2: "#E89A3C", thumbA: "#FBE8C4", thumbB: "#F8D498" }
  };
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const norm = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const n = parseInt(norm, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  }
  function mezclarColor(hexBase, hexTema, pesoTema) {
    const a = hexToRgb(hexBase), b = hexToRgb(hexTema);
    return rgbToHex(
      a.r + (b.r - a.r) * pesoTema,
      a.g + (b.g - a.g) * pesoTema,
      a.b + (b.b - a.b) * pesoTema
    );
  }
  // Qué tan fuerte se nota la mezcla: 0 = color de sección puro, 1 = amber puro.
  const PESO_MEZCLA_SECCION = 0.35;

  // Utilidad: convierte una figura del catálogo SHAPES en un data-URI de SVG
  // ya coloreado, listo para usarse en background-image (CSS).
  function prepararSvgInterno(nombreFigura, color, strokeWidth) {
    const fig = SHAPES[nombreFigura];
    if (!fig) return "";
    let inner = fig.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    // Para iconos que se van a mostrar muy chicos (círculos de 14-28px), un
    // trazo de 4 unidades sobre un lienzo de 100 casi desaparece. Al pasar
    // strokeWidth se engrosa el trazo SOLO para ese uso, sin tocar el
    // catálogo original (que se sigue viendo bien grande en el fondo).
    if (strokeWidth) inner = inner.replace(/stroke-width="4"/g, `stroke-width="${strokeWidth}"`);
    return inner.replace(/COLOR/g, color);
  }
  function armarDataUri(svgCompleto) {
    return "data:image/svg+xml," + encodeURIComponent(svgCompleto).replace(/'/g, "%27").replace(/"/g, "%22");
  }
  function svgDataUri(nombreFigura, color, strokeWidth) {
    const inner = prepararSvgInterno(nombreFigura, color, strokeWidth);
    if (!inner) return "";
    return armarDataUri(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`);
  }
  // Combina DOS figuras dentro de un mismo lienzo cuadrado de 100x100 (una a
  // la izquierda, otra a la derecha, cada una a la mitad de tamaño), para
  // usarse como una sola unidad de mosaico que al repetirse en la guirnalda
  // alterna entre ambas figuras sin romper el tamaño/CSS ya definido.
  function svgDataUriPar(nombreA, nombreB, color, strokeWidth) {
    const a = prepararSvgInterno(nombreA, color, strokeWidth);
    const b = prepararSvgInterno(nombreB, color, strokeWidth);
    if (!a) return "";
    if (!b) return svgDataUri(nombreA, color, strokeWidth);
    return armarDataUri(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` +
      `<g transform="translate(1,27) scale(.46)">${a}</g>` +
      `<g transform="translate(51,27) scale(.46)">${b}</g>` +
      `</svg>`
    );
  }

  // Utilidad: rango de días del año (soporta que cruce el 31-dic → 1-ene)
  function enRango(fecha, [m1, d1, m2, d2]) {
    const y = fecha.getFullYear();
    const ini = new Date(y, m1 - 1, d1);
    let fin = new Date(y, m2 - 1, d2);
    if (fin < ini) {
      // el rango cruza fin de año: comparamos contra dos ventanas
      const finAlt = new Date(y + 1, m2 - 1, d2);
      const iniAlt = new Date(y - 1, m1 - 1, d1);
      return (fecha >= ini && fecha <= finAlt) || (fecha >= iniAlt && fecha <= fin);
    }
    return fecha >= ini && fecha <= fin;
  }

  // Orden de prioridad: festividades puntuales primero, estaciones al final
  // (así una fecha dentro de invierno pero también dentro de "navidad"
  // cae primero en "navidad" porque se revisa antes en la lista).
  const THEMES = [
    {
      id: "diademuertos",
      nombre: "Día de Muertos",
      rangos: [[10, 28, 11, 2]],
      badge: "💀🌼 Día de Muertos",
      amber: "#C9622A", amberL: "rgba(201,98,42,.16)", amberGlow: "rgba(201,98,42,.24)",
      bg: "#EFE3D8", surface: "#FBF5EC", surface2: "#F4E9DA",
      orbes: ["rgba(201,98,42,.22)", "rgba(91,62,143,.18)", "rgba(216,163,29,.16)", "rgba(146,58,40,.14)"],
      emojis: ["💀", "🌼", "🕯️", "🦋"],
      modo: "fall",
      figuras: ["calavera", "florCempasuchil", "vela", "mariposa"],
      esquinaFigura: "calavera", guirnaldaFigura: "florCempasuchil", franja: "scallop", detalleFigura: "vela"
    },
    {
      id: "halloween",
      nombre: "Halloween",
      rangos: [[10, 20, 10, 27]],
      badge: "🎃 Halloween",
      amber: "#D9720E", amberL: "rgba(217,114,14,.16)", amberGlow: "rgba(217,114,14,.26)",
      bg: "#E9E2D8", surface: "#F8F1E5", surface2: "#F1E7D6",
      orbes: ["rgba(217,114,14,.22)", "rgba(74,44,110,.20)", "rgba(20,20,24,.14)", "rgba(217,114,14,.12)"],
      emojis: ["🎃", "👻", "🦇", "🕸️"],
      modo: "fall",
      figuras: ["calabaza", "fantasma", "murcielago", "telarana"],
      esquinaFigura: "calabaza", guirnaldaFigura: "murcielago", franja: "zigzag", detalleFigura: "fantasma"
    },
    {
      id: "independencia",
      nombre: "Día de la Independencia",
      rangos: [[9, 12, 9, 17]],
      badge: "🇲🇽 ¡Viva México!",
      amber: "#A32638", amberL: "rgba(163,38,56,.14)", amberGlow: "rgba(163,38,56,.22)",
      bg: "#EDE9DF", surface: "#FAF8F3", surface2: "#F3F0E6",
      orbes: ["rgba(42,101,69,.20)", "rgba(163,38,56,.18)", "rgba(250,248,243,.30)", "rgba(42,101,69,.12)"],
      emojis: ["🎉", "🎊", "🇲🇽"],
      modo: "fall",
      figuras: ["banderaMx", "campana", "laurel", "estrella"],
      esquinaFigura: "banderaMx", guirnaldaFigura: "estrella", franja: "scallop", detalleFigura: "campana"
    },
    {
      // Doble referencia: "Do you remember... the 21st night of
      // September?" (Earth, Wind & Fire) + la lluvia de flores amarillas
      // de "Cien años de soledad" (García Márquez). 4 días, todo amarillo.
      id: "21septiembre",
      nombre: "21 de Septiembre",
      rangos: [[9, 21, 9, 24]],
      badge: "🌼 Llovieron flores amarillas la noche del 21 de septiembre",
      amber: "#F5B700", amberL: "rgba(245,183,0,.18)", amberGlow: "rgba(245,183,0,.3)",
      bg: "#FFFBEA", surface: "#FFFDF3", surface2: "#FFF6D6",
      orbes: ["rgba(245,183,0,.24)", "rgba(255,214,64,.22)", "rgba(230,160,0,.16)", "rgba(255,236,140,.2)"],
      emojis: ["🌼", "✨", "🕺", "💃"],
      modo: "fall",
      figuras: ["flor", "discoBall", "notaMusical", "estrella"],
      esquinaFigura: "discoBall", guirnaldaFigura: "flor", franja: "wave", detalleFigura: "flor"
    },
    {
      id: "navidad",
      nombre: "Navidad",
      rangos: [[12, 1, 12, 25]],
      badge: "🎄 ¡Feliz Navidad!",
      amber: "#B23B3B", amberL: "rgba(178,59,59,.14)", amberGlow: "rgba(178,59,59,.22)",
      bg: "#EDE4DE", surface: "#FBF6F1", surface2: "#F5EBE3",
      orbes: ["rgba(178,59,59,.22)", "rgba(42,101,69,.18)", "rgba(200,166,58,.16)", "rgba(178,59,59,.12)"],
      emojis: ["❄️", "🎄", "⭐", "🎁"],
      modo: "fall",
      figuras: ["copoNieve", "arbolNavidad", "estrella", "regalo"],
      esquinaFigura: "arbolNavidad", guirnaldaFigura: "estrella", franja: "zigzag", detalleFigura: "regalo"
    },
    {
      id: "anonuevo",
      nombre: "Año Nuevo",
      rangos: [[12, 26, 1, 6]],
      badge: "🎆 ¡Feliz Año Nuevo!",
      amber: "#C9A227", amberL: "rgba(201,162,39,.15)", amberGlow: "rgba(201,162,39,.24)",
      bg: "#EBE8EF", surface: "#F9F8FB", surface2: "#F2F0F6",
      orbes: ["rgba(201,162,39,.20)", "rgba(91,62,143,.18)", "rgba(62,91,143,.16)", "rgba(201,162,39,.12)"],
      emojis: ["🎆", "✨", "🥂", "🎉"],
      modo: "twinkle",
      figuras: ["fuegoArtificial", "estrella", "copaBrindis"],
      esquinaFigura: "fuegoArtificial", guirnaldaFigura: "estrella", franja: "wave", detalleFigura: "copaBrindis"
    },
    {
      id: "sanvalentin",
      nombre: "Día del Amor y la Amistad",
      rangos: [[2, 10, 2, 14]],
      badge: "💘 Día del Amor y la Amistad",
      amber: "#C23B5A", amberL: "rgba(194,59,90,.16)", amberGlow: "rgba(194,59,90,.24)",
      bg: "#F3E7EA", surface: "#FDF6F8", surface2: "#F8ECEF",
      orbes: ["rgba(194,59,90,.20)", "rgba(216,120,150,.16)", "rgba(232,180,190,.18)", "rgba(194,59,90,.12)"],
      emojis: ["💌", "💕", "🌹", "💘"],
      modo: "float",
      figuras: ["corazon", "sobre", "flor"],
      esquinaFigura: "corazon", guirnaldaFigura: "corazon", franja: "scallop", detalleFigura: "sobre"
    },
    {
      id: "diadelnino",
      nombre: "Día del Niño",
      rangos: [[4, 28, 4, 30]],
      badge: "🎈 Día del Niño",
      amber: "#2E86C9", amberL: "rgba(46,134,201,.15)", amberGlow: "rgba(46,134,201,.24)",
      bg: "#E6EEF3", surface: "#F5FAFC", surface2: "#EAF2F7",
      orbes: ["rgba(46,134,201,.20)", "rgba(232,169,58,.18)", "rgba(201,124,42,.14)", "rgba(91,62,143,.12)"],
      emojis: ["🎈", "🪁", "🧸", "🎉"],
      modo: "float",
      figuras: ["globo", "papalote", "estrella"],
      esquinaFigura: "globo", guirnaldaFigura: "papalote", franja: "wave", detalleFigura: "papalote"
    },
    {
      id: "diamadres",
      nombre: "Día de las Madres",
      rangos: [[5, 8, 5, 10]],
      badge: "💐 Día de las Madres",
      amber: "#C9587E", amberL: "rgba(201,88,126,.15)", amberGlow: "rgba(201,88,126,.24)",
      bg: "#F3E8ED", surface: "#FCF6F9", surface2: "#F7ECF1",
      orbes: ["rgba(201,88,126,.20)", "rgba(216,163,29,.14)", "rgba(42,101,69,.10)", "rgba(201,88,126,.12)"],
      emojis: ["🌷", "💐", "❤️", "🌸"],
      modo: "fall",
      figuras: ["flor", "corazon", "regalo"],
      esquinaFigura: "flor", guirnaldaFigura: "corazon", franja: "scallop", detalleFigura: "regalo"
    },
    {
      id: "regresoaclases",
      nombre: "Regreso a Clases",
      rangos: [[8, 15, 8, 31]],
      badge: "📚 Regreso a Clases",
      amber: "#2E5FA3", amberL: "rgba(46,95,163,.15)", amberGlow: "rgba(46,95,163,.24)",
      bg: "#E7EBF2", surface: "#F6F8FB", surface2: "#EDF1F7",
      orbes: ["rgba(46,95,163,.20)", "rgba(201,124,42,.14)", "rgba(42,101,69,.14)", "rgba(46,95,163,.10)"],
      emojis: ["📚", "✏️", "🎒", "📐"],
      modo: "fall",
      figuras: ["libro", "lapiz", "mochila"],
      esquinaFigura: "mochila", guirnaldaFigura: "lapiz", franja: "wave", detalleFigura: "libro"
    },
    {
      id: "primavera",
      nombre: "Primavera",
      rangos: [[3, 21, 6, 20]],
      badge: "🌸 Primavera",
      amber: "#C97CA0", amberL: "rgba(201,124,160,.14)", amberGlow: "rgba(201,124,160,.22)",
      bg: "#EBEEE0", surface: "#F9FAF3", surface2: "#F1F4E7",
      orbes: ["rgba(201,124,160,.18)", "rgba(42,101,69,.16)", "rgba(216,197,58,.14)", "rgba(201,124,160,.10)"],
      emojis: ["🌸", "🌷", "🦋", "🌼"],
      modo: "fall",
      figuras: ["flor", "mariposa", "hojaVerde"],
      esquinaFigura: "flor", guirnaldaFigura: "mariposa", franja: "scallop", detalleFigura: "mariposa"
    },
    {
      id: "verano",
      nombre: "Verano",
      rangos: [[6, 21, 9, 11]],
      badge: "☀️ Verano",
      amber: "#E8A93A", amberL: "rgba(232,169,58,.15)", amberGlow: "rgba(232,169,58,.24)",
      bg: "#EFEADB", surface: "#FCF9F0", surface2: "#F6F0DE",
      orbes: ["rgba(232,169,58,.22)", "rgba(62,145,150,.16)", "rgba(232,169,58,.12)", "rgba(27,122,110,.14)"],
      emojis: ["☀️", "🌊", "🍉", "🕶️"],
      modo: "float",
      figuras: ["sol", "ola", "lentesSol"],
      esquinaFigura: "sol", guirnaldaFigura: "ola", franja: "wave", detalleFigura: "lentesSol"
    },
    {
      id: "otono",
      nombre: "Otoño",
      rangos: [[9, 18, 10, 27], [11, 3, 11, 30]],
      badge: "🍂 Otoño",
      amber: "#B5651D", amberL: "rgba(181,101,29,.15)", amberGlow: "rgba(181,101,29,.24)",
      bg: "#EDE5D6", surface: "#FAF4E9", surface2: "#F3E9D5",
      orbes: ["rgba(181,101,29,.22)", "rgba(146,58,40,.16)", "rgba(181,101,29,.12)", "rgba(115,83,67,.14)"],
      emojis: ["🍂", "🍁", "🌰"],
      modo: "fall",
      figuras: ["hojaOtono", "bellota"],
      esquinaFigura: "hojaOtono", guirnaldaFigura: "bellota", franja: "wave", detalleFigura: "hojaOtono"
    },
    {
      id: "invierno",
      nombre: "Invierno",
      rangos: [[1, 7, 3, 20]],
      badge: "❄️ Invierno",
      amber: "#5B7B9A", amberL: "rgba(91,123,154,.14)", amberGlow: "rgba(91,123,154,.22)",
      bg: "#E7EAEE", surface: "#F7F9FB", surface2: "#EEF1F5",
      orbes: ["rgba(91,123,154,.20)", "rgba(84,100,122,.16)", "rgba(91,123,154,.10)", "rgba(62,91,143,.12)"],
      emojis: ["❄️", "🌨️"],
      modo: "fall",
      figuras: ["copoNieve", "carambano"],
      esquinaFigura: "copoNieve", guirnaldaFigura: "carambano", franja: "zigzag", detalleFigura: "copoNieve"
    }
  ];

  const THEMES_BY_ID = Object.fromEntries(THEMES.map(t => [t.id, t]));

  /* ────────────────────────────────────────────────────────────────────
     3. RESOLUCIÓN DEL TEMA A APLICAR
  ──────────────────────────────────────────────────────────────────── */
  function detectarPorFecha(fecha) {
    for (const tema of THEMES) {
      if (tema.rangos.some(r => enRango(fecha, r))) return tema.id;
    }
    return null;
  }

  function resolverTemaId() {
    // 1) Parámetro en la URL
    if (CONFIG.allowUrlParam) {
      const params = new URLSearchParams(window.location.search);
      for (const nombre of CONFIG.urlParamNames) {
        const val = params.get(nombre);
        if (val) {
          const norm = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (norm === "ninguno" || norm === "none" || norm === "default") return null;
          if (THEMES_BY_ID[norm]) return norm;
        }
      }
    }
    // 2) Variable global definida antes de cargar este script
    if (window.TPF_THEME_FORCE) {
      const norm = String(window.TPF_THEME_FORCE).toLowerCase();
      if (norm === "ninguno" || norm === "none") return null;
      if (THEMES_BY_ID[norm]) return norm;
    }
    // 3) Auto-detección por fecha actual
    return detectarPorFecha(new Date());
  }

  /* ────────────────────────────────────────────────────────────────────
     4. APLICACIÓN DEL TEMA (estilos, partículas, insignia, fondo)
  ──────────────────────────────────────────────────────────────────── */
  let styleEl = null;
  let particlesEl = null;
  let badgeEl = null;
  let garlandEl = null;
  let cornersEl = null;
  let bottomStripEl = null;
  let headerDecorEls = [];
  let originalGenerarFondo = null;
  let currentThemeId = null;

  function limpiarTemaActual() {
    if (document.body) {
      THEMES.forEach(t => document.body.classList.remove("tpf-theme-" + t.id));
    }
    if (particlesEl) { particlesEl.remove(); particlesEl = null; }
    if (badgeEl) { badgeEl.remove(); badgeEl = null; }
    if (garlandEl) { garlandEl.remove(); garlandEl = null; }
    if (cornersEl) { cornersEl.remove(); cornersEl = null; }
    if (bottomStripEl) { bottomStripEl.remove(); bottomStripEl = null; }
    if (headerDecorEls.length) { headerDecorEls.forEach(el => el.remove()); headerDecorEls = []; }
    if (styleEl) { styleEl.remove(); styleEl = null; }
    if (originalGenerarFondo) {
      window.generarFondo = originalGenerarFondo;
      originalGenerarFondo = null;
    }
    currentThemeId = null;
  }

  function inyectarEstilos(tema) {
    const nombreDetalle = tema.detalleFigura || tema.esquinaFigura || tema.figuras[0];
    // Segunda y tercera figura del mismo tema (si existen) para rotar en
    // tarjetas y botones, y que no se repita siempre el mismo icono.
    const otrasFiguras = tema.figuras.filter(f => f !== nombreDetalle);
    const nombreDetalle2 = otrasFiguras[0] || nombreDetalle;
    const nombreDetalle3 = otrasFiguras[1] || otrasFiguras[0] || nombreDetalle;
    // Trazo engrosado (12 en vez de 4) SOLO para los círculos chicos, donde
    // el trazo original se veía casi invisible.
    const uriDetalleAmbar = svgDataUri(nombreDetalle, tema.amber, 12);
    const uriDetalleBlanco = svgDataUri(nombreDetalle, "#ffffff", 12);
    const uriDetalleBlanco2 = svgDataUri(nombreDetalle2, "#ffffff", 12);
    const uriDetalleAmbar2 = svgDataUri(nombreDetalle2, tema.amber, 12);
    const uriDetalleBlanco3 = svgDataUri(nombreDetalle3, "#ffffff", 12);
    const uriDetalleAmbar3 = svgDataUri(nombreDetalle3, tema.amber, 12);
    // Mismo mosaico de 2 figuras que usa la guirnalda superior, reutilizado
    // en la franja del pie del menú para que ambas combinen entre sí.
    const uriGuirnalda = svgDataUriPar(tema.guirnaldaFigura || nombreDetalle, nombreDetalle2, tema.amber);

    // Variables --teal/--rust/--green/--orange/--purple (y sus -l) mezcladas
    // con el amber del tema. Como TODO el botón/etiqueta/tarjeta de cada
    // sección ya está pintado con var(--teal), var(--rust), etc., con solo
    // redefinir estas variables aquí se tiñen automáticamente los botones de
    // descarga, las etiquetas de tipo de archivo y el fondo/borde de cada
    // tarjeta de Membretes, Formatos, Instrumentaciones, Programas, etc.
    let varsSeccion = "";
    Object.keys(COLORES_SECCION).forEach(key => {
      const mezclado = mezclarColor(COLORES_SECCION[key], tema.amber, PESO_MEZCLA_SECCION);
      const rgb = hexToRgb(mezclado);
      varsSeccion += `  --${key}:${mezclado}; --${key}-l:rgba(${rgb.r},${rgb.g},${rgb.b},.14);\n`;
    });

    // Reglas sueltas (fuera del bloque de variables) que pisan esos 3 puntos
    // con valores fijos en tu CSS original, con la MISMA fuerza de mezcla.
    let reglasSeccionExtra = "";
    Object.keys(COLORES_SECCION_EXTRA).forEach(key => {
      const ex = COLORES_SECCION_EXTRA[key];
      const btn2 = mezclarColor(ex.btn2, tema.amber, PESO_MEZCLA_SECCION);
      const thumbA = mezclarColor(ex.thumbA, tema.amber, PESO_MEZCLA_SECCION);
      const thumbB = mezclarColor(ex.thumbB, tema.amber, PESO_MEZCLA_SECCION);
      const badgeMix = mezclarColor(COLORES_SECCION[key], tema.amber, PESO_MEZCLA_SECCION);
      const badgeRgb = hexToRgb(badgeMix);
      reglasSeccionExtra += `
body.tpf-theme-${tema.id} .thumb-${key}{background:linear-gradient(145deg,${thumbA},${thumbB})}
body.tpf-theme-${tema.id} .badge-${key}{background:rgba(${badgeRgb.r},${badgeRgb.g},${badgeRgb.b},.85)}
body.tpf-theme-${tema.id} .btn-${key}{background:linear-gradient(135deg,var(--${key}),${btn2})}`;
    });

    styleEl = document.createElement("style");
    styleEl.id = "tpf-theme-style";
    styleEl.textContent = `
body.tpf-theme-${tema.id}{
  --amber:${tema.amber}; --amber-l:${tema.amberL}; --amber-glow:${tema.amberGlow};
  --bg:${tema.bg}; --surface:${tema.surface}; --surface-2:${tema.surface2};
${varsSeccion}}
body.tpf-theme-${tema.id} .orb-1{background:radial-gradient(circle,${tema.orbes[0]} 0%,transparent 68%)}
body.tpf-theme-${tema.id} .orb-2{background:radial-gradient(circle,${tema.orbes[1]} 0%,transparent 68%)}
body.tpf-theme-${tema.id} .orb-3{background:radial-gradient(circle,${tema.orbes[2]} 0%,transparent 68%)}
body.tpf-theme-${tema.id} .orb-4{background:radial-gradient(circle,${tema.orbes[3]} 0%,transparent 68%)}
body.tpf-theme-${tema.id} .mark{background:linear-gradient(140deg,${tema.amberGlow.replace(/,[.\d]+\)/, ',1)')},${tema.amber})}
${reglasSeccionExtra}

#tpf-theme-particles{position:fixed;inset:0;pointer-events:none;z-index:4;overflow:hidden}
.tpf-particle{position:absolute;top:-8vh;will-change:transform,opacity;user-select:none}
@keyframes tpfFall{
  0%{transform:translateY(-10vh) translateX(0) rotate(0deg);opacity:0}
  8%{opacity:.85}
  92%{opacity:.85}
  100%{transform:translateY(112vh) translateX(var(--tpf-sway,24px)) rotate(360deg);opacity:0}
}
@keyframes tpfFloat{
  0%,100%{transform:translate(0,0)}
  50%{transform:translate(var(--tpf-sway,14px),-22px)}
}
@keyframes tpfTwinkle{
  0%,100%{opacity:.12;transform:scale(.75)}
  50%{opacity:1;transform:scale(1.2)}
}

#tpf-theme-badge{
  position:fixed;${CONFIG.badgePosition === "bottom-right" ? "right:18px" : "left:18px"};bottom:18px;
  z-index:50;display:flex;align-items:center;gap:.5rem;
  background:var(--surface);color:var(--ink);border:1px solid rgba(0,0,0,.08);
  padding:.55rem .9rem;border-radius:999px;font-family:'DM Sans',sans-serif;
  font-size:.78rem;font-weight:500;box-shadow:0 8px 24px rgba(28,25,23,.14);
  opacity:0;transform:translateY(12px);transition:opacity .5s ease,transform .5s ease;
}
#tpf-theme-badge.tpf-show{opacity:1;transform:translateY(0)}
#tpf-theme-badge button{
  background:none;border:none;cursor:pointer;color:var(--ink-faint);
  font-size:.9rem;line-height:1;padding:0 0 0 .3rem;
}
@media (max-width:680px){ #tpf-theme-badge{font-size:.72rem;padding:.45rem .7rem} }

/* Guirnalda superior: franja fina con un icono del tema repetido */
#tpf-theme-garland{
  position:fixed;top:0;left:0;right:0;height:26px;z-index:3;pointer-events:none;
  background-repeat:repeat-x;background-size:26px 26px;background-position:top center;
  opacity:.5;filter:drop-shadow(0 1px 1px rgba(0,0,0,.06));
  animation:tpfGarlandDrift 40s linear infinite;
}
@keyframes tpfGarlandDrift{ 0%{background-position-x:0} 100%{background-position-x:520px} }

/* Flourishes de esquina: figura grande, suave y girada en dos esquinas */
#tpf-theme-corners{position:fixed;inset:0;pointer-events:none;z-index:2;overflow:hidden}
.tpf-corner{position:absolute;width:170px;height:170px;opacity:.09}
.tpf-corner svg{width:100%;height:100%}
.tpf-corner-tl{top:-34px;left:-34px;transform:rotate(-14deg)}
.tpf-corner-br{bottom:-34px;right:-34px;transform:rotate(166deg)}
@media (max-width:680px){ .tpf-corner{width:100px;height:100px} }

/* Franja inferior ondulada / festón, tipo remate decorativo */
#tpf-theme-bottomstrip{position:fixed;left:0;right:0;bottom:0;height:46px;z-index:2;pointer-events:none}
#tpf-theme-bottomstrip svg{width:100%;height:100%;display:block}
@media (max-width:680px){ #tpf-theme-bottomstrip{height:30px} }

@media (prefers-reduced-motion: reduce){
  .tpf-particle{animation:none !important;opacity:.5}
  #tpf-theme-garland{animation:none !important}
}

${!CONFIG.showUIAccents ? "" : `
/* ════════════════════════════════════════════════════════════
   ACENTOS PEGADOS A LA UI (no al fondo): logo, menú, tarjetas,
   botones y encabezados. Todo vía pseudo-elementos, así que
   funciona aunque el contenido se genere dinámicamente por tu JS.
   Cada uno es un "sticker": círculo de color sólido + icono blanco
   encima, para que se note de verdad y no se pierda como detalle
   sutil.
════════════════════════════════════════════════════════════ */

@keyframes tpfStickerSway{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(10deg)}}
@keyframes tpfBadgePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
@keyframes tpfBadgeBob{0%,100%{transform:translateY(-50%) scale(1)}50%{transform:translateY(-58%) scale(1.07)}}

/* 1) Insignia grande en el logo "CR" del menú lateral: círculo de color
      + icono blanco, semi-montada sobre la esquina del badge */
body.tpf-theme-${tema.id} .mark{position:relative}
body.tpf-theme-${tema.id} .mark::before{
  content:'';position:absolute;top:-14px;right:-14px;width:34px;height:34px;z-index:3;
  background-image:radial-gradient(circle at 34% 30%, ${tema.amberGlow.replace(/,[.\d]+\)/, ",1)")}, ${tema.amber} 72%);
  border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,.35),0 0 0 3px var(--surface);
  animation:tpfBadgePulse 3s ease-in-out infinite;
}
body.tpf-theme-${tema.id} .mark::after{
  content:'';position:absolute;top:-9px;right:-9px;width:24px;height:24px;z-index:4;
  background-image:url("${uriDetalleBlanco}");background-size:contain;background-repeat:no-repeat;
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.35));pointer-events:none;
  transform-origin:65% 35%;animation:tpfStickerSway 4.5s ease-in-out infinite;
}

/* 2) Insignia junto a cada título de sección del menú (Descargas, Consulta...) */
/* body.tpf-theme-${tema.id} .nav-section-title{display:inline-flex;align-items:center;gap:.5rem}
body.tpf-theme-${tema.id} .nav-section-title::before{
  content:'';display:inline-block;width:18px;height:18px;flex:none;order:-1;
  background-image:radial-gradient(circle at 34% 30%, ${tema.amberGlow.replace(/,[.\d]+\)/, ",1)")}, ${tema.amber} 72%), url("${uriDetalleBlanco}");
  background-size:18px 18px, 13px 13px;background-position:center,center;background-repeat:no-repeat,no-repeat;
  border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,.25);
}*/

/* 3) Franja decorativa, más alta y visible, arriba del pie del menú lateral */
body.tpf-theme-${tema.id} .nav-footer{position:relative}
body.tpf-theme-${tema.id} .nav-footer::before{
  content:'';display:block;width:100%;height:24px;margin-bottom:.75rem;
  background-image:url("${uriGuirnalda}");background-repeat:repeat-x;
  background-size:24px 24px;opacity:.5;
}

/* 4) Pequeña insignia pegada al icono del link del menú que está activo */
body.tpf-theme-${tema.id} .nav-link.active .nl-icon{position:relative}
body.tpf-theme-${tema.id} .nav-link.active .nl-icon::after{
  content:'';position:absolute;top:-6px;right:-6px;width:14px;height:14px;z-index:2;
  background-image:radial-gradient(circle at 34% 30%, ${tema.amberGlow.replace(/,[.\d]+\)/, ",1)")}, ${tema.amber} 72%), url("${uriDetalleBlanco}");
  background-size:14px 14px, 8px 8px;background-position:center,center;background-repeat:no-repeat,no-repeat;
  border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.3);
  animation:tpfStickerSway 3s ease-in-out infinite;
}

/* 5) Sello grande en la esquina de cada miniatura de tarjeta (membretes/formatos/etc.)
      Va del lado IZQUIERDO a propósito: el badge que ya trae tu diseño con el
      tipo de archivo (PDF/DOCX/etc.) vive en la esquina derecha, así no se tapan.
      Rota entre HASTA 3 figuras del tema (tarjeta 1/4/7..., 2/5/8..., 3/6/9...)
      para que no se repita siempre el mismo icono en toda la cuadrícula. */
body.tpf-theme-${tema.id} .card-thumb::after{
  content:'';position:absolute;top:10px;left:10px;width:44px;height:44px;z-index:2;
  background-image:radial-gradient(circle at 34% 30%, ${tema.amberGlow.replace(/,[.\d]+\)/, ",1)")}, ${tema.amber} 72%), url("${uriDetalleBlanco}");
  background-size:44px 44px, 26px 26px;background-position:center,center;background-repeat:no-repeat,no-repeat;
  border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,.3);
  transition:transform .35s cubic-bezier(.34,1.56,.64,1);
}
body.tpf-theme-${tema.id} .card:nth-child(3n+2) .card-thumb::after{
  background-image:radial-gradient(circle at 34% 30%, ${tema.amberGlow.replace(/,[.\d]+\)/, ",1)")}, ${tema.amber} 72%), url("${uriDetalleBlanco2}");
}
body.tpf-theme-${tema.id} .card:nth-child(3n) .card-thumb::after{
  background-image:radial-gradient(circle at 34% 30%, ${tema.amberGlow.replace(/,[.\d]+\)/, ",1)")}, ${tema.amber} 72%), url("${uriDetalleBlanco3}");
}
body.tpf-theme-${tema.id} .card:hover .card-thumb::after{transform:scale(1.16) rotate(-9deg)}

/* 6) Insignia SIEMPRE visible (no solo en hover) sobre cada botón de descarga.
      También rota entre las mismas 3 figuras, en sincronía con la tarjeta. */
body.tpf-theme-${tema.id} .btn-dl{position:relative}
body.tpf-theme-${tema.id} .btn-dl::before{
  content:'';position:absolute;top:50%;left:10px;width:24px;height:24px;z-index:3;
  background-image:radial-gradient(circle at 34% 30%, #fff, #f3f3f3 75%), url("${uriDetalleAmbar}");
  background-size:24px 24px, 16px 16px;background-position:center,center;background-repeat:no-repeat,no-repeat;
  border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,.35);
  animation:tpfBadgeBob 2.4s ease-in-out infinite;
}
body.tpf-theme-${tema.id} .card:nth-child(3n+2) .btn-dl::before{
  background-image:radial-gradient(circle at 34% 30%, #fff, #f3f3f3 75%), url("${uriDetalleAmbar2}");
}
body.tpf-theme-${tema.id} .card:nth-child(3n) .btn-dl::before{
  background-image:radial-gradient(circle at 34% 30%, #fff, #f3f3f3 75%), url("${uriDetalleAmbar3}");
}
body.tpf-theme-${tema.id} .btn-dl:hover::before{animation:none;transform:translateY(-50%) scale(1.25) rotate(12deg)}

/* 7) Medallón grande y visible en la esquina de cada encabezado de página */
.tpf-header-deco{
  position:absolute;top:14px;right:20px;width:66px;height:66px;
  pointer-events:none;z-index:1;transform:rotate(6deg);
}
.tpf-header-deco::before{
  content:'';position:absolute;inset:0;border-radius:50%;
  background-image:radial-gradient(circle at 34% 30%, var(--amber-glow), var(--amber) 72%);
  opacity:.3;
}
.tpf-header-deco svg{position:relative;width:100%;height:100%;opacity:.6}

/* ── Ajustes específicos para tablet / escritorio angosto ── */
@media(max-width:900px){
  .tpf-header-deco{width:46px;height:46px;top:10px;right:14px}
  body.tpf-theme-${tema.id} .card-thumb::after{width:36px;height:36px;background-size:36px 36px, 22px 22px}
}

/* ── Ajustes específicos para MÓVIL VERTICAL (mismo corte que usa tu diseño) ──
   En este ancho tu menú se convierte en una barra horizontal de pastillas
   apretadas, y los encabezados se achican mucho, así que aquí achicamos o
   reposicionamos lo que antes se veía encimado o demasiado grande. */
@media(max-width:640px){
  /* Tu propio CSS oculta ".nav-section-title" en este ancho (display:none)
     y no lo reemplaza por nada, así que las pastillas del menú quedan todas
     revueltas sin agrupar — por eso se ve desorganizado. Las regresamos,
     pero adaptadas a la fila horizontal: cada título fuerza un salto de
     línea (flex-basis:100%) para que actúe como encabezado de su grupo,
     con una rayita punteada del color del tema y su propio icono. */
  body.tpf-theme-${tema.id} .nav-section-title{
    display:flex; align-items:center; gap:.4rem;
    width:100%; flex:1 0 100%;
    font-size:.66rem; opacity:.85;
    margin:.55rem 0 .15rem !important;
    padding-top:.5rem;
    border-top:1px dashed ${tema.amberL};
  }
  body.tpf-theme-${tema.id} #nav-pill + .nav-section-title{
    border-top:none; padding-top:0; margin-top:0 !important;
  }
  /* El menú pasa a ser una fila de pastillas con poco espacio: la insignia
     del link activo se hace más chica y se pega más al icono para no
     encimarse con la siguiente pastilla. */
  body.tpf-theme-${tema.id} .nav-link.active .nl-icon::after{
    width:11px;height:11px;top:-4px;right:-4px;
    background-size:11px 11px, 6px 6px;
  }
  /* El badge del logo se achica un poco para no verse desproporcionado en
     la barra superior angosta. */
  body.tpf-theme-${tema.id} .mark::before{width:28px;height:28px;top:-11px;right:-11px}
  body.tpf-theme-${tema.id} .mark::after{width:19px;height:19px;top:-6px;right:-6px}
  /* El encabezado de página se achica mucho en móvil (padding:1.5rem) y el
     título puede pasar a dos líneas: el medallón baja de tamaño y opacidad
     y se recorre para no pelearse con el texto. */
  .tpf-header-deco{width:36px;height:36px;top:8px;right:10px;opacity:.7}
  .tpf-header-deco::before{opacity:.22}
  /* La franja del pie del menú se angosta un poco junto con el resto del nav. */
  body.tpf-theme-${tema.id} .nav-footer::before{height:18px;background-size:18px 18px}
}
@media(max-width:400px){
  /* En teléfonos muy angostos, los flourishes de esquina (grandes) se
     bajan de tamaño y opacidad para no comerse tanto ancho de pantalla. */
  .tpf-corner{width:64px;height:64px;opacity:.06}
  .tpf-header-deco{display:none}
}
`}
`;
    document.head.appendChild(styleEl);
  }

  function crearParticulas(tema) {
    if (!CONFIG.showParticles) return;
    particlesEl = document.createElement("div");
    particlesEl.id = "tpf-theme-particles";
    particlesEl.setAttribute("aria-hidden", "true");

    const animName = tema.modo === "twinkle" ? "tpfTwinkle" : tema.modo === "float" ? "tpfFloat" : "tpfFall";

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const span = document.createElement("span");
      span.className = "tpf-particle";
      span.textContent = tema.emojis[Math.floor(Math.random() * tema.emojis.length)];

      const size = (Math.random() * 14 + 14).toFixed(1);
      const left = (Math.random() * 100).toFixed(2);
      const duration = (Math.random() * 10 + 10).toFixed(2);
      const delay = (-Math.random() * 20).toFixed(2);
      const sway = (Math.random() * 60 - 30).toFixed(0) + "px";

      span.style.left = left + "vw";
      span.style.top = tema.modo === "twinkle" ? (Math.random() * 90) + "vh" : (tema.modo === "float" ? (Math.random() * 80 + 5) + "vh" : "-8vh");
      span.style.fontSize = size + "px";
      span.style.setProperty("--tpf-sway", sway);
      span.style.animation = `${animName} ${duration}s linear ${delay}s infinite`;
      span.style.opacity = tema.modo === "float" ? (Math.random() * 0.3 + 0.35).toFixed(2) : "";

      particlesEl.appendChild(span);
    }
    document.body.appendChild(particlesEl);
  }

  function crearInsignia(tema) {
    if (!CONFIG.showBadge) return;
    const dismissKey = "tpf_badge_oculta_" + tema.id + "_" + new Date().toDateString();
    if (sessionStorage.getItem(dismissKey)) return;

    badgeEl = document.createElement("div");
    badgeEl.id = "tpf-theme-badge";
    badgeEl.innerHTML = `<span>${tema.badge}</span><button type="button" aria-label="Cerrar aviso de tema">✕</button>`;
    document.body.appendChild(badgeEl);

    requestAnimationFrame(() => requestAnimationFrame(() => badgeEl.classList.add("tpf-show")));

    badgeEl.querySelector("button").addEventListener("click", () => {
      sessionStorage.setItem(dismissKey, "1");
      badgeEl.classList.remove("tpf-show");
      setTimeout(() => { if (badgeEl) { badgeEl.remove(); badgeEl = null; } }, 400);
    });
  }

  function sobreescribirFondoAmbiental(tema) {
    if (!CONFIG.themeBackgroundShapes) return;
    if (typeof window.generarFondo !== "function") return;
    if (!originalGenerarFondo) originalGenerarFondo = window.generarFondo;

    const colores = tema.orbes.map(c => c.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, (_, r, g, b) => {
      const hex = n => Number(n).toString(16).padStart(2, "0");
      return "#" + hex(r) + hex(g) + hex(b);
    })).concat(tema.amber);

    const animaciones = ["floatRandom1", "floatRandom2", "floatRandom3"];
    const figuras = tema.figuras.map(nombre => SHAPES[nombre]).filter(Boolean);

    window.generarFondo = function (pageId) {
      const bgContainer = document.getElementById("worldcup-bg");
      if (!bgContainer) return;
      bgContainer.innerHTML = "";
      const numShapes = 40;
      for (let i = 0; i < numShapes; i++) {
        const div = document.createElement("div");
        const size = Math.random() * 200 + 30;
        const color = colores[Math.floor(Math.random() * colores.length)];
        const svgCode = figuras[Math.floor(Math.random() * figuras.length)].replace(/COLOR/g, color);

        div.innerHTML = svgCode;
        div.className = "bg-shape";
        div.style.left = (Math.random() * 120 - 10) + "vw";
        div.style.top = (Math.random() * 120 - 10) + "vh";
        div.style.width = size + "px";
        div.style.height = size + "px";
        div.style.opacity = (Math.random() * 0.065 + 0.03).toFixed(3);

        const anim = animaciones[Math.floor(Math.random() * animaciones.length)];
        const duration = Math.random() * 40 + 30;
        const delay = Math.random() * -50;
        div.style.animation = `${anim} ${duration}s infinite ease-in-out ${delay}s`;

        bgContainer.appendChild(div);
      }
    };

    // Si ya hay un fondo pintado (init ya corrió), lo regeneramos ya mismo.
    if (document.getElementById("worldcup-bg")) window.generarFondo();
  }

  // Guirnalda superior: repite en mosaico horizontal el icono del tema
  // (foquitos, banderines, mariposas, etc.) como una franja fina en el
  // borde de arriba de la pantalla.
  function crearGuirnalda(tema) {
    if (!CONFIG.showGarland) return;
    const figA = tema.guirnaldaFigura || tema.figuras[0];
    const figB = tema.figuras.find(f => f !== figA) || figA;
    const uri = svgDataUriPar(figA, figB, tema.amber);
    if (!uri) return;

    garlandEl = document.createElement("div");
    garlandEl.id = "tpf-theme-garland";
    garlandEl.setAttribute("aria-hidden", "true");
    garlandEl.style.backgroundImage = `url("${uri}")`;
    document.body.appendChild(garlandEl);
  }

  // Flourishes de esquina: coloca una figura grande, translúcida y girada
  // en dos esquinas opuestas de la pantalla, como un marco decorativo sutil.
  function crearEsquinas(tema) {
    if (!CONFIG.showCorners) return;
    const nombreFig = tema.esquinaFigura || tema.figuras[0];
    const fig = SHAPES[nombreFig];
    if (!fig) return;
    const svgColoreado = fig.replace(/COLOR/g, tema.amber);

    cornersEl = document.createElement("div");
    cornersEl.id = "tpf-theme-corners";
    cornersEl.setAttribute("aria-hidden", "true");
    cornersEl.innerHTML =
      `<div class="tpf-corner tpf-corner-tl">${svgColoreado}</div>` +
      `<div class="tpf-corner tpf-corner-br">${svgColoreado}</div>`;
    document.body.appendChild(cornersEl);
  }

  // Franja inferior ondulada: un remate decorativo (ola, festón o zigzag
  // tipo papel picado) pegado al borde inferior de la pantalla.
  const FRANJA_PATHS = {
    wave: "M0,32 C80,4 160,4 240,32 C320,60 400,60 480,32 L480,80 L0,80 Z",
    zigzag: "M0,20 L40,55 L80,20 L120,55 L160,20 L200,55 L240,20 L280,55 L320,20 L360,55 L400,20 L440,55 L480,20 L480,80 L0,80 Z",
    scallop: "M0,20 Q20,50 40,20 Q60,50 80,20 Q100,50 120,20 Q140,50 160,20 Q160,20 180,20 Q200,50 220,20 Q240,50 260,20 Q280,50 300,20 Q320,50 340,20 Q360,50 380,20 Q400,50 420,20 Q440,50 460,20 Q470,35 480,20 L480,80 L0,80 Z"
  };
  function crearFranjaInferior(tema) {
    if (!CONFIG.showBottomStrip) return;
    const tipo = FRANJA_PATHS[tema.franja] ? tema.franja : "wave";
    bottomStripEl = document.createElement("div");
    bottomStripEl.id = "tpf-theme-bottomstrip";
    bottomStripEl.setAttribute("aria-hidden", "true");
    bottomStripEl.innerHTML =
      `<svg viewBox="0 0 480 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="${FRANJA_PATHS[tipo]}" fill="${tema.amberL}"/></svg>`;
    document.body.appendChild(bottomStripEl);
  }

  // Figura suave en la esquina de cada .page-header. Se hace por DOM (y no
  // por ::before/::after) porque esos pseudo-elementos ya los usa tu CSS
  // original para el blob de fondo y la franja animada de color.
  function decorarEncabezados(tema) {
    if (!CONFIG.showUIAccents) return;
    // Cada encabezado de página usa una figura distinta del tema (van
    // rotando en el orden en que aparecen en el catálogo "figuras" de cada
    // tema), así Membretes, Formatos, Instrumentaciones, Programas, etc.
    // no muestran siempre el mismo icono en su medallón.
    document.querySelectorAll(".page-header").forEach((header, i) => {
      const nombreFig = tema.figuras[i % tema.figuras.length];
      const fig = SHAPES[nombreFig];
      if (!fig) return;
      const svgColoreado = fig.replace(/COLOR/g, tema.amber);
      const deco = document.createElement("div");
      deco.className = "tpf-header-deco";
      deco.setAttribute("aria-hidden", "true");
      deco.innerHTML = svgColoreado;
      header.appendChild(deco);
      headerDecorEls.push(deco);
    });
  }

  function aplicarTema(id) {
    limpiarTemaActual();
    if (!id || !THEMES_BY_ID[id]) return;
    const tema = THEMES_BY_ID[id];
    currentThemeId = id;

    document.body.classList.add("tpf-theme-" + id);
    inyectarEstilos(tema);
    crearParticulas(tema);
    crearInsignia(tema);
    sobreescribirFondoAmbiental(tema);
    crearGuirnalda(tema);
    crearEsquinas(tema);
    crearFranjaInferior(tema);
    decorarEncabezados(tema);
  }

  /* ────────────────────────────────────────────────────────────────────
     5. API PÚBLICA (para pruebas/consola) + AUTOEJECUCIÓN
  ──────────────────────────────────────────────────────────────────── */
  /* window.TPFTheme = {
    apply(id) { aplicarTema(id); },
    disable() { limpiarTemaActual(); },
    list() { return THEMES.map(t => t.id); },
    current() { return currentThemeId; },
    detectByDate(date) { return detectarPorFecha(date || new Date()); }
  };

  aplicarTema(resolverTemaId());
})(); */