import { firebaseConfig, ACCESS_CODE_HASH, APP_NAME, AI_REGION, EVIDENCE_UPLOADS_ENABLED } from './config.js';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getDatabase, ref, push, set, update, remove,
  onValue, query, orderByChild, limitToLast
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
  getStorage, ref as sref, uploadBytes, getDownloadURL, deleteObject
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js';
import {
  getFunctions, httpsCallable
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-functions.js';

/* ================= utilidades ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = n => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const safeUrl = u => { try { const x = new URL(String(u).trim()); return (x.protocol === 'https:' || x.protocol === 'http:') ? x.href : ''; } catch { return ''; } };
const normUrl = u => { u = (u || '').trim(); if (!u) return ''; if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u; return safeUrl(u); };
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const fmtTs = t => t ? new Date(t).toLocaleDateString('es-MX', {day:'numeric', month:'short', year:'numeric'}) : '';
const fmtDate = s => { if (!s) return ''; const d = new Date(s + 'T00:00:00'); return isNaN(d) ? s : d.toLocaleDateString('es-MX', {day:'numeric', month:'short', year:'numeric'}); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fmtBytes = n => !n ? '' : n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
const parseTags = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 12);
const distinct = arr => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
const uid4 = () => Math.random().toString(36).slice(2, 6);
const decodeEntities = s => String(s || '').replace(/&amp;|&lt;|&gt;|&quot;|&#0?39;/g, m => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"',"&#39;":"'","&#039;":"'"}[m] || m));
const initials = name => { const p = String(name || '').trim().split(/\s+/).filter(Boolean); return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?'; };
const avatarHtml = (name, color, cls = 'av') => `<span class="${cls}" style="background:var(--${color || 'amber'})">${esc(initials(name))}</span>`;
const memberCode = uid => (String(uid || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'NODO0000').padEnd(8, '0');

// Código de barras Code 39, generado como SVG puro (sin librerías externas,
// para que funcione sin conexión). Tabla de anchos estándar de Code 39:
// n = barra/espacio angosto, w = barra/espacio ancho.
const CODE39 = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
  'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw', 'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn',
  'F': 'nnwnwwnnn', 'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww', 'O': 'wnnnwnnwn',
  'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn', 'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn',
  'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw', 'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn',
  'Z': 'nwwnwnnnn', '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '*': 'nwnnwnwnn'
};
function barcodeSvg(text, {h = 56, narrow = 2.2, wide = 5, quiet = 12} = {}) {
  const chars = ('*' + String(text || '').toUpperCase().replace(/[^A-Z0-9 \-.]/g, '') + '*').split('');
  let x = quiet, bars = '';
  chars.forEach((ch, i) => {
    const pat = CODE39[ch] || CODE39['0'];
    for (let j = 0; j < pat.length; j++) {
      const w = pat[j] === 'w' ? wide : narrow;
      if (j % 2 === 0) bars += `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${h}" fill="currentColor"/>`;
      x += w;
    }
    if (i < chars.length - 1) x += narrow; // espacio entre caracteres
  });
  const width = x + quiet;
  return `<svg viewBox="0 0 ${width.toFixed(2)} ${h}" width="100%" height="${h}" preserveAspectRatio="none" role="img" aria-label="Código de barras ${esc(text)}">${bars}</svg>`;
}

function getContributions(name) {
  return KEYS.flatMap(k => S.data[k].filter(it => it.autor === name).map(it => ({sec: k, titulo: label(it), creado: it.creado})))
    .sort((a, b) => (b.creado || 0) - (a.creado || 0));
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
// Utilidad expuesta para generar el hash de un nuevo código desde la consola
// del navegador: await bovedaHashCode("nuevo-codigo")
window.bovedaHashCode = sha256Hex;

let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2800);
}
async function copyText(text, msg) {
  try { await navigator.clipboard.writeText(text); toast(msg || 'Copiado'); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;opacity:0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    toast(ok ? (msg || 'Copiado') : 'No se pudo copiar. Selecciona el texto y cópialo a mano.');
  }
}
function errMsg(e) {
  const raw = (e && e.code || '').toLowerCase().replace(/_/g, '-');
  const c = raw.replace('storage/', '').replace('database/', '').replace('auth/', '').replace('functions/', '');
  if (c === 'custom') return e.message;
  const m = {
    'permission-denied': 'No tienes permiso para hacer esto. Verifica el código de acceso o las reglas de Firebase (ver README).',
    unauthenticated: 'Se perdió la sesión con la Bóveda. Recarga la página.',
    unavailable: 'Sin conexión. Se guardará cuando vuelva el internet.',
    disconnected: 'Sin conexión. Se guardará cuando vuelva el internet.',
    'network-error': 'Sin conexión. Se guardará cuando vuelva el internet.',
    'resource-exhausted': 'Demasiadas acciones seguidas. Espera unos segundos e inténtalo otra vez.',
    'max-retries': 'Demasiadas acciones seguidas. Espera unos segundos e inténtalo otra vez.',
    canceled: 'Se canceló la subida.',
    'quota-exceeded': 'Se llenó el espacio de almacenamiento del proyecto.',
    'not-found': 'El Asistente IA no está configurado todavía (falta desplegar la función). Revisa el README, sección "Asistente IA".',
    'internal': 'El Asistente IA tuvo un problema al responder. Intenta de nuevo en un momento.',
    'invalid-argument': 'Escribe una pregunta antes de enviar.',
    'unknown': 'No se pudo completar la acción. Revisa tu conexión e inténtalo de nuevo.'
  };
  return m[c] || 'No se pudo completar la acción. Reintenta.';
}

/* ================= paleta / acentos ================= */
const PALETTE = ['amber','teal','rust','green','purple','blue','rose','crimson','slate','sepia','pink','orchid','orange'];
const ACCENT = {accesos:'accesos', evidencias:'evidencias', snippets:'lab', acuerdos:'acuerdos', biblioteca:'biblioteca', asistente:'ia', perfil:'perfil'};

/* ================= configuración de secciones ================= */
const KEYS = ['accesos', 'evidencias', 'snippets', 'acuerdos', 'biblioteca'];
const NAVORDER = [...KEYS, 'asistente', 'perfil'];
const EXTRA = {
  asistente: {nav: 'IA', rail: 'Asistente', icon: 'sparkle'},
  perfil: {nav: 'Perfil', rail: 'Mi tarjeta', icon: 'user'}
};
const PLATS = ['Classroom', 'Moodle', 'Teams', 'GitHub', 'Reunión', 'Otro'];
const CATS = ['Entorno', 'Git', 'Docker', 'Redes', 'Base de datos', 'Python', 'Java', 'JavaScript', 'Linux', 'Editor / IDE', 'Otro'];
const TIPOS_AC = ['Fecha movida', 'Porcentaje de evaluación', 'Prórroga de entrega', 'Cambio de modalidad', 'Otro'];
const MEDIOS = ['Presencial en clase', 'WhatsApp', 'Correo', 'Classroom o Moodle', 'Teams', 'Otro'];
const TIPOS_BI = ['PDF', 'ISO', 'Libro', 'Video', 'Repositorio', 'Otro'];
const ROLES = ['Jefatura', 'Subjefatura', 'Titular', 'Suplente']; // todos los roles posibles (para mostrar)
const SELF_ROLES = ['Titular', 'Suplente']; // los únicos que una persona puede elegirse a sí misma
const LEAD_ROLES = ['Jefatura', 'Subjefatura']; // solo se asignan a mano desde la consola de Firebase

const CFG = {
  accesos: {
    nav: 'Accesos', rail: 'Accesos', icon: 'key', noun: 'acceso',
    title: 'Directorio de accesos',
    lead: 'Claves de matriculación y enlaces recurrentes de cada materia: Classroom, Moodle, Teams, GitHub y reuniones.',
    add: 'Agregar acceso', placeholder: 'Buscar materia, plataforma o nombre',
    search: ['titulo', 'plataforma', 'materia', 'notas', 'url'],
    filter: (it, f) => !f.plat || it.plataforma === f.plat,
    fields: [
      {n: 'plataforma', l: 'Plataforma', t: 'select', o: PLATS, req: 1},
      {n: 'titulo', l: 'Nombre', req: 1, ph: 'Bases de Datos II, grupo A'},
      {n: 'materia', l: 'Materia', ph: 'Bases de Datos II'},
      {n: 'url', l: 'Enlace', ph: 'https://classroom.google.com/c/...'},
      {n: 'clave', l: 'Clave de matriculación o código', mono: 1},
      {n: 'notas', l: 'Notas', t: 'textarea', rows: 3, ph: 'Quién administra el curso, cuándo vence la clave...'}
    ]
  },
  evidencias: {
    nav: 'Evidencias', rail: 'Evidencias', icon: 'image', noun: 'evidencia',
    title: 'Evidencias',
    lead: 'Fotos del pizarrón, diagramas y requisitos en resolución original, fuera de WhatsApp.',
    add: 'Subir fotos', placeholder: 'Buscar título, materia o etiqueta',
    search: ['titulo', 'materia', 'nota', 'tags'],
    filter: (it, f) => !f.materia || it.materia === f.materia,
    fields: [
      {n: 'titulo', l: 'Título', req: 1},
      {n: 'materia', l: 'Materia'},
      {n: 'tags', l: 'Etiquetas separadas por coma', ph: 'ER, pizarrón, parcial 2'},
      {n: 'nota', l: 'Nota', t: 'textarea', rows: 3, ph: 'Qué muestra y por qué importa'}
    ]
  },
  snippets: {
    nav: 'Lab', rail: 'Laboratorio', icon: 'wrench', noun: 'entrada',
    title: 'Laboratorio',
    lead: 'Errores clásicos con su solución propia, o resultados reales de Stack Overflow al instante.',
    add: 'Registrar solución', placeholder: 'Buscar error, comando o etiqueta',
    search: ['titulo', 'categoria', 'sintoma', 'solucion', 'codigo', 'tags'],
    filter: (it, f) => (!f.cat || it.categoria === f.cat) && (!f.estado || it.estado === f.estado),
    fields: [
      {n: 'titulo', l: 'Error o problema', req: 1, ph: 'ModuleNotFoundError: No module named "flask"'},
      {n: 'categoria', l: 'Categoría', t: 'select', o: CATS, req: 1},
      {n: 'estado', l: 'Estado', t: 'select', o: [['resuelto', 'Resuelto'], ['abierto', 'Pendiente de solución']], req: 1},
      {n: 'sintoma', l: 'Qué pasa', t: 'textarea', rows: 3, ph: 'Sistema operativo, versión y comando que lo dispara'},
      {n: 'solucion', l: 'Solución paso a paso', t: 'textarea', rows: 5, ph: '1. Abre el archivo...\n2. Ejecuta...'},
      {n: 'codigo', l: 'Comando o snippet', t: 'textarea', rows: 5, mono: 1},
      {n: 'tags', l: 'Etiquetas separadas por coma', ph: 'PATH, .env, pip'}
    ],
    check: d => d.estado === 'resuelto' && !d.solucion && !d.codigo ? 'Una entrada resuelta necesita la solución o un comando. Si aún no la tienes, márcala como pendiente.' : ''
  },
  acuerdos: {
    nav: 'Acuerdos', rail: 'Acuerdos', icon: 'scale', noun: 'acuerdo',
    title: 'Acuerdos',
    lead: 'Fechas movidas y porcentajes acordados con cada profesor, con la constancia para respaldarlos.',
    add: 'Registrar acuerdo', placeholder: 'Buscar materia, profesor o acuerdo',
    search: ['materia', 'profesor', 'tipo', 'resumen', 'antes', 'ahora', 'constancia'],
    filter: (it, f) => (!f.materia || it.materia === f.materia) && (!f.vigente || it.estado !== 'reemplazado'),
    fields: [
      {n: 'materia', l: 'Materia', req: 1},
      {n: 'profesor', l: 'Profesor o profesora'},
      {n: 'tipo', l: 'Tipo de acuerdo', t: 'select', o: TIPOS_AC, req: 1},
      {n: 'resumen', l: 'Qué se acordó', t: 'textarea', rows: 3, req: 1, ph: 'El parcial 2 pasa del 12 al 19 de octubre por el feriado.'},
      {n: 'antes', l: 'Antes (fecha o porcentaje)', ph: '12 oct, 30%'},
      {n: 'ahora', l: 'Acordado (fecha o porcentaje)', ph: '19 oct, 25%'},
      {n: 'fechaAcuerdo', l: 'Fecha del acuerdo', t: 'date', req: 1},
      {n: 'medio', l: 'Medio', t: 'select', o: MEDIOS, req: 1},
      {n: 'constancia', l: 'Dónde consta', ph: 'Captura en el grupo, correo del 14/09, presentes: 8 titulares'},
      {n: 'estado', l: 'Estado', t: 'select', o: [['vigente', 'Vigente'], ['reemplazado', 'Reemplazado por otro acuerdo']], req: 1}
    ],
    defaults: () => ({fechaAcuerdo: today(), estado: 'vigente'})
  },
  biblioteca: {
    nav: 'Biblioteca', rail: 'Biblioteca', icon: 'library', noun: 'recurso',
    title: 'Biblioteca',
    lead: 'Enlaces directos a PDFs, ISOs y libros que pesan demasiado para el chat.',
    add: 'Agregar recurso', placeholder: 'Buscar título, materia o tipo',
    search: ['titulo', 'tipo', 'materia', 'notas', 'url'],
    filter: (it, f) => !f.tipo || it.tipo === f.tipo,
    fields: [
      {n: 'titulo', l: 'Título', req: 1},
      {n: 'tipo', l: 'Tipo', t: 'select', o: TIPOS_BI, req: 1},
      {n: 'url', l: 'Enlace directo', req: 1, ph: 'https://drive.google.com/...'},
      {n: 'tamano', l: 'Tamaño', ph: '1.4 GB'},
      {n: 'materia', l: 'Materia'},
      {n: 'notas', l: 'Notas', t: 'textarea', rows: 3, ph: 'Versión, edición, contraseña del archivo comprimido...'}
    ]
  }
};

/* ================= estado ================= */
const S = {
  tab: 'accesos', status: 'gate',
  db: null, auth: null, storage: null, functions: null, uid: '', myName: '', myRole: '', myColor: 'amber',
  data: {accesos: [], evidencias: [], snippets: [], acuerdos: [], biblioteca: [], miembros: []},
  loaded: {}, err: {},
  q: {}, f: {accesos: {plat: ''}, evidencias: {materia: ''}, snippets: {cat: '', estado: ''}, acuerdos: {materia: '', vigente: false}, biblioteca: {tipo: ''}},
  open: new Set(), rev: new Set(), unsub: [],
  lab: {mode: 'nodo', so: {q: '', loading: false, err: '', items: null}},
  chat: [], chatBusy: false
};
const view = $('#view');
const dlg = $('#dlg'), dlgBody = $('#dlgBody'), cfm = $('#cfm'), cfmBody = $('#cfmBody');

const label = it => it.titulo || (it.materia ? it.materia + (it.tipo ? ', ' + it.tipo : '') : 'este registro');
const byname = it => it.autor || 'Alguien del Nodo';

/* ================= navegación ================= */
function buildNav() {
  const item = (k, cls) => {
    const meta = CFG[k] || EXTRA[k];
    const lbl = cls === 'nav-i' ? meta.rail : meta.nav;
    const ac = ACCENT[k];
    return `<button type="button" class="${cls}" data-tab="${k}" style="--nav-c:var(--c-${ac});--tab-c:var(--c-${ac})">${icon(meta.icon)}<span class="nl">${esc(lbl)}</span><span class="cnt"></span></button>`;
  };
  $('#rail-nav').innerHTML = KEYS.map(k => item(k, 'nav-i')).join('') +
    '<div class="rule"></div>' + ['asistente', 'perfil'].map(k => item(k, 'nav-i')).join('');
  $('#tabbar').innerHTML = NAVORDER.map(k => item(k, 'tab-i')).join('');
}
function updateNav() {
  $$('[data-tab]').forEach(b => {
    const k = b.dataset.tab;
    if (k === S.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    const c = b.querySelector('.cnt'); if (c) c.textContent = (KEYS.includes(k) && S.loaded[k]) ? S.data[k].length : '';
  });
}
function syncSearchBar() {
  const q = $('#q'), wrap = q.closest('.search');
  const isContent = KEYS.includes(S.tab);
  wrap.style.display = isContent ? '' : 'none';
  if (!isContent) return;
  if (S.tab === 'snippets' && S.lab.mode === 'so') {
    q.placeholder = 'Buscar en Stack Overflow (mín. 3 letras)';
    q.value = S.lab.so.q;
  } else {
    q.placeholder = CFG[S.tab].placeholder;
    q.value = S.q[S.tab] || '';
  }
}
function setTab(k, userNav) {
  if (!NAVORDER.includes(k)) return;
  S.tab = k;
  try { localStorage.setItem('boveda:tab', k); } catch {}
  syncSearchBar();
  document.title = (CFG[k] ? CFG[k].title : (k === 'asistente' ? 'Asistente IA' : 'Mi tarjeta')) + ' | ' + APP_NAME;
  updateNav(); renderView();
  if (userNav) { window.scrollTo({top: 0}); view.focus({preventScroll: true}); }
}

/* ================= renderizado ================= */
const fkey = el => {
  if (!el || !el.dataset) return '';
  if (el.dataset.act) return ['a', el.dataset.act, el.dataset.sec, el.dataset.id, el.dataset.f, el.dataset.key].join('|');
  if (el.dataset.sel) return 's|' + el.dataset.sel;
  if (el.tagName === 'SUMMARY') return 'u|' + (el.parentElement.dataset.id || '');
  return '';
};
let rq = 0;
function schedule() {
  if (rq) return;
  rq = requestAnimationFrame(() => {
    rq = 0; updateNav();
    if (S.tab !== 'asistente') renderView(); // evita perder texto que se esté escribiendo en el chat
    refreshMaterias();
  });
}

function renderView() {
  const fk = view.contains(document.activeElement) ? fkey(document.activeElement) : '';
  view.innerHTML = build();
  if (fk) {
    const el = $$('[data-act],[data-sel],summary', view).find(x => fkey(x) === fk);
    if (el) el.focus({preventScroll: true});
  }
  if (S.tab === 'asistente') { try { view.scrollTop = view.scrollHeight; } catch {} }
}
function build() {
  const k = S.tab;
  if (S.status === 'connecting') return `<div class="sk"></div><div class="sk"></div><div class="sk"></div><p class="hint" style="margin-top:16px">Conectando con la Bóveda...</p>`;
  if (S.status === 'off') return `<div class="empty">${icon('alert')}<h2>No se pudo conectar</h2><p>Revisa tu conexión o que la configuración de Firebase en <code>js/config.js</code> sea correcta. Consulta el README del proyecto.</p><button type="button" class="btn primary" data-act="reload">Recargar</button></div>`;
  if (k === 'asistente') return bAsistente();
  if (k === 'perfil') return bPerfil();
  const B = {accesos: bAccesos, evidencias: bEvid, snippets: bSnip, acuerdos: bAcu, biblioteca: bBib}[k];
  let body = S.err[k] ? `<div class="note">${icon('alert')}<p>${esc(errMsg(S.err[k]))}</p></div>` : '';
  if (!navigator.onLine) body += `<div class="note info">${icon('wifi-off')}<p>Sin conexión. Estás viendo la última copia guardada en este dispositivo; lo que agregues se sincronizará al volver el internet.</p></div>`;
  return head(k) + body + (S.loaded[k] ? B() : skel());
}
function head(k) {
  const c = CFG[k]; let act = '';
  if (k === 'snippets') act = S.lab.mode === 'so' ? '' : `<button type="button" class="btn" data-act="help">${icon('help')}Pedir ayuda</button><button type="button" class="btn primary" data-act="add">${icon('plus')}${c.add}</button>`;
  else if (k === 'evidencias') act = EVIDENCE_UPLOADS_ENABLED
    ? `<button type="button" class="btn primary" data-act="add">${icon('upload')}${c.add}</button>`
    : `<button type="button" class="btn" disabled title="Subida de fotos deshabilitada temporalmente">${icon('upload')}${c.add}</button>`;
  else act = `<button type="button" class="btn primary" data-act="add">${icon('plus')}${c.add}</button>`;
  return `<div class="sec-h"><div><h1>${c.title}</h1><p class="lead">${c.lead}</p></div><div class="sec-act">${act}</div></div>`;
}
const skel = () => `<div class="sk"></div><div class="sk"></div><div class="sk"></div>`;
const chip = (key, val, text, on, accent) => `<button type="button" class="chip" data-act="chip" data-key="${key}" data-val="${esc(val)}" aria-pressed="${on}"${accent ? ` style="--chip-c:var(--${accent})"` : ''}>${esc(text)}</button>`;
const sel = (key, all, opts, cur) => `<label class="selw"><span class="sr">${esc(all)}</span><select data-sel="${key}" aria-label="${esc(all)}"><option value="">${esc(all)}</option>${opts.map(o => `<option value="${esc(o)}"${o === cur ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
const empty = (ic, t, p, btn) => `<div class="empty">${icon(ic)}<h2>${t}</h2><p>${p}</p>${btn || ''}</div>`;
const addBtn = k => `<button type="button" class="btn primary" data-act="add">${icon('plus')}${CFG[k].add}</button>`;
const noMatch = () => empty('search', 'Nada coincide', 'Prueba con otras palabras o quita los filtros.', `<button type="button" class="btn" data-act="clear">Limpiar filtros</button>`);
const tagsHtml = a => Array.isArray(a) && a.length ? `<ul class="tags">${a.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
const byline = it => `<p class="by"><b>${esc(byname(it))}</b><span>${fmtTs(it.creado)}</span></p>`;
const acts = (k, it) => `<button type="button" class="icon-btn" data-act="edit" data-sec="${k}" data-id="${it.id}" aria-label="Editar ${esc(label(it))}" title="Editar">${icon('pencil')}</button><button type="button" class="icon-btn" data-act="del" data-sec="${k}" data-id="${it.id}" aria-label="Eliminar ${esc(label(it))}" title="Eliminar">${icon('trash')}</button>`;
const copyBtn = (k, it, f, text) => `<button type="button" class="btn" data-act="copy" data-sec="${k}" data-id="${it.id}" data-f="${f}">${icon('copy')}${text}</button>`;

function filterList(k) {
  const c = CFG[k], f = S.f[k], q = norm(S.q[k]).split(/\s+/).filter(Boolean);
  return S.data[k].filter(it => {
    if (!c.filter(it, f)) return false;
    if (!q.length) return true;
    const hay = norm(c.search.map(x => Array.isArray(it[x]) ? it[x].join(' ') : it[x]).join(' '));
    return q.every(t => hay.includes(t));
  });
}

/* ---- Accesos ---- */
function bAccesos() {
  const all = S.data.accesos, f = S.f.accesos, list = filterList('accesos');
  let out = `<div class="note">${icon('lock')}<p>Guarda aquí claves de matriculación y enlaces de grupo. No pongas contraseñas personales: todos los que entran a la Bóveda pueden leerlas.</p></div>`;
  if (!all.length) return out + empty('key', 'Aún no hay accesos', 'Agrega la primera clave de matriculación o el enlace de una reunión recurrente.', addBtn('accesos'));
  out += `<div class="bar"><div class="chips" role="group" aria-label="Filtrar por plataforma">${chip('plat', '', 'Todas', f.plat === '', 'amber')}${PLATS.map(p => chip('plat', p, p, f.plat === p, 'amber')).join('')}</div></div>`;
  if (!list.length) return out + noMatch();
  const g = {};
  list.forEach(it => { (g[it.materia || 'General'] = g[it.materia || 'General'] || []).push(it); });
  const names = Object.keys(g).sort((a, b) => a === 'General' ? 1 : b === 'General' ? -1 : a.localeCompare(b, 'es'));
  return out + names.map(n => `<section class="grp"><h2>${esc(n)}</h2><div class="list cols">${g[n].map(accCard).join('')}</div></section>`).join('');
}
function accCard(it) {
  const url = safeUrl(it.url), on = S.rev.has(it.id);
  return `<article class="card">
    <div class="card-h"><span class="tag">${esc(it.plataforma || 'Otro')}</span><h3>${esc(it.titulo || 'Sin nombre')}</h3></div>
    ${it.clave ? `<div class="keyrow"><span class="kl">Clave</span><code class="key">${on ? esc(it.clave) : '••••••••'}</code>
      <button type="button" class="icon-btn" data-act="reveal" data-sec="accesos" data-id="${it.id}" aria-pressed="${on}" aria-label="Mostrar clave" title="Mostrar u ocultar">${icon('eye')}</button>
      <button type="button" class="icon-btn" data-act="copy" data-sec="accesos" data-id="${it.id}" data-f="clave" aria-label="Copiar clave" title="Copiar clave">${icon('copy')}</button></div>` : ''}
    ${it.notas ? `<p class="prose sm">${esc(it.notas)}</p>` : ''}
    <div class="card-f">
      ${url ? `<a class="btn primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon('ext')}Abrir</a>${copyBtn('accesos', it, 'url', 'Copiar enlace')}` : ''}
      <span class="sp"></span>${acts('accesos', it)}
    </div>
    ${byline(it)}
  </article>`;
}

/* ---- Evidencias ---- */
function bEvid() {
  const all = S.data.evidencias, f = S.f.evidencias, list = filterList('evidencias');
  const uploadNote = !EVIDENCE_UPLOADS_ENABLED ? `<div class="note info">${icon('alert')}<p>Subir fotos nuevas está deshabilitado temporalmente. Lo que ya está guardado se puede seguir viendo, editando y borrando con normalidad.</p></div>` : '';
  if (!all.length) {
    const btn = EVIDENCE_UPLOADS_ENABLED ? addBtn('evidencias') : '';
    return uploadNote + empty('image', 'Sin evidencias todavía', EVIDENCE_UPLOADS_ENABLED ? 'Sube la foto del pizarrón antes de que se borre. Se guarda en resolución original.' : 'La subida de fotos está pausada por ahora. Vuelve más tarde.', btn);
  }
  const mats = distinct(all.map(x => x.materia));
  let out = uploadNote + (mats.length ? `<div class="bar">${sel('materia', 'Todas las materias', mats, f.materia)}</div>` : '');
  if (!list.length) return out + noMatch();
  return out + `<div class="gal">${list.map(it => `<button type="button" class="shot" data-act="open-img" data-sec="evidencias" data-id="${it.id}">
      <span class="shot-img"><img loading="lazy" decoding="async" alt="" src="${esc(it.thumb || it.url || '')}"></span>
      <span class="shot-t">${esc(it.titulo)}</span>
      <span class="shot-m">${esc(it.materia || 'Sin materia')}, ${fmtTs(it.creado)}</span></button>`).join('')}</div>`;
}

/* ---- Laboratorio ---- */
function bSnip() {
  const modeBar = `<div class="bar"><div class="chips" role="group" aria-label="Modo de búsqueda">
    <button type="button" class="chip" data-act="labmode" data-val="nodo" aria-pressed="${S.lab.mode !== 'so'}">${icon('wrench')}Nuestro Lab</button>
    <button type="button" class="chip" data-act="labmode" data-val="so" aria-pressed="${S.lab.mode === 'so'}" style="--chip-c:var(--blue)">${icon('stack')}Buscar en Stack Overflow</button>
  </div></div>`;
  return modeBar + (S.lab.mode === 'so' ? bSnipSO() : bSnipNodo());
}
function bSnipNodo() {
  const all = S.data.snippets, f = S.f.snippets, list = filterList('snippets');
  if (!all.length) return empty('wrench', 'El botiquín está vacío', 'Registra el primer error que resolviste, con su comando y los pasos. O pide ayuda si estás trabado.', addBtn('snippets'));
  const cats = distinct(all.map(x => x.categoria));
  let out = `<div class="bar">${sel('cat', 'Todas las categorías', cats, f.cat)}<div class="chips" role="group" aria-label="Filtrar por estado">${chip('estado', '', 'Todas', f.estado === '')}${chip('estado', 'resuelto', 'Resueltas', f.estado === 'resuelto', 'green')}${chip('estado', 'abierto', 'Pendientes', f.estado === 'abierto', 'amber')}</div></div>`;
  if (!list.length) return out + noMatch();
  return out + list.map(it => {
    const open = S.open.has(it.id), solved = it.estado !== 'abierto';
    return `<details class="qa" data-id="${it.id}"${open ? ' open' : ''}>
      <summary><span class="tag ${solved ? 'ok' : 'warn'}">${solved ? 'Resuelto' : 'Pendiente'}</span>
        <span class="q-t">${esc(it.titulo)}</span><span class="chev">${icon('chev')}</span>
        <span class="q-m"><span>${esc(it.categoria || 'Otro')}</span><span>${esc(byname(it))}</span><span>${fmtTs(it.creado)}</span></span></summary>
      <div class="qa-b">
        ${it.sintoma ? `<section><h4>Qué pasa</h4><p class="prose">${esc(it.sintoma)}</p></section>` : ''}
        ${it.solucion ? `<section><h4>Solución</h4><p class="prose">${esc(it.solucion)}</p></section>` : (solved ? '' : `<p class="hint">Nadie ha aportado solución todavía. Si sabes cómo destrabarlo, aporta los pasos.</p>`)}
        ${it.codigo ? `<section><div class="code-h"><h4>Comando</h4><button type="button" class="btn" data-act="copy" data-sec="snippets" data-id="${it.id}" data-f="codigo">${icon('copy')}Copiar</button></div><pre class="code" tabindex="0"><code>${esc(it.codigo)}</code></pre></section>` : ''}
        ${tagsHtml(it.tags)}
        <div class="qa-f">
          ${!solved ? `<button type="button" class="btn primary" data-act="solve" data-sec="snippets" data-id="${it.id}">${icon('check')}Aportar solución</button>` : ''}
          <span class="sp"></span>${acts('snippets', it)}
        </div>
      </div></details>`;
  }).join('');
}
let soTimer = null, soAbort = null;
function soSearch(qtext) {
  clearTimeout(soTimer);
  soTimer = setTimeout(async () => {
    if (soAbort) soAbort.abort();
    const query = qtext.trim();
    S.lab.so.err = '';
    if (query.length < 3) { S.lab.so.items = []; renderView(); return; }
    S.lab.so.loading = true; S.lab.so.items = null; renderView();
    soAbort = new AbortController();
    try {
      const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&pagesize=15&q=${encodeURIComponent(query)}&site=stackoverflow`;
      const r = await fetch(url, {signal: soAbort.signal});
      const j = await r.json();
      if (j.error_id) throw new Error(j.error_message || 'Stack Overflow rechazó la búsqueda.');
      S.lab.so.items = j.items || [];
    } catch (e) {
      if (e.name === 'AbortError') return;
      S.lab.so.err = e.message === 'Failed to fetch' ? 'Sin conexión con Stack Overflow.' : (e.message || 'No se pudo buscar.');
      S.lab.so.items = [];
    } finally {
      S.lab.so.loading = false; renderView();
    }
  }, 400);
}
function bSnipSO() {
  const st = S.lab.so;
  if (!st.q) return empty('stack', 'Busca en Stack Overflow', 'Escribe arriba, en la barra de búsqueda, para consultar preguntas reales de Stack Overflow al instante, sin depender de que el grupo ya las haya cargado.');
  if (st.loading) return skel();
  if (st.err) return `<div class="note">${icon('alert')}<p>${esc(st.err)}</p></div>`;
  if (st.items && !st.items.length) return empty('search', 'Sin resultados en Stack Overflow', 'Prueba con otras palabras; en inglés suele haber más resultados.');
  if (!st.items) return skel();
  return `<div class="list">${st.items.map(soItem).join('')}</div>`;
}
function soItem(q) {
  const title = decodeEntities(q.title), link = safeUrl(q.link);
  return `<article class="so-item">
    <div class="so-stat ${q.is_answered ? 'answered' : ''}"><b>${Number(q.score) || 0}</b><span>votos</span></div>
    <div class="so-stat ${q.is_answered ? 'answered' : ''}"><b>${Number(q.answer_count) || 0}</b><span>resp.</span></div>
    <div class="so-body">
      ${link ? `<a class="so-t" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a>` : `<span class="so-t">${esc(title)}</span>`}
      <div class="so-tagrow">${(q.tags || []).slice(0, 5).map(t => `<span class="tag mute">${esc(t)}</span>`).join('')}</div>
    </div>
  </article>`;
}

