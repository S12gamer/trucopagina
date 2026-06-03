/* ═══════════════════════════════════════════════════════════════
   NEON CREATIVO — script.js
   Arquitectura: Data-Driven JS + SPA Vanilla
   ─────────────────────────────────────────────────────────────
   Para añadir / editar trabajos del portafolio:
     → Solo modifica el arreglo PORTFOLIO_ITEMS (ver Sección A).
   Para añadir pasos al proceso:
     → Modifica PROCESS_STEPS (Sección B).
   Para añadir preguntas al FAQ:
     → Modifica FAQ_ITEMS (Sección C).
   Para actualizar datos de contacto:
     → Modifica CONTACT_INFO (Sección D).
═══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   A. DATOS DEL PORTAFOLIO
   ──────────────────────────────────────────────────────────────
   Estructura de cada objeto:
   {
     id:        Identificador único (string sin espacios).
     title:     Título del cartel (se muestra en la tarjeta).
     client:    Nombre del cliente o proyecto.
     desc:      Descripción breve para la tarjeta.
     fullDesc:  Descripción completa para el lightbox.
     category:  Categoría para filtrar ("Neón LED", "Acrílico",
                "Institucional", "Exterior").
     tags:      Arreglo de etiquetas informativas.
     -- Imagen desde Google Drive (OPCIONAL) --
     imageId:   ID del archivo en Google Drive.
                Cómo obtenerlo:
                  1. Sube la foto a Google Drive
                  2. Click derecho → Compartir → "Cualquier persona con el enlace"
                  3. La URL se ve así:
                     https://drive.google.com/file/d/[ESTE_ES_EL_ID]/view
                  4. Copia solo ese ID y pégalo aquí:
                     imageId: '1abc2XYZ3defGHI...'
                Si no tienes imagen, omite el campo y se mostrará el efecto neón.
     -- Configuración visual (usada también cuando hay imagen) --
     mainColor:   Color principal del neón CSS (hex o variable).
     mainGlow:    Rgba del resplandor principal.
     bgGradient:  Gradiente para el fondo de la tarjeta (sin imagen).
     textGlow:    Valor del text-shadow neón para la etiqueta.
     borderColor: Color del borde de la tarjeta al hacer hover.
     tagBg:       Fondo de las etiquetas de categoría.
     tagColor:    Texto de las etiquetas.
     badgeText:   Texto de la insignia en la tarjeta de proceso.
     badgeBg / badgeColor: Estilos de la insignia.
   }
══════════════════════════════════════════════════════════════ */

/* ── Helper: convierte un File ID de Google Drive a URL de thumbnail ── */
function gdThumb(id, w = 800) {
  if (!id) return null;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
}

