/* Código reutilizado de Portafolios PWA */
const PX_A_PT = 0.75;
const CALIDAD_JPEG = 0.92;
  /* ═══════════════ Escritor de PDF mínimo ═══════════════ */
  const enc = new TextEncoder();
  const ascii = s => enc.encode(s);
  const num = n => (Math.round(n * 100) / 100).toString();

  // Texto «WinAnsi» (la codificación de la fuente estándar Helvetica) con escapes de PDF
  const CP1252 = { 0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F };
  function cadenaPdf(texto) {
    const bytes = [];
    for (const ch of String(texto).normalize("NFC")) {
      const cp = ch.codePointAt(0);
      let b;
      if (cp === 0xA0) b = 0x20;
      else if (cp < 0x20) b = 0x20;
      else if (cp < 0x80 || (cp >= 0xA1 && cp <= 0xFF)) b = cp;
      else b = CP1252[cp] || 0x3F;
      if (b === 0x28 || b === 0x29 || b === 0x5C) bytes.push(0x5C);   // ( ) \
      bytes.push(b);
    }
    return Uint8Array.from(bytes);
  }
  // Cadena UTF-16BE en hexadecimal (para el título del documento, con acentos)
  function hexUtf16(texto) {
    let h = "FEFF";
    for (let i = 0; i < texto.length; i++) h += texto.charCodeAt(i).toString(16).padStart(4, "0");
    return "<" + h.toUpperCase() + ">";
  }

  // Mide con Arial (mismas métricas que Helvetica) para ajustar el ancho del texto invisible
  const medidor = document.createElement("canvas").getContext("2d");
  function anchoNatural(t) {
    medidor.font = `${t.bold ? "bold " : ""}${t.size}px Arial, Helvetica, "Liberation Sans", sans-serif`;
    return medidor.measureText(t.text).width;
  }

  function capaTexto(textos, hPt) {
    const partes = [];
    for (const t of textos) {
      if (!t.text || !t.text.trim()) continue;
      const natural = anchoNatural(t);
      let tz = natural > 0 && t.w > 0 ? (t.w / natural) * 100 : 100;
      tz = Math.max(20, Math.min(400, tz));
      const x = t.x * PX_A_PT, y = hPt - (t.y + t.size * 0.8) * PX_A_PT, size = Math.max(1, t.size * PX_A_PT);
      partes.push(ascii(`BT\n3 Tr\n/${t.bold ? "F2" : "F1"} ${num(size)} Tf\n${num(tz)} Tz\n1 0 0 1 ${num(x)} ${num(y)} Tm\n(`));
      partes.push(cadenaPdf(t.text));
      partes.push(ascii(") Tj\nET\n"));
    }
    return partes;
  }

  function unir(partes) {
    let n = 0; partes.forEach(p => { n += p.length; });
    const out = new Uint8Array(n); let o = 0;
    partes.forEach(p => { out.set(p, o); o += p.length; });
    return out;
  }

  /* páginas: [{ jpeg:Uint8Array, wPx, hPx, wPt, hPt, texts:[] }]  →  Uint8Array con el PDF */
  function construirPdf(paginas, titulo) {
    const chunks = [], offs = [];
    let largo = 0;
    const push = b => { chunks.push(b); largo += b.length; };
    const obj = (n, partes) => { offs[n] = largo; push(ascii(`${n} 0 obj\n`)); partes.forEach(push); push(ascii("\nendobj\n")); };

    push(ascii("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"));
    const total = 5 + paginas.length * 3;
    const kids = paginas.map((_, i) => `${6 + i * 3} 0 R`).join(" ");
    const ahora = new Date(), p2 = n => String(n).padStart(2, "0");
    const fecha = `D:${ahora.getFullYear()}${p2(ahora.getMonth() + 1)}${p2(ahora.getDate())}${p2(ahora.getHours())}${p2(ahora.getMinutes())}${p2(ahora.getSeconds())}`;

    obj(1, [ascii("<< /Type /Catalog /Pages 2 0 R >>")]);
    obj(2, [ascii(`<< /Type /Pages /Kids [${kids}] /Count ${paginas.length} >>`)]);
    obj(3, [ascii("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")]);
    obj(4, [ascii("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")]);
    obj(5, [ascii(`<< /Title ${hexUtf16(titulo)} /Producer (Generador de Formatos) /CreationDate (${fecha}) >>`)]);

    paginas.forEach((p, i) => {
      const nPag = 6 + i * 3, nCont = nPag + 1, nImg = nPag + 2;
      obj(nPag, [ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(p.wPt)} ${num(p.hPt)}] /Resources << /XObject << /Im0 ${nImg} 0 R >> /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${nCont} 0 R >>`)]);
      const contenido = unir([ascii(`q\n${num(p.wPt)} 0 0 ${num(p.hPt)} 0 0 cm\n/Im0 Do\nQ\n`), ...capaTexto(p.texts, p.hPt)]);
      obj(nCont, [ascii(`<< /Length ${contenido.length} >>\nstream\n`), contenido, ascii("\nendstream")]);
      obj(nImg, [ascii(`<< /Type /XObject /Subtype /Image /Width ${p.wPx} /Height ${p.hPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`), p.jpeg, ascii("\nendstream")]);
    });

    const xref = largo;
    let tabla = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
    for (let n = 1; n <= total; n++) tabla += String(offs[n]).padStart(10, "0") + " 00000 n \n";
    push(ascii(tabla + `trailer\n<< /Size ${total + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
    return unir(chunks);
  }

  const canvasAJpeg = cv => new Promise((ok, fail) => cv.toBlob(async b => {
    if (!b) return fail(new Error("el navegador no pudo codificar la página (¿demasiado grande?)"));
    ok(new Uint8Array(await b.arrayBuffer()));
  }, "image/jpeg", CALIDAD_JPEG));
async function bitmapDe(file) {
  try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch (e) { return await createImageBitmap(file); }
}
function cargarHeic() {
  if (window.heic2any) return Promise.resolve();
  return new Promise((ok, fail) => {
    const sc = document.createElement('script');
    sc.src = 'libs/heic2any.min.js';
    sc.onload = ok; sc.onerror = () => fail(new Error('no se pudo cargar el conversor HEIC'));
    document.head.appendChild(sc);
  });
}
/* Valida/convierte una foto. Los HEIC/HEIF que el navegador no sabe abrir (Windows, Chrome…) se pasan a JPEG. */
async function prepararFoto(file) {
  try { const bmp = await bitmapDe(file); const r = { file, w: bmp.width, h: bmp.height }; if (bmp.close) bmp.close(); return r; }
  catch (e) {
    if (!/hei[cf]/i.test(file.type + ' ' + file.name)) throw new Error('formato de imagen no compatible');
    await cargarHeic();
    const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    const blob = Array.isArray(out) ? out[0] : out;
    const f2 = new File([blob], file.name.replace(/\.hei[cf]$/i, '') + '.jpg', { type: 'image/jpeg' });
    const bmp = await bitmapDe(f2); const r = { file: f2, w: bmp.width, h: bmp.height }; if (bmp.close) bmp.close();
    return r;
  }
}
async function imagenAJpeg(file) {
  const bmp = await bitmapDe(file);
  const MAX = 3200, esc = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * esc)), h = Math.max(1, Math.round(bmp.height * esc));
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(bmp, 0, 0, w, h);
  if (bmp.close) bmp.close();
  const bytes = await canvasAJpeg(cv);
  cv.width = cv.height = 0;
  return { bytes, w, h };
}
const PDFJS_URL = 'libs/pdf.min.js';
const PDFJS_WORKER = 'libs/pdf.worker.min.js';
const DPI_DOCX = 144;
function cargarPdfJs() {
  if (window.pdfjsLib) return Promise.resolve();
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = PDFJS_URL;
    s.onload = () => { pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER; ok(); };
    s.onerror = () => fail(new Error('no se pudo cargar pdf.js (archivo libs/pdf.min.js no disponible)'));
    document.head.appendChild(s);
  });
}