/* ---- Acuerdos ---- */
function bAcu() {
  const all = S.data.acuerdos, f = S.f.acuerdos;
  if (!all.length) return empty('scale', 'Sin acuerdos registrados', 'Anota cada cambio de fecha o porcentaje el mismo día que se acuerda, con dónde consta.', addBtn('acuerdos'));
  const list = filterList('acuerdos').sort((a, b) => (b.fechaAcuerdo || '').localeCompare(a.fechaAcuerdo || ''));
  const mats = distinct(all.map(x => x.materia));
  let out = `<div class="bar">${sel('materia', 'Todas las materias', mats, f.materia)}<div class="chips"><button type="button" class="chip" data-act="toggle" data-key="vigente" aria-pressed="${!!f.vigente}" style="--chip-c:var(--green)">Solo vigentes</button></div></div>`;
  if (!list.length) return out + noMatch();
  return out + `<div class="list">${list.map(it => {
    const gone = it.estado === 'reemplazado';
    return `<article class="card ag${gone ? ' gone' : ''}">
      <div class="card-h"><div class="card-f"><span class="tag">${esc(it.tipo || 'Otro')}</span><span class="tag ${gone ? 'mute' : 'ok'}">${gone ? 'Reemplazado' : 'Vigente'}</span></div>
      <h3>${esc(it.materia)}</h3></div>
      <div class="meta">${it.profesor ? `<span>${esc(it.profesor)}</span>` : ''}<span>Acordado el ${fmtDate(it.fechaAcuerdo)}</span>${it.medio ? `<span>${esc(it.medio)}</span>` : ''}</div>
      <p class="prose ag-sum">${esc(it.resumen)}</p>
      ${it.antes || it.ahora ? `<div class="diff"><div><span class="dl">Antes</span><span class="dv">${esc(it.antes || 'Sin dato')}</span></div>${icon('arrow')}<div><span class="dl">Acordado</span><span class="dv">${esc(it.ahora || 'Sin dato')}</span></div></div>` : ''}
      ${it.constancia ? `<p class="proof"><b>Consta en:</b> ${esc(it.constancia)}</p>` : ''}
      <div class="card-f"><button type="button" class="btn" data-act="constancia" data-sec="acuerdos" data-id="${it.id}">${icon('copy')}Copiar constancia</button><span class="sp"></span>${acts('acuerdos', it)}</div>
      ${byline(it)}
    </article>`;
  }).join('')}</div>`;
}
function constancia(it) {
  return ['Constancia de acuerdo', `Materia: ${it.materia}`, it.profesor ? `Profesor/a: ${it.profesor}` : '', `Fecha del acuerdo: ${fmtDate(it.fechaAcuerdo)}`,
    `Tipo: ${it.tipo}`, `Acuerdo: ${it.resumen}`, it.antes ? `Antes: ${it.antes}` : '', it.ahora ? `Acordado: ${it.ahora}` : '',
    it.medio ? `Medio: ${it.medio}` : '', it.constancia ? `Consta en: ${it.constancia}` : '', `Estado: ${it.estado === 'reemplazado' ? 'Reemplazado' : 'Vigente'}`,
    'Registrado en la Bóveda del Nodo.'].filter(Boolean).join('\n');
}