const PORTFOLIO_ITEMS = [
  {
    id:          'maruchan',
    title:       'Anuncio Neón Maruchan',
    client:      'Maruchan®',
    desc:        'Cartel cian/blanco de alto brillo para punto de venta, diseñado para máxima visibilidad diurna y nocturna.',
    fullDesc:    'Producción de anuncio luminoso en neón LED de alta densidad para la marca Maruchan. Estructura en acrílico de 10 mm con iluminación LED cian y blanco cálido. Diseñado para resistir condiciones de exterior con IP65, garantizando visibilidad óptima en todos los ángulos.',
    category:    'Neón LED',
    tags:        ['Neón LED', 'Cian / Blanco', 'Exterior', 'Alta luminosidad'],
    mainColor:   '#00e5ff',
    mainGlow:    'rgba(0,229,255,0.6)',
    bgGradient:  'radial-gradient(ellipse at center, rgba(0,229,255,0.18) 0%, rgba(0,229,255,0.04) 60%, transparent 100%)',
    textGlow:    '0 0 14px #fff, 0 0 28px #00e5ff, 0 0 60px #00e5ff',
    borderColor: '#00e5ff',
    tagBg:       'rgba(0,229,255,0.12)',
    tagColor:    '#00e5ff',
    badgeText:   'Comercial',
    badgeBg:     'rgba(0,229,255,0.15)',
    badgeColor:  '#00e5ff',
  },
  {
    id:          'ay-guey',
    title:       'Letrero ¡Ay Güey!',
    client:      '¡Ay Güey! Restaurante',
    desc:        'Estructura exterior de gran formato con luz roja potente y efecto industrial para fachada nocturna de alto impacto.',
    fullDesc:    'Letrero de gran formato para la cadena de restaurantes ¡Ay Güey! Construcción en aluminio galvanizado con tubo de neón LED rojo de alta potencia. Montaje en fachada con anclaje estructural certificado. La intensidad del color rojo fue calibrada para destacar entre la saturación visual de la zona.',
    category:    'Exterior',
    tags:        ['Exterior', 'Rojo intenso', 'Gran formato', 'Aluminio'],
    mainColor:   '#ff2d55',
    mainGlow:    'rgba(255,45,85,0.6)',
    bgGradient:  'radial-gradient(ellipse at center, rgba(255,45,85,0.18) 0%, rgba(255,45,85,0.04) 60%, transparent 100%)',
    textGlow:    '0 0 14px #fff, 0 0 28px #ff2d55, 0 0 60px #ff2d55',
    borderColor: '#ff2d55',
    tagBg:       'rgba(255,45,85,0.12)',
    tagColor:    '#ff2d55',
    badgeText:   'Exterior',
    badgeBg:     'rgba(255,45,85,0.15)',
    badgeColor:  '#ff2d55',
  },
  {
    id:          'sepsa',
    title:       'Logotipo Corporativo SEPSA',
    client:      'SEPSA',
    desc:        'Anuncio institucional de fachada con retroiluminación azul sobre acrílico translúcido. Elegancia corporativa y presencia de marca.',
    fullDesc:    'Anuncio institucional para la fachada corporativa de SEPSA. Fabricado en acrílico de 8 mm corte CNC con letras en relieve y retroiluminación LED azul de espectro frío. El diseño refuerza la identidad corporativa con una presentación limpia, seria y altamente visible en horario nocturno.',
    category:    'Institucional',
    tags:        ['Institucional', 'Azul corporativo', 'Acrílico', 'Retroiluminado'],
    mainColor:   '#0066ff',
    mainGlow:    'rgba(0,102,255,0.6)',
    bgGradient:  'radial-gradient(ellipse at center, rgba(0,102,255,0.18) 0%, rgba(0,102,255,0.04) 60%, transparent 100%)',
    textGlow:    '0 0 14px #fff, 0 0 28px #0066ff, 0 0 60px #0066ff',
    borderColor: '#0066ff',
    tagBg:       'rgba(0,102,255,0.12)',
    tagColor:    '#4d94ff',
    badgeText:   'Corporativo',
    badgeBg:     'rgba(0,102,255,0.15)',
    badgeColor:  '#4d94ff',
  },
  {
    id:          'dental-protec',
    title:       'Letrero Dental Protec',
    client:      'Dental Protec',
    desc:        'Logotipo clínico con silueta en verde neón y blanco puro. Transmite higiene, confianza y profesionalismo en cada detalle.',
    fullDesc:    'Diseño y fabricación del letrero institucional para la clínica Dental Protec. El uso del verde neón evoca salud y frescura, mientras que el blanco puro comunica limpieza y precisión clínica. La pieza cuenta con protección UV y está diseñada para uso en fachada exterior con garantía de 3 años.',
    category:    'Acrílico',
    tags:        ['Clínica', 'Verde Neón', 'Blanco', 'Salud'],
    mainColor:   '#00ff9f',
    mainGlow:    'rgba(0,255,159,0.6)',
    bgGradient:  'radial-gradient(ellipse at center, rgba(0,255,159,0.15) 0%, rgba(0,255,159,0.04) 60%, transparent 100%)',
    textGlow:    '0 0 14px #fff, 0 0 28px #00ff9f, 0 0 60px #00ff9f',
    borderColor: '#00ff9f',
    tagBg:       'rgba(0,255,159,0.12)',
    tagColor:    '#00ff9f',
    badgeText:   'Salud',
    badgeBg:     'rgba(0,255,159,0.15)',
    badgeColor:  '#00ff9f',
  },
  /* ──────────────────────────────────────────────────────────
     PLANTILLA — Para añadir un nuevo trabajo, copia desde aquí:

  {
    id:          'nuevo-cliente',          // único, sin espacios
    title:       'Título del Cartel',
    client:      'Nombre del Cliente',
    desc:        'Descripción corta de máximo 2 líneas.',
    fullDesc:    'Descripción detallada para el lightbox. Incluye materiales, dimensiones, tipo de instalación, etc.',
    category:    'Neón LED',               // "Neón LED" | "Acrílico" | "Institucional" | "Exterior"
    tags:        ['Tag 1', 'Tag 2', 'Tag 3'],
    // IMAGEN (opcional): ID del archivo en Google Drive
    // Comparte el archivo como "Cualquier persona con el enlace puede ver"
    // y pega solo el ID que aparece en la URL
    imageId:     '1abc2XYZ3defGHI456jkl', // ← Pega aquí tu ID de Google Drive
    mainColor:   '#bd00ff',                // color principal en hex
    mainGlow:    'rgba(189,0,255,0.6)',    // glow rgba
    bgGradient:  'radial-gradient(ellipse at center, rgba(189,0,255,0.15) 0%, rgba(189,0,255,0.04) 60%, transparent 100%)',
    textGlow:    '0 0 14px #fff, 0 0 28px #bd00ff, 0 0 60px #bd00ff',
    borderColor: '#bd00ff',
    tagBg:       'rgba(189,0,255,0.12)',
    tagColor:    '#bd00ff',
    badgeText:   'Arte',
    badgeBg:     'rgba(189,0,255,0.15)',
    badgeColor:  '#bd00ff',
  },
  ────────────────────────────────────────────────────────── */
];

