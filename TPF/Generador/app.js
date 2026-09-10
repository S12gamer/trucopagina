/**
 * app.js
 * ─────────────────────────────────────────────────────────
 * Lógica completa del Generador de Reportes (antes inline en el HTML).
 * Depende de las librerías globales cargadas por <script> en index.html:
 * Quill, saveAs (FileSaver), PizZip, JSZip.
 *
 * El módulo de IA (ai-module.js, btn_ai_generate, resetearApiKey) fue
 * removido de esta migración.
 * ─────────────────────────────────────────────────────────
 */

import { initPWA, offerInstall } from './pwa.js';

(function(){

"use strict";

/* =========================================================================
   CONSTANTES DE MAQUETACIÓN
   ========================================================================= */
const EMU_PER_PX = 9525;          
const TWIPS_PER_PX = 15;          
const HALFPT_TO_PX = (hp) => (hp / 2) * (96 / 72); 
const PT_TO_PX = (pt) => pt * (96 / 72);

const DEFAULT_PAGE_W_PX = 794;    
const DEFAULT_PAGE_H_PX = 1123;   
const DEFAULT_MARGIN_PX = 96;     
const PAGE_GAP = 28;              

/* =========================================================================
   ESTADO GLOBAL
   ========================================================================= */
let state = {
  zip: null,
  mediaCache: {},      
  activeMediaCache: null, 
  relsMap: {},          
  styles: {},            
  docDefaults: {},       
  numbering: {},         
  abstractNum: {},       
  numCounters: {},       
  page: { w: DEFAULT_PAGE_W_PX, h: DEFAULT_PAGE_H_PX, mL: DEFAULT_MARGIN_PX, mR: DEFAULT_MARGIN_PX, mT: DEFAULT_MARGIN_PX, mB: DEFAULT_MARGIN_PX, headerDistPx: 48, footerDistPx: 48, titlePg: false },
  blocks: [],            
  pages: [],             
  headerRefs: {},         
  footerRefs: {},         
  headers: {},             
  footers: {},             
  headerLayout: {},        
  footerLayout: {},        
  zoom: 1,
  images: {}             
};

const canvas = document.getElementById('dv_renderCanvas');
const ctx = canvas.getContext('2d');
const viewport = document.getElementById('dv_viewport');
const canvasHost = document.getElementById('dv_canvasHost');
const emptyState = document.getElementById('dv_emptyState');
const statusText = document.getElementById('dv_statusText');
const fileNameLabel = document.getElementById('dv_fileNameLabel');
const pageIndicator = document.getElementById('dv_pageIndicator');
const zoomLabel = document.getElementById('dv_zoomLabel');

function setStatus(msg, kind){
  statusText.textContent = msg || '';
  statusText.className = kind ? kind : '';
}

/* =========================================================================
   CARGA DE ARCHIVO (adaptado: recibe un Blob ya generado en memoria,
   en vez de un <input type=file>, para alimentar la vista previa en vivo)
   ========================================================================= */
async function handleFile(blobOrFile, displayName){
  try{
    fileNameLabel.textContent = displayName || (blobOrFile && blobOrFile.name) || 'vista_previa.docx';
    setStatus('Procesando plantilla… ', 'ok');
    emptyState.classList.add('dv-hidden');
    canvas.classList.remove('dv-hidden');

    const arrayBuffer = await blobOrFile.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    state.zip = zip;
    state.mediaCache = {};
    state.activeMediaCache = null;
    state.relsMap = {};
    state.styles = {};
    state.numbering = {};
    state.abstractNum = {};
    state.numCounters = {};
    state.blocks = [];
    state.pages = [];
    state.headerRefs = {};
    state.footerRefs = {};
    state.headers = {};
    state.footers = {};
    state.headerLayout = {};
    state.footerLayout = {};

    setStatus('Leyendo relaciones (rels)…', 'ok');
    await loadRelationships(zip);

    setStatus('Extrayendo imágenes multimedia…', 'ok');
    await loadMedia(zip);

    setStatus('Procesando estilos (styles.xml)…', 'ok');
    await loadStyles(zip);

    setStatus('Procesando listas (numbering.xml)…', 'ok');
    await loadNumbering(zip);

    setStatus('Procesando document.xml…', 'ok');
    await loadDocument(zip);

    setStatus('Procesando encabezados y pies de página…', 'ok');
    await loadHeadersFooters(zip);

    setStatus('Calculando maquetación (layout engine)…', 'ok');
    await computeLayout();
    await layoutHeadersFooters();

    setStatus('Renderizando en Canvas…', 'ok');
    await renderAllPages();

    setStatus(`Listo — ${state.pages.length} página(s)`, 'ok');
  }catch(err){
    console.error(err);
    setStatus('Error al procesar el documento: ' + err.message, 'error');
  }
}

/* =========================================================================
   UTILIDADES XML
   ========================================================================= */
const parser = new DOMParser();

function parseXML(text){
  return parser.parseFromString(text, 'application/xml');
}

function children(el, localName){
  if (!el) return [];
  const out = [];
  for (const c of el.children){
    if (c.localName === localName) out.push(c);
  }
  return out;
}
function child(el, localName){
  if (!el) return null;
  for (const c of el.children){
    if (c.localName === localName) return c;
  }
  return null;
}
function attr(el, name){
  if (!el) return null;
  return el.getAttribute(name) || el.getAttribute('w:' + name) || el.getAttributeNS(null, name);
}
function findAll(el, localName){
  if (!el) return [];
  return Array.from(el.getElementsByTagName('*')).filter(n => n.localName === localName);
}

/* =========================================================================
   1) RELACIONES (document.xml.rels)
   ========================================================================= */
async function loadRelationships(zip){
  const relsFile = zip.file('word/_rels/document.xml.rels');
  if (!relsFile) return;
  const text = await relsFile.async('string');
  const xml = parseXML(text);
  const rels = xml.getElementsByTagName('Relationship');
  for (const rel of rels){
    const id = rel.getAttribute('Id');
    const target = rel.getAttribute('Target');
    state.relsMap[id] = target;
  }
}

/* =========================================================================
   2) MEDIA (imágenes -> DataURL base64)
   ========================================================================= */
const MIME_BY_EXT = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', bmp: 'image/bmp', svg: 'image/svg+xml',
  emf: 'image/x-emf', wmf: 'image/x-wmf', tif: 'image/tiff', tiff: 'image/tiff'
};

async function buildMediaCache(zip, relsMap){
  const cache = {};
  for (const rId in relsMap){
    const target = relsMap[rId];
    if (!target || !/media\//.test(target)) continue;
    let path = target.replace(/^\.?\/?/, '');
    if (!path.startsWith('word/')) path = 'word/' + path;
    const f = zip.file(path);
    if (!f) continue;
    const ext = (path.split('.').pop() || '').toLowerCase();
    const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
    if (mime === 'image/x-emf' || mime === 'image/x-wmf') continue;
    try{
      const base64 = await f.async('base64');
      cache[rId] = `data:${mime};base64,${base64}`;
    }catch(e){ }
  }
  return cache;
}

async function loadMedia(zip){
  state.mediaCache = await buildMediaCache(zip, state.relsMap);
  state.activeMediaCache = state.mediaCache;
}

function preloadImage(dataUrl){
  return new Promise((resolve) => {
    if (state.images[dataUrl]) { resolve(state.images[dataUrl]); return; }
    const img = new Image();
    img.onload = () => { state.images[dataUrl] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

/* =========================================================================
   3) ESTILOS (styles.xml)
   ========================================================================= */
function parseRunProps(rPrEl){
  if (!rPrEl) return {};
  const p = {};
  const b = child(rPrEl, 'b');
  if (b) p.bold = attr(b,'val') !== 'false' && attr(b,'val') !== '0';
  const i = child(rPrEl, 'i');
  if (i) p.italic = attr(i,'val') !== 'false' && attr(i,'val') !== '0';
  const u = child(rPrEl, 'u');
  if (u && attr(u,'val') && attr(u,'val') !== 'none') p.underline = true;
  const strike = child(rPrEl, 'strike');
  if (strike) p.strike = attr(strike,'val') !== 'false';
  const color = child(rPrEl, 'color');
  if (color){
    const v = attr(color,'val');
    if (v && v !== 'auto') p.color = '#' + v;
  }
  const sz = child(rPrEl, 'sz');
  if (sz) p.sizePx = HALFPT_TO_PX(parseFloat(attr(sz,'val')) || 24);
  const fonts = child(rPrEl, 'rFonts');
  if (fonts){
    const f = attr(fonts,'ascii') || attr(fonts,'hAnsi') || attr(fonts,'cs');
    if (f) p.font = f;
  }
  const highlight = child(rPrEl, 'highlight');
  if (highlight){
    const v = attr(highlight,'val');
    if (v && v !== 'none') p.highlight = v;
  }
  const vertAlign = child(rPrEl, 'vertAlign');
  if (vertAlign) p.vertAlign = attr(vertAlign,'val');
  return p;
}

function parseParaProps(pPrEl){
  if (!pPrEl) return {};
  const p = {};
  const jc = child(pPrEl, 'jc');
  if (jc) p.align = attr(jc,'val'); 
  const ind = child(pPrEl, 'ind');
  if (ind){
    p.indent = {};
    const left = attr(ind,'left') || attr(ind,'start');
    const right = attr(ind,'right') || attr(ind,'end');
    const first = attr(ind,'firstLine');
    const hang = attr(ind,'hanging');
    if (left) p.indent.left = parseFloat(left) / TWIPS_PER_PX;
    if (right) p.indent.right = parseFloat(right) / TWIPS_PER_PX;
    if (first) p.indent.firstLine = parseFloat(first) / TWIPS_PER_PX;
    if (hang) p.indent.hanging = -parseFloat(hang) / TWIPS_PER_PX;
  }
  const spacing = child(pPrEl, 'spacing');
  if (spacing){
    p.spacing = {};
    const before = attr(spacing,'before');
    const after = attr(spacing,'after');
    const line = attr(spacing,'line');
    if (before) p.spacing.before = parseFloat(before) / TWIPS_PER_PX;
    if (after) p.spacing.after = parseFloat(after) / TWIPS_PER_PX;
    if (line) p.spacing.line = parseFloat(line) / 240;
  }
  const pStyle = child(pPrEl, 'pStyle');
  if (pStyle) p.styleId = attr(pStyle,'val');
  const numPr = child(pPrEl, 'numPr');
  if (numPr){
    const ilvl = child(numPr,'ilvl');
    const numId = child(numPr,'numId');
    p.numPr = {
      ilvl: ilvl ? parseInt(attr(ilvl,'val')||'0',10) : 0,
      numId: numId ? attr(numId,'val') : null
    };
  }
  const pageBreakBefore = child(pPrEl, 'pageBreakBefore');
  if (pageBreakBefore) p.pageBreakBefore = true;
  const keepNext = child(pPrEl, 'keepNext');
  if (keepNext) p.keepNext = true;
  return p;
}

async function loadStyles(zip){
  const f = zip.file('word/styles.xml');
  if (!f){
    state.docDefaults = { run: { font: 'Calibri', sizePx: HALFPT_TO_PX(22), color:'#000000' }, para: {} };
    return;
  }
  const text = await f.async('string');
  const xml = parseXML(text);
  const root = xml.documentElement;

  const docDefaultsEl = child(root, 'docDefaults');
  let defaultRun = { font: 'Calibri', sizePx: HALFPT_TO_PX(22), color: '#000000' };
  let defaultPara = {};
  if (docDefaultsEl){
    const rpd = child(docDefaultsEl, 'rPrDefault');
    if (rpd) Object.assign(defaultRun, parseRunProps(child(rpd,'rPr')));
    const ppd = child(docDefaultsEl, 'pPrDefault');
    if (ppd) Object.assign(defaultPara, parseParaProps(child(ppd,'pPr')));
  }
  state.docDefaults = { run: defaultRun, para: defaultPara };

  const styleEls = children(root, 'style');
  const rawStyles = {};
  for (const s of styleEls){
    const id = attr(s,'styleId');
    const type = attr(s,'type');
    const nameEl = child(s,'name');
    const basedOnEl = child(s,'basedOn');
    rawStyles[id] = {
      id, type,
      name: nameEl ? attr(nameEl,'val') : id,
      basedOn: basedOnEl ? attr(basedOnEl,'val') : null,
      run: parseRunProps(child(s,'rPr')),
      para: parseParaProps(child(s,'pPr')),
      isDefault: attr(s,'default') === '1'
    };
  }

  const resolved = {};
  function resolveStyle(id, seen){
    if (!id || !rawStyles[id]) return { run:{}, para:{} };
    if (resolved[id]) return resolved[id];
    seen = seen || new Set();
    if (seen.has(id)) return { run:{}, para:{} };
    seen.add(id);
    const raw = rawStyles[id];
    const parent = raw.basedOn ? resolveStyle(raw.basedOn, seen) : { run:{}, para:{} };
    const merged = {
      run: Object.assign({}, parent.run, raw.run),
      para: Object.assign({}, parent.para, raw.para, {
        indent: Object.assign({}, parent.para.indent, raw.para.indent),
        spacing: Object.assign({}, parent.para.spacing, raw.para.spacing)
      })
    };
    resolved[id] = merged;
    return merged;
  }
  for (const id in rawStyles) resolveStyle(id);
  state.styles = resolved;
  state.rawStylesMeta = rawStyles;
}

function getEffectiveStyleForParagraph(styleId){
  if (styleId && state.styles[styleId]) return state.styles[styleId];
  return { run:{}, para:{} };
}

/* =========================================================================
   4) NUMBERING (listas) numbering.xml
   ========================================================================= */
async function loadNumbering(zip){
  const f = zip.file('word/numbering.xml');
  if (!f) return;
  const text = await f.async('string');
  const xml = parseXML(text);
  const root = xml.documentElement;

  const abstractNums = children(root, 'abstractNum');
  for (const an of abstractNums){
    const id = attr(an, 'abstractNumId');
    const levels = {};
    for (const lvl of children(an, 'lvl')){
      const ilvl = parseInt(attr(lvl,'ilvl') || '0', 10);
      const numFmtEl = child(lvl,'numFmt');
      const lvlTextEl = child(lvl,'lvlText');
      const startEl = child(lvl,'start');
      const indEl = child(lvl, 'pPr') ? child(child(lvl,'pPr'),'ind') : null;
      levels[ilvl] = {
        numFmt: numFmtEl ? attr(numFmtEl,'val') : 'decimal',
        lvlText: lvlTextEl ? attr(lvlTextEl,'val') : '%1.',
        start: startEl ? parseInt(attr(startEl,'val')||'1',10) : 1,
        indentLeft: indEl && attr(indEl,'left') ? parseFloat(attr(indEl,'left'))/TWIPS_PER_PX : (18 + ilvl*24)
      };
    }
    state.abstractNum[id] = { levels };
  }
  const nums = children(root, 'num');
  for (const n of nums){
    const numId = attr(n, 'numId');
    const abstractIdEl = child(n, 'abstractNumId');
    state.numbering[numId] = { abstractId: abstractIdEl ? attr(abstractIdEl,'val') : null };
  }
}

function getListLevelInfo(numId, ilvl){
  const numDef = state.numbering[numId];
  if (!numDef) return null;
  const abs = state.abstractNum[numDef.abstractId];
  if (!abs) return null;
  return abs.levels[ilvl] || abs.levels[0] || null;
}

function nextListLabel(numId, ilvl, numFmt, lvlText){
  if (!state.numCounters[numId]) state.numCounters[numId] = {};
  const counters = state.numCounters[numId];
  if (counters[ilvl] === undefined){
    const info = getListLevelInfo(numId, ilvl);
    counters[ilvl] = (info && info.start) ? info.start : 1;
  } else {
    counters[ilvl]++;
  }
  for (const k in counters){
    if (parseInt(k,10) > ilvl) delete counters[k];
  }
  const n = counters[ilvl];
  if (numFmt === 'bullet'){
    return lvlText || '•';
  }
  let label = toFormattedNumber(n, numFmt);
  if (lvlText){
    label = lvlText.replace(/%\d/g, label);
  }
  return label;
}

function toFormattedNumber(n, fmt){
  switch(fmt){
    case 'decimal': return String(n);
    case 'lowerLetter': return numberToLetters(n).toLowerCase();
    case 'upperLetter': return numberToLetters(n).toUpperCase();
    case 'lowerRoman': return toRoman(n).toLowerCase();
    case 'upperRoman': return toRoman(n).toUpperCase();
    default: return String(n);
  }
}
function numberToLetters(n){
  let s = '';
  while (n > 0){
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
function toRoman(n){
  const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
    [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let out = '';
  for (const [val, sym] of map){
    while (n >= val){ out += sym; n -= val; }
  }
  return out;
}

/* =========================================================================
   5) DOCUMENT.XML  -> árbol de bloques (párrafos / tablas)
   ========================================================================= */
async function loadDocument(zip){
  const f = zip.file('word/document.xml');
  if (!f) throw new Error('word/document.xml no encontrado — el archivo no es un .docx válido.');
  const text = await f.async('string');
  const xml = parseXML(text);
  const root = xml.documentElement;
  const body = child(root, 'body');
  if (!body) throw new Error('No se encontró <w:body> en el documento.');

  const sectPr = child(body, 'sectPr');
  if (sectPr){
    const pgSz = child(sectPr, 'pgSz');
    const pgMar = child(sectPr, 'pgMar');
    if (pgSz){
      const w = attr(pgSz,'w'), h = attr(pgSz,'h');
      if (w) state.page.w = Math.round(parseFloat(w) / TWIPS_PER_PX);
      if (h) state.page.h = Math.round(parseFloat(h) / TWIPS_PER_PX);
    }
    if (pgMar){
      const mL = attr(pgMar,'left'), mR = attr(pgMar,'right'),
            mT = attr(pgMar,'top'), mB = attr(pgMar,'bottom');
      if (mL) state.page.mL = parseFloat(mL) / TWIPS_PER_PX;
      if (mR) state.page.mR = parseFloat(mR) / TWIPS_PER_PX;
      if (mT) state.page.mT = parseFloat(mT) / TWIPS_PER_PX;
      if (mB) state.page.mB = parseFloat(mB) / TWIPS_PER_PX;
      const headerD = attr(pgMar,'header');
      const footerD = attr(pgMar,'footer');
      if (headerD) state.page.headerDistPx = parseFloat(headerD) / TWIPS_PER_PX - 5;
      if (footerD) state.page.footerDistPx = parseFloat(footerD) / TWIPS_PER_PX;
    }
    state.page.titlePg = !!child(sectPr, 'titlePg');

    for (const hRef of children(sectPr, 'headerReference')){
      const type = attr(hRef, 'type') || 'default';
      const rId = hRef.getAttribute('r:id') || hRef.getAttribute('id');
      if (rId) state.headerRefs[type] = rId;
    }
    for (const fRef of children(sectPr, 'footerReference')){
      const type = attr(fRef, 'type') || 'default';
      const rId = fRef.getAttribute('r:id') || fRef.getAttribute('id');
      if (rId) state.footerRefs[type] = rId;
    }
  }

  state.blocks = parseBodyChildren(body);
}

async function loadHeadersFooters(zip){
  for (const type in state.headerRefs){
    const rId = state.headerRefs[type];
    const target = state.relsMap[rId];
    if (!target) continue;
    let path = target.replace(/^\.?\/?/, '');
    if (!path.startsWith('word/')) path = 'word/' + path;
    const blocks = await parseHeaderFooterPart(zip, path);
    if (blocks) state.headers[type] = blocks;
  }
  for (const type in state.footerRefs){
    const rId = state.footerRefs[type];
    const target = state.relsMap[rId];
    if (!target) continue;
    let path = target.replace(/^\.?\/?/, '');
    if (!path.startsWith('word/')) path = 'word/' + path;
    const blocks = await parseHeaderFooterPart(zip, path);
    if (blocks) state.footers[type] = blocks;
  }
}

async function parseHeaderFooterPart(zip, path){
  const f = zip.file(path);
  if (!f) return null;
  const text = await f.async('string');
  const xml = parseXML(text);
  const root = xml.documentElement; 
  if (!root) return null;

  const dirEnd = path.lastIndexOf('/');
  const dir = dirEnd >= 0 ? path.slice(0, dirEnd + 1) : '';
  const fileName = dirEnd >= 0 ? path.slice(dirEnd + 1) : path;
  const relsPath = `${dir}_rels/${fileName}.rels`;
  const relsFile = zip.file(relsPath);
  let localRels = {};
  if (relsFile){
    const relsText = await relsFile.async('string');
    const relsXml = parseXML(relsText);
    for (const rel of relsXml.getElementsByTagName('Relationship')){
      localRels[rel.getAttribute('Id')] = rel.getAttribute('Target');
    }
  }
  const localMediaCache = await buildMediaCache(zip, localRels);

  const previousCache = state.activeMediaCache;
  state.activeMediaCache = localMediaCache;
  const blocks = parseBodyChildren(root);
  state.activeMediaCache = previousCache;

  return blocks;
}

function parseBodyChildren(container){
  const blocks = [];
  for (const el of container.children){
    if (el.localName === 'p'){
      blocks.push(parseParagraph(el));
    } else if (el.localName === 'tbl'){
      blocks.push(parseTable(el));
    }
  }
  return blocks;
}

function parseParagraph(pEl){
  const pPr = child(pEl, 'pPr');
  const directPara = parseParaProps(pPr);
  const styleId = directPara.styleId;
  const styleDef = getEffectiveStyleForParagraph(styleId);

  const effectivePara = Object.assign({}, state.docDefaults.para, styleDef.para, directPara, {
    indent: Object.assign({}, state.docDefaults.para.indent, styleDef.para.indent, directPara.indent),
    spacing: Object.assign({}, state.docDefaults.para.spacing, styleDef.para.spacing, directPara.spacing)
  });

  const runs = [];
  for (const child_ of pEl.children){
    if (child_.localName === 'r'){
      runs.push(...parseRun(child_, styleDef.run));
    } else if (child_.localName === 'hyperlink'){
      for (const r of children(child_, 'r')){
        runs.push(...parseRun(r, styleDef.run));
      }
    } else if (child_.localName === 'fldSimple'){
      for (const r of children(child_, 'r')){
        runs.push(...parseRun(r, styleDef.run));
      }
    }
  }

  return {
    type: 'paragraph',
    para: effectivePara,
    runs,
    isEmpty: runs.length === 0
  };
}

function parseRun(rEl, baseStyleRun){
  const rPr = child(rEl, 'rPr');
  const directRun = parseRunProps(rPr);
  const effectiveRun = Object.assign({}, state.docDefaults.run, baseStyleRun, directRun);

  const items = [];
  for (const node of rEl.children){
    switch(node.localName){
      case 't': {
        const text = node.textContent || '';
        items.push({ kind:'text', text, style: effectiveRun });
        break;
      }
      case 'tab': {
        items.push({ kind:'tab', style: effectiveRun });
        break;
      }
      case 'br': {
        const brType = attr(node,'type');
        items.push({ kind: brType === 'page' ? 'pageBreak' : 'lineBreak', style: effectiveRun });
        break;
      }
      case 'drawing': {
        const img = extractDrawingImage(node);
        if (img){
          items.push({ kind: img.isFloating ? 'floatingImage' : 'image', image: img, style: effectiveRun });
        }
        break;
      }
      case 'pict': {
        const img = extractDrawingImage(node);
        if (img) items.push({ kind: img.isFloating ? 'floatingImage' : 'image', image: img, style: effectiveRun });
        break;
      }
      default: break;
    }
  }
  return items;
}

function parsePosition(posEl){
  if (!posEl) return { relativeFrom: 'column', offset: 0, align: null };
  const relativeFrom = posEl.getAttribute('relativeFrom') || 'column';
  let offset = 0;
  const offsetEl = child(posEl, 'posOffset');
  if (offsetEl){
    const emu = parseFloat(offsetEl.textContent);
    if (!isNaN(emu)) offset = emu / EMU_PER_PX;
  }
  let align = null;
  const alignEl = child(posEl, 'align');
  if (alignEl) align = (alignEl.textContent || '').trim();
  return { relativeFrom, offset, align };
}

function extractDrawingImage(drawingEl){
  const anchorEl = child(drawingEl, 'anchor');
  const inlineEl = child(drawingEl, 'inline');
  const containerEl = anchorEl || inlineEl;
  if (!containerEl) return null;

  const blips = findAll(drawingEl, 'blip');
  if (blips.length === 0) return null;
  const blip = blips[0];
  const rEmbed = blip.getAttribute('r:embed') || blip.getAttribute('embed');
  if (!rEmbed) return null;
  const activeCache = state.activeMediaCache || state.mediaCache;
  const dataUrl = activeCache[rEmbed];
  if (!dataUrl) return null;

  let widthPx = 200, heightPx = 150;
  const extEl = child(containerEl, 'extent');
  if (extEl){
    const cx = parseFloat(extEl.getAttribute('cx'));
    const cy = parseFloat(extEl.getAttribute('cy'));
    if (cx && cy){
      widthPx = cx / EMU_PER_PX;
      heightPx = cy / EMU_PER_PX;
    }
  }

  let opacity = 1;
  const alphaModEls = findAll(drawingEl, 'alphaModFix');
  if (alphaModEls.length){
    const amt = alphaModEls[0].getAttribute('amt');
    if (amt !== null) opacity = Math.max(0, Math.min(1, parseFloat(amt) / 100000));
  } else {
    const alphaEls = findAll(drawingEl, 'alpha');
    if (alphaEls.length){
      const amt = alphaEls[0].getAttribute('val') || alphaEls[0].getAttribute('amt');
      if (amt !== null) opacity = Math.max(0, Math.min(1, parseFloat(amt) / 100000));
    }
  }

  let rotation = 0;
  const xfrmEls = findAll(drawingEl, 'xfrm');
  if (xfrmEls.length){
    const rot = xfrmEls[0].getAttribute('rot');
    if (rot) rotation = (parseFloat(rot) / 60000) * Math.PI / 180;
  }

  const result = { dataUrl, widthPx, heightPx, opacity, rotation, isFloating: false };

  if (anchorEl){
    result.isFloating = true;
    result.behindDoc = anchorEl.getAttribute('behindDoc') === '1';
    result.relativeHeight = parseInt(anchorEl.getAttribute('relativeHeight') || '0', 10);
    const posH = child(anchorEl, 'positionH');
    const posV = child(anchorEl, 'positionV');
    result.posH = parsePosition(posH);
    result.posV = parsePosition(posV);
  }

  return result;
}

function parseTable(tblEl){
  const tblGrid = child(tblEl, 'tblGrid');
  const colWidths = [];
  if (tblGrid){
    for (const gridCol of children(tblGrid, 'gridCol')){
      const w = attr(gridCol, 'w');
      colWidths.push(w ? parseFloat(w) / TWIPS_PER_PX : 100);
    }
  }
  const rows = [];
  for (const tr of children(tblEl, 'tr')){
    const cells = [];
    for (const tc of children(tr, 'tc')){
      const tcPr = child(tc, 'tcPr');
      let gridSpan = 1;
      if (tcPr){
        const gs = child(tcPr, 'gridSpan');
        if (gs) gridSpan = parseInt(attr(gs,'val') || '1', 10);
      }
      const cellBlocks = parseBodyChildren(tc);
      cells.push({ blocks: cellBlocks, gridSpan });
    }
    rows.push({ cells });
  }
  return { type:'table', colWidths, rows };
}

/* =========================================================================
   6) MOTOR DE LAYOUT
   ========================================================================= */

function fontString(style, scale){
  scale = scale || 1;
  const sizePx = (style.sizePx || 16) * scale;
  const weight = style.bold ? 'bold' : 'normal';
  const styleAttr = style.italic ? 'italic' : 'normal';
  const family = mapFontFamily(style.font);
  return `${styleAttr} ${weight} ${sizePx}px ${family}`;
}
function mapFontFamily(f){
  if (!f) return 'Calibri, Arial, sans-serif';
  return `"${f}", Calibri, Arial, sans-serif`;
}

function newPageLayout(){
  return {
    w: state.page.w, h: state.page.h,
    ops: [],
    floatingBehind: [],  
    floatingFront: [],   
    cursorY: state.page.mT
  };
}

async function computeLayout(){
  const measureCtx = ctx;
  const pages = [];
  function createBodyPage() {
    const headerH = (state.headerLayout && state.headerLayout.default) ? state.headerLayout.default.height : 0;
    const startY = Math.max(state.page.mT, state.page.headerDistPx + headerH);
    return { w: state.page.w, h: state.page.h, ops: [], floatingBehind: [], floatingFront: [], cursorY: startY };
  }
  let current = newPageLayout();
  pages.push(current);

  const contentLeft = state.page.mL;
  const contentWidth = state.page.w - state.page.mL - state.page.mR;

  function ensureSpace(neededHeight, forcePageBreak){
    if (forcePageBreak || current.cursorY + neededHeight > state.page.h - state.page.mB){
      current = newPageLayout();
      pages.push(current);
    }
  }

  for (const block of state.blocks){
    if (block.type === 'paragraph'){
      await layoutParagraph(block, contentLeft, contentWidth, pages, () => current, (p) => { current = p; }, ensureSpace);
    } else if (block.type === 'table'){
      await layoutTable(block, contentLeft, contentWidth, pages, () => current, (p) => { current = p; }, ensureSpace);
    }
  }

  state.pages = pages;
}

async function layoutHeaderFooterBlocks(blocks, width){
  if (!blocks || blocks.length === 0) return { ops: [], floatingBehind: [], floatingFront: [], height: 0 };
  let bufferPage = { w: width, h: 999999, ops: [], floatingBehind: [], floatingFront: [], cursorY: 0 };
  const pagesBuf = [bufferPage];
  const noPaginate = () => { };
  for (const block of blocks){
    if (block.type === 'paragraph'){
      await layoutParagraph(block, 0, width, pagesBuf, () => bufferPage, (p) => { bufferPage = p; }, noPaginate);
    } else if (block.type === 'table'){
      await layoutTable(block, 0, width, pagesBuf, () => bufferPage, (p) => { bufferPage = p; }, noPaginate);
    }
  }
  return {
    ops: bufferPage.ops,
    floatingBehind: bufferPage.floatingBehind,
    floatingFront: bufferPage.floatingFront,
    height: bufferPage.cursorY
  };
}

async function layoutHeadersFooters(){
  const contentWidth = state.page.w - state.page.mL - state.page.mR;
  state.headerLayout = {};
  state.footerLayout = {};
  for (const type in state.headers){
    state.headerLayout[type] = await layoutHeaderFooterBlocks(state.headers[type], contentWidth);
  }
  for (const type in state.footers){
    state.footerLayout[type] = await layoutHeaderFooterBlocks(state.footers[type], contentWidth);
  }
}

async function layoutParagraph(block, contentLeft, contentWidth, pages, getCurrent, setCurrent, ensureSpace){
  const para = block.para;
  const lineHeightMultiplier = (para.spacing && para.spacing.line) ? para.spacing.line : 1.15;
  const spaceBefore = (para.spacing && para.spacing.before) || 0;
  const spaceAfter = (para.spacing && para.spacing.after) || 0;

  let indentLeft = (para.indent && para.indent.left) || 0;
  const indentRight = (para.indent && para.indent.right) || 0;
  let firstLineExtra = 0;
  if (para.indent){
    if (para.indent.firstLine) firstLineExtra = para.indent.firstLine;
    if (para.indent.hanging) firstLineExtra = para.indent.hanging;
  }

  let listLabel = null;
  if (para.numPr && para.numPr.numId && para.numPr.numId !== '0'){
    const info = getListLevelInfo(para.numPr.numId, para.numPr.ilvl || 0);
    if (info){
      listLabel = nextListLabel(para.numPr.numId, para.numPr.ilvl || 0, info.numFmt, info.lvlText);
      indentLeft = Math.max(indentLeft, info.indentLeft || (18 + (para.numPr.ilvl||0)*24));
    }
  }

  if (para.pageBreakBefore){
    let cur = getCurrent();
    const np = newPageLayout();
    pages.push(np);
    setCurrent(np);
  }

  spaceIfNeeded(spaceBefore, getCurrent, setCurrent, pages);

  const floatItems = block.runs.filter(it => it.kind === 'floatingImage');
  if (floatItems.length){
    const cur = getCurrent();
    for (const fi of floatItems){
      const posH = fi.image.posH || { relativeFrom: 'column', offset: 0, align: null };
      const posV = fi.image.posV || { relativeFrom: 'paragraph', offset: 0, align: null };

      let x = 0, y = 0;
      let isAbsX = false, isAbsY = false;

      const relH = posH.relativeFrom;
      if (relH === 'page'){
        if (posH.align === 'center') x = (state.page.w - fi.image.widthPx)/2;
        else if (posH.align === 'right') x = state.page.w - fi.image.widthPx;
        else x = posH.offset;
        isAbsX = true;
      } else if (relH === 'margin' || relH === 'leftMargin' || relH === 'rightMargin'){
        const avail = state.page.w - state.page.mL - state.page.mR;
        if (posH.align === 'center') x = state.page.mL + (avail - fi.image.widthPx)/2;
        else if (posH.align === 'right') x = state.page.mL + avail - fi.image.widthPx;
        else x = state.page.mL + posH.offset;
        isAbsX = true;
      } else {
        const avail = contentWidth;
        if (posH.align === 'center') x = contentLeft + (avail - fi.image.widthPx)/2;
        else if (posH.align === 'right') x = contentLeft + avail - fi.image.widthPx;
        else x = contentLeft + posH.offset;
        isAbsX = false;
      }

      const relV = posV.relativeFrom;
      if (relV === 'page'){
        if (posV.align === 'center') y = (state.page.h - fi.image.heightPx)/2;
        else if (posV.align === 'bottom') y = state.page.h - fi.image.heightPx;
        else y = posV.offset;
        isAbsY = true;
      } else if (relV === 'margin' || relV === 'topMargin' || relV === 'bottomMargin'){
        const avail = state.page.h - state.page.mT - state.page.mB;
        if (posV.align === 'center') y = state.page.mT + (avail - fi.image.heightPx)/2;
        else if (posV.align === 'bottom') y = state.page.mT + avail - fi.image.heightPx;
        else y = state.page.mT + posV.offset;
        isAbsY = true;
      } else {
        y = cur.cursorY + posV.offset;
        isAbsY = false;
      }

      const op = {
        op: 'image',
        x: x, y: y,
        w: fi.image.widthPx, h: fi.image.heightPx,
        dataUrl: fi.image.dataUrl,
        opacity: fi.image.opacity,
        rotation: fi.image.rotation,
        relativeHeight: fi.image.relativeHeight || 0,
        isAbsoluteX: isAbsX,
        isAbsoluteY: isAbsY
      };
      if (fi.image.behindDoc) cur.floatingBehind.push(op);
      else cur.floatingFront.push(op);
    }
  }

  if (block.isEmpty){
    const emptyStyle = Object.assign({}, state.docDefaults.run);
    const h = (emptyStyle.sizePx || 16) * lineHeightMultiplier;
    ensureSpace(h, false);
    let cur = getCurrent();
    cur.cursorY += h;
    spaceIfNeeded(spaceAfter, getCurrent, setCurrent, pages);
    return;
  }

  const tokens = []; 
  for (const item of block.runs){
    if (item.kind === 'text'){
      const parts = item.text.split(/(\s+)/).filter(s => s.length > 0);
      for (const part of parts){
        tokens.push({ text: part, style: item.style, isSpace: /^\s+$/.test(part) });
      }
    } else if (item.kind === 'tab'){
      tokens.push({ text: '\t', style: item.style, isTab: true });
    } else if (item.kind === 'lineBreak'){
      tokens.push({ forceBreak: true, style: item.style });
    } else if (item.kind === 'pageBreak'){
      tokens.push({ forceBreak: true, forcePage: true, style: item.style });
    } else if (item.kind === 'image'){
      tokens.push({ image: item.image, style: item.style });
    }
  }

  let firstLineOfPara = true;
  let lineTokens = [];
  let lineWidth = 0;

  function availableWidth(){
    const extra = firstLineOfPara ? Math.max(firstLineExtra,0) : 0;
    const hang = (!firstLineOfPara && firstLineExtra < 0) ? -firstLineExtra : 0;
    return contentWidth - indentLeft - indentRight - extra - (firstLineOfPara ? 0 : hang);
  }

  function flushLine(){
    if (lineTokens.length === 0 && firstLineOfPara === false) { }
    let maxTokenHeight = 0;
    for (const t of lineTokens){
      const h = t.image ? t.image.heightPx : (t.style.sizePx || 16) * lineHeightMultiplier;
      if (h > maxTokenHeight) maxTokenHeight = h;
    }
    if (maxTokenHeight === 0) maxTokenHeight = 16 * lineHeightMultiplier;

    ensureSpace(maxTokenHeight, false);
    let cur = getCurrent();

    const lineIndent = indentLeft + (firstLineOfPara ? Math.max(firstLineExtra,0) : (firstLineExtra < 0 ? -firstLineExtra : 0));
    const lineY = cur.cursorY;
    const lineAvailWidth = availableWidth();

    let trimmed = lineTokens.slice();
    while (trimmed.length && trimmed[trimmed.length-1].isSpace) trimmed.pop();

    let naturalWidth = 0;
    for (const t of trimmed){
      naturalWidth += tokenWidth(t);
    }

    let startX = contentLeft + lineIndent;
    let extraSpacePerGap = 0;
    if (para.align === 'center'){
      startX += Math.max(0,(lineAvailWidth - naturalWidth)/2);
    } else if (para.align === 'right'){
      startX += Math.max(0,(lineAvailWidth - naturalWidth));
    } else if (para.align === 'both' && !isLastLineOfParaFlag){
      const gaps = trimmed.filter(t=>t.isSpace).length;
      if (gaps > 0){
        extraSpacePerGap = Math.max(0,(lineAvailWidth - naturalWidth)) / gaps;
      }
    }

    if (listLabel && firstLineOfPara){
      const labelStyle = (block.runs[0] && block.runs[0].style) ? block.runs[0].style : state.docDefaults.run;
      cur.ops.push({
        op:'text', text: listLabel, x: contentLeft + Math.max(indentLeft - 22,0), y: lineY,
        style: labelStyle, baseline: maxTokenHeight
      });
    }

    let x = startX;
    for (const t of trimmed){
      if (t.image){
        cur.ops.push({ op:'image', x, y: lineY, w: t.image.widthPx, h: t.image.heightPx, dataUrl: t.image.dataUrl, opacity: t.image.opacity, rotation: t.image.rotation });
        x += t.image.widthPx;
        continue;
      }
      if (t.isTab){
        x += 36; 
        continue;
      }
      const w = tokenWidth(t);
      cur.ops.push({ op:'text', text: t.text, x, y: lineY, style: t.style, baseline: maxTokenHeight });
      x += w;
      if (t.isSpace) x += extraSpacePerGap;
    }

    cur.cursorY += maxTokenHeight;
    firstLineOfPara = false;
    lineTokens = [];
    lineWidth = 0;
  }

  let isLastLineOfParaFlag = false;

  function tokenWidth(t){
    if (t.image) return t.image.widthPx;
    if (t.isTab) return 36;
    ctx.font = fontString(t.style);
    return ctx.measureText(t.text).width;
  }

  for (let idx = 0; idx < tokens.length; idx++){
    const t = tokens[idx];
    if (t.forceBreak){
      flushLine();
      if (t.forcePage){
        const np = newPageLayout();
        pages.push(np);
        setCurrent(np);
      }
      continue;
    }
    const w = tokenWidth(t);
    const limit = availableWidth();
    if (lineWidth + w > limit && lineTokens.length > 0 && !t.isSpace){
      flushLine();
    }
    lineTokens.push(t);
    lineWidth += w;
  }
  isLastLineOfParaFlag = true;
  if (lineTokens.length > 0 || firstLineOfPara){
    flushLine();
  }

  spaceIfNeeded(spaceAfter, getCurrent, setCurrent, pages);
}

function spaceIfNeeded(amount, getCurrent, setCurrent, pages){
  if (!amount) return;
  let cur = getCurrent();
  cur.cursorY += amount;
}

async function layoutTable(tbl, contentLeft, contentWidth, pages, getCurrent, setCurrent, ensureSpace){
  const totalDefinedWidth = tbl.colWidths.reduce((a,b)=>a+b,0) || contentWidth;
  const scale = contentWidth / totalDefinedWidth;
  const colWidths = tbl.colWidths.length ? tbl.colWidths.map(w => w*scale) : [contentWidth];

  for (const row of tbl.rows){
    const cellRenders = [];
    let colIndex = 0;
    let rowHeight = 24;
    for (const cell of row.cells){
      const cellWidth = sumColWidths(colWidths, colIndex, cell.gridSpan);
      const cellPages = [ { w: cellWidth, h: 999999, ops: [], floatingBehind: [], floatingFront: [], cursorY: 4 } ];
      let curCellPage = cellPages[0];
      const cellEnsure = (needed) => { };
      for (const b of cell.blocks){
        if (b.type === 'paragraph'){
          await layoutParagraph(b, 0, cellWidth - 8, cellPages, () => curCellPage, (p)=>{curCellPage=p;}, cellEnsure);
        }
      }
      const h = Math.max(24, curCellPage.cursorY + 6);
      rowHeight = Math.max(rowHeight, h);
      cellRenders.push({ ops: curCellPage.ops, width: cellWidth, colIndex, gridSpan: cell.gridSpan });
      if (curCellPage.floatingBehind.length) getCurrent().floatingBehind.push(...curCellPage.floatingBehind);
      if (curCellPage.floatingFront.length) getCurrent().floatingFront.push(...curCellPage.floatingFront);
      colIndex += cell.gridSpan;
    }

    ensureSpace(rowHeight, false);
    let cur = getCurrent();
    const rowY = cur.cursorY;
    let x = contentLeft;
    colIndex = 0;
    for (const cr of cellRenders){
      const cellX = contentLeft + sumColWidths(colWidths, 0, cr.colIndex);
      cur.ops.push({ op:'rect', x: cellX, y: rowY, w: cr.width, h: rowHeight, stroke:'#000000', lineWidth: 1 });
      for (const o of cr.ops){
        const shifted = Object.assign({}, o, { x: o.x + cellX + 4, y: o.y + rowY });
        cur.ops.push(shifted);
      }
    }
    cur.cursorY += rowHeight;
  }
}
function sumColWidths(colWidths, from, span){
  let s = 0;
  for (let i=from; i<from+span && i<colWidths.length; i++) s += colWidths[i];
  return s;
}

/* =========================================================================
   7) RENDERIZADO EN CANVAS
   ========================================================================= */
async function renderAllPages(){
  const pagesData = state.pages;
  const zoom = state.zoom;

  const dataUrls = new Set();
  for (const p of pagesData){
    for (const op of p.ops){ if (op.op === 'image') dataUrls.add(op.dataUrl); }
    for (const op of p.floatingBehind){ dataUrls.add(op.dataUrl); }
    for (const op of p.floatingFront){ dataUrls.add(op.dataUrl); }
  }
  for (const layoutMap of [state.headerLayout, state.footerLayout]){
    for (const type in layoutMap){
      const data = layoutMap[type];
      for (const op of data.ops){ if (op.op === 'image') dataUrls.add(op.dataUrl); }
      for (const op of data.floatingBehind){ dataUrls.add(op.dataUrl); }
      for (const op of data.floatingFront){ dataUrls.add(op.dataUrl); }
    }
  }
  await Promise.all(Array.from(dataUrls).map(preloadImage));

  const pageW = state.page.w;
  const totalHeight = pagesData.reduce((acc,p) => acc + p.h + PAGE_GAP, 0);

  canvas.width = Math.round(pageW * zoom);
  canvas.height = Math.round((totalHeight) * zoom);
  canvas.style.width = Math.round(pageW * zoom) + 'px';
  canvas.style.height = Math.round(totalHeight * zoom) + 'px';

  ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
  ctx.clearRect(0,0, canvas.width/zoom, canvas.height/zoom);

  let offsetY = 0;
  for (let i = 0; i < pagesData.length; i++){
    const page = pagesData[i];
    drawPageSheet(offsetY, pageW, page.h);

    const useFirst = (i === 0) && state.page.titlePg;
    const headerData = (useFirst && state.headerLayout.first) || state.headerLayout.default;
    const footerData = (useFirst && state.footerLayout.first) || state.footerLayout.default;

    // FIX: Declare footerTopY here so it exists for the entire page loop
    let footerTopY = 0; 
    if (footerData) {
      footerTopY = state.page.h - state.page.footerDistPx - footerData.height;
    }

    drawFloatingLayer(sortByRelativeHeight(page.floatingBehind), offsetY);
    
    if (headerData){
      drawFloatingLayerShifted(sortByRelativeHeight(headerData.floatingBehind), state.page.mL, state.page.headerDistPx, offsetY);
      drawOpsShifted(headerData.ops, state.page.mL, state.page.headerDistPx, offsetY);
    }
    
    if (footerData){
      drawFloatingLayerShifted(sortByRelativeHeight(footerData.floatingBehind), state.page.mL, footerTopY, offsetY);
      drawOpsShifted(footerData.ops, state.page.mL, footerTopY, offsetY);
    }

    drawOps(page.ops, offsetY);

    if (headerData) drawFloatingLayerShifted(sortByRelativeHeight(headerData.floatingFront), state.page.mL, state.page.headerDistPx, offsetY);
    
    // footerTopY is now perfectly accessible here!
    if (footerData) drawFloatingLayerShifted(sortByRelativeHeight(footerData.floatingFront), state.page.mL, footerTopY, offsetY);
    
    drawFloatingLayer(sortByRelativeHeight(page.floatingFront), offsetY);

    offsetY += page.h + PAGE_GAP;
  }

  pageIndicator.textContent = `${pagesData.length} página${pagesData.length===1?'':'s'}`;
}

function sortByRelativeHeight(list){
  return list.slice().sort((a,b) => (a.relativeHeight||0) - (b.relativeHeight||0));
}

function drawFloatingLayerShifted(ops, shiftX, shiftY, offsetY){
  for (const op of ops){
    const img = state.images[op.dataUrl];
    if (img) {
      const finalX = op.isAbsoluteX ? op.x : op.x + shiftX;
      const finalY = op.isAbsoluteY ? op.y : op.y + shiftY;
      drawImageOp(Object.assign({}, op, { x: finalX, y: finalY }), offsetY, img);
    }
  }
}

function drawFloatingLayer(ops, offsetY){
  for (const op of ops){
    const img = state.images[op.dataUrl];
    if (img) drawImageOp(op, offsetY, img);
  }
}

function drawPageSheet(offsetY, w, h){
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, offsetY, w, h);
  ctx.restore();
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, offsetY + 0.5, w-1, h-1);
}

function drawOps(ops, offsetY){
  for (const op of ops){
    if (op.op === 'text'){
      drawText(op, offsetY);
    } else if (op.op === 'image'){
      const img = state.images[op.dataUrl];
      if (img) drawImageOp(op, offsetY, img);
    } else if (op.op === 'rect'){
      ctx.save();
      ctx.strokeStyle = op.stroke || '#000';
      ctx.lineWidth = op.lineWidth || 1;
      ctx.strokeRect(op.x + 0.5, offsetY + op.y + 0.5, op.w - 1, op.h - 1);
      ctx.restore();
    }
  }
}

function drawOpsShifted(ops, shiftX, shiftY, offsetY){
  const shiftedOps = ops.map(op => {
    return Object.assign({}, op, {
      x: op.x + shiftX,
      y: op.y + shiftY
    });
  });
  drawOps(shiftedOps, offsetY);
}

function drawImageOp(op, offsetY, img){
  ctx.save();
  if (typeof op.opacity === 'number' && op.opacity < 1){
    ctx.globalAlpha = op.opacity;
  }
  if (op.rotation){
    const cx = op.x + op.w / 2;
    const cy = offsetY + op.y + op.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(op.rotation);
    ctx.drawImage(img, -op.w / 2, -op.h / 2, op.w, op.h);
  } else {
    ctx.drawImage(img, op.x, offsetY + op.y, op.w, op.h);
  }
  ctx.restore();
}

function drawText(op, offsetY){
  const style = op.style || {};
  ctx.save();
  ctx.font = fontString(style);
  ctx.fillStyle = style.color || '#000000';
  ctx.textBaseline = 'alphabetic';
  const ascent = (style.sizePx || 16) * 0.8;
  const y = offsetY + op.y + ascent;
  let text = op.text;
  let xPos = op.x;
  if (style.vertAlign === 'superscript'){
    ctx.font = fontString(Object.assign({}, style, { sizePx: (style.sizePx||16)*0.7 }));
    ctx.fillText(text, xPos, y - (style.sizePx||16)*0.25);
  } else if (style.vertAlign === 'subscript'){
    ctx.font = fontString(Object.assign({}, style, { sizePx: (style.sizePx||16)*0.7 }));
    ctx.fillText(text, xPos, y + (style.sizePx||16)*0.15);
  } else {
    if (style.highlight){
      const w = ctx.measureText(text).width;
      ctx.save();
      ctx.fillStyle = highlightColor(style.highlight);
      ctx.fillRect(xPos, y - ascent, w, (style.sizePx||16)*1.2);
      ctx.restore();
      ctx.fillStyle = style.color || '#000000';
    }
    ctx.fillText(text, xPos, y);
    if (style.underline || style.strike){
      const w = ctx.measureText(text).width;
      ctx.strokeStyle = style.color || '#000000';
      ctx.lineWidth = Math.max(1, (style.sizePx||16)*0.06);
      ctx.beginPath();
      const lineY = style.strike ? y - (style.sizePx||16)*0.3 : y + 2;
      ctx.moveTo(xPos, lineY);
      ctx.lineTo(xPos + w, lineY);
      ctx.stroke();
    }
  }
  ctx.restore();
}
function highlightColor(name){
  const map = { yellow:'#fff59d', green:'#a5d6a7', cyan:'#80deea', magenta:'#f48fb1',
    blue:'#90caf9', red:'#ef9a9a', darkYellow:'#ffe082', darkGray:'#bdbdbd', lightGray:'#eeeeee' };
  return map[name] || '#fff59d';
}

/* =========================================================================
   8) CONTROLES DE ZOOM
   ========================================================================= */
function applyZoom(newZoom, refit){
  state.zoom = Math.min(3, Math.max(0.25, newZoom));
  zoomLabel.textContent = Math.round(state.zoom*100) + '%';
  if (state.pages.length){
    renderAllPages();
  }
}
document.getElementById('dv_zoomInBtn').addEventListener('click', () => applyZoom(state.zoom + 0.1));
document.getElementById('dv_zoomOutBtn').addEventListener('click', () => applyZoom(state.zoom - 0.1));
zoomLabel.addEventListener('click', () => applyZoom(1));
document.getElementById('dv_fitBtn').addEventListener('click', () => {
  const availW = viewport.clientWidth - 64;
  const newZoom = Math.max(0.25, Math.min(3, availW / state.page.w));
  applyZoom(newZoom);
});

window.addEventListener('resize', () => {
});


/* =========================================================================
   9) EXPOSICIÓN PÚBLICA PARA EL GENERADOR (GFEWTB)
   ========================================================================= */
document.getElementById('dv_refreshBtn').addEventListener('click', () => {
  if (typeof window.dvOnRefreshRequested === 'function') window.dvOnRefreshRequested();
});

window.DocxViewerEngine = {
  loadBlob: handleFile,
  setStatus: setStatus
};

})();

/* ════════════════════════════════════════
   BASE DE DATOS DE ASIGNATURAS (VACÍA)
════════════════════════════════════════ */
const asignaturasData = {};

/* ════════════════════════════════════════
   MATERIA PERSONALIZADA Y LOCALSTORAGE
════════════════════════════════════════ */
let customMateriaData = null; 
let quill; 


function toggleCustomPanel() {
  const panel = document.getElementById('custom_mat_panel');
  panel.classList.toggle('open');
}

function renderizarSelectorMaterias() {
  const select = document.getElementById('asignatura_select');
  const valorActual = select.value;
  select.innerHTML = ''; 

  select.add(new Option('— Selecciona una materia —', ''));
  select.add(new Option('✏️ Formato vacío (ingresar todo manualmente)', '__vacio__'));

  try {
    const stored = localStorage.getItem('custom_materias');
    if (stored) {
      const custom = JSON.parse(stored);
      const keys = Object.keys(custom);
      
      if (keys.length > 0) {
        const optCustom = document.createElement('option');
        optCustom.disabled = true;
        optCustom.text = '─── MIS MATERIAS ───';
        select.add(optCustom);

        for (const key in custom) {
          select.add(new Option('⭐ ' + key, key));
          asignaturasData[key] = custom[key]; 
        }
      }
    }
  } catch (e) {
    console.error("Error leyendo localStorage:", e);
  }

  if (Array.from(select.options).some(opt => opt.value === valorActual)) {
    select.value = valorActual;
  }
  
  renderSavedMaterias();
}

function renderSavedMaterias() {
  const grid = document.getElementById('saved_materias_grid');
  let custom = {};
  try { custom = JSON.parse(localStorage.getItem('custom_materias') || '{}'); } catch(e){}
  
  const keys = Object.keys(custom);
  grid.innerHTML = '';

  if(keys.length === 0) {
    grid.innerHTML = '<div style="font-size:12px; color:var(--ink-faint); text-align:center; padding:10px;">No hay materias guardadas.</div>';
    return;
  }

  /* ════════════════════════════════════════
    onclick="seleccionarMateriaCard('${escHtml(key)}')""
    ════════════════════════════════════════ */
  keys.forEach(key => {
    grid.innerHTML += `
      <div class="saved-materia-card"> 
        <h4>⭐ ${escHtml(key)}</h4>
        <div class="smc-actions">
          <button class="smc-btn edit" onclick="openMateriaModal('${escHtml(key)}')">✏️ Editar</button>
          <button class="smc-btn export" onclick="exportarMateriaPersonalizada('${escHtml(key)}')">⬇ Exportar</button>
          <button class="smc-btn delete" onclick="borrarMateriaPersonalizada('${escHtml(key)}')">🗑 Borrar</button>
        </div>
      </div>
    `;
  });
}

function borrarMateriaPersonalizada(nombre) {
  if (confirm(`¿Estás seguro de borrar permanentemente la materia "${nombre}"?`)) {
    let custom = JSON.parse(localStorage.getItem('custom_materias') || '{}');
    delete custom[nombre];
    localStorage.setItem('custom_materias', JSON.stringify(custom));
    delete asignaturasData[nombre];
    
    renderizarSelectorMaterias();
    document.getElementById('asignatura_select').value = '__vacio__';
    document.getElementById('asignatura_select').dispatchEvent(new Event('change'));
    showSuccess(`Materia "${nombre}" eliminada correctamente.`);
  }
}

function exportarMateriaPersonalizada(nombre) {
  let custom = JSON.parse(localStorage.getItem('custom_materias') || '{}');
  if(!custom[nombre]) return;
  
  const exportData = { [nombre]: custom[nombre] };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  saveAs(blob, `${nombre.replace(/\s+/g,'_')}.json`);
}

function descargarPlantillaJSON() {
  const plantilla = {
    "Nombre de la Materia": {
      docente: "Apellido Nombre del Docente",
      total_comp: 4,
      competencias: [
        "descripción de la competencia 1.",
        "descripción de la competencia 2.",
        "descripción de la competencia 3.",
        "descripción de la competencia 4."
      ],
      indicadores: [
        "A. Se adapta a situaciones y contextos complejos.",
        "B. Hace aportaciones a las actividades académicas desarrolladas.",
        "C. Propone y/o explica soluciones o procedimientos no vistos en clase.",
        "D. Introduce recursos y experiencias que promueven un pensamiento crítico.",
        "E. Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",
        "F. Realiza su trabajo de manera autónoma y autorregulada."
      ]
    }
  };
  const blob = new Blob([JSON.stringify(plantilla, null, 2)], { type: 'application/json' });
  saveAs(blob, 'plantilla_materia.json');
}

function cargarMateriaDesdeArchivo(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const raw = JSON.parse(e.target.result);
      const keys = Object.keys(raw);
      if (keys.length === 0) throw new Error('El archivo está vacío.');
      const nombre = keys[0];
      const d = raw[nombre];
      
      if (!d.docente || !Array.isArray(d.competencias) || !Array.isArray(d.indicadores))
        throw new Error('Formato inválido. Asegúrate de usar la plantilla descargada.');
      if (d.competencias.length === 0) throw new Error('La materia debe tener al menos una competencia.');

      let custom = {};
      try { custom = JSON.parse(localStorage.getItem('custom_materias') || '{}'); } catch(e){}
      
      custom[nombre] = {
        docente: d.docente,
        total_comp: d.total_comp || d.competencias.length,
        competencias: d.competencias,
        indicadores: d.indicadores
      };
      localStorage.setItem('custom_materias', JSON.stringify(custom));

      renderizarSelectorMaterias();
      document.getElementById('asignatura_select').value = nombre;
      
      document.getElementById('asignatura_select').dispatchEvent(new Event('change'));
      showSuccess(`✓ Materia "${nombre}" guardada e integrada al sistema.`);

    } catch(err) {
      showError('Error al leer el archivo: ' + err.message);
    }
    input.value = ''; 
  };
  reader.readAsText(file);
}

/* ════════════════════════════════════════
   LÓGICA DEL FORMULARIO MODAL
════════════════════════════════════════ */
let editandoMateriaOldName = null;

function openMateriaModal(nombre = null) {
  editandoMateriaOldName = nombre;
  document.getElementById('modal_comps').innerHTML = '';
  document.getElementById('modal_inds').innerHTML = '';
  
  if(nombre) {
    document.getElementById('modal_mat_title').textContent = 'Editar Materia';
    let custom = JSON.parse(localStorage.getItem('custom_materias') || '{}');
    const data = custom[nombre];
    
    document.getElementById('modal_mat_name').value = nombre;
    document.getElementById('modal_mat_docente').value = data.docente;
    data.competencias.forEach(c => addModalField('modal_comps', c, true));
    data.indicadores.forEach(i => addModalField('modal_inds', i, false));
  } else {
    document.getElementById('modal_mat_title').textContent = 'Crear Nueva Materia';
    document.getElementById('modal_mat_name').value = '';
    document.getElementById('modal_mat_docente').value = '';
    addModalField('modal_comps', '', true);
    
    const defInds = [
      "A. Se adapta a situaciones y contextos complejos.",
      "B. Hace aportaciones a las actividades académicas desarrolladas.",
      "C. Propone y/o explica soluciones o procedimientos no vistos en clase.",
      "D. Introduce recursos y experiencias que promueven un pensamiento crítico.",
      "E. Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",
      "F. Realiza su trabajo de manera autónoma y autorregulada."
    ];
    defInds.forEach(i => addModalField('modal_inds', i, false));
  }
  
  document.getElementById('materia_modal').classList.add('active');
}

function closeMateriaModal() {
  document.getElementById('materia_modal').classList.remove('active');
}

function addModalField(containerId, value = '', isTextArea = false) {
  const container = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  
  const input = isTextArea ? document.createElement('textarea') : document.createElement('input');
  if(isTextArea) input.rows = 2;
  input.value = value;
  input.className = 'modal-dyn-input';
  input.placeholder = isTextArea ? "Descripción..." : "Indicador...";
  
  const btn = document.createElement('button');
  btn.textContent = 'x';
  btn.className = 'btn-remove';
  btn.onclick = () => container.removeChild(div);
  
  div.appendChild(input);
  div.appendChild(btn);
  container.appendChild(div);
}

function saveMateriaModal() {
  const nombre = document.getElementById('modal_mat_name').value.trim();
  const docente = document.getElementById('modal_mat_docente').value.trim();
  if(!nombre) { showError('Ingresa el nombre de la materia'); return; }
  
  const comps = Array.from(document.getElementById('modal_comps').querySelectorAll('.modal-dyn-input')).map(i => i.value.trim()).filter(v => v);
  const inds = Array.from(document.getElementById('modal_inds').querySelectorAll('.modal-dyn-input')).map(i => i.value.trim()).filter(v => v);
  
  if(comps.length === 0) { showError('Agrega al menos una competencia'); return; }
  if(inds.length === 0) { showError('Agrega al menos un indicador'); return; }
  
  let custom = JSON.parse(localStorage.getItem('custom_materias') || '{}');
  
  if(editandoMateriaOldName && editandoMateriaOldName !== nombre) {
    delete custom[editandoMateriaOldName];
    delete asignaturasData[editandoMateriaOldName];
  }
  
  custom[nombre] = {
    docente: docente,
    total_comp: comps.length,
    competencias: comps,
    indicadores: inds
  };
  
  localStorage.setItem('custom_materias', JSON.stringify(custom));
  renderizarSelectorMaterias();
  
  document.getElementById('asignatura_select').value = nombre;
  document.getElementById('asignatura_select').dispatchEvent(new Event('change'));
  
  closeMateriaModal();
  showSuccess(`✓ Materia "${nombre}" guardada correctamente`);
}

/* ════════════════════════════════════════
   ESTADO Y UTILIDADES GLOBALES
════════════════════════════════════════ */
let selectedComp = null;
let selectedIndicadores = [];
const el = id => document.getElementById(id);

function escHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escXml(str) {
  return String(str || '').replace(/&/g, '&amp;')
                           .replace(/</g, '&lt;')
                           .replace(/>/g, '&gt;')
                           .replace(/"/g, '&quot;')
                           .replace(/'/g, '&apos;');
}

/* ════════════════════════════════════════
   PERSISTENCIA localStorage
════════════════════════════════════════ */
function guardarLS() {
  localStorage.setItem('fo205', JSON.stringify({
    nombre: el('nombre').value,
    control: el('control').value,
    division: el('division').value,
    grupo: el('grupo').value
  }));
}
function cargarLS() {
  try {
    const d = JSON.parse(localStorage.getItem('fo205') || '{}');
    ['nombre','control','division','grupo'].forEach(k => { if(d[k]) el(k).value = d[k]; });
  } catch(e){}
}
['nombre','control','division','grupo'].forEach(id => el(id).addEventListener('input', guardarLS));

/* ════════════════════════════════════════
   STEPPER Y ASIGNATURA EVENTOS
════════════════════════════════════════ */
function updateStepper() {
  const mat = el('asignatura_select').value;
  const s1 = el('nombre').value.trim() && el('control').value.trim();
  const s2 = mat !== '';
  const s3 = selectedComp !== null || (mat === '__vacio__' && !customMateriaData);
  ['step1','step2','step3','step4'].forEach(id => el(id).classList.remove('active','done'));
  if(s1 && s2 && s3){ el('step4').classList.add('active'); ['step1','step2','step3'].forEach(id => el(id).classList.add('done')); }
  else if(s1 && s2){ el('step3').classList.add('active'); ['step1','step2'].forEach(id => el(id).classList.add('done')); }
  else if(s1){ el('step2').classList.add('active'); el('step1').classList.add('done'); }
  else { el('step1').classList.add('active'); }
}
['nombre','control','asignatura_select'].forEach(id => el(id).addEventListener('input', updateStepper));
['nombre','control'].forEach(id => el(id).addEventListener('change', updateStepper));

el('asignatura_select').addEventListener('change', function() {
  const val = this.value;
  el('modo_vacio').style.display = val === '__vacio__' ? 'block' : 'none';
  el('docente_auto_wrap').style.display = (val && val !== '__vacio__') ? 'block' : 'none';
  el('card_competencia').style.display = (val && val !== '__vacio__') ? 'block' : 'none';
  el('card_comp_manual').style.display = val === '__vacio__' ? 'block' : 'none';

  selectedComp = null;
  selectedIndicadores = [];
  el('desc_preview').className = 'desc-preview';

  if(val && val !== '__vacio__' && asignaturasData[val]) {
    const d = asignaturasData[val];
    el('docente_auto').value = d.docente;
    renderCompGrid(d.total_comp);
    renderIndGrid(d.indicadores);
  }
  updateStepper();
});

function renderCompGrid(total) {
  const g = el('comp_grid'); g.innerHTML = '';
  for(let i=1; i<=total; i++) {
    const b = document.createElement('button');
    b.className = 'comp-btn'; b.textContent = i; b.dataset.num = i;
    b.addEventListener('click', () => selectComp(i, b));
    g.appendChild(b);
  }
}

function renderIndGrid(indicadores) {
  const g = el('ind_grid'); g.innerHTML = '';
  selectedIndicadores = [];
  indicadores.forEach((ind, idx) => {
    const letra = typeof ind === 'string' && ind.length <= 2 ? ind : ind.charAt(0);
    const b = document.createElement('button');
    b.className = 'ind-btn'; b.textContent = letra;
    b.dataset.letra = letra; b.dataset.full = ind;
    b.addEventListener('click', () => toggleInd(letra, ind, b));
    g.appendChild(b);
  });
}

function selectComp(num, btn) {
  document.querySelectorAll('.comp-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedComp = num;
  const mat = el('asignatura_select').value;
  const data = asignaturasData[mat];
  if(data && data.competencias[num-1]) {
    const prev = el('desc_preview');
    prev.textContent = data.competencias[num-1];
    prev.className = 'desc-preview show';
  }
  updateStepper();
}

function toggleInd(letra, full, btn) {
  btn.classList.toggle('active');
  if(selectedIndicadores.find(i => i.letra === letra)) {
    selectedIndicadores = selectedIndicadores.filter(i => i.letra !== letra);
  } else {
    selectedIndicadores.push({ letra, full });
  }
}

/* ════════════════════════════════════════
   BANNERS Y VALIDACIÓN Y GITHUB URLS
════════════════════════════════════════ */
const BASE_URL = 'https://raw.githubusercontent.com/s12gamer/gxdasnz/main/';
const githubUrls = {
  '__vacio__': BASE_URL + 'Formato vacio form2.docx',
};

function formatFecha(val) { if(!val) return ''; const [y,m,d] = val.split('-'); return `${d}/${m}/${y}`; }

function hideBanners() { ['loading_banner','success_banner','error_banner'].forEach(id => el(id).className = el(id).className.replace(' show','').trim()); }
function showLoading(msg) { hideBanners(); el('loading_banner').textContent = msg; el('loading_banner').classList.add('show'); }
function showSuccess(msg) { hideBanners(); el('success_banner').textContent = msg; el('success_banner').classList.add('show'); setTimeout(hideBanners,5000); }
function showError(msg)   { hideBanners(); el('error_banner').textContent = msg; el('error_banner').classList.add('show'); setTimeout(hideBanners,7000); }

function validar() {
  const nombre   = el('nombre').value.trim();
  const control  = el('control').value.trim();
  const materia  = el('asignatura_select').value;
  if(!nombre)   { showError('Ingresa tu nombre completo.'); return false; }
  if(!control)  { showError('Ingresa tu No. de Control.'); return false; }
  if(!materia)  { showError('Selecciona una materia.'); return false; }
  if(materia === '__vacio__') {
    if(!el('materia_manual').value.trim()) { showError('Ingresa el nombre de la asignatura.'); return false; }
    if(!el('docente_manual').value.trim()) { showError('Ingresa el nombre del docente.'); return false; }
    if(!el('comp_manual_num').value.trim()) { showError('Ingresa el número de competencia.'); return false; }
  } else {
    if(selectedComp === null) { showError('Selecciona una competencia.'); return false; }
  }
  return true;
}

/* ════════════════════════════════════════
   TRADUCTOR OOXML RECURSIVO (NATIVO DESDE EL COMPLEJO)
════════════════════════════════════════ */
function convertirHtmlAWordXML(htmlContenido) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContenido, 'text/html');
  let bodyXml = "";
  const bloques = doc.body.childNodes;
  
  const pPrEstandar = '<w:pPr><w:jc w:val="left"/></w:pPr>';

  bloques.forEach(bloque => {
    if (bloque.nodeType === Node.ELEMENT_NODE) {
      if (bloque.nodeName === 'UL' || bloque.nodeName === 'OL') {
        bloque.childNodes.forEach(li => {
          if (li.nodeType === Node.ELEMENT_NODE && li.nodeName === 'LI') {
            bodyXml += "<w:p>" + pPrEstandar;
            bodyXml += '<w:r><w:rPr><w:rFonts w:ascii="Gotham Book" w:hAnsi="Gotham Book" w:cs="Gotham Book"/><w:b/></w:rPr><w:t xml:space="preserve">• </w:t></w:r>';
            bodyXml += procesarNodo(li, { bold: false, italic: false, underline: false, size: null });
            bodyXml += "</w:p>";
          }
        });
      } else {
        bodyXml += "<w:p>" + pPrEstandar;
        bodyXml += procesarNodo(bloque, { bold: false, italic: false, underline: false, size: null });
        bodyXml += "</w:p>";
      }
    }
  });

  return bodyXml;
}

function procesarNodo(nodo, formatoActual ) {
  let xmlResultado = "";
  let formato = { ...formatoActual };

  if (nodo.nodeName === 'STRONG' || nodo.nodeName === 'B') formato.bold = true;
  if (nodo.nodeName === 'EM' || nodo.nodeName === 'I') formato.italic = true;
  if (nodo.nodeName === 'U') formato.underline = true;
  if (nodo.nodeName === 'H3') {
    formato.size = "36"; // Tamaño 16pt para el Word
    formato.bold = true; // Forzamos negrita para los subtítulos
  }
  if (nodo.nodeName === 'H1') {
    formato.size = "36"; // Tamaño 16pt para el Word
    formato.bold = true; // Forzamos negrita para los subtítulos
  }
  if (nodo.nodeName === 'H2') {
    formato.size = "36"; // Tamaño 16pt para el Word
    formato.bold = true; // Forzamos negrita para los subtítulos
  }
  
  if (nodo.classList && nodo.classList.contains('ql-size-small')) formato.size = "12"; 
  if (nodo.classList && nodo.classList.contains('ql-size-large')) formato.size = "18"; 
  if (nodo.classList && nodo.classList.contains('ql-size-huge'))  formato.size = "32"; 

  if (nodo.nodeName === 'BR') {
    return "<w:r><w:br/></w:r>";
  }

  if (nodo.nodeType === Node.TEXT_NODE) {
    const textoEscapado = nodo.nodeValue
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (textoEscapado.trim() === "" && nodo.nodeValue !== " ") return "";

    xmlResultado += "<w:r>";
    
    let rPr = "<w:rPr>";
    rPr += '<w:rFonts w:ascii="Gotham Book" w:hAnsi="Gotham Book" w:cs="Gotham Book"/>';
    if (formato.bold) rPr += "<w:b/>";
    if (formato.italic) rPr += "<w:i/>";
    if (formato.underline) rPr += '<w:u w:val="single"/>';
    if (formato.size) rPr += `<w:sz w:val="${formato.size}"/>`; 
    rPr += "</w:rPr>";
    
    xmlResultado += rPr;
    xmlResultado += `<w:t xml:space="preserve">${nodo.nodeValue}</w:t>`;
    xmlResultado += "</w:r>";
  } else {
    nodo.childNodes.forEach(hijo => {
      xmlResultado += procesarNodo(hijo, formato);
    });
  }

  return xmlResultado;
}

/* ════════════════════════════════════════
   LÓGICA PRINCIPAL: EDICIÓN DEL DOCX
════════════════════════════════════════ */
/* Reúne los datos del formulario en un solo objeto "opts", compartido tanto
   por la descarga final ("Generar Documento") como por la vista previa en
   vivo, para que ambas rutas generen exactamente el mismo documento.
   Devuelve null si todavía no hay suficiente información para procesar
   una plantilla (por ejemplo, no se ha elegido materia). */
function recopilarDatosFormulario() {
  const materia_sel = el('asignatura_select').value;
  if (!materia_sel) return null;

  const nombre    = el('nombre').value.trim();
  const control   = el('control').value.trim();
  const division  = el('division').value.trim();
  const grupo     = el('grupo').value.trim();
  const fecha     = formatFecha(el('fecha').value);
  const evidencia = el('evidencia').value.trim();

  let materia, docente, compNum, compDesc;

  if(materia_sel === '__vacio__') {
    materia = el('materia_manual').value.trim();
    docente = el('docente_manual').value.trim();
    compNum  = el('comp_manual_num').value.trim();
    compDesc = el('comp_manual_desc').value.trim().toLowerCase();
  } else {
    const data = asignaturasData[materia_sel];
    if (!data) return null;
    materia   = materia_sel;
    docente   = data.docente;
    compNum   = selectedComp !== null ? String(selectedComp) : '';
    compDesc  = selectedComp !== null ? (data.competencias[selectedComp - 1] || '') : '';
  }

  const indLetras = selectedIndicadores.map(i => i.letra);
  const indFull   = selectedIndicadores.map(i => i.full);
  const urlFinal  = githubUrls[materia_sel] || (BASE_URL + 'Formato vacio form2.docx');

  return {
    githubUrl: urlFinal,
    nombre, control, division, grupo, fecha,
    materia, docente, compNum, compDesc, indLetras, indFull, evidencia, materia_sel
  };
}

/* Cache en memoria de las plantillas .docx descargadas de GitHub, indexada
   por URL, para no volver a descargar el mismo archivo en cada tecleo de
   la vista previa en vivo. */
const dvTemplateCache = {};
async function obtenerPlantillaArrayBuffer(url) {
  if (dvTemplateCache[url]) return dvTemplateCache[url];
  const resp = await fetch(url);
  if(!resp.ok) throw new Error(`No se pudo descargar el archivo (HTTP ${resp.status})`);
  const ab = await resp.arrayBuffer();
  dvTemplateCache[url] = ab;
  return ab;
}

async function generarDocumento() {
  if(!validar()) return;
  el('generar_btn').disabled = true;
  showLoading('Descargando plantilla y procesando documento...');

  // El usuario ya validó el formulario y está generando el documento:
  // es el momento de mayor intención de uso, así que es cuando le
  // ofrecemos instalar la app (si el navegador nos dio el evento).
  offerInstall();

  const opts = recopilarDatosFormulario();

  try {
    if (!opts) throw new Error('Completa el formulario antes de generar el documento.');
    let blob = await procesarDesdeGithub(opts);

    const filename = `${opts.evidencia.replace(/\s+/g,'_')}_${opts.nombre.replace(/\s+/g,'_')}__${opts.materia.replace(/\s+/g,'_')}_C${opts.compNum}.docx`;
    saveAs(blob, filename);
    showSuccess('✓ Documento generado y descargado: ' + filename);
  } catch(e) {
    showError('Error al generar el documento: ' + e.message);
    console.error(e);
  } finally {
    el('generar_btn').disabled = false;
  }
}

async function procesarDesdeGithub(opts) {
  const ab  = await obtenerPlantillaArrayBuffer(opts.githubUrl);
  const zip = new PizZip(ab.slice(0));

  let xmlStr = zip.file('word/document.xml').asText();
  xmlStr = aplicarSustitucionesXML(xmlStr, opts);

  // INYECCIÓN DE TEXTO ENRIQUECIDO ADICIONAL AL FINAL DE LA HOJA (SI ESTÁ ACTIVO)
  if (el('insertar_texto_adicional').checked) {
    const htmlAdicional = quill.root.innerHTML;
    const xmlAdicional = convertirHtmlAWordXML(htmlAdicional);
    xmlStr = insertarTextoEnXML(xmlStr, xmlAdicional);
  }

  zip.file('word/document.xml', xmlStr);

  return zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

// Inserta de forma robusta las nuevas líneas de contenido justo antes del cierre del body/sectPr
function insertarTextoEnXML(xml, textoXml) {
  const lastSectPrIdx = xml.lastIndexOf('<w:sectPr');
  
  // Eliminamos 'parrafoEspaciador' para evitar el tercer salto de línea innecesario.
  // Al insertar 'textoXml' directamente, se respeta el espacio nativo de la plantilla 
  // dejando exactamente dos espacios de separación bajo el cuadro.
  const totalAInsertar = textoXml;

  if (lastSectPrIdx !== -1) {
    return xml.slice(0, lastSectPrIdx) + totalAInsertar + xml.slice(lastSectPrIdx);
  } else {
    const bodyEndIdx = xml.lastIndexOf('</w:body>');
    if (bodyEndIdx !== -1) {
      return xml.slice(0, bodyEndIdx) + totalAInsertar + xml.slice(bodyEndIdx);
    }
  }
  return xml;
}

function aplicarSustitucionesXML(xml, opts) {
  xml = procesarFilasDeTabla(xml, opts);
  if(opts.materia_sel !== '__vacio__') xml = filtrarCompetencias(xml, opts);
  xml = filtrarIndicadores(xml, opts);
  return xml;
}

function procesarFilasDeTabla(xml, opts) {
  return xml.replace(/(<w:tr\b[\s\S]*?<\/w:tr>)/g, fila => {
    const celdas = [];
    const reCell = /<w:tc\b[\s\S]*?<\/w:tc>/g;
    let m;
    while((m = reCell.exec(fila)) !== null) celdas.push({ match: m[0], index: m.index });
    if(celdas.length < 2) return fila;

    let filaModificada = fila;

    for(let i = 0; i < celdas.length - 1; i++) {
      const txtEtiqueta = extraerTexto(celdas[i].match).toLowerCase().trim();
      let nuevoValor = null;

      if(/nombre.*alumno|nombre.*estudiante|^nombre$/i.test(txtEtiqueta)) nuevoValor = opts.nombre + ' ' + opts.control;
      else if(/no\.?\s*control|n[uú]mero.*control|control/i.test(txtEtiqueta)) nuevoValor = opts.nombre + ' ' + opts.control;
      else if(/divisi[oó]n|carrera|programa/i.test(txtEtiqueta)) nuevoValor = opts.division;
      else if(/grupo/i.test(txtEtiqueta)) nuevoValor = opts.grupo;
      else if(/fecha/i.test(txtEtiqueta)) nuevoValor = opts.fecha;
      else if(/asignatura|materia/i.test(txtEtiqueta)) nuevoValor = opts.materia;
      else if(/docente|profesor|maestro/i.test(txtEtiqueta)) nuevoValor = opts.docente;
      else if(/competencia.*no|no.*competencia|competencia\s*#|n[uú]m.*competencia/i.test(txtEtiqueta)) nuevoValor = opts.compNum;
      else if(/evidencia/i.test(txtEtiqueta)) nuevoValor = opts.evidencia;

      if(nuevoValor !== null) {
        const celdaValorOriginal = celdas[i + 1].match;
        const celdaValorNueva = escribirValorEnCelda(celdaValorOriginal, nuevoValor);
        filaModificada = filaModificada.replace(celdaValorOriginal, celdaValorNueva);
      }
    }
    return filaModificada;
  });
}

function escribirValorEnCelda(celda, valor) {
  const matchRpr = celda.match(/<w:rPr[\s\S]*?<\/w:rPr>/);
  const rPr = matchRpr ? matchRpr[0] : '';
  const matchPPr = celda.match(/<w:pPr[\s\S]*?<\/w:pPr>/);
  const pPr = matchPPr ? matchPPr[0] : '';
  const matchTcPr = celda.match(/<w:tcPr[\s\S]*?<\/w:tcPr>/);
  const tcPr = matchTcPr ? matchTcPr[0] : '';
  return `<w:tc>${tcPr}<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escXml(valor)}</w:t></w:r></w:p></w:tc>`;
}

function extraerTexto(xml) {
  return (xml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || []).map(m => m.replace(/<[^>]+>/g,'')).join('');
}

function filtrarCompetencias(xml, opts) {
  const data = asignaturasData[opts.materia_sel];
  if(!data) return xml;

  const compElegida = String(opts.compNum);
  const todasComps  = data.competencias;

  xml = xml.replace(/(<w:tr\b[\s\S]*?<\/w:tr>)/g, fila => {
    const celdas = extraerCeldas(fila);
    if(celdas.length < 2) return fila;

    let filaModificada = fila;

    for(let i = 0; i < celdas.length - 1; i++) {
      const txtEtiq = extraerTexto(celdas[i]).toLowerCase().trim();
      const celdaValor = celdas[i + 1];

      if(/competencia.*no|no.*competencia|competencia\s*#|n[uú]m.*competencia/i.test(txtEtiq)) {
        const nueva = limpiarNumerosCompetencia(celdaValor, compElegida, data.total_comp);
        filaModificada = filaModificada.replace(celdaValor, nueva);
      }
      if(/descripci[oó]n/i.test(txtEtiq)) {
        const nueva = limpiarDescripcionesCompetencia(celdaValor, compElegida, todasComps);
        filaModificada = filaModificada.replace(celdaValor, nueva);
      }
    }
    return filaModificada;
  });
  return xml;
}

function extraerCeldas(fila) {
  const celdas = [];
  const re = /<w:tc\b[\s\S]*?<\/w:tc>/g;
  let m;
  while((m = re.exec(fila)) !== null) celdas.push(m[0]);
  return celdas;
}

function limpiarNumerosCompetencia(celda, compElegida, total) {
  const parrafos = extraerParrafos(celda);
  const mantenidos = parrafos.filter(p => {
    const txt = extraerTexto(p).trim();
    if(!txt) return false;
    return txt === compElegida || txt === compElegida + '.' || txt.startsWith(compElegida);
  });
  const resultado = mantenidos.length > 0 ? mantenidos : parrafos.filter(p => extraerTexto(p).trim().includes(compElegida));
  return reconstruirCelda(celda, resultado.length > 0 ? resultado : [crearParrafoTexto(celda, compElegida)]);
}

function limpiarDescripcionesCompetencia(celda, compElegida, todasComps) {
  const descElegida = todasComps[parseInt(compElegida) - 1];
  if(!descElegida) return celda;

  const parrafos = extraerParrafos(celda);
  const conTexto = parrafos.filter(p => extraerTexto(p).trim().length > 0);
  const numActual = parseInt(compElegida);
  const numSiguiente = numActual + 1;
  let guardar = false;
  const elegidos = [];
  const firmaActual = descElegida.toLowerCase().trim().substring(0, 20);
  const descSiguiente = todasComps[numSiguiente - 1];
  const firmaSiguiente = descSiguiente ? descSiguiente.toLowerCase().trim().substring(0, 20) : null;
  
  for (let i = 0; i < conTexto.length; i++) {
    const txtParagraph = extraerTexto(conTexto[i]).toLowerCase().trim();
    if (txtParagraph.includes(firmaActual) || firmaActual.includes(txtParagraph)) guardar = true;
    else if (firmaSiguiente && (txtParagraph.includes(firmaSiguiente) || firmaSiguiente.includes(txtParagraph))) guardar = false;
    if (guardar) elegidos.push(conTexto[i]);
  }
  const resultado = elegidos.length > 0 ? elegidos : [crearParrafoTexto(celda, descElegida)];
  return reconstruirCelda(celda, resultado);
}

function extraerParrafos(celda) { return celda.match(/<w:p\b[\s\S]*?<\/w:p>/g) || []; }

function reconstruirCelda(celdaOriginal, parrafosNuevos) {
  const matchTcPr = celdaOriginal.match(/<w:tcPr[\s\S]*?<\/w:tcPr>/);
  const tcPr = matchTcPr ? matchTcPr[0] : '';
  return `<w:tc>${tcPr}${parrafosNuevos.join('')}</w:tc>`;
}

function crearParrafoTexto(celdaRef, texto) {
  const matchRpr = celdaRef.match(/<w:rPr[\s\S]*?<\/w:rPr>/);
  const rPr = matchRpr ? matchRpr[0] : '';
  const matchPPr = celdaRef.match(/<w:pPr[\s\S]*?<\/w:pPr>/);
  const pPr = matchPPr ? matchPPr[0] : '';
  return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escXml(texto)}</w:t></w:r></w:p>`;
}

function filtrarIndicadores(xml, opts) {
  return xml.replace(/(<w:tr\b[\s\S]*?<\/w:tr>)/g, fila => {
    const celdas = extraerCeldas(fila);
    if(celdas.length < 2) return fila;

    let filaModificada = fila;
    for(let i = 0; i < celdas.length - 1; i++) {
      const txtEtiq = extraerTexto(celdas[i]).toLowerCase().trim();
      if(/indicador|desempe[nñ]o/i.test(txtEtiq)) {
        const celdaValor = celdas[i + 1];
        let parrafosNuevos = [];
        if(opts.indFull && opts.indFull.length > 0) {
          const ordenados = opts.indFull.slice().sort((a, b) => a.localeCompare(b));
          parrafosNuevos = ordenados.map(ind => crearParrafoTexto(celdaValor, ind));
        } else {
          parrafosNuevos = [crearParrafoTexto(celdaValor, '—')];
        }
        const nueva = reconstruirCelda(celdaValor, parrafosNuevos);
        filaModificada = filaModificada.replace(celdaValor, nueva);
      }
    }
    return filaModificada;
  });
}

/* ════════════════════════════════════════
   VISTA PREVIA
════════════════════════════════════════ */
let previewVisible = false;

function toggleVistaPrvia() {
  previewVisible = !previewVisible;
  const panel = el('preview_panel');
  const btn   = el('preview_toggle_btn');
  const arrow = el('ptb_arrow');
  if(previewVisible) {
    panel.classList.add('show'); btn.classList.add('active'); arrow.textContent = '▴';
    generarPreviewEnVivo();
  } else {
    panel.classList.remove('show'); btn.classList.remove('active'); arrow.textContent = '▾';
  }
}

/* ── Generación de la vista previa real (.docx renderizado en Canvas) ──
   Hace exactamente lo mismo que "Generar Documento" (descarga la
   plantilla, aplica las mismas sustituciones XML) pero en vez de
   descargar el archivo, lo entrega al visor de Canvas embebido para
   que se muestre dentro del panel "Vista Previa en Vivo". */
let dvPreviewGenId = 0;

async function generarPreviewEnVivo() {
  if(!previewVisible) return;
  if(!window.DocxViewerEngine) return;

  const opts = recopilarDatosFormulario();
  if(!opts) {
    window.DocxViewerEngine.setStatus('Selecciona una materia para previsualizar', '');
    return;
  }

  const myGenId = ++dvPreviewGenId;
  try {
    window.DocxViewerEngine.setStatus('Descargando plantilla…', 'ok');
    const ab = await obtenerPlantillaArrayBuffer(opts.githubUrl);
    if(myGenId !== dvPreviewGenId) return; // una solicitud más nueva ya está en curso

    const zip = new PizZip(ab.slice(0));
    let xmlStr = zip.file('word/document.xml').asText();
    xmlStr = aplicarSustitucionesXML(xmlStr, opts);

    if(el('insertar_texto_adicional').checked) {
      const htmlAdicional = quill.root.innerHTML;
      const xmlAdicional = convertirHtmlAWordXML(htmlAdicional);
      xmlStr = insertarTextoEnXML(xmlStr, xmlAdicional);
    }
    zip.file('word/document.xml', xmlStr);

    const blob = zip.generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    if(myGenId !== dvPreviewGenId) return;

    await window.DocxViewerEngine.loadBlob(blob, 'vista_previa.docx');
  } catch(e) {
    console.error(e);
    window.DocxViewerEngine.setStatus('Error en vista previa: ' + e.message, 'error');
  }
}

let dvPreviewTimer = null;
function scheduleDocxPreview() {
  if(!previewVisible) return;
  clearTimeout(dvPreviewTimer);
  dvPreviewTimer = setTimeout(generarPreviewEnVivo, 550);
}
// El botón "↻ Actualizar" dentro del visor fuerza una regeneración inmediata.
window.dvOnRefreshRequested = generarPreviewEnVivo;

function hookPreviewListeners() {
  ['nombre','control','division','grupo','fecha','evidencia','materia_manual','docente_manual','comp_manual_num','comp_manual_desc'].forEach(id => {
    const e = el(id); if(e) e.addEventListener('input', scheduleDocxPreview);
  });
  el('asignatura_select').addEventListener('change', scheduleDocxPreview);
}

const _origSelectComp = selectComp;
selectComp = function(num, btn) { _origSelectComp(num, btn); scheduleDocxPreview(); };

const _origToggleInd = toggleInd;
toggleInd = function(letra, full, btn) { _origToggleInd(letra, full, btn); scheduleDocxPreview(); };

function seleccionarMateriaCard(nombre) {
  const select = document.getElementById('asignatura_select');
  if (select) {
    select.value = nombre;
    select.dispatchEvent(new Event('change'));
    showSuccess(`Materia "${nombre}" seleccionada.`);
  }
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  initPWA();
  renderizarSelectorMaterias(); 
  cargarLS();
  el('fecha').value = new Date().toISOString().slice(0,10);
  hookPreviewListeners();
  
  if(window.innerWidth < 900) {
    el('custom_mat_panel').classList.remove('open');
  }

  quill = new Quill('#editor-container', {
    theme: 'snow',
    formats: [
    'header', 
    'bold', 'italic', 'underline', 
    'list', 'bullet'
    ],
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike']
      ]
    }
  });

  quill.on('text-change', () => {
    scheduleDocxPreview();
  });

  el('insertar_texto_adicional').addEventListener('change', function() {
    el('editor_wrapper').style.display = this.checked ? 'block' : 'none';
    scheduleDocxPreview();
  });
});

/* ─────────────────────────────────────────────────────────
   EXPOSICIÓN A window
   Este archivo se carga como <script type="module">, por lo que sus
   funciones NO quedan colgadas de `window` automáticamente. El HTML
   todavía usa atributos onclick="..." (algunos generados dinámicamente
   al pintar tarjetas de materias), así que exponemos aquí, de forma
   explícita y centralizada, únicamente las funciones que el markup
   necesita invocar directamente.

   Si más adelante quieres eliminar este bloque, reemplaza cada
   onclick="..." del HTML (estático y el generado dentro de plantillas
   con innerHTML) por addEventListener() equivalentes.
   ───────────────────────────────────────────────────────── */
window.addModalField = addModalField;
window.closeMateriaModal = closeMateriaModal;
window.descargarPlantillaJSON = descargarPlantillaJSON;
window.generarDocumento = generarDocumento;
window.openMateriaModal = openMateriaModal;
window.saveMateriaModal = saveMateriaModal;
window.toggleCustomPanel = toggleCustomPanel;
window.toggleVistaPrvia = toggleVistaPrvia;
window.borrarMateriaPersonalizada = borrarMateriaPersonalizada;
window.exportarMateriaPersonalizada = exportarMateriaPersonalizada;
window.seleccionarMateriaCard = seleccionarMateriaCard;
window.cargarMateriaDesdeArchivo = cargarMateriaDesdeArchivo;