/* ---- Biblioteca ---- */
function bBib() {
  const all = S.data.biblioteca, f = S.f.biblioteca, list = filterList('biblioteca');
  if (!all.length) return empty('library', 'La biblioteca está vacía', 'Agrega el enlace a un PDF, ISO o libro pesado.', addBtn('biblioteca'));
  let out = `<div class="bar"><div class="chips" role="group" aria-label="Filtrar por tipo">${chip('tipo', '', 'Todos', f.tipo === '', 'purple')}${TIPOS_BI.map(t => chip('tipo', t, t, f.tipo === t, 'purple')).join('')}</div></div>`;
  if (!list.length) return out + noMatch();
  return out + `<div class="list">${list.map(it => {
    const url = safeUrl(it.url);
    return `<article class="card row"><div class="row-main">
      <span class="tag" style="--tag-c:var(--purple);--tag-l:var(--purple-l)">${esc(it.tipo || 'Otro')}</span><h3>${esc(it.titulo)}</h3>
      <div class="meta">${it.materia ? `<span>${esc(it.materia)}</span>` : ''}${url ? `<span>${esc(host(url))}</span>` : ''}${it.tamano ? `<span>${esc(it.tamano)}</span>` : ''}</div>
      ${it.notas ? `<p class="prose sm">${esc(it.notas)}</p>` : ''}${byline(it)}</div>
      <div class="row-act">${url ? `<a class="btn primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon('ext')}Abrir</a><button type="button" class="icon-btn" data-act="copy" data-sec="biblioteca" data-id="${it.id}" data-f="url" aria-label="Copiar enlace de ${esc(it.titulo)}" title="Copiar enlace">${icon('copy')}</button>` : ''}${acts('biblioteca', it)}</div>
    </article>`;
  }).join('')}</div>`;
}