/* ══════════════════════════════════════════════════════════════
   B. DATOS DEL PROCESO DE TRABAJO
══════════════════════════════════════════════════════════════ */
const PROCESS_STEPS = [
  {
    step:    '01',
    icon:    '✏️',
    title:   'Cotización y Diseño',
    desc:    'Analizamos tu idea, medidas y ubicación. Nuestro equipo de diseño crea bocetos digitales con visualización del resultado final antes de fabricar cualquier pieza.',
    badge:   'Gratis',
    badgeBg: 'rgba(0,229,255,0.15)',
    badgeColor: '#00e5ff',
  },
  {
    step:    '02',
    icon:    '⚙️',
    title:   'Corte en Acrílico / Estructura',
    desc:    'Utilizamos ruteadoras CNC de alta precisión para cortar y moldear el acrílico o la estructura metálica según las especificaciones exactas del diseño aprobado.',
    badge:   'CNC',
    badgeBg: 'rgba(189,0,255,0.15)',
    badgeColor: '#bd00ff',
  },
  {
    step:    '03',
    icon:    '💡',
    title:   'Montaje de Neón LED',
    desc:    'Instalamos tiras o tubos de neón LED de alta densidad, calibrando temperatura de color, intensidad y uniformidad. Todo el cableado es sellado y protegido para uso interior o exterior.',
    badge:   'LED',
    badgeBg: 'rgba(255,211,0,0.15)',
    badgeColor: '#ffd300',
  },
  {
    step:    '04',
    icon:    '🚀',
    title:   'Entrega e Instalación',
    desc:    'Entregamos en tu domicilio o instalamos en sitio con nuestro equipo especializado. Incluye prueba de funcionamiento, garantía por escrito y soporte post-venta.',
    badge:   'Garantía',
    badgeBg: 'rgba(0,255,159,0.15)',
    badgeColor: '#00ff9f',
  },
];

