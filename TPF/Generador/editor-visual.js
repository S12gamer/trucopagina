/**
 * editor-visual.js
 * ─────────────────────────────────────────────────────────
 * «Editor visual»: muestra TODAS las páginas del documento (con el marco de la
 * plantilla) en pantalla completa; el texto adicional se edita con un clic y las
 * imágenes se seleccionan, se arrastran entre párrafos y cambian de alineación /
 * tamaño. Se apoya en el motor de vista previa (DocxViewerEngine) y en imagenes.js.
 * Depende de window.GF (puente al final de app.js).
 * ─────────────────────────────────────────────────────────
 */
const GF = window.GF;
if (!GF) {
  console.error("[editor-visual.js] No se encontró window.GF: app.js no terminó de cargar. Revisa la pestaña Red/Consola; casi siempre es un archivo que falta o no se subió (index.html, app.js, pwa.js, equipos.js, imagenes.js, editor-visual.js, styles.css, sw.js, manifest.webmanifest).");
} else (function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const IM = () => window.ImagenesDoc;
  const E = window.EditorVisual = { activo: false };
  const ALN = { left: "Izq.", center: "Centro", right: "Der." };

  let layout = null, sel = null, editing = null, drag = null, resize = null;
  let fitPendiente = false, zoomPrev = 1, panelAbierto = false, pendingEdit = null, tBusy = null;
  let hostCanvas = null, nextSib = null;

  /* ─── estructura ─── */
  const ov = document.createElement("div");
  ov.id = "ve_overlay";
  ov.innerHTML = `
    <div class="ve-bar">
      <strong>✎ Editor visual</strong>
      <span class="ve-sub">Haz clic en un texto para editarlo · arrastra una imagen y suéltala entre dos párrafos · el lado donde la sueltes define su alineación</span>
      <span class="ve-state" id="ve_state"></span>
      <button type="button" id="ve_zout" title="Alejar">−</button><span class="ve-zl" id="ve_zl">100%</span><button type="button" id="ve_zin" title="Acercar">+</button>
      <button type="button" id="ve_fit">Ajustar</button>
      <button type="button" class="ve-done" id="ve_close">Listo</button>
    </div>
    <div class="ve-body">
      <div class="ve-scroll" id="ve_scroll">
        <div class="ve-stage" id="ve_stage"><div class="ve-layer" id="ve_layer"></div></div>
        <div class="ve-msg" id="ve_msg">Preparando las páginas…</div>
      </div>
      <aside class="ve-side" id="ve_side"></aside>
    </div>
    <input type="file" id="ve_file" accept="image/*" multiple hidden>`;
  document.body.appendChild(ov);
  const stage = $("ve_stage"), layer = $("ve_layer"), scroll = $("ve_scroll"), side = $("ve_side");

  const itemDe = uid => IM().items().find(x => x.uid === uid) || null;
  const estado = (t, busy) => { const s = $("ve_state"); s.textContent = t || ""; s.classList.toggle("busy", !!busy); };
  function ocupado() {
    layer.classList.add("busy"); estado("Actualizando…", true);
    clearTimeout(tBusy); tBusy = setTimeout(() => { layer.classList.remove("busy"); estado(""); }, 5000);
  }
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* ─── abrir / cerrar ─── */
  function abrir() {
    if (E.activo || !window.DocxViewerEngine) return;
    if (!$("asignatura_select").value) { try { GF.showError("Elige primero una materia para ver el documento."); } catch (e) { alert("Elige primero una materia."); } return; }
    E.activo = true; sel = null; editing = null; layout = null;
    const cv = DocxViewerEngine.getCanvas();
    zoomPrev = DocxViewerEngine.getZoom();
    hostCanvas = cv.parentNode; nextSib = cv.nextSibling;
    stage.insertBefore(cv, layer);
    ov.classList.add("open"); document.body.classList.add("ve-open");
    $("ve_msg").style.display = "flex"; $("ve_msg").textContent = "Preparando las páginas…";
    layer.innerHTML = ""; inspector();
    fitPendiente = true;
    window.dvOnRendered = alRenderizar;
    if (!GF.previewVisible()) { GF.toggleVistaPrvia(); panelAbierto = true; } else GF.generarPreviewEnVivo();
  }
  function cerrar() {
    if (!E.activo) return;
    cerrarEdicion(true);
    E.activo = false; window.dvOnRendered = null;
    const cv = DocxViewerEngine.getCanvas();
    if (hostCanvas) hostCanvas.insertBefore(cv, nextSib && nextSib.parentNode === hostCanvas ? nextSib : null);
    ov.classList.remove("open"); document.body.classList.remove("ve-open");
    DocxViewerEngine.setZoom(zoomPrev);
    if (panelAbierto) { panelAbierto = false; GF.toggleVistaPrvia(); } else GF.generarPreviewEnVivo();   // regenera sin marcadores
  }
  $("ve_close").addEventListener("click", cerrar);
  $("ve_zin").addEventListener("click", () => layout && DocxViewerEngine.setZoom(layout.zoom + 0.1));
  $("ve_zout").addEventListener("click", () => layout && DocxViewerEngine.setZoom(layout.zoom - 0.1));
  $("ve_fit").addEventListener("click", () => { fitPendiente = true; if (layout) DocxViewerEngine.setZoom(layout.zoom + 0.0001); });

  // Botones de entrada: barra del visor y tarjeta ⑥
  const tb = document.createElement("button");
  tb.type = "button"; tb.className = "dv-btn"; tb.id = "ve_open_tb"; tb.textContent = "✎ Editor visual";
  const rb = $("dv_refreshBtn"); if (rb) rb.after(tb);
  tb.addEventListener("click", abrir);
  const cardIm = $("im_card");
  if (cardIm) {
    const w = document.createElement("div");
    w.style.cssText = "margin:-2px 0 14px;";
    w.innerHTML = '<button type="button" class="ve-open-btn" id="ve_open_card">✎ Abrir editor visual (ver páginas, editar texto, mover imágenes)</button>';
    cardIm.querySelector(".card-title").after(w);
    $("ve_open_card").addEventListener("click", abrir);
  }

  /* ─── al terminar cada render del visor ─── */
  function alRenderizar() {
    if (!E.activo) return;
    const L = DocxViewerEngine.getLayout();
    if (fitPendiente) {
      fitPendiente = false;
      const disponible = scroll.clientWidth - 48;
      const z = Math.max(0.4, Math.min(1.3, disponible / L.pageW));
      if (Math.abs(z - L.zoom) > 0.02) { DocxViewerEngine.setZoom(z); return; }
    }
    layout = L;
    $("ve_msg").style.display = "none";
    $("ve_zl").textContent = Math.round(L.zoom * 100) + "%";
    clearTimeout(tBusy); layer.classList.remove("busy"); estado("✓ Actualizado");
    construirCapa();
    if (!side.contains(document.activeElement)) inspector();
    if (pendingEdit != null) { const k = pendingEdit; pendingEdit = null; empezarEdicion(k, null, true); }
    if (sel != null) { const h = layer.querySelector('.ve-img[data-uid="' + sel + '"]'); if (h && !drag) h.scrollIntoView({ block: "nearest", inline: "nearest" }); }
  }

  /* ─── geometría ─── */
  function geo() {
    const z = layout.zoom, tops = []; let acc = 0;
    layout.pages.forEach(p => { tops.push(acc); acc += p.h + layout.gap; });
    return { z, X: x => x * z, Y: (pg, y) => (tops[pg] + y) * z, cL: layout.mL, cW: layout.pageW - layout.mL - layout.mR };
  }
  function rectsDe(tipo) {
    return layout.rects.map(r => { const m = /^_tm_(img|cap|txt)_(\d+)$/.exec(r.tm); return m && m[1] === tipo ? Object.assign({ n: +m[2] }, r) : null; }).filter(Boolean);
  }

  function construirCapa() {
    const guardado = editing && editing.box ? editing.box : null;
    if (guardado) guardado.remove();
    layer.innerHTML = "";
    const g = geo();
    rectsDe("txt").forEach(r => {
      const d = document.createElement("div");
      d.className = "ve-hit ve-txt"; d.dataset.k = r.n;
      d.style.cssText = `left:${g.X(g.cL) - 4}px; top:${g.Y(r.page, r.y0) - 2}px; width:${g.X(g.cW) + 8}px; height:${(r.y1 - r.y0) * g.z + 4}px;`;
      layer.appendChild(d);
    });
    rectsDe("cap").forEach(r => {
      const d = document.createElement("div");
      d.className = "ve-hit ve-cap"; d.dataset.uid = r.n;
      d.style.cssText = `left:${g.X(g.cL)}px; top:${g.Y(r.page, r.y0) - 2}px; width:${g.X(g.cW)}px; height:${(r.y1 - r.y0) * g.z + 4}px;`;
      layer.appendChild(d);
    });
    rectsDe("img").forEach(r => {
      if (!r.img) return;
      const d = document.createElement("div");
      d.className = "ve-hit ve-img" + (sel === r.n ? " sel" : ""); d.dataset.uid = r.n;
      d.style.cssText = `left:${g.X(r.img.x)}px; top:${g.Y(r.page, r.img.y)}px; width:${r.img.w * g.z}px; height:${r.img.h * g.z}px;`;
      if (sel === r.n) d.appendChild(Object.assign(document.createElement("div"), { className: "ve-handle" }));
      layer.appendChild(d);
    });
    if (guardado) {
      const r = rectsDe("txt").filter(x => x.n === editing.k).sort((a, c) => a.page - c.page || a.y0 - c.y0)[0];
      if (r) { guardado.style.left = (g.X(g.cL) - 4) + "px"; guardado.style.top = (g.Y(r.page, r.y0) - 2) + "px"; guardado.style.width = (g.X(g.cW) + 8) + "px"; }
      layer.appendChild(guardado);
    }
  }

  /* ─── selección ─── */
  function seleccionar(uid) {
    if (sel === uid) return;
    sel = uid;
    layer.querySelectorAll(".ve-img").forEach(el => {
      const on = +el.dataset.uid === uid;
      el.classList.toggle("sel", on);
      const h = el.querySelector(".ve-handle");
      if (on && !h) el.appendChild(Object.assign(document.createElement("div"), { className: "ve-handle" }));
      if (!on && h) h.remove();
    });
    inspector();
  }

  /* ─── puntero: texto, imágenes, arrastre y tamaño ─── */
  layer.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    const t = e.target;
    if (t.classList.contains("ve-handle")) {
      const host = t.parentNode, it = itemDe(+host.dataset.uid); if (!it) return;
      e.preventDefault(); cerrarEdicion(true);
      const g = geo();
      resize = { uid: it.uid, el: host, sx: e.clientX, w0: host.offsetWidth, ratio: it.h / it.w, max: g.X(g.cW), pct: it.pct, chip: null };
      t.setPointerCapture(e.pointerId); return;
    }
    const h = t.closest(".ve-img, .ve-cap");
    if (h) {
      e.preventDefault(); cerrarEdicion(true);
      const uid = +h.dataset.uid; seleccionar(uid);
      if (h.classList.contains("ve-img")) {
        drag = { uid, el: h, sx: e.clientX, sy: e.clientY, moved: false, tgt: null, ghost: null, guide: null, chip: null };
        h.setPointerCapture(e.pointerId);
      }
      return;
    }
    if (t === layer) { cerrarEdicion(true); if (sel != null) { sel = null; layer.querySelectorAll(".ve-img").forEach(el => { el.classList.remove("sel"); const x = el.querySelector(".ve-handle"); if (x) x.remove(); }); inspector(); } }
  });
  layer.addEventListener("click", e => {
    const h = e.target.closest(".ve-txt");
    if (h && !drag) empezarEdicion(+h.dataset.k, e);
  });
  layer.addEventListener("pointermove", e => {
    if (resize) return moverResize(e);
    if (drag) moverDrag(e);
  });
  layer.addEventListener("pointerup", e => {
    if (resize) return soltarResize();
    if (drag) soltarDrag();
  });
  layer.addEventListener("pointercancel", () => { limpiarDrag(); resize = null; });

  function chipEn(x, y, txt, ref) {
    let c = ref;
    if (!c) { c = document.createElement("div"); c.className = "ve-chip"; layer.appendChild(c); }
    c.textContent = txt; c.style.left = Math.max(4, x) + "px"; c.style.top = Math.max(2, y) + "px";
    return c;
  }

  function candidatos() {
    const g = geo(), cand = [], ps = IM().parrafos();
    const porK = new Map();
    rectsDe("txt").forEach(r => { const a = porK.get(r.n) || { first: r, last: r }; if (r.page < a.first.page || (r.page === a.first.page && r.y0 < a.first.y0)) a.first = r; if (r.page > a.last.page || (r.page === a.last.page && r.y1 > a.last.y1)) a.last = r; porK.set(r.n, a); });
    const ks = [...porK.keys()].sort((a, b) => a - b);
    if (ks.length) cand.push({ y: g.Y(porK.get(ks[0]).first.page, porK.get(ks[0]).first.y0) - 4, anchor: { i: -1, clave: "" }, label: "Al inicio del texto adicional" });
    ks.forEach(k => {
      const p = ps.find(x => x.idx === k); if (!p) return;
      cand.push({ y: g.Y(porK.get(k).last.page, porK.get(k).last.y1) + 4, anchor: { i: p.idx, clave: p.clave }, label: "Después del párrafo " + p.n });
    });
    let maxY = 0;
    layout.rects.forEach(r => { if (/^_tm_/.test(r.tm)) maxY = Math.max(maxY, g.Y(r.page, r.y1)); });
    if (maxY) cand.push({ y: maxY + 4, anchor: null, label: "Al final del documento" });
    return cand;
  }

  function moverDrag(e) {
    const d = drag, it = itemDe(d.uid); if (!it) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved) { if (Math.hypot(dx, dy) < 5) return; d.moved = true; d.el.classList.add("dragging"); d.cand = candidatos(); }
    const g = geo(), sr = stage.getBoundingClientRect();
    const px = e.clientX - sr.left, py = e.clientY - sr.top;
    if (!d.ghost) {
      d.ghost = document.createElement("div"); d.ghost.className = "ve-ghost";
      d.ghost.style.width = d.el.offsetWidth + "px"; d.ghost.style.height = d.el.offsetHeight + "px";
      d.ghost.innerHTML = '<img alt="" src="' + esc(it.url) + '">'; layer.appendChild(d.ghost);
    }
    d.ghost.style.left = (px - d.el.offsetWidth / 2) + "px"; d.ghost.style.top = (py - d.el.offsetHeight / 2) + "px";
    // alineación: según dónde queda el centro de la imagen respecto a la hoja
    const centro = (parseFloat(d.el.style.left) + d.el.offsetWidth / 2 + dx) / g.z;
    const fr = (centro - g.cL) / g.cW;
    const al = fr < 0.34 ? "left" : fr > 0.66 ? "right" : "center";
    let best = null;
    (d.cand || []).forEach(c => { if (!best || Math.abs(c.y - py) < Math.abs(best.y - py)) best = c; });
    d.tgt = best ? { anchor: best.anchor, al, label: best.label, y: best.y } : { anchor: null, al, label: "Al final del documento", y: py };
    if (!d.guide) { d.guide = document.createElement("div"); d.guide.className = "ve-guide"; layer.appendChild(d.guide); }
    d.guide.style.left = g.X(g.cL) + "px"; d.guide.style.width = g.X(g.cW) + "px"; d.guide.style.top = (d.tgt.y - 2) + "px";
    d.chip = chipEn(g.X(g.cL), d.tgt.y - 26, d.tgt.label + " · " + ({ left: "izquierda", center: "centro", right: "derecha" })[al], d.chip);
    const sr2 = scroll.getBoundingClientRect();
    if (e.clientY < sr2.top + 60) scroll.scrollTop -= 16; else if (e.clientY > sr2.bottom - 60) scroll.scrollTop += 16;
  }
  function limpiarDrag() {
    if (!drag) return;
    ["ghost", "guide", "chip"].forEach(k => drag[k] && drag[k].remove());
    drag.el.classList.remove("dragging"); drag = null;
  }
  function soltarDrag() {
    const d = drag; if (!d) return;
    const it = itemDe(d.uid), t = d.tgt, movio = d.moved;
    limpiarDrag();
    if (!movio || !it || !t) return;
    it.after = t.anchor; it.al = t.al;
    IM().pintar(); IM().refrescar(); ocupado(); inspector();
  }

  function moverResize(e) {
    const r = resize, g = geo();
    const w = Math.max(30, Math.min(r.max, r.w0 + (e.clientX - r.sx)));
    r.pct = Math.max(10, Math.min(100, Math.round((w / r.max) * 100 / 5) * 5));
    const wf = r.max * r.pct / 100;
    r.el.style.width = wf + "px"; r.el.style.height = wf * r.ratio + "px";
    r.chip = chipEn(parseFloat(r.el.style.left), parseFloat(r.el.style.top) - 26, "Ancho " + r.pct + " %", r.chip);
  }
  function soltarResize() {
    const r = resize; resize = null; if (!r) return;
    if (r.chip) r.chip.remove();
    const it = itemDe(r.uid); if (!it || it.pct === r.pct) return;
    it.pct = r.pct; IM().pintar(); IM().refrescar(); ocupado(); inspector();
  }

  /* ─── edición de texto ─── */
  function saneado(nodo) {
    let out = "";
    nodo.childNodes.forEach(n => {
      if (n.nodeType === 3) { out += esc(n.nodeValue); return; }
      if (n.nodeType !== 1) return;
      const t = n.nodeName;
      if (n.classList && n.classList.contains("ve-bul")) return;
      if (t === "BR") out += "<br>";
      else if (t === "STRONG" || t === "B") out += "<strong>" + saneado(n) + "</strong>";
      else if (t === "EM" || t === "I") out += "<em>" + saneado(n) + "</em>";
      else if (t === "U") out += "<u>" + saneado(n) + "</u>";
      else if (t === "S" || t === "STRIKE" || t === "DEL") out += "<s>" + saneado(n) + "</s>";
      else if (t === "SPAN") {
        let inner = saneado(n); const st = n.getAttribute("style") || "";
        const sz = (n.className.match(/ql-size-\w+/) || [])[0];
        if (/font-weight:\s*(bold|[6-9]00)/i.test(st)) inner = "<strong>" + inner + "</strong>";
        if (/font-style:\s*italic/i.test(st)) inner = "<em>" + inner + "</em>";
        if (/text-decoration[^;]*underline/i.test(st)) inner = "<u>" + inner + "</u>";
        out += sz ? '<span class="' + sz + '">' + inner + "</span>" : inner;
      } else if (t === "DIV" || t === "P") out += (out && !/<br>$/.test(out) ? "<br>" : "") + saneado(n);
      else out += saneado(n);
    });
    return out;
  }
  const limpio = html => (html.replace(/<br>$/, "").trim() ? html : "<br>");

  function empezarEdicion(k, ev, seleccionarTodo) {
    cerrarEdicion(true);
    const U = IM().unidadesTexto(); if (!U || !U.units[k]) return;
    const u = U.units[k];
    const r = rectsDe("txt").filter(x => x.n === k).sort((a, b) => a.page - b.page || a.y0 - b.y0)[0];
    if (!r) return;
    const g = geo();
    const copia = u.el.cloneNode(true); copia.querySelectorAll(".ql-ui").forEach(n => n.remove());
    const inicial = limpio(saneado(copia));
    const box = document.createElement("div");
    box.className = "ve-editor"; box.contentEditable = "true"; box.spellcheck = true;
    const fs = r.fs || {};
    box.style.cssText = `left:${g.X(g.cL) - 4}px; top:${g.Y(r.page, r.y0) - 2}px; width:${g.X(g.cW) + 8}px; min-height:${(r.y1 - r.y0) * g.z + 4}px;`
      + `font:${fs.italic ? "italic " : ""}${fs.bold ? "bold " : ""}${(fs.sizePx || 16) * g.z}px "${fs.font || "Calibri"}", Calibri, Arial, sans-serif; line-height:${(r.lh || (fs.sizePx || 16) * 1.2) * g.z}px;`
      + `text-align:${r.align === "both" ? "justify" : (r.align || "left")};`;
    box.innerHTML = (u.li ? '<span class="ve-bul" contenteditable="false">• </span>' : "") + inicial;
    layer.appendChild(box);
    editing = { k, box, inicial };
    box.addEventListener("keydown", ke => {
      if (ke.key === "Enter" && !ke.shiftKey) { ke.preventDefault(); box.blur(); }
      else if (ke.key === "Escape") { ke.preventDefault(); editing && (editing.cancel = true); box.blur(); }
      else if ((ke.ctrlKey || ke.metaKey) && ["b", "i", "u"].includes(ke.key.toLowerCase())) { /* negrita/cursiva/subrayado nativos */ }
    });
    box.addEventListener("paste", pe => { pe.preventDefault(); const t = (pe.clipboardData || window.clipboardData).getData("text/plain"); document.execCommand("insertText", false, t.replace(/\r?\n/g, " ")); });
    box.addEventListener("blur", () => { setTimeout(() => { if (editing && editing.box === box && document.activeElement !== box) cerrarEdicion(!editing.cancel); }, 0); });
    box.focus();
    const rg = document.createRange(); rg.selectNodeContents(box);
    if (seleccionarTodo) { const s = getSelection(); s.removeAllRanges(); s.addRange(rg); }
    else if (ev) colocarCursor(box, ev.clientX, ev.clientY);
    else { rg.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); }
    inspector();
  }
  function colocarCursor(box, cx, cy) {
    let rg = null;
    if (document.caretRangeFromPoint) rg = document.caretRangeFromPoint(cx, cy);
    else if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(cx, cy); if (p) { rg = document.createRange(); rg.setStart(p.offsetNode, p.offset); } }
    const s = getSelection(); s.removeAllRanges();
    if (rg && box.contains(rg.startContainer)) { rg.collapse(true); s.addRange(rg); }
    else { const r2 = document.createRange(); r2.selectNodeContents(box); r2.collapse(false); s.addRange(r2); }
  }
  function cerrarEdicion(guardar) {
    if (!editing) return;
    const { k, box, inicial } = editing; editing = null;
    const nuevo = limpio(saneado(box));
    box.remove();
    if (guardar && nuevo !== inicial) aplicarTexto(k, nuevo);
    inspector();
  }
  function aplicarTexto(k, html) {
    const U = IM().unidadesTexto(); if (!U || !U.units[k]) return;
    const el = U.units[k].el, ui = el.querySelector(".ql-ui");
    el.innerHTML = html; if (ui) el.insertBefore(ui, el.firstChild);
    IM().aplicarUnidades(U.doc); ocupado();
  }
  function agregarParrafo(k) {
    cerrarEdicion(true);
    const U = IM().unidadesTexto();
    if (!U || !U.units.length) {
      const cb = $("insertar_texto_adicional");
      if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event("change")); }
      const q = GF.getQuill();
      let delta; try { delta = q.clipboard.convert({ html: "<p>Nuevo párrafo</p>" }); } catch (e) { delta = q.clipboard.convert("<p>Nuevo párrafo</p>"); }
      q.setContents(delta, "user"); pendingEdit = 0; ocupado(); return;
    }
    const idx = k == null ? U.units.length - 1 : k, u = U.units[idx];
    const nuevo = U.doc.createElement(u.li ? "li" : "p"); nuevo.textContent = "Nuevo párrafo";
    if (u.li && u.el.getAttribute("data-list")) nuevo.setAttribute("data-list", u.el.getAttribute("data-list"));
    u.el.after(nuevo); IM().aplicarUnidades(U.doc); pendingEdit = idx + 1; ocupado();
  }
  function quitarParrafo(k) {
    cerrarEdicion(false);
    const U = IM().unidadesTexto(); if (!U || !U.units[k]) return;
    const u = U.units[k], padre = u.parent; u.el.remove();
    if (padre && !padre.querySelector("li")) padre.remove();
    IM().aplicarUnidades(U.doc); ocupado();
  }

  /* ─── ubicación de imágenes ─── */
  function fijarUbicacion(it, v) {
    if (v === "fin") it.after = null;
    else if (v === "-1") it.after = { i: -1, clave: "" };
    else { const p = IM().parrafos().find(x => String(x.idx) === v); it.after = p ? { i: p.idx, clave: p.clave } : null; }
    IM().pintar(); IM().refrescar(); ocupado(); inspector();
  }
  function pasoUbicacion(it, d) {
    const ps = IM().parrafos(), seq = ps.length ? ["-1", ...ps.map(p => String(p.idx)), "fin"] : ["fin"];
    const cur = it.after ? String(it.after.i) : "fin"; let i = seq.indexOf(cur); if (i < 0) i = seq.length - 1;
    const j = Math.max(0, Math.min(seq.length - 1, i + d)); if (j !== i) fijarUbicacion(it, seq[j]);
  }

  /* ─── panel lateral ─── */
  function inspector() {
    const it = sel != null ? itemDe(sel) : null;
    if (editing) {
      const ps = IM().parrafos(), p = ps.find(x => x.idx === editing.k);
      side.innerHTML = `
        <h4>Editando ${p ? "el párrafo " + p.n : "un párrafo"}</h4>
        <div class="ve-row" id="vt_fmt">
          <button type="button" data-c="bold" title="Negrita (Ctrl+B)"><b>B</b></button>
          <button type="button" data-c="italic" title="Cursiva (Ctrl+I)"><i>I</i></button>
          <button type="button" data-c="underline" title="Subrayado (Ctrl+U)"><u>U</u></button>
        </div>
        <button type="button" class="ve-btn" id="vt_add">＋ Agregar párrafo debajo</button>
        <button type="button" class="ve-btn danger" id="vt_del">🗑 Quitar este párrafo</button>
        <button type="button" class="ve-btn primary" id="vt_ok">Listo</button>
        <p class="ve-hint"><b>Enter</b> confirma · <b>Shift+Enter</b> salto de línea · <b>Esc</b> cancela.</p>`;
      const k = editing.k;
      side.querySelectorAll("button").forEach(b => b.addEventListener("mousedown", e => e.preventDefault()));
      side.querySelectorAll("#vt_fmt button").forEach(b => b.addEventListener("click", () => document.execCommand(b.dataset.c)));
      $("vt_add").addEventListener("click", () => agregarParrafo(k));
      $("vt_del").addEventListener("click", () => quitarParrafo(k));
      $("vt_ok").addEventListener("click", () => cerrarEdicion(true));
      return;
    }
    if (it) {
      const ps = IM().parrafos();
      side.innerHTML = `
        <h4>Imagen seleccionada</h4>
        <div class="ve-prev"><img alt="" src="${esc(it.url)}"><div class="ve-nm">${esc(it.name)}</div></div>
        <label>Pie de imagen</label><input type="text" id="vi_cap" maxlength="160" placeholder="Opcional" value="${esc(it.cap)}">
        <label>Alineación</label>
        <div class="ve-seg2" id="vi_al">${Object.keys(ALN).map(k => `<button type="button" data-al="${k}" class="${it.al === k ? "on" : ""}">${ALN[k]}</button>`).join("")}</div>
        <label>Ancho: <span id="vi_pl">${it.pct} %</span></label>
        <input type="range" id="vi_pct" min="10" max="100" step="5" value="${it.pct}">
        <label>Ubicación</label>
        <select id="vi_loc">
          <option value="fin">Al final del documento</option>
          ${ps.length ? '<option value="-1">Al inicio del texto adicional</option>' : ""}
          ${ps.map(p => `<option value="${p.idx}">Después del párrafo ${p.n}: «${esc(p.texto.length > 34 ? p.texto.slice(0, 33) + "…" : p.texto)}»</option>`).join("")}
        </select>
        <div class="ve-row"><button type="button" id="vi_up">↑ Un párrafo</button><button type="button" id="vi_dn">↓ Un párrafo</button></div>
        <button type="button" class="ve-btn danger" id="vi_del">🗑 Quitar imagen</button>
        <p class="ve-hint">También puedes arrastrarla, o tirar de la esquina para cambiar su tamaño.</p>`;
      const loc = $("vi_loc"); loc.value = it.after ? String(it.after.i) : "fin"; if (loc.value !== (it.after ? String(it.after.i) : "fin")) loc.value = "fin";
      $("vi_cap").addEventListener("input", e => { it.cap = e.target.value; IM().refrescar(); ocupado(); });
      $("vi_cap").addEventListener("change", () => IM().pintar());
      side.querySelectorAll("#vi_al button").forEach(b => b.addEventListener("click", () => {
        it.al = b.dataset.al; side.querySelectorAll("#vi_al button").forEach(x => x.classList.toggle("on", x === b));
        IM().pintar(); IM().refrescar(); ocupado();
      }));
      $("vi_pct").addEventListener("input", e => { it.pct = parseInt(e.target.value, 10); $("vi_pl").textContent = it.pct + " %"; IM().refrescar(); ocupado(); });
      $("vi_pct").addEventListener("change", () => IM().pintar());
      loc.addEventListener("change", () => fijarUbicacion(it, loc.value));
      $("vi_up").addEventListener("click", () => pasoUbicacion(it, -1));
      $("vi_dn").addEventListener("click", () => pasoUbicacion(it, 1));
      $("vi_del").addEventListener("click", () => quitarImagen(it));
      return;
    }
    const hayTexto = !!(IM().parrafos().length);
    side.innerHTML = `
      <h4>Editor visual</h4>
      <ul class="ve-empty">
        <li><b>Texto:</b> haz clic sobre un párrafo del contenido adicional para editarlo.</li>
        <li><b>Imágenes:</b> haz clic para seleccionarlas; arrástralas entre párrafos o a la izquierda / derecha de la hoja.</li>
        <li>El marco, encabezado y pie de la plantilla se muestran en todas las páginas, pero no se editan aquí.</li>
      </ul>
      <button type="button" class="ve-btn" id="vd_img">＋ Agregar imagen</button>
      <button type="button" class="ve-btn" id="vd_txt">＋ ${hayTexto ? "Agregar párrafo al final" : "Agregar texto adicional"}</button>`;
    $("vd_img").addEventListener("click", () => $("ve_file").click());
    $("vd_txt").addEventListener("click", () => agregarParrafo(null));
  }
  function quitarImagen(it) {
    const arr = IM().items(), i = arr.indexOf(it); if (i < 0) return;
    try { URL.revokeObjectURL(it.url); } catch (e) {}
    arr.splice(i, 1); sel = null;
    IM().pintar(); IM().actualizarParrafos(); IM().refrescar(); ocupado(); inspector();
  }
  $("ve_file").addEventListener("change", async e => {
    const en = $("im_enable"); if (!en.checked) { en.checked = true; en.dispatchEvent(new Event("change")); }
    await IM().agregar(e.target.files); e.target.value = ""; ocupado();
  });

  document.addEventListener("keydown", e => {
    if (!E.activo) return;
    const enCampo = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName) || (editing && editing.box.contains(document.activeElement));
    if (e.key === "Escape" && !enCampo) { if (sel != null) { sel = null; construirCapa(); inspector(); } return; }
    if (enCampo || sel == null) return;
    const it = itemDe(sel); if (!it) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); quitarImagen(it); }
    else if (e.key === "ArrowUp") { e.preventDefault(); pasoUbicacion(it, -1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); pasoUbicacion(it, 1); }
  });
  window.addEventListener("resize", () => { if (E.activo && layout) { fitPendiente = true; DocxViewerEngine.setZoom(layout.zoom + 0.0001); } });

  E.abrir = abrir; E.cerrar = cerrar;
})();