/* ---- Asistente IA ---- */
function bAsistente() {
  const rows = S.chat.map(m => {
    const mine = m.role === 'user';
    const av = mine ? avatarHtml(S.myName, S.myColor) : `<span class="av" style="background:var(--orchid)">${icon('sparkle')}</span>`;
    const src = (!mine && m.sources && m.sources.length) ? `<div class="src">Basado en: ${m.sources.map(s => esc(s.seccion + ': ' + s.titulo)).join(' · ')}</div>` : '';
    return `<div class="msg${mine ? ' me' : ''}">${av}<div class="bub">${esc(m.content)}${src}</div></div>`;
  }).join('');
  const typing = S.chatBusy ? `<div class="msg"><span class="av" style="background:var(--orchid)">${icon('sparkle')}</span><div class="bub"><span class="chat-dots"><i></i><i></i><i></i></span></div></div>` : '';
  const intro = (!S.chat.length && !S.chatBusy) ? empty('sparkle', 'Pregúntale al Nodo', 'Busca en Accesos, Evidencias, Lab, Acuerdos y Biblioteca antes de responder. Nunca comparte claves de matriculación. Si no está configurado, te lo va a avisar en vez de fallar en silencio.') : '';
  return `<div class="sec-h"><div><h1>Asistente</h1><p class="lead">Responde con base en lo que ya está guardado en la Bóveda.</p></div></div>
    <div class="chat">${intro}${rows}${typing}</div>
    <form class="chat-form" id="chatForm">
      <label class="sr" for="chatInput">Escribe tu pregunta</label>
      <textarea id="chatInput" rows="1" placeholder="Ej. ¿Cuándo se movió el parcial de Redes?"${S.chatBusy ? ' disabled' : ''}></textarea>
      <button type="submit" class="icon-btn" aria-label="Enviar"${S.chatBusy ? ' disabled' : ''}>${icon('send')}</button>
    </form>`;
}
async function sendChat(text) {
  S.chat.push({role: 'user', content: text}); persistChat();
  S.chatBusy = true; renderView();
  try {
    if (!S.functions) throw {code: 'functions/not-found'};
    const askVault = httpsCallable(S.functions, 'askVault');
    const history = S.chat.slice(-8, -1);
    const res = await askVault({question: text, history});
    S.chat.push({role: 'assistant', content: res.data.answer, sources: res.data.sources || []});
  } catch (e) {
    S.chat.push({role: 'assistant', content: errMsg(e)});
  } finally {
    S.chatBusy = false; persistChat(); renderView();
  }
}
function persistChat() { try { localStorage.setItem('boveda:chat', JSON.stringify(S.chat.slice(-40))); } catch {} }

/* ---- Perfil / tarjeta digital ---- */
function bPerfil() {
  const me = S.data.miembros.find(m => m.id === S.uid);
  const rol = (me && me.rol) || 'Titular';
  const color = (me && me.color) || S.myColor || 'amber';
  const area = (me && me.area) || '';
  const bio = (me && me.bio) || '';
  const contacto = (me && me.contacto) || '';
  const contribs = getContributions(S.myName);
  const desde = fmtTs((me && me.creado) || Date.now());
  const ultima = contribs.length ? fmtTs(contribs[0].creado) : 'Sin aportes aún';
  const roster = S.data.miembros.filter(m => m.nombre).slice().sort((a, b) =>
    (a.id === S.uid ? -1 : b.id === S.uid ? 1 : 0) || (a.nombre || '').localeCompare(b.nombre || '', 'es'));

  return `<div class="sec-h"><div><h1>Mi tarjeta</h1><p class="lead">Tu tarjeta de presentación dentro del Nodo. El resto del equipo la ve, con menos datos, en el directorio de abajo.</p></div></div>
  <div class="id-card" style="--card-c:var(--${color})">
    <div class="id-top">${avatarHtml(S.myName, color, 'id-av')}<div><div class="id-name">${esc(S.myName)}</div><span class="id-role">${esc(rol)}</span>${area ? `<div class="id-area">${esc(area)}</div>` : ''}</div></div>
    <p class="id-bio">${bio ? esc(bio) : 'Sin biografía todavía.'}</p>
    <div class="id-meta">
      <button type="button" class="id-stat" data-act="contribs" data-name="${esc(S.myName)}"><b>${contribs.length}</b><span>Aportes, ver lista</span></button>
      <div><b>${esc(desde)}</b><span>Miembro desde</span></div>
      <div><b style="font-size:15px">${esc(ultima)}</b><span>Última actividad</span></div>
      ${contacto ? `<div><b style="font-size:14px">${esc(contacto)}</b><span>Contacto</span></div>` : ''}
    </div>
    <div class="id-edit">
      <button type="button" class="btn" data-act="editprofile">${icon('pencil')}Editar mi tarjeta</button>
      <button type="button" class="btn" data-act="credencial">${icon('id')}Ver credencial</button>
    </div>
  </div>
  <section class="roster">
    <h2 style="font-size:15px;font-weight:700;color:var(--ink-m);margin-bottom:12px">El Nodo (${roster.length})</h2>
    ${roster.length ? `<div class="roster-grid">${roster.map(m => `<button type="button" class="mini-card${m.id === S.uid ? ' me' : ''}" data-act="viewcard" data-id="${esc(m.id)}">${avatarHtml(m.nombre, m.color)}<div><b>${esc(m.nombre)}</b><span class="role">${esc(m.rol || 'Miembro')}</span></div></button>`).join('')}</div>`
      : `<p class="hint">Todavía no hay tarjetas del resto del equipo.</p>`}
  </section>`;
}
function viewPublicCard(m) {
  const contribs = getContributions(m.nombre);
  dlg.classList.remove('wide');
  dlgBody.innerHTML = `<div class="dlg-h"><h2 id="dlgTitle">Tarjeta de ${esc(m.nombre)}</h2><button type="button" class="icon-btn" data-close aria-label="Cerrar">${icon('x')}</button></div>
    <div class="dlg-b">
      <div class="id-card" style="--card-c:var(--${m.color || 'amber'})">
        <div class="id-top">${avatarHtml(m.nombre, m.color, 'id-av')}<div><div class="id-name">${esc(m.nombre)}</div><span class="id-role">${esc(m.rol || 'Miembro')}</span>${m.area ? `<div class="id-area">${esc(m.area)}</div>` : ''}</div></div>
        <p class="id-bio">${m.bio ? esc(m.bio) : 'Sin biografía todavía.'}</p>
        <div class="id-meta">
          <button type="button" class="id-stat" data-act="contribs" data-name="${esc(m.nombre)}"><b>${contribs.length}</b><span>Aportes, ver lista</span></button>
          <div><b>${esc(fmtTs(m.creado || Date.now()))}</b><span>Miembro desde</span></div>
        </div>
      </div>
      <p class="hint" style="margin-top:14px">Por privacidad, aquí no se muestra el contacto ni la credencial de otras personas.</p>
    </div>
    <div class="dlg-f"><button type="button" class="btn" data-close>Cerrar</button></div>`;
  dlg.showModal();
}
function viewContribs(name) {
  const items = getContributions(name);
  dlg.classList.remove('wide');
  dlgBody.innerHTML = `<div class="dlg-h"><h2 id="dlgTitle">Aportes de ${esc(name)}</h2><button type="button" class="icon-btn" data-close aria-label="Cerrar">${icon('x')}</button></div>
    <div class="dlg-b">
      ${items.length ? `<div class="list">${items.map(it => `<div class="card" style="padding:12px 14px;gap:6px"><div class="card-f"><span class="tag" style="--tag-c:var(--c-${ACCENT[it.sec]});--tag-l:var(--c-${ACCENT[it.sec]}-l)">${esc(CFG[it.sec].nav)}</span><span class="sp"></span><span class="meta">${fmtTs(it.creado)}</span></div><h3 style="font-size:15.5px">${esc(it.titulo)}</h3></div>`).join('')}</div>`
        : `<p class="hint">Todavía no hay aportes registrados con este nombre.</p>`}
    </div>
    <div class="dlg-f"><button type="button" class="btn" data-close>Cerrar</button></div>`;
  dlg.showModal();
}
function viewCredential() {
  const me = S.data.miembros.find(m => m.id === S.uid) || {};
  const codigo = me.codigo || memberCode(S.uid);
  const color = me.color || S.myColor || 'amber';
  dlg.classList.remove('wide');
  dlgBody.innerHTML = `<div class="dlg-h"><h2 id="dlgTitle">Mi credencial</h2><button type="button" class="icon-btn" data-close aria-label="Cerrar">${icon('x')}</button></div>
    <div class="dlg-b">
      <div class="cred-card" style="--card-c:var(--${color})">
        <div class="cred-top"><img src="icons/icon-192.png" alt="" width="22" height="22"><b>Bóveda del Nodo</b><span class="id-role" style="margin-left:auto">${esc(me.rol || 'Titular')}</span></div>
        ${avatarHtml(S.myName, color, 'cred-av')}
        <div class="cred-name">${esc(S.myName)}</div>
        <div class="cred-code">${esc(codigo)}</div>
        <div class="cred-bars">${barcodeSvg(codigo)}</div>
      </div>
      <p class="hint" style="margin-top:14px">Este código identifica tu tarjeta dentro del Nodo. Es personal: no la compartas fuera del grupo.</p>
    </div>
    <div class="dlg-f"><button type="button" class="btn" data-close>Cerrar</button></div>`;
  dlg.showModal();
}
function editProfile() {
  const me = S.data.miembros.find(m => m.id === S.uid) || {};
  const isLead = LEAD_ROLES.includes(me.rol);
  let chosenColor = me.color || S.myColor || 'amber';
  dlg.classList.remove('wide');
  const rolField = isLead
    ? `<div class="fld"><label>Rol</label><div class="key" style="font-family:var(--sans);letter-spacing:normal">${esc(me.rol)}</div><p class="hint">Tu rol de liderazgo lo asigna quien administra la Bóveda; no se cambia desde aquí.</p></div>`
    : `<div class="fld"><label for="pfRol">Rol</label><select id="pfRol" name="rol">${SELF_ROLES.map(r => `<option value="${esc(r)}"${me.rol === r ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select><p class="hint">Jefatura y Subjefatura no se autoasignan; los pone quien administra la Bóveda.</p></div>`;
  dlgBody.innerHTML = `<form id="frm" style="display:flex;flex-direction:column;min-height:0;max-height:inherit">
    <div class="dlg-h"><h2 id="dlgTitle">Editar mi tarjeta</h2><button type="button" class="icon-btn" data-close aria-label="Cerrar">${icon('x')}</button></div>
    <div class="dlg-b">
      <div class="fld"><label for="pfNombre">Nombre</label><input id="pfNombre" name="nombre" value="${esc(S.myName)}" required maxlength="40"></div>
      ${rolField}
      <div class="fld"><label for="pfArea">Área o materia principal <span class="opt">(opcional)</span></label><input id="pfArea" name="area" value="${esc(me.area || '')}" maxlength="60" placeholder="Redes, Bases de Datos..."></div>
      <div class="fld"><label for="pfBio">Bio corta <span class="opt">(opcional)</span></label><textarea id="pfBio" name="bio" rows="2" maxlength="140">${esc(me.bio || '')}</textarea></div>
      <div class="fld"><label for="pfContacto">Contacto <span class="opt">(opcional)</span></label><input id="pfContacto" name="contacto" value="${esc(me.contacto || '')}" placeholder="correo o WhatsApp"></div>
      <div class="fld"><label>Color de tarjeta</label><div class="swatches" id="pfSwatches">${PALETTE.map(c => `<button type="button" class="swatch" data-color="${c}" style="background:var(--${c})" aria-pressed="${chosenColor === c}" aria-label="${c}"></button>`).join('')}</div></div>
      <p class="err" id="frmErr" role="alert"></p>
    </div>
    <div class="dlg-f"><button type="button" class="btn ghost" data-close>Cancelar</button><button type="submit" class="btn primary" id="frmOk">Guardar</button></div>
  </form>`;
  $('#pfSwatches', dlgBody).addEventListener('click', e => {
    const b = e.target.closest('.swatch'); if (!b) return;
    chosenColor = b.dataset.color;
    $$('.swatch', dlgBody).forEach(s => s.setAttribute('aria-pressed', String(s === b)));
  });
  const frm = $('#frm', dlgBody), ok = $('#frmOk', dlgBody), er = $('#frmErr', dlgBody);
  frm.addEventListener('submit', async e => {
    e.preventDefault();
    er.textContent = ''; ok.disabled = true; ok.textContent = 'Guardando...';
    try {
      const nombre = $('#pfNombre', dlgBody).value.trim().slice(0, 40) || S.myName;
      // El rol de liderazgo nunca se toca desde este formulario; si la persona
      // ya es Jefatura/Subjefatura, se conserva tal cual esté en la base.
      const rolSel = $('#pfRol', dlgBody);
      const rol = isLead ? me.rol : (SELF_ROLES.includes(rolSel.value) ? rolSel.value : 'Titular');
      const area = $('#pfArea', dlgBody).value.trim().slice(0, 60);
      const bio = $('#pfBio', dlgBody).value.trim().slice(0, 140);
      const contacto = $('#pfContacto', dlgBody).value.trim().slice(0, 80);
      await update(ref(S.db, `miembros/${S.uid}`), {nombre, rol, area, bio, contacto, color: chosenColor, actualizado: Date.now(), creado: me.creado || Date.now(), codigo: me.codigo || memberCode(S.uid)});
      if (nombre !== S.myName) { S.myName = nombre; try { localStorage.setItem(NAME_KEY, nombre); } catch {} }
      S.myColor = chosenColor;
      updateWho();
      toast('Tarjeta guardada'); dlg.close();
    } catch (err) { er.textContent = errMsg(err); ok.disabled = false; ok.textContent = 'Guardar'; }
  });
  dlg.showModal();
  $('#pfNombre', dlgBody).focus();
}
function updateWho() {
  $('#whoName').textContent = S.myName;
  const av = $('#whoAv'); av.textContent = initials(S.myName); av.style.background = `var(--${S.myColor || 'amber'})`;
}

/* ================= diálogos ================= */
let dlgDown = false;
dlg.addEventListener('pointerdown', e => { dlgDown = e.target === dlg; });
dlg.addEventListener('click', e => { if ((e.target === dlg && dlgDown) || e.target.closest('[data-close]')) dlg.close(); });
cfm.addEventListener('click', e => { if (e.target === cfm || e.target.closest('[data-close]')) cfm.close(); });

function fieldHtml(f, v) {
  const id = 'f_' + f.n, val = v == null ? (f.def || '') : v, req = f.req ? ' required' : '';
  let ctl;
  if (f.t === 'select') {
    ctl = `<select id="${id}" name="${f.n}"${req}>${f.o.map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}"${String(ov) === String(val) ? ' selected' : ''}>${esc(ol)}</option>`; }).join('')}</select>`;
  } else if (f.t === 'textarea') {
    ctl = `<textarea id="${id}" name="${f.n}" rows="${f.rows || 3}"${req} class="${f.mono ? 'mono' : ''}" ${f.mono ? 'spellcheck="false"' : ''} placeholder="${esc(f.ph || '')}">${esc(val)}</textarea>`;
  } else if (f.t === 'file') {
    ctl = `<input id="${id}" name="${f.n}" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple required>`;
  } else {
    ctl = `<input id="${id}" name="${f.n}" type="${f.t === 'date' ? 'date' : 'text'}"${req} class="${f.mono ? 'mono' : ''}" value="${esc(val)}" autocomplete="off" placeholder="${esc(f.ph || '')}" ${f.n === 'url' ? 'inputmode="url" autocapitalize="off"' : ''} ${f.n === 'materia' ? 'list="dl-materias"' : ''} ${f.mono ? 'spellcheck="false"' : ''}>`;
  }
  return `<div class="fld"><label for="${id}">${esc(f.l)}${f.req ? '' : ' <span class="opt">(opcional)</span>'}</label>${ctl}${f.hint ? `<p class="hint">${esc(f.hint)}</p>` : ''}</div>`;
}
function openForm({title, sub, fields, values = {}, submit = 'Guardar', focus, onSubmit}) {
  const v = {...values}; if (Array.isArray(v.tags)) v.tags = v.tags.join(', ');
  dlg.classList.remove('wide');
  dlgBody.innerHTML = `<form id="frm" style="display:flex;flex-direction:column;min-height:0;max-height:inherit">
    <div class="dlg-h"><h2 id="dlgTitle">${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Cerrar">${icon('x')}</button></div>
    <div class="dlg-b">${sub ? `<p class="hint">${esc(sub)}</p>` : ''}${fields.map(f => fieldHtml(f, v[f.n])).join('')}<p class="err" id="frmErr" role="alert"></p></div>
    <div class="dlg-f"><button type="button" class="btn ghost" data-close>Cancelar</button><button type="submit" class="btn primary" id="frmOk">${esc(submit)}</button></div></form>`;
  const frm = $('#frm', dlgBody), ok = $('#frmOk', dlgBody), er = $('#frmErr', dlgBody);
  frm.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(frm), data = {};
    fields.forEach(f => { if (f.t !== 'file') data[f.n] = String(fd.get(f.n) || '').trim(); });
    er.textContent = ''; ok.disabled = true; ok.textContent = 'Guardando...';
    try { await onSubmit(data, {frm, progress: m => { ok.textContent = m; }}); dlg.close(); }
    catch (err) { er.textContent = errMsg(err); ok.disabled = false; ok.textContent = submit; }
  });
  dlg.showModal();
  const first = $('#f_' + (focus || fields[0].n), dlgBody); if (first) first.focus();
}
function confirmBox({title, msg, ok = 'Eliminar'}) {
  return new Promise(res => {
    cfmBody.innerHTML = `<div class="dlg-h"><h2 id="cfmTitle">${esc(title)}</h2></div><div class="dlg-b"><p>${esc(msg)}</p></div>
      <div class="dlg-f"><button type="button" class="btn ghost" data-close>Cancelar</button><button type="button" class="btn danger" id="cfmOk">${esc(ok)}</button></div>`;
    let done = false;
    $('#cfmOk', cfmBody).onclick = () => { done = true; cfm.close(); res(true); };
    cfm.addEventListener('close', () => { if (!done) res(false); }, {once: true});
    cfm.showModal();
  });
}

/* ================= datos (Realtime Database) ================= */
async function saveDoc(k, id, data) {
  const now = Date.now();
  if (id) await update(ref(S.db, `${k}/${id}`), {...data, actualizado: now, editor: S.myName});
  else await push(ref(S.db, k), {...data, autor: S.myName, creado: now, actualizado: now});
}
function startForm(k, it, o = {}) {
  const c = CFG[k];
  const values = it ? {...it, ...(o.values || {})} : {...(c.defaults ? c.defaults() : {}), ...(o.values || {})};
  openForm({
    title: o.title || (it ? 'Editar ' + c.noun : c.add), fields: c.fields, values, submit: o.submit || 'Guardar', focus: o.focus,
    onSubmit: async data => {
      const msg = c.check ? c.check(data) : ''; if (msg) throw {code: 'custom', message: msg};
      if ('url' in data) { const raw = data.url; data.url = normUrl(raw); if (raw && !data.url) throw {code: 'custom', message: 'El enlace no parece válido. Debe empezar con https://'}; }
      if ('tags' in data) data.tags = parseTags(data.tags);
      await saveDoc(k, it && it.id, data);
      toast(it ? 'Cambios guardados' : 'Guardado en la Bóveda');
    }
  });
}
async function removeItem(k, it) {
  const ok = await confirmBox({title: 'Eliminar ' + CFG[k].noun, msg: `«${label(it)}» se borrará para todo el Nodo. Esta acción no se puede deshacer.`});
  if (!ok) return;
  try {
    await remove(ref(S.db, `${k}/${it.id}`));
    if (k === 'evidencias' && it.path) { try { await deleteObject(sref(S.storage, it.path)); } catch {} }
    toast('Eliminado');
  } catch (e) { toast(errMsg(e)); }
}