/* ══════════════════════════════════════════════════════════════
   C. DATOS DE PREGUNTAS FRECUENTES
══════════════════════════════════════════════════════════════ */
const FAQ_ITEMS = [
  {
    q: '¿Cuánto dura un cartel de neón LED?',
    a: `Los carteles de <strong>neón LED moderno tienen una vida útil de 50,000 a 100,000 horas</strong> (aproximadamente 11 a 22 años operando 12 horas diarias). A diferencia del neón de vidrio tradicional, el LED no contiene gas, no requiere transformadores de alto voltaje y mantiene su brillo constante a lo largo del tiempo.`,
  },
  {
    q: '¿Qué mantenimiento requiere el cartel?',
    a: `El mantenimiento es <strong>mínimo</strong>. Recomendamos una limpieza superficial con paño seco o ligeramente húmedo cada 3 meses para remover polvo. No se requiere lubricación, cambio de gases ni revisiones eléctricas frecuentes. En instalaciones exteriores verificamos el sello de cables una vez al año como medida preventiva.`,
  },
  {
    q: '¿Hacen envíos a todo México?',
    a: `Sí. <strong>Enviamos a toda la República Mexicana</strong> mediante paquetería especializada con embalaje reforzado para proteger el cartel durante el trayecto. También ofrecemos instalación en sitio para la Ciudad de México, Estado de México y zonas cercanas. Para el interior del país, enviamos el kit con guía de instalación detallada.`,
  },
  {
    q: '¿Cómo se cotiza un cartel luminoso?',
    a: `El precio depende de: <strong>(1) Dimensiones</strong> del cartel (ancho × alto), <strong>(2) Tipo de material</strong> (acrílico, aluminio, vinilo), <strong>(3) Complejidad del diseño</strong> (número de colores, tipografía, logotipo), <strong>(4) Tipo de instalación</strong> (interior/exterior, con o sin estructura de montaje). Puedes solicitar tu cotización gratuita a través del formulario de esta página, WhatsApp o llamándonos al <a href="tel:5562865085">55 6286 5085</a>.`,
  },
  {
    q: '¿Trabajan con diseño propio o necesito llevar el mío?',
    a: `Las dos opciones están disponibles. Si cuentas con tu logotipo o diseño en formato vectorial (AI, EPS, SVG o PDF de alta calidad), perfecto — lo adaptamos sin costo. Si partes desde cero, nuestro equipo de diseño lo crea por ti. El boceto digital se comparte para tu aprobación antes de iniciar la fabricación.`,
  },
  {
    q: '¿Los carteles funcionan en exterior con lluvia o sol?',
    a: `Sí. Nuestros carteles exteriores tienen <strong>clasificación IP65</strong> (protección total contra polvo y resistencia a chorros de agua) y los materiales utilizados cuentan con <strong>protección UV</strong> para evitar decoloración por exposición solar. Están diseñados para las condiciones climáticas típicas de México.`,
  },
  {
    q: '¿Cuál es el tiempo de entrega?',
    a: `El tiempo de producción varía según la complejidad: carteles simples de <strong>5 a 8 días hábiles</strong>, proyectos con diseño personalizado o gran formato de <strong>10 a 15 días hábiles</strong>. En temporada alta (diciembre, Buen Fin) recomendamos solicitar con 3 semanas de anticipación.`,
  },
];

/* ══════════════════════════════════════════════════════════════
   D. DATOS DE CONTACTO
══════════════════════════════════════════════════════════════ */
const CONTACT_INFO = [
  {
    icon:  '📍',
    label: 'Dirección',
    value: 'Calle Capulín 21, Naucalpan de Juárez, Estado de México, CP 53580',
    link:  null,
  },
  {
    icon:  '📞',
    label: 'Teléfono',
    value: '55 6286 5085',
    link:  'tel:5562865085',
  },
  {
    icon:  '✉️',
    label: 'Correo electrónico',
    value: 'marquez-1977@hotmail.com',
    link:  'mailto:marquez-1977@hotmail.com',
  },
  {
    icon:  '⏰',
    label: 'Horario de atención',
    value: 'Lunes a Viernes: 9:00 – 18:00 h\nSábados: 9:00 – 14:00 h',
    link:  null,
  },
];

/* ══════════════════════════════════════════════════════════════
   E. INICIALIZACIÓN — esperar al DOM
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSPA();
  renderProcessSteps();
  renderPortfolio();
  renderFAQ();
  renderContactInfo();
  initCountUp();
  initScrollHeader();
  initForm();
  setFooterYear();
  initHamburger();
});

/* ══════════════════════════════════════════════════════════════
   F. SPA — NAVEGACIÓN ENTRE SECCIONES
══════════════════════════════════════════════════════════════ */
function initSPA() {
  // Reúne todos los elementos con data-nav
  const triggers = document.querySelectorAll('[data-nav]');
  triggers.forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = el.dataset.nav;
      navigateTo(target);
      // Cierra el menú móvil si estaba abierto
      closeMobileMenu();
    });
  });
}