async function abrirPdfJs(bytes, etiqueta) {
  try { return await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise; }
  catch (e) { throw new Error(`no se pudo abrir «${etiqueta}» (¿dañado o con contraseña?)`); }
}
async function rasterizarPaginas(doc, desde, hasta, etiqueta) {
  const paginas = [];
  for (let i = desde; i <= hasta; i++) {
    const page = await doc.getPage(i);
    const v1 = page.getViewport({ scale: 1 }), v = page.getViewport({ scale: DPI_DOCX / 72 });
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(v.width); cv.height = Math.ceil(v.height);
    const cx = cv.getContext('2d');
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
    await page.render({ canvasContext: cx, viewport: v }).promise;
    paginas.push({ jpeg: await canvasAJpeg(cv), wPt: v1.width, hPt: v1.height });
    cv.width = cv.height = 0; page.cleanup();
    showLoading(`Convirtiendo «${etiqueta}» a imágenes (${i}/${doc.numPages})…`);
    await sleep(0);
  }
  return paginas;
}
async function rasterizarPdf(bytes, etiqueta) {
  const doc = await abrirPdfJs(bytes, etiqueta);
  try { return await rasterizarPaginas(doc, 1, doc.numPages, etiqueta); } finally { await doc.destroy(); }
}
const NS_W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const REL_IMG = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';
const REL_HDR = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header';
const REL_FTR = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer';
const emu = pt => Math.round(pt * 12700);