/* ---- subida de evidencias ---- */
async function makeThumb(file, max = 480) {
  try {
    const bmp = await createImageBitmap(file);
    const w = bmp.width, h = bmp.height, r = Math.min(1, max / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(h * r);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    if (bmp.close) bmp.close();
    return {thumb: c.toDataURL('image/jpeg', 0.72), w, h};
  } catch { return {thumb: '', w: 0, h: 0}; }
}
function startUpload() {
  openForm({
    title: 'Subir evidencias',
    sub: 'Las fotos se guardan en resolución original. Puedes elegir varias a la vez.',
    fields: [
      {n: 'archivos', l: 'Fotos', t: 'file', req: 1},
      {n: 'titulo', l: 'Título', hint: 'Si subes varias, se numeran solas. Si lo dejas vacío se usa el nombre del archivo.'},
      {n: 'materia', l: 'Materia'},
      {n: 'tags', l: 'Etiquetas separadas por coma', ph: 'ER, pizarrón, parcial 2'},
      {n: 'nota', l: 'Nota', t: 'textarea', rows: 3}
    ],
    submit: 'Subir',
    onSubmit: async (data, {frm, progress}) => {
      const files = [...frm.querySelector('input[type=file]').files];
      if (!files.length) throw {code: 'custom', message: 'Elige al menos una imagen.'};
      let n = 0, ok = 0, firstErr = null;
      for (const file of files) {
        n++; progress(`Subiendo ${n} de ${files.length}...`);
        try {
          const t = await makeThumb(file);
          const path = `evidencias/${S.uid || 'anon'}/${Date.now()}-${uid4()}-${file.name.replace(/[^a-z0-9_.-]/gi, '_')}`;
          const fref = sref(S.storage, path);
          await uploadBytes(fref, file, {contentType: file.type || 'image/jpeg'});
          const url = await getDownloadURL(fref);
          const titulo = data.titulo ? (files.length > 1 ? `${data.titulo} ${n}` : data.titulo) : file.name.replace(/\.[^.]+$/, '');
          await push(ref(S.db, 'evidencias'), {titulo, materia: data.materia, tags: parseTags(data.tags), nota: data.nota, url, path, thumb: t.thumb, w: t.w, h: t.h, bytes: file.size, autor: S.myName, creado: Date.now(), actualizado: Date.now()});
          ok++;
        } catch (e) { if (!firstErr) firstErr = e; }
      }
      if (!ok) throw firstErr || {code: 'unknown'};
      toast(ok === files.length ? (ok > 1 ? `${ok} fotos guardadas` : 'Foto guardada') : `Se subieron ${ok} de ${files.length}. Revisa formato y tamaño del resto.`);
    }
  });
}
function openImg(it) {
  dlg.classList.add('wide');
  dlgBody.innerHTML = `<div class="lb"><div class="lb-img">${it.url ? `<img src="${esc(it.url)}" alt="${esc(it.titulo)}">` : ''}</div>
    <div class="lb-side"><div class="lb-h"><h2 id="dlgTitle">${esc(it.titulo)}</h2><button type="button" class="icon-btn" data-close aria-label="Cerrar">${icon('x')}</button></div>
    <div class="meta">${it.materia ? `<span>${esc(it.materia)}</span>` : ''}<span>${fmtTs(it.creado)}</span>${it.bytes ? `<span>${fmtBytes(it.bytes)}</span>` : ''}${it.w ? `<span>${it.w} × ${it.h} px</span>` : ''}</div>
    ${it.nota ? `<p class="prose">${esc(it.nota)}</p>` : ''}${tagsHtml(it.tags)}${byline(it)}
    <div class="lb-act">${it.url ? `<a class="btn primary" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${icon('ext')}Abrir original</a>` : ''}<button type="button" class="btn" data-dact="edit">${icon('pencil')}Editar</button><button type="button" class="btn" data-dact="del">${icon('trash')}Eliminar</button></div></div></div>`;
  dlgBody.onclick = e => {
    const b = e.target.closest('[data-dact]'); if (!b) return;
    dlg.close();
    if (b.dataset.dact === 'edit') startForm('evidencias', it); else removeItem('evidencias', it);
  };
  dlg.showModal();
}

/* ================= eventos ================= */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]'); if (t) { setTab(t.dataset.tab, true); return; }
  const w = e.target.closest('[data-act="who"]'); if (w) setTab('perfil', true);
});
$('#q').addEventListener('input', e => {
  if (S.tab === 'snippets' && S.lab.mode === 'so') { S.lab.so.q = e.target.value; soSearch(e.target.value); }
  else { S.q[S.tab] = e.target.value; renderView(); }
});
view.addEventListener('toggle', e => { const d = e.target; if (d.tagName === 'DETAILS' && d.dataset.id) { d.open ? S.open.add(d.dataset.id) : S.open.delete(d.dataset.id); } }, true);
view.addEventListener('change', e => { const s = e.target.closest('[data-sel]'); if (!s) return; S.f[S.tab][s.dataset.sel] = s.value; renderView(); });
view.addEventListener('submit', e => {
  const f = e.target.closest('#chatForm'); if (!f) return;
  e.preventDefault();
  const ta = $('#chatInput', f), text = ta.value.trim();
  if (!text || S.chatBusy) return;
  sendChat(text);
});
view.addEventListener('keydown', e => {
  const ta = e.target.closest('#chatInput');
  if (ta && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chatForm', view).requestSubmit(); }
});
view.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const {act, sec, id, f, key, val, name} = b.dataset, k = S.tab;
  const it = sec && id ? S.data[sec].find(x => x.id === id) : null;
  switch (act) {
    case 'add': k === 'evidencias' ? (EVIDENCE_UPLOADS_ENABLED ? startUpload() : toast('Subir fotos está deshabilitado temporalmente.')) : startForm(k); break;
    case 'help': startForm('snippets', null, {title: 'Pedir ayuda al Nodo', submit: 'Publicar pregunta', values: {estado: 'abierto'}, focus: 'titulo'}); break;
    case 'solve': if (it) startForm('snippets', it, {title: 'Aportar solución', submit: 'Guardar solución', values: {estado: 'resuelto'}, focus: 'solucion'}); break;
    case 'edit': if (it) startForm(sec, it); break;
    case 'del': if (it) removeItem(sec, it); break;
    case 'copy': if (it && it[f]) copyText(it[f], {clave: 'Clave copiada', url: 'Enlace copiado', codigo: 'Comando copiado'}[f]); break;
    case 'reveal': S.rev.has(id) ? S.rev.delete(id) : S.rev.add(id); renderView(); break;
    case 'constancia': if (it) copyText(constancia(it), 'Constancia copiada'); break;
    case 'open-img': if (it) openImg(it); break;
    case 'chip': S.f[k][key] = val; renderView(); break;
    case 'toggle': S.f[k][key] = !S.f[k][key]; renderView(); break;
    case 'clear': { const f0 = S.f[k]; Object.keys(f0).forEach(x => { f0[x] = typeof f0[x] === 'boolean' ? false : ''; }); S.q[k] = ''; syncSearchBar(); renderView(); break; }
    case 'labmode': S.lab.mode = val; syncSearchBar(); renderView(); break;
    case 'editprofile': editProfile(); break;
    case 'credencial': viewCredential(); break;
    case 'contribs': if (name) viewContribs(name); break;
    case 'viewcard': { const m = S.data.miembros.find(x => x.id === id); if (m) viewPublicCard(m); break; }
    case 'reload': location.reload(); break;
    case 'signout': signOutOfVault(); break;
    case 'install': triggerInstall(); break;
  }
});