function navigateTo(sectionId) {
  // Oculta todas las secciones
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  // Activa la sección objetivo
  const target = document.getElementById(`sec-${sectionId}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualiza estado activo de los links de nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.nav === sectionId);
  });

  // Si entramos al portafolio, re-inicializa animaciones
  if (sectionId === 'portafolio') {
    animateCards();
  }

  // Si entramos a inicio, reinicia el contador
  if (sectionId === 'inicio') {
    initCountUp();
  }
}

/* ══════════════════════════════════════════════════════════════
   G. HAMBURGER MENU (MÓVIL)
══════════════════════════════════════════════════════════════ */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');

  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Cierra al hacer clic fuera
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  links.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

/* ══════════════════════════════════════════════════════════════
   H. HEADER — efecto scroll
══════════════════════════════════════════════════════════════ */
function initScrollHeader() {
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   I. RENDER — PROCESO DE TRABAJO
══════════════════════════════════════════════════════════════ */
function renderProcessSteps() {
  const container = document.getElementById('process-timeline');
  if (!container) return;

  container.innerHTML = PROCESS_STEPS.map((step, i) => `
    <article class="process-step" role="listitem"
             style="animation-delay:${i * 0.1}s;">
      <span class="process-step-badge"
            style="background:${step.badgeBg}; color:${step.badgeColor};">
        ${step.badge}
      </span>
      <div class="process-step-number">${step.step}</div>
      <span class="process-step-icon" aria-hidden="true">${step.icon}</span>
      <h3 class="process-step-title">${step.title}</h3>
      <p class="process-step-desc">${step.desc}</p>
    </article>
  `).join('');
}

/* ══════════════════════════════════════════════════════════════
   J. RENDER — PORTAFOLIO (con filtros y lightbox)
══════════════════════════════════════════════════════════════ */
let currentFilter = 'Todos';

function renderPortfolio(filter = 'Todos') {
  renderFilters();
  renderCards(filter);
  initLightbox();
}

function renderFilters() {
  const container = document.getElementById('portfolio-filters');
  if (!container || container.dataset.initialized) return;
  container.dataset.initialized = 'true';

  const categories = ['Todos', ...new Set(PORTFOLIO_ITEMS.map(p => p.category))];
  container.innerHTML = categories.map(cat => `
    <button class="filter-btn ${cat === 'Todos' ? 'active' : ''}"
            data-filter="${cat}"
            aria-pressed="${cat === 'Todos'}">
      ${cat}
    </button>
  `).join('');

  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const filter = btn.dataset.filter;
    currentFilter = filter;

    container.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === filter);
      b.setAttribute('aria-pressed', b.dataset.filter === filter);
    });
    renderCards(filter);
  });
}

function renderCards(filter) {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  const items = filter === 'Todos'
    ? PORTFOLIO_ITEMS
    : PORTFOLIO_ITEMS.filter(p => p.category === filter);

  grid.innerHTML = items.map((item, i) => {
    const imgUrl = gdThumb(item.imageId);

    // Bloque visual: imagen real o efecto neon placeholder
    const visualBlock = imgUrl ? `
      <div class="card-img-wrap"
           style="--img-border:${item.mainColor}; --img-glow:${item.mainGlow.replace('0.6','0.22')};">
        <div class="card-img-skeleton" id="skel-${item.id}"></div>
        <img src="${imgUrl}"
             alt="Proyecto ${item.client}"
             loading="lazy"
             onload="document.getElementById('skel-${item.id}')?.remove()"
             onerror="this.closest('.card-img-wrap').innerHTML='<div class=\\'card-visual-fallback\\' style=\\'background:${item.bgGradient}\\'></div>'" />
      </div>
    ` : `
      <div class="card-visual">
        <div class="card-visual-bg" style="background:${item.bgGradient};"></div>
        <div style="
          position:absolute; inset:20px; border-radius:12px;
          border:1.5px solid ${item.mainColor}33;
          box-shadow: inset 0 0 40px ${item.mainGlow.replace('0.6','0.08')}, 0 0 20px ${item.mainGlow.replace('0.6','0.15')};
          pointer-events:none;
        "></div>
        <div class="card-visual-inner">
          <span class="card-neon-label"
                style="color:${item.mainColor};
                       text-shadow:${item.textGlow};">
            ${item.client}
          </span>
          <span class="card-neon-sub"
                style="color:${item.mainColor}99;">
            ${item.category}
          </span>
        </div>
      </div>
    `;

    return `
    <article class="portfolio-card"
             role="listitem"
             data-id="${item.id}"
             style="animation-delay:${i * 0.08}s;
                    --card-border: ${item.borderColor};
                    box-shadow: 0 0 0 1px transparent;"
             tabindex="0"
             aria-label="Ver proyecto ${item.title}">

      ${visualBlock}

      <div class="card-info">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.desc}</p>
        <div class="card-tags">
          ${item.tags.map(tag => `
            <span class="card-tag"
                  style="background:${item.tagBg}; color:${item.tagColor}; border:1px solid ${item.tagColor}33;">
              ${tag}
            </span>
          `).join('')}
        </div>
      </div>

      <div class="card-overlay" aria-hidden="true">
        <button class="overlay-btn" tabindex="-1">Ver Detalle →</button>
      </div>
    </article>
  `;
  }).join('');

  // Hover border glow
  grid.querySelectorAll('.portfolio-card').forEach(card => {
    const color = card.style.getPropertyValue('--card-border');
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = color;
      card.style.boxShadow   = `0 16px 50px rgba(0,0,0,0.5), 0 0 30px ${color}44`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '';
      card.style.boxShadow   = '';
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openLightbox(card.dataset.id);
    });
    card.addEventListener('click', () => openLightbox(card.dataset.id));
  });
}

function animateCards() {
  const cards = document.querySelectorAll('.portfolio-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 80);
  });
}

/* Lightbox */
function initLightbox() {
  const lb      = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  if (!lb || !closeBtn) return;

  closeBtn.addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openLightbox(id) {
  const item = PORTFOLIO_ITEMS.find(p => p.id === id);
  if (!item) return;

  const lb      = document.getElementById('lightbox');
  const content = document.getElementById('lightbox-content');

  const imgUrl = gdThumb(item.imageId, 1200);

  // Bloque visual del lightbox: imagen real o efecto neon
  const lbVisual = imgUrl ? `
    <div style="position:relative; overflow:hidden; max-height:400px;">
      <img class="lb-visual-img"
           src="${imgUrl}"
           alt="Proyecto ${item.client}"
           style="width:100%; max-height:400px; object-fit:cover; display:block;" />
      <div style="
        position:absolute; bottom:0; left:0; right:0; height:80px;
        background:linear-gradient(transparent, ${item.bgGradient.includes('rgba') ? item.bgGradient.match(/rgba\([^)]+\)/)[0].replace(/,[\d.]+\)/, ',0.6)') : 'rgba(0,0,0,0.5)'}, var(--bg-card));
        pointer-events:none;
      "></div>
    </div>
  ` : `
    <div class="lb-visual"
         style="background:${item.bgGradient}; border-bottom:1px solid #ffffff10;">
      <div style="text-align:center;">
        <span style="
          font-family:'Orbitron',monospace;
          font-size:clamp(2rem,6vw,4rem);
          font-weight:900;
          color:${item.mainColor};
          text-shadow:${item.textGlow};
          display:block;
          line-height:1.15;
        ">${item.client}</span>
        <span style="
          font-family:'Barlow Condensed',sans-serif;
          font-size:0.75rem;
          letter-spacing:0.2em;
          text-transform:uppercase;
          color:${item.mainColor}99;
          margin-top:8px;
          display:block;
        ">${item.category}</span>
      </div>
    </div>
  `;

  content.innerHTML = `
    ${lbVisual}
    <div class="lb-body">
      <h2 class="lb-title">${item.title}</h2>
      <p class="lb-desc">${item.fullDesc}</p>
      <div class="lb-tags">
        ${item.tags.map(tag => `
          <span class="card-tag"
                style="background:${item.tagBg}; color:${item.tagColor}; border:1px solid ${item.tagColor}33;">
            ${tag}
          </span>
        `).join('')}
      </div>
    </div>
  `;

  lb.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('lightbox-close').focus();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════════════
   K. RENDER — FAQ ACORDEÓN
══════════════════════════════════════════════════════════════ */
function renderFAQ() {
  const container = document.getElementById('faq-accordion');
  if (!container) return;

  container.innerHTML = FAQ_ITEMS.map((item, i) => `
    <div class="faq-item" role="listitem" id="faq-item-${i}">
      <button class="faq-question"
              aria-expanded="false"
              aria-controls="faq-answer-${i}"
              id="faq-btn-${i}">
        <span>${item.q}</span>
        <span class="faq-arrow" aria-hidden="true">▾</span>
      </button>
      <div class="faq-answer"
           id="faq-answer-${i}"
           role="region"
           aria-labelledby="faq-btn-${i}"
           hidden>
        <div class="faq-answer-inner">${item.a}</div>
      </div>
    </div>
  `).join('');

  // Accordion logic
  container.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item     = btn.closest('.faq-item');
      const answer   = btn.nextElementSibling;
      const isOpen   = item.classList.contains('open');

      // Cierra todos
      container.querySelectorAll('.faq-item').forEach(fi => {
        fi.classList.remove('open');
        fi.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        fi.querySelector('.faq-answer').setAttribute('hidden', '');
      });

      // Abre el actual si estaba cerrado
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   L. RENDER — INFORMACIÓN DE CONTACTO
══════════════════════════════════════════════════════════════ */
function renderContactInfo() {
  const container = document.getElementById('info-cards');
  if (!container) return;

  container.innerHTML = CONTACT_INFO.map(info => `
    <div class="info-card">
      <span class="info-icon" aria-hidden="true">${info.icon}</span>
      <div>
        <div class="info-label">${info.label}</div>
        <div class="info-value">
          ${info.link
            ? `<a href="${info.link}">${info.value.replace(/\n/g, '<br>')}</a>`
            : info.value.replace(/\n/g, '<br>')}
        </div>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════════════
   M. CONTADOR ANIMADO (Hero Stats)
