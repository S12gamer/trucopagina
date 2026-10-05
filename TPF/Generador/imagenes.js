/**
 * imagenes.js  (EXPERIMENTAL)
 * ─────────────────────────────────────────────────────────
 * Inserta imágenes directamente en el .docx: alineación por imagen (izq./centro/der.),
 * ancho, pie de imagen numerado y ubicación al final o justo después de un párrafo
 * del texto adicional (los párrafos se detectan solos).
 * Se engancha a PizZip.generate, así que sirve tanto para «Generar Documento» como
 * para la vista previa. Depende de window.GF (puente al final de app.js).
 * ─────────────────────────────────────────────────────────
 */
const GF = window.GF;
if (!GF) {
  console.error("[imagenes.js] No se encontró window.GF: app.js no terminó de cargar. Revisa la pestaña Red/Consola; casi siempre es un archivo que falta o no se subió (index.html, app.js, pwa.js, equipos.js, imagenes.js, editor-visual.js, styles.css, sw.js, manifest.webmanifest).");
} else (function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const MAX_IMGS = 20;           // límite de imágenes por documento
  const MAX_PX = 1600;           // lado mayor tras reducir (mantiene el .docx ligero)
  const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";
  const NS_PIC = "http://schemas.openxmlformats.org/drawingml/2006/picture";
  const NS_WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";
  const ALIN = { left: "Izq.", center: "Centro", right: "Der." };

  let items = [];                // {uid,name,ext,mime,bytes,w,h,url,pct,al,after,cap}
  let uid = 0;
  let parrafos = [];             // párrafos con texto detectados en el texto adicional: {idx, n, texto, clave}

  /* ─── interfaz ─── */
  const anchorCard = $("insertar_texto_adicional").closest(".card");
  const card = document.createElement("div");
  card.className = "card";
  card.id = "im_card";
  card.innerHTML = `
    <div class="card-title">⑥ Imágenes <span class="im-badge">Experimental</span></div>
    <div class="field" style="margin-bottom:12px;">
      <label style="display:flex; align-items:center; gap:8px; text-transform:none; cursor:pointer; font-weight:600;">
        <input type="checkbox" id="im_enable" style="width:auto; margin:0; cursor:pointer;">
        <span>¿Insertar imágenes en el documento?</span>
      </label>
    </div>
    <div id="im_body" style="display:none;">
      <div class="im-drop" id="im_drop" tabindex="0" role="button" aria-label="Agregar imágenes">
        📷 Arrastra imágenes aquí, <u>elige archivos</u> o pega una captura con <b>Ctrl+V</b>
        <input type="file" id="im_file" accept="image/*" multiple hidden>
      </div>
      <div class="im-opts">
        <label><input type="checkbox" id="im_num" checked> Numerar los pies de imagen (Figura 1, 2…)</label>
        <label>Ancho al agregar:
          <select id="im_defw"><option value="100">100 %</option><option value="75">75 %</option><option value="50" selected>50 %</option><option value="25">25 %</option></select>
        </label>
        <label>Alineación al agregar:
          <select id="im_defal"><option value="left">Izquierda</option><option value="center" selected>Centro</option><option value="right">Derecha</option></select>
        </label>
      </div>
      <ul id="im_list"></ul>
      <div class="im-sum" id="im_sum"></div>
      <div class="im-hint" id="im_hint" style="display:none;"></div>
      <div class="im-note">Cada imagen puede ir al final del documento o justo después de un párrafo del texto adicional (se detectan solos).
        Se reducen a ${MAX_PX} px para que el archivo no pese de más. No se guardan al recargar la página.</div>
    </div>`;
  anchorCard.after(card);

  const refrescar = () => { try { GF.scheduleDocxPreview(); } catch (e) {} };
  const msg = (t, err) => { try { (err ? GF.showError : GF.showSuccess)(t); } catch (e) { alert(t); } };
  const activo = () => $("im_enable").checked && items.length > 0;
  const kb = n => n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
  const plural = (n, a, b) => n === 1 ? "1 " + a : n + " " + b;

  $("im_enable").addEventListener("change", () => { $("im_body").style.display = $("im_enable").checked ? "block" : "none"; actualizarParrafos(); refrescar(); });
  $("im_num").addEventListener("change", refrescar);

  /* ─── detección de párrafos del texto adicional ─── */
  const decodificar = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const clave = t => t.replace(/\s+/g, " ").trim().slice(0, 40).toLowerCase();
  // Divide el XML del texto adicional en sus <w:p>; devuelve posiciones relativas a ese fragmento.
  function bloquesDe(xml) {
    const out = []; const re = /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g; let m, idx = 0;
    while ((m = re.exec(xml))) {
      let t = "", mt; const rt = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
      while ((mt = rt.exec(m[0]))) t += mt[1];
      t = decodificar(t).replace(/^•\s*/, "").trim();
      out.push({ idx: idx++, ini: m.index, fin: m.index + m[0].length, texto: t });
    }
    return out;
  }
  function textoAdicionalXml() {
    const q = GF.getQuill();
    if (!$("insertar_texto_adicional").checked || !q) return "";
    try { return GF.convertirHtmlAWordXML(q.root.innerHTML) || ""; } catch (e) { return ""; }
  }
  function actualizarParrafos() {
    const antes = JSON.stringify(parrafos.map(p => [p.idx, p.clave]));
    let n = 0;
    parrafos = bloquesDe(textoAdicionalXml()).filter(b => b.texto).map(b => ({ idx: b.idx, n: ++n, texto: b.texto, clave: clave(b.texto) }));
    // Las imágenes siguen a «su» párrafo aunque se agreguen o editen otros
    items.forEach(it => { if (it.after) it.after = resolver(it.after, parrafos); });
    if (JSON.stringify(parrafos.map(p => [p.idx, p.clave])) !== antes) { pintar(); refrescar(); }
    const hint = $("im_hint");
    if (!items.length) hint.style.display = "none";
    else if (!$("insertar_texto_adicional").checked) { hint.style.display = "block"; hint.textContent = "💡 Para colocar imágenes entre párrafos, activa «Texto adicional» (sección ⑤) y escribe el texto: los párrafos aparecerán aquí."; }
    else if (!parrafos.length) { hint.style.display = "block"; hint.textContent = "💡 Aún no hay párrafos en el texto adicional. Escríbelos y podrás ubicar cada imagen después del párrafo que quieras."; }
    else hint.style.display = "none";
  }
  // Busca el párrafo del ancla: primero por su contenido (si cambió de lugar) y luego por posición (si lo están editando)
  function resolver(a, lista) {
    if (!a || !lista.length) return null;
    if (a.i === -1) return { i: -1, clave: "" };
    const porClave = lista.find(p => p.clave === a.clave && p.clave);
    if (porClave) return { i: porClave.idx, clave: porClave.clave };
    const porPos = lista.find(p => p.idx === a.i);
    return porPos ? { i: porPos.idx, clave: porPos.clave } : null;
  }

  /* ─── cargar y reducir imágenes (el canvas también corrige la orientación EXIF) ─── */
  function cargarImagen(file) {
    return new Promise((ok, fail) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); ok(img); };
      img.onerror = () => { URL.revokeObjectURL(url); fail(new Error("no se pudo leer " + (file.name || "la imagen"))); };
      img.src = url;
    });
  }
  async function procesar(file) {
    const img = await cargarImagen(file);
    let w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) throw new Error("imagen sin dimensiones");
    const k = Math.min(1, MAX_PX / Math.max(w, h));
    w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const cx = cv.getContext("2d");
    const jpeg = file.type === "image/jpeg";
    if (jpeg) { cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h); }
    cx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise(r => cv.toBlob(r, jpeg ? "image/jpeg" : "image/png", 0.88));
    if (!blob) throw new Error("no se pudo convertir");
    return {
      uid: ++uid, name: (file.name && file.name !== "image.png" ? file.name : "captura_" + uid + ".png"),
      ext: jpeg ? "jpeg" : "png", mime: jpeg ? "image/jpeg" : "image/png",
      bytes: new Uint8Array(await blob.arrayBuffer()), w, h, url: URL.createObjectURL(blob),
      pct: parseInt($("im_defw").value, 10) || 50, al: $("im_defal").value || "center", after: null, cap: ""
    };
  }
  async function agregar(files) {
    const lista = Array.from(files || []).filter(f => /^image\//.test(f.type));
    if (!lista.length) { msg("Ese archivo no es una imagen.", true); return; }
    let ok = 0, mal = [];
    for (const f of lista) {
      if (items.length >= MAX_IMGS) { msg(`Máximo ${MAX_IMGS} imágenes por documento.`, true); break; }
      try { items.push(await procesar(f)); ok++; } catch (e) { mal.push(e.message); }
    }
    pintar(); actualizarParrafos(); refrescar();
    if (mal.length) msg("No se pudo agregar: " + mal.join("; "), true);
    else if (ok) msg(ok === 1 ? "✓ 1 imagen agregada." : `✓ ${ok} imágenes agregadas.`);
  }

  const drop = $("im_drop"), inp = $("im_file");
  drop.addEventListener("click", () => inp.click());
  drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inp.click(); } });
  inp.addEventListener("change", () => { agregar(inp.files); inp.value = ""; });
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => agregar(e.dataTransfer && e.dataTransfer.files));
  // Pegar capturas con Ctrl+V (no interfiere con el editor de texto adicional)
  document.addEventListener("paste", e => {
    if (!$("im_enable").checked) return;
    if (e.target && e.target.closest && e.target.closest("#editor-container")) return;
    const fs = Array.from((e.clipboardData && e.clipboardData.files) || []).filter(f => /^image\//.test(f.type));
    if (fs.length) { e.preventDefault(); agregar(fs); }
  });

  /* ─── lista ─── */
  const recorte = (t, n) => t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
  function pintar() {
    const ul = $("im_list");
    ul.innerHTML = "";
    items.forEach((it, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <img class="im-thumb" alt="" src="${it.url}">
        <div class="im-meta">
          <div class="im-name"></div>
          <input class="im-cap" type="text" maxlength="160" placeholder="Pie de imagen (opcional)">
          <select class="im-loc" aria-label="Ubicación en el documento"></select>
        </div>
        <div class="im-ctl">
          <select class="im-w" aria-label="Ancho">${[...new Set([100, 75, 50, 25, it.pct])].sort((a, b) => b - a).map(p => `<option value="${p}"${p === it.pct ? " selected" : ""}>${p} % del ancho</option>`).join("")}</select>
          <div class="im-seg" role="group" aria-label="Alineación">${Object.keys(ALIN).map(k => `<button type="button" data-al="${k}" class="${it.al === k ? "on" : ""}" aria-pressed="${it.al === k}" title="Alinear a la ${k === "left" ? "izquierda" : k === "right" ? "derecha" : "mitad"}">${ALIN[k]}</button>`).join("")}</div>
          <div class="im-btns">
            <button type="button" class="im-up" title="Subir"${i === 0 ? " disabled" : ""}>↑</button>
            <button type="button" class="im-dn" title="Bajar"${i === items.length - 1 ? " disabled" : ""}>↓</button>
            <button type="button" class="im-x" title="Quitar">✕</button>
          </div>
        </div>`;
      const nm = li.querySelector(".im-name");
      nm.textContent = `${i + 1}. ${it.name}`;
      const sm = document.createElement("small"); sm.textContent = `${it.w}×${it.h} · ${kb(it.bytes.length)}`; nm.appendChild(sm);

      const loc = li.querySelector(".im-loc");
      const op = (v, t) => { const o = document.createElement("option"); o.value = v; o.textContent = t; return o; };
      loc.appendChild(op("fin", "Al final del documento"));
      if (parrafos.length) loc.appendChild(op("-1", "Al inicio del texto adicional (antes del párrafo 1)"));
      parrafos.forEach(p => loc.appendChild(op(String(p.idx), `Después del párrafo ${p.n}: «${recorte(p.texto, 38)}»`)));
      loc.value = it.after ? String(it.after.i) : "fin";
      if (loc.value !== (it.after ? String(it.after.i) : "fin")) loc.value = "fin";
      loc.disabled = !parrafos.length;
      loc.title = parrafos.length ? "" : "Activa «Texto adicional» y escribe párrafos para poder ubicar la imagen entre ellos";
      loc.addEventListener("change", () => {
        const p = parrafos.find(x => String(x.idx) === loc.value);
        it.after = loc.value === "-1" ? { i: -1, clave: "" } : (p ? { i: p.idx, clave: p.clave } : null); refrescar();
      });

      const cap = li.querySelector(".im-cap"); cap.value = it.cap;
      cap.addEventListener("input", () => { it.cap = cap.value; refrescar(); });
      li.querySelector(".im-w").addEventListener("change", e => { it.pct = parseInt(e.target.value, 10); refrescar(); });
      li.querySelectorAll(".im-seg button").forEach(b => b.addEventListener("click", () => {
        it.al = b.dataset.al;
        li.querySelectorAll(".im-seg button").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
        refrescar();
      }));
      li.querySelector(".im-up").addEventListener("click", () => mover(i, -1));
      li.querySelector(".im-dn").addEventListener("click", () => mover(i, 1));
      li.querySelector(".im-x").addEventListener("click", () => { URL.revokeObjectURL(it.url); items.splice(i, 1); pintar(); actualizarParrafos(); refrescar(); });
      ul.appendChild(li);
    });
    const tot = items.reduce((s, x) => s + x.bytes.length, 0);
    $("im_sum").textContent = items.length ? `${plural(items.length, "imagen", "imágenes")} · ${kb(tot)} en total` : "";
  }
  function mover(i, d) {
    const j = i + d; if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]]; pintar(); refrescar();
  }

  /* ─── inyección en el .docx (se ejecuta justo antes de empaquetar el zip) ─── */
  const xesc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const attrNum = (tag, name, def) => { const m = tag && tag.match(new RegExp("\\bw:" + name + '="(-?\\d+)"')); return m ? parseInt(m[1], 10) : def; };

  function puntoDeInsercion(xml) {
    const body = xml.lastIndexOf("</w:body>"), s = xml.lastIndexOf("<w:sectPr");
    if (body < 0) return -1;
    if (s >= 0 && s < body) { const resto = xml.slice(s, body); if (!/<w:p[ >]/.test(resto)) return s; }
    return body;
  }
  function areaUtil(xml) {
    const s = xml.lastIndexOf("<w:sectPr"), sec = s >= 0 ? xml.slice(s) : "";
    const sz = (sec.match(/<w:pgSz\b[^>]*>/) || [])[0], mg = (sec.match(/<w:pgMar\b[^>]*>/) || [])[0];
    const W = attrNum(sz, "w", 12240), H = attrNum(sz, "h", 15840);
    const L = attrNum(mg, "left", 1440), R = attrNum(mg, "right", 1440), T = attrNum(mg, "top", 1440), B = attrNum(mg, "bottom", 1440);
    return { w: Math.max(2000, W - L - R) * 635, h: Math.max(2000, H - T - B) * 635 };   // en EMU (1 twip = 635 EMU)
  }

  function parrafoImagen(it, n, rid, area, conPie, mk) {
    let cx = Math.round(area.w * it.pct / 100), cy = Math.round(cx * it.h / it.w);
    const maxH = Math.round(area.h * 0.85);
    if (cy > maxH) { cx = Math.round(cx * maxH / cy); cy = maxH; }
    const id = 90000 + n, jc = ALIN[it.al] ? it.al : "center";
    return `<w:p><w:pPr>${conPie ? "<w:keepNext/>" : ""}<w:spacing w:before="200" w:after="${conPie ? 60 : 200}"/><w:jc w:val="${jc}"/></w:pPr>${mk || ""}<w:r><w:drawing>`
      + `<wp:inline xmlns:wp="${NS_WP}" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>`
      + `<wp:docPr id="${id}" name="Imagen ${n}" descr="${xesc(it.cap || it.name)}"/>`
      + `<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="${NS_A}" noChangeAspect="1"/></wp:cNvGraphicFramePr>`
      + `<a:graphic xmlns:a="${NS_A}"><a:graphicData uri="${NS_PIC}"><pic:pic xmlns:pic="${NS_PIC}">`
      + `<pic:nvPicPr><pic:cNvPr id="${id}" name="${xesc(it.name)}"/><pic:cNvPicPr/></pic:nvPicPr>`
      + `<pic:blipFill><a:blip xmlns:r="${NS_R}" r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`
      + `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>`
      + `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  }
  function parrafoPie(texto, al, mk) {
    return `<w:p><w:pPr><w:spacing w:before="0" w:after="200"/><w:jc w:val="${ALIN[al] ? al : "center"}"/></w:pPr>${mk || ""}<w:r><w:rPr><w:rFonts w:ascii="Gotham Book" w:hAnsi="Gotham Book" w:cs="Gotham Book"/><w:i/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${xesc(texto)}</w:t></w:r></w:p>`;
  }

  // El texto adicional que la app acaba de insertar (para saber dónde están sus párrafos dentro del document.xml)
  let ultimoTexto = "";
  GF.wrap("insertarTextoEnXML", _ins => function (xml, textoXml) { ultimoTexto = textoXml || ""; return _ins.apply(this, arguments); });

  function inyectar(zip) {
    const docF = zip.file("word/document.xml");
    if (!docF) return;
    let xml = docF.asText();
    const fin0 = puntoDeInsercion(xml);
    if (fin0 < 0) return;

    // 1) dónde están los párrafos del texto adicional dentro del documento
    const marcar = !!(window.EditorVisual && window.EditorVisual.activo);   // marcadores ocultos solo para el editor visual
    let bm = 7000;
    const marca = nombre => { bm++; return `<w:bookmarkStart w:id="${bm}" w:name="${nombre}"/><w:bookmarkEnd w:id="${bm}"/>`; };
    let baseTxt = ultimoTexto ? xml.lastIndexOf(ultimoTexto) : -1;
    let textoUsado = ultimoTexto;
    if (marcar && baseTxt >= 0) {
      let k = 0;
      textoUsado = ultimoTexto.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, p => p.replace("</w:pPr>", () => "</w:pPr>" + marca("_tm_txt_" + (k++))));
      xml = xml.slice(0, baseTxt) + textoUsado + xml.slice(baseTxt + ultimoTexto.length);
    }
    const fin = marcar ? puntoDeInsercion(xml) : fin0;
    const bloques = baseTxt >= 0 ? bloquesDe(textoUsado).filter(b => b.texto).map(b => Object.assign(b, { clave: clave(b.texto) })) : [];

    // 2) a qué lugar va cada imagen (según el contenido ACTUAL del texto) y orden real en el documento
    const plan = items.map((it, k) => {
      const a = it.after ? resolver(it.after, bloques.map(b => ({ idx: b.idx, clave: b.clave }))) : null;
      const b = a ? (a.i === -1 ? { idx: -1, fin: 0 } : bloques.find(x => x.idx === a.i)) : null;
      return { it, k, pos: b ? baseTxt + b.fin : fin, orden: b ? b.idx : Infinity };
    });
    plan.sort((x, y) => (x.orden === y.orden ? x.k - y.k : (x.orden < y.orden ? -1 : 1)));

    // 3) tipos de contenido
    const ctF = zip.file("[Content_Types].xml");
    if (ctF) {
      let ct = ctF.asText(), add = "";
      [...new Set(items.map(x => x.ext))].forEach(e => { if (!new RegExp('Extension="' + e + '"', "i").test(ct)) add += `<Default Extension="${e}" ContentType="${e === "png" ? "image/png" : "image/jpeg"}"/>`; });
      if (add) { ct = ct.replace(/(<Types\b[^>]*>)/, "$1" + add); zip.file("[Content_Types].xml", ct); }
    }
    // 4) relaciones + archivos de imagen + XML en su lugar
    const relF = zip.file("word/_rels/document.xml.rels");
    if (!relF) return;
    let rels = relF.asText(), relsNuevas = "", num = 0;
    const area = areaUtil(xml), porPos = new Map();
    plan.forEach(({ it, k, pos }, orden) => {
      const rid = "rIdTMImg" + (k + 1), ruta = `media/tm_img${k + 1}.${it.ext}`;
      zip.file("word/" + ruta, it.bytes, { binary: true });
      relsNuevas += `<Relationship Id="${rid}" Type="${NS_R}/image" Target="${ruta}"/>`;
      const pie = (it.cap || "").trim();
      let b = parrafoImagen(it, k + 1, rid, area, !!pie, marcar ? marca("_tm_img_" + it.uid) : "");
      if (pie) { num++; b += parrafoPie(($("im_num").checked ? `Figura ${num}. ` : "") + pie, it.al, marcar ? marca("_tm_cap_" + it.uid) : ""); }
      porPos.set(pos, (porPos.get(pos) || "") + b);
    });
    rels = rels.replace("</Relationships>", relsNuevas + "</Relationships>");
    zip.file("word/_rels/document.xml.rels", rels);
    [...porPos.keys()].sort((a, b) => b - a).forEach(pos => { xml = xml.slice(0, pos) + porPos.get(pos) + xml.slice(pos); });
    zip.file("word/document.xml", xml);
  }

  // Se engancha al empaquetado: así sirve tanto para «Generar documento» como para la vista previa.
  if (window.PizZip && PizZip.prototype && typeof PizZip.prototype.generate === "function") {
    const _gen = PizZip.prototype.generate;
    PizZip.prototype.generate = function () {
      if (activo() && !this.__imInyectado && this.file("word/document.xml")) {
        try { inyectar(this); this.__imInyectado = true; }
        catch (e) { console.error("[Imágenes] No se pudieron insertar:", e); try { GF.showError("No se pudieron insertar las imágenes: " + e.message); } catch (_) {} }
      }
      return _gen.apply(this, arguments);
    };
  } else {
    console.warn("[Imágenes] PizZip no está disponible; la función no se activará.");
  }

  /* ─── seguir al editor de texto adicional (Quill se crea cuando termina de cargar la página) ─── */
  let tmr = null;
  const diferir = () => { clearTimeout(tmr); tmr = setTimeout(actualizarParrafos, 250); };
  function enlazarEditor() {
    $("insertar_texto_adicional").addEventListener("change", actualizarParrafos);
    const q = GF.getQuill();
    if (q && q.on) q.on("text-change", diferir);
    actualizarParrafos();
  }
  // Quill se crea en el DOMContentLoaded de app.js; GF avisa con «gf:ready» cuando ya existe.
  if (GF.ready) enlazarEditor(); else window.addEventListener("gf:ready", enlazarEditor, { once: true });

  /* ─── utilidades para el editor visual ─── */
  // Las mismas «unidades» (un párrafo de Word cada una) que genera convertirHtmlAWordXML a partir de Quill.
  function unidadesTexto() {
    const q = GF.getQuill();
    if (!q) return null;
    const doc = new DOMParser().parseFromString(q.root.innerHTML, "text/html"), units = [];
    doc.body.childNodes.forEach(b => {
      if (b.nodeType !== 1) return;
      if (b.nodeName === "UL" || b.nodeName === "OL") b.childNodes.forEach(li => { if (li.nodeType === 1 && li.nodeName === "LI") units.push({ el: li, li: true, parent: b }); });
      else units.push({ el: b, li: false, parent: null });
    });
    return { doc, units };
  }
  function aplicarUnidades(doc) {
    const html = doc.body.innerHTML;
    const q = GF.getQuill();
    let delta; try { delta = q.clipboard.convert({ html }); } catch (e) { delta = q.clipboard.convert(html); }
    q.setContents(delta, "user");
  }
  window.ImagenesDoc = { items: () => items, parrafos: () => parrafos, inyectar, actualizarParrafos, pintar, refrescar, agregar, unidadesTexto, aplicarUnidades, resolver };   // también sirve para depuración
})();