function refreshMaterias() {
  const m = distinct(KEYS.flatMap(k => S.data[k].map(x => x.materia)));
  $('#dl-materias').innerHTML = m.map(x => `<option value="${esc(x)}"></option>`).join('');
}

/* ================= candado de acceso ================= */
const GATE_KEY = 'boveda:pasada', NAME_KEY = 'boveda:nombre';
function showApp() {
  $('#gate').hidden = true;
  $('#app').hidden = false;
  $('#tabbar').hidden = false;
  const dot = $('#whoDot'); dot.classList.toggle('off', !navigator.onLine);
  updateWho();
}
async function tryGateSubmit(code) {
  const h = await sha256Hex(code.trim());
  return h === ACCESS_CODE_HASH;
}
$('#gateForm').addEventListener('submit', async e => {
  e.preventDefault();
  const code = $('#gateCode').value, err = $('#gateErr'), btn = e.target.querySelector('button');
  err.textContent = ''; btn.disabled = true;
  const ok = await tryGateSubmit(code);
  btn.disabled = false;
  if (!ok) { err.textContent = 'Código incorrecto. Pide el código vigente a Jefatura.'; $('#gateCode').select(); return; }
  try { localStorage.setItem(GATE_KEY, '1'); } catch {}
  let name = ''; try { name = localStorage.getItem(NAME_KEY) || ''; } catch {}
  if (name) { S.myName = name; startVault(); }
  else { $('#gateForm').hidden = true; $('#gateName').hidden = false; $('#gateNameInput').focus(); }
});
$('#gateNameForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#gateNameInput').value.trim().slice(0, 40) || 'Del Nodo';
  const rol = SELF_ROLES.includes($('#gateRolInput').value) ? $('#gateRolInput').value : 'Titular';
  try { localStorage.setItem(NAME_KEY, name); } catch {}
  S.myName = name; S.myRole = rol;
  startVault();
});
function signOutOfVault() {
  try { localStorage.removeItem(GATE_KEY); } catch {}
  location.reload();
}
async function checkGateOnLoad() {
  let passed = false, name = '';
  try { passed = localStorage.getItem(GATE_KEY) === '1'; name = localStorage.getItem(NAME_KEY) || ''; } catch {}
  try { const saved = JSON.parse(localStorage.getItem('boveda:chat') || '[]'); if (Array.isArray(saved)) S.chat = saved; } catch {}
  $('#gate').hidden = false;
  if (passed && name) { S.myName = name; startVault(); }
  else if (passed) { $('#gateForm').hidden = true; $('#gateName').hidden = false; }
}

/* ================= arranque de Firebase ================= */
let started = false;
async function startVault() {
  if (started) { showApp(); return; }
  started = true;
  showApp();
  buildNav();
  let start = 'accesos'; try { const t = localStorage.getItem('boveda:tab'); if (NAVORDER.includes(t)) start = t; } catch {}
  setTab(start);
  S.status = 'connecting'; renderView();

  const notConfigured = !firebaseConfig || firebaseConfig.apiKey === 'PEGA_AQUI_TU_API_KEY' ||
    !firebaseConfig.databaseURL || /PEGA_AQUI/.test(firebaseConfig.databaseURL);
  if (notConfigured) {
    S.status = 'off'; renderView();
    toast('Falta completar js/config.js (apiKey y/o databaseURL)');
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    S.db = getDatabase(app);
    S.auth = getAuth(app);
    S.storage = getStorage(app);
    try { S.functions = getFunctions(app, AI_REGION || 'us-central1'); } catch { S.functions = null; }
    // Nota: Realtime Database no tiene un equivalente directo a la caché en
    // disco de Firestore (enableIndexedDbPersistence). Mantiene los datos en
    // memoria mientras la pestaña está abierta y reintenta solo al reconectar;
    // ver "Fuera de línea" en el README para el detalle de qué cambia con esto.

    await new Promise((resolve, reject) => {
      onAuthStateChanged(S.auth, user => { if (user) { S.uid = user.uid; resolve(); } }, reject);
      signInAnonymously(S.auth).catch(reject);
    });

    S.status = 'ready';
    subscribe();
    renderView();
  } catch (e) {
    S.status = 'off'; renderView();
    toast(errMsg(e));
  }
}
function subscribe() {
  KEYS.forEach(k => {
    try {
      const qy = query(ref(S.db, k), orderByChild('creado'), limitToLast(500));
      const un = onValue(qy, snap => {
        const val = snap.val() || {};
        const arr = Object.entries(val).map(([id, d]) => ({...d, id}));
        arr.sort((a, b) => (b.creado || 0) - (a.creado || 0));
        S.data[k] = arr;
        S.loaded[k] = true; delete S.err[k]; schedule();
      }, err => { S.err[k] = err; S.loaded[k] = true; schedule(); });
      S.unsub.push(un);
    } catch (e) { S.err[k] = e; S.loaded[k] = true; }
  });
  try {
    const un = onValue(ref(S.db, 'miembros'), snap => {
      const val = snap.val() || {};
      S.data.miembros = Object.entries(val).map(([id, d]) => ({...d, id}));
      S.loaded.miembros = true;
      const mine = S.data.miembros.find(m => m.id === S.uid);
      if (mine) { S.myColor = mine.color || 'amber'; updateWho(); }
      else if (S.uid) {
        update(ref(S.db, `miembros/${S.uid}`), {
          nombre: S.myName, rol: S.myRole || 'Titular', color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          bio: '', contacto: '', area: '', codigo: memberCode(S.uid), creado: Date.now(), actualizado: Date.now()
        }).catch(() => {});
      }
      schedule();
    }, err => { S.err.miembros = err; S.loaded.miembros = true; schedule(); });
    S.unsub.push(un);
  } catch (e) { S.err.miembros = e; S.loaded.miembros = true; }
}

window.addEventListener('online', () => { const d = $('#whoDot'); if (d) d.classList.remove('off'); renderView(); });
window.addEventListener('offline', () => { const d = $('#whoDot'); if (d) d.classList.add('off'); renderView(); });

/* ================= instalación (A2HS) ================= */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  const b = $('#installRail'); if (b) b.hidden = false;
});
window.addEventListener('appinstalled', () => { deferredPrompt = null; const b = $('#installRail'); if (b) b.hidden = true; });
async function triggerInstall() {
  if (!deferredPrompt) { toast('En iPhone: botón Compartir → Añadir a pantalla de inicio.'); return; }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  const b = $('#installRail'); if (b) b.hidden = true;
}

/* ================= registro del service worker ================= */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

checkGateOnLoad();