══════════════════════════════════════════════════════════════ */
function initCountUp() {
  const counters = document.querySelectorAll('.stat-number');
  counters.forEach(counter => {
    const target   = parseInt(counter.dataset.target, 10);
    const duration = 1800;
    const step     = Math.ceil(target / (duration / 16));
    let current    = 0;
    counter.textContent = '0';

    const tick = () => {
      current += step;
      if (current >= target) {
        counter.textContent = target;
        return;
      }
      counter.textContent = current;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ══════════════════════════════════════════════════════════════
   N. FORMULARIO DE CONTACTO (validación cliente)
══════════════════════════════════════════════════════════════ */
function initForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (validateForm(form)) {
      simulateSubmit(form, success);
    }
  });

  // Limpia errores al escribir
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => clearError(field));
  });
}

function validateForm(form) {
  let valid = true;
  const fields = form.querySelectorAll('[required]');

  fields.forEach(field => {
    const val = field.value.trim();
    if (!val) {
      showError(field, 'Este campo es obligatorio.');
      valid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showError(field, 'Ingresa un correo válido.');
      valid = false;
    } else {
      clearError(field);
    }
  });

  return valid;
}

function showError(field, msg) {
  field.classList.add('error');
  const errEl = field.parentElement.querySelector('.field-error');
  if (errEl) errEl.textContent = msg;
}

function clearError(field) {
  field.classList.remove('error');
  const errEl = field.parentElement.querySelector('.field-error');
  if (errEl) errEl.textContent = '';
}

function simulateSubmit(form, successEl) {
  const btn     = form.querySelector('button[type="submit"]');
  const btnText = btn.querySelector('.btn-text');
  btnText.textContent = 'Enviando…';
  btn.disabled = true;

  // Simula latencia de red
  setTimeout(() => {
    form.setAttribute('hidden', '');
    successEl.removeAttribute('hidden');
  }, 1200);
}

/* ══════════════════════════════════════════════════════════════
   O. AÑO DINÁMICO EN FOOTER
══════════════════════════════════════════════════════════════ */
function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════════════════════════════
   P. FOOTER NAV — conectar a SPA
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.footer-nav a[data-nav]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(a.dataset.nav);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
});