function forzarNuevaPagina(sect) {
  if (/<w:type\b[^>]*\/>/.test(sect)) return sect.replace(/<w:type\b[^>]*\/>/, '<w:type w:val="nextPage"/>');
  return sect.replace(/<w:pgSz\b/, '<w:type w:val="nextPage"/><w:pgSz');
}
function sectPagina(wPt, hPt) {
  const w = Math.round(wPt * 20), h = Math.round(hPt * 20);
  return '<w:sectPr><w:headerReference w:type="default" r:id="rIdPfH"/><w:footerReference w:type="default" r:id="rIdPfF"/>' +
    `<w:type w:val="nextPage"/><w:pgSz w:w="${w}" w:h="${h}"${w > h ? ' w:orient="landscape"' : ''}/>` +
    '<w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/><w:cols w:space="720"/></w:sectPr>';
}
function parrafoImagen(n, wPt, hPt) {
  const cx = emu(wPt), cy = emu(hPt);
  return '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/></w:pPr><w:r><w:drawing>' +
    '<wp:anchor xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="' + (251650000 + n) + '" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1">' +
    '<wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH><wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>' +
    `<wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/><wp:docPr id="${9000 + n}" name="Página ${n}"/><wp:cNvGraphicFramePr/>` +
    '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
    `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${9000 + n}" name="pagina_${n}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr>` +
    `<pic:blipFill><a:blip r:embed="rIdPf${n}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>` +
    '</a:graphicData></a:graphic></wp:anchor></w:drawing></w:r></w:p>';
}

function nuevoDocx() {
  const st = { zip: new PizZip(obtenerPlantilla().slice(0)), secciones: [], rels: [], n: 0 };
  st.agregarRasters = paginas => paginas.forEach(pg => {
    st.n++;
    st.zip.file(`word/media/pf_${st.n}.jpeg`, pg.jpeg);
    st.rels.push(`<Relationship Id="rIdPf${st.n}" Type="${REL_IMG}" Target="media/pf_${st.n}.jpeg"/>`);
    st.secciones.push({ xml: parrafoImagen(st.n, pg.wPt, pg.hPt), sect: sectPagina(pg.wPt, pg.hPt) });
  });
  return st;
}
function cerrarDocx(st) {
  const { zip, secciones, rels } = st;
  if (!secciones.length) throw new Error('el portafolio quedó sin páginas.');
  showLoading('Armando el documento Word…');
  let cuerpo = '';
  secciones.forEach((s, i) => {
    cuerpo += s.xml;
    cuerpo += (i < secciones.length - 1)
      ? `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/>${s.sect}</w:pPr></w:p>`
      : s.sect;
  });
  zip.file('word/document.xml', plantillaInfo.head + cuerpo + plantillaInfo.tail);
  zip.file('word/headerPf.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ${NS_W}><w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p></w:hdr>`);
  zip.file('word/footerPf.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ${NS_W}><w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p></w:ftr>`);
  const rl = rels.concat([`<Relationship Id="rIdPfH" Type="${REL_HDR}" Target="headerPf.xml"/>`, `<Relationship Id="rIdPfF" Type="${REL_FTR}" Target="footerPf.xml"/>`]);
  const relsPath = 'word/_rels/document.xml.rels';
  zip.file(relsPath, zip.file(relsPath).asText().replace('</Relationships>', rl.join('') + '</Relationships>'));
  let ct = zip.file('[Content_Types].xml').asText();
  if (!/Extension="jpeg"/i.test(ct)) ct = ct.replace(/<Default /, '<Default Extension="jpeg" ContentType="image/jpeg"/><Default ');
  ct = ct.replace('</Types>',
    '<Override PartName="/word/headerPf.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' +
    '<Override PartName="/word/footerPf.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>');
  zip.file('[Content_Types].xml', ct);
  showLoading('Comprimiendo el archivo…');
  return zip.generate({ type: 'blob', mimeType: MIME_DOCX, compression: 'DEFLATE', compressionOptions: { level: 3 } });
}