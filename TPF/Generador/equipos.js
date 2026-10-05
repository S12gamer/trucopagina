/**
 * equipos.js
 * ─────────────────────────────────────────────────────────
 * Varios alumnos en UN solo documento.
 *   · Equipo   : guardado a largo plazo en localStorage.
 *   · Quick team: se guarda con fecha de vencimiento fija (QUICK_DIAS) y se
 *                 borra solo; puede convertirse en equipo.
 * En el documento, los integrantes marcados se listan uno debajo de otro en
 * la celda «Nombre del alumno».
 * Depende de window.GF (puente definido al final de app.js).
 * ─────────────────────────────────────────────────────────
 */
const GF = window.GF;
if (!GF) {
  console.error("[equipos.js] No se encontró window.GF: app.js no terminó de cargar. Revisa la pestaña Red/Consola; casi siempre es un archivo que falta o no se subió (index.html, app.js, pwa.js, equipos.js, imagenes.js, editor-visual.js, styles.css, sw.js, manifest.webmanifest).");
} else (function () {
  "use strict";
  const SENT = "§§EQUIPO§§";                 // marcador interno (se sustituye al generar)
  const QUICK_DIAS = 7;                      // vigencia FIJA de un Quick team (en días, no se renueva al editar)
  const K_EQ = "tm_equipos_v1", K_QK = "tm_quick_v1", K_MODE = "tm_mode_v1", K_ACT = "tm_active_v1";
  const $ = id => document.getElementById(id);

  /* ─── almacenamiento ─── */
  const leer = k => { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { alert("No se pudo guardar (almacenamiento lleno o bloqueado)."); } };
  let equipos = leer(K_EQ), quick = leer(K_QK);
  function purgarVencidos() {
    const antes = quick.length, ahora = Date.now();
    quick = quick.filter(q => q.expira > ahora);
    if (quick.length !== antes) guardar(K_QK, quick);
    return antes - quick.length;
  }
  purgarVencidos();

  let modo = "individual", activo = null, elegidos = new Set();   // elegidos = controles marcados
  try { modo = localStorage.getItem(K_MODE) === "equipo" ? "equipo" : "individual"; activo = localStorage.getItem(K_ACT) || null; } catch (e) {}

  const todos = () => equipos.concat(quick);
  const buscar = id => todos().find(t => t.id === id) || null;
  const esQuick = t => !!t && quick.indexOf(t) >= 0;
  const nuevoId = () => "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const fmtFecha = ms => new Date(ms).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ─── interpretar integrantes: «Nombre, control» por línea (o «Nombre 23060001») ─── */
  function parsearIntegrantes(texto) {
    const out = [], vistos = new Set();
    String(texto || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach(l => {
      let p = l.split(/\t|;|,/).map(x => x.trim()).filter(Boolean);
      if (p.length === 1) { const m = l.match(/^(.*?)\s+(\d{4,})$/); if (m) p = [m[1].trim(), m[2]]; }
      if (p.length < 2) return;
      let nombre = p[0], control = p[1];
      if (/^\d+$/.test(nombre) && !/^\d+$/.test(control)) [nombre, control] = [control, nombre];
      const k = control.toLowerCase();
      if (!nombre || !control || vistos.has(k)) return;
      vistos.add(k); out.push({ nombre, control });
    });
    return out;
  }

  /* ─── interfaz ─── */
  const card = $("sec_alumno");
  const seg = document.createElement("div");
  seg.className = "tm-seg";
  seg.innerHTML = '<button type="button" data-m="individual">👤 Individual</button><button type="button" data-m="equipo">👥 Equipo</button>';
  card.querySelector(".card-title").after(seg);

  const panel = document.createElement("div");
  panel.id = "tm_panel";
  panel.innerHTML = `
    <div class="tm-row">
      <select id="tm_select" aria-label="Equipo"></select>
      <button type="button" class="cm-btn primary" id="tm_new_btn">＋ Crear equipo</button>
      <button type="button" class="cm-btn secondary" id="tm_quick_btn">⚡ Quick team</button>
    </div>
    <div class="tm-info" id="tm_info"></div>
    <div id="tm_body"></div>`;
  seg.after(panel);

  // lo que no aplica en modo equipo (el nombre/control/grupo salen del equipo)
  card.querySelectorAll("#nombre, #control, #grupo").forEach(i => { const w = i.closest(".grid2") && i.closest(".grid2").contains($("nombre")) ? i.closest(".grid2") : i.closest(".field"); if (w) w.classList.add("tm-hide-in-team"); });

  /* modal de crear / editar */
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "tm_modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header"><h3 id="tm_modal_title">Crear equipo</h3><button class="modal-close" type="button" id="tm_modal_x">×</button></div>
      <div class="modal-body">
        <div class="field"><label>Nombre del equipo</label><input type="text" id="tm_m_nombre" placeholder="Ej. Equipo Proyecto Final"></div>
        <div class="grid2">
          <div class="field"><label>Grupo (una sola vez)</label><input type="text" id="tm_m_grupo" placeholder="Ej. 2S-A"></div>
          <div class="field"><label>División / Carrera (opcional)</label><input type="text" id="tm_m_div" placeholder="Ej. Ing. en Sistemas"></div>
        </div>
        <div class="field"><label>Integrantes — uno por línea: Nombre, No. de control</label>
          <textarea id="tm_m_miembros" placeholder="Juan Pérez López, 23060001&#10;María López Díaz, 23060002&#10;Luis Sosa 23060003"></textarea></div>
        <div class="tm-note" id="tm_m_note"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="cm-btn secondary" id="tm_m_cancel">Cancelar</button>
        <button type="button" class="cm-btn primary" id="tm_m_save">Guardar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  let editando = null;      // {tipo:'equipo'|'quick', id|null}
  function abrirModal(tipo, t) {
    editando = { tipo, id: t ? t.id : null };
    $("tm_modal_title").textContent = (t ? "Editar " : "Crear ") + (tipo === "quick" ? "Quick team" : "equipo");
    $("tm_m_nombre").value = t ? t.nombre : "";
    $("tm_m_grupo").value = t ? t.grupo || "" : ($("grupo").value || "");
    $("tm_m_div").value = t ? t.division || "" : ($("division").value || "");
    $("tm_m_miembros").value = t ? t.miembros.map(m => m.nombre + ", " + m.control).join("\n") : "";
    $("tm_m_note").textContent = tipo === "quick"
      ? `⚡ Los Quick team se guardan ${QUICK_DIAS} días desde que se crean y después se borran solos (la fecha no se renueva al editar). Si quieres conservarlo, conviértelo en equipo.`
      : "Los equipos quedan guardados en este navegador hasta que los borres.";
    modal.classList.add("active");
    setTimeout(() => $("tm_m_nombre").focus(), 50);
  }
  const cerrarModal = () => modal.classList.remove("active");
  $("tm_modal_x").addEventListener("click", cerrarModal);
  $("tm_m_cancel").addEventListener("click", cerrarModal);
  modal.addEventListener("mousedown", e => { if (e.target === modal) cerrarModal(); });

  $("tm_m_save").addEventListener("click", () => {
    const miembros = parsearIntegrantes($("tm_m_miembros").value);
    if (!miembros.length) { aviso("Agrega al menos un integrante: «Nombre, No. de control» (uno por línea).", true); return; }
    const esQ = editando.tipo === "quick";
    const datos = {
      nombre: $("tm_m_nombre").value.trim() || (esQ ? "Quick team" : "Equipo"),
      grupo: $("tm_m_grupo").value.trim(), division: $("tm_m_div").value.trim(), miembros
    };
    let t = editando.id ? buscar(editando.id) : null;
    if (t) Object.assign(t, datos);
    else {
      t = Object.assign({ id: nuevoId(), creado: Date.now() }, datos);
      if (esQ) { t.expira = Date.now() + QUICK_DIAS * 86400000; quick.push(t); } else equipos.push(t);
    }
    guardar(K_EQ, equipos); guardar(K_QK, quick);
    cerrarModal();
    activar(t.id);
    aviso(`✓ ${esQ ? "Quick team" : "Equipo"} «${t.nombre}» guardado (${miembros.length} integrante${miembros.length === 1 ? "" : "s"}).`);
  });

  $("tm_new_btn").addEventListener("click", () => abrirModal("equipo"));
  $("tm_quick_btn").addEventListener("click", () => abrirModal("quick"));

  function aviso(msg, error) { try { (error ? GF.showError : GF.showSuccess)(msg); } catch (e) { alert(msg); } }

  function activar(id) {
    activo = id;
    const t = buscar(id);
    elegidos = new Set(t ? t.miembros.map(m => m.control) : []);
    try { localStorage.setItem(K_ACT, id || ""); } catch (e) {}
    render();
  }

  function setModo(m) {
    modo = m;
    document.body.classList.toggle("tm-on", m === "equipo");
    seg.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.m === m));
    try { localStorage.setItem(K_MODE, m); } catch (e) {}
    if (m === "equipo") render();
    refrescar();
  }
  seg.addEventListener("click", e => { const b = e.target.closest("button"); if (b) setModo(b.dataset.m); });

  function refrescar() {
    try { GF.updateStepper(); } catch (e) {}
    try { GF.scheduleDocxPreview(); } catch (e) {}
  }

  /* ─── pintar panel ─── */
  function render() {
    const n = purgarVencidos();
    if (n) aviso(`Se borraron ${n} Quick team vencido${n === 1 ? "" : "s"}.`);
    if (activo && !buscar(activo)) activo = null;
    const sel = $("tm_select");
    const opt = (t, q) => `<option value="${t.id}"${t.id === activo ? " selected" : ""}>${esc(t.nombre)} (${t.miembros.length})${q ? " · vence " + fmtFecha(t.expira) : ""}</option>`;
    sel.innerHTML = '<option value="">— Elige un equipo —</option>'
      + (equipos.length ? `<optgroup label="Equipos">${equipos.map(t => opt(t, false)).join("")}</optgroup>` : "")
      + (quick.length ? `<optgroup label="Quick teams (vencen)">${quick.map(t => opt(t, true)).join("")}</optgroup>` : "");

    const t = buscar(activo), body = $("tm_body"), info = $("tm_info");
    if (!t) {
      info.innerHTML = "";
      body.innerHTML = `<div class="tm-empty">${todos().length
        ? "Elige un equipo de la lista para ver a sus integrantes."
        : "Aún no tienes equipos. Crea un <b>equipo</b> (se guarda para siempre) o un <b>Quick team</b> (pegas los nombres y se borra solo en " + QUICK_DIAS + " días)."}</div>`;
      return;
    }
    const q = esQuick(t);
    const dias = q ? Math.max(0, Math.ceil((t.expira - Date.now()) / 86400000)) : 0;
    info.innerHTML =
      (q ? `<span class="tm-tag quick">⚡ Quick team</span><span class="tm-tag ${dias <= 1 ? "warn" : "quick"}">vence ${fmtFecha(t.expira)}${dias <= 1 ? " · ¡pronto!" : ""}</span>`
         : `<span class="tm-tag perm">Equipo guardado</span>`)
      + `<span>Grupo: <b>${esc(t.grupo || "—")}</b></span>` + (t.division ? `<span>${esc(t.division)}</span>` : "");

    body.innerHTML = `
      <ul class="tm-members">${t.miembros.map((m, i) => `
        <li><label><input type="checkbox" data-c="${esc(m.control)}"${elegidos.has(m.control) ? " checked" : ""}> ${esc(m.nombre)}</label><small>${esc(m.control)}</small></li>`).join("")}</ul>
      <div class="tm-row" style="margin-top:.7rem;">
        <button type="button" class="cm-btn secondary" id="tm_all">Todos</button>
        <button type="button" class="cm-btn secondary" id="tm_none">Ninguno</button>
        <span class="tm-count" id="tm_count"></span>
        <span style="flex:1"></span>
        <button type="button" class="cm-btn secondary" id="tm_edit">✎ Editar</button>
        ${q ? '<button type="button" class="cm-btn secondary" id="tm_keep">📌 Convertir en equipo</button>' : ""}
        <button type="button" class="btn-remove" id="tm_del" style="padding:8px 12px;">Borrar</button>
      </div>
      <div class="tm-note" style="margin-top:.6rem;">Los integrantes marcados se listan uno debajo de otro en la celda «Nombre del alumno» de un solo documento.</div>`;

    const cont = () => { $("tm_count").textContent = `${elegidos.size} de ${t.miembros.length} en el documento`; };
    cont();
    body.querySelectorAll(".tm-members input").forEach(c => c.addEventListener("change", () => {
      c.checked ? elegidos.add(c.dataset.c) : elegidos.delete(c.dataset.c); cont(); refrescar();
    }));
    $("tm_all").addEventListener("click", () => { t.miembros.forEach(m => elegidos.add(m.control)); render(); refrescar(); });
    $("tm_none").addEventListener("click", () => { elegidos.clear(); render(); refrescar(); });
    $("tm_edit").addEventListener("click", () => abrirModal(q ? "quick" : "equipo", t));
    $("tm_del").addEventListener("click", () => {
      if (!confirm(`¿Borrar ${q ? "el Quick team" : "el equipo"} «${t.nombre}»?`)) return;
      equipos = equipos.filter(x => x !== t); quick = quick.filter(x => x !== t);
      guardar(K_EQ, equipos); guardar(K_QK, quick);
      activar(null); refrescar();
    });
    if (q) $("tm_keep").addEventListener("click", () => {
      quick = quick.filter(x => x !== t); delete t.expira; equipos.push(t);
      guardar(K_EQ, equipos); guardar(K_QK, quick);
      render(); aviso(`✓ «${t.nombre}» ahora es un equipo guardado sin vencimiento.`);
    });
  }
  $("tm_select").addEventListener("change", e => { activar(e.target.value || null); refrescar(); });

  /* ─── integrantes elegidos del equipo activo (o null si no se usa el modo equipo) ─── */
  function equipoEnUso() {
    if (modo !== "equipo") return null;
    const t = buscar(activo);
    return t ? { t, miembros: t.miembros.filter(m => elegidos.has(m.control)) } : { t: null, miembros: [] };
  }
  // Ejecuta fn con el primer integrante escrito en los campos (para reutilizar validaciones existentes)
  function conPrimerMiembro(fn) {
    const eq = equipoEnUso();
    if (!eq || !eq.miembros.length) return fn();
    const n = $("nombre"), c = $("control"), g = $("grupo");
    const bak = [n.value, c.value, g.value];
    n.value = eq.miembros[0].nombre; c.value = eq.miembros[0].control; if (eq.t.grupo) g.value = eq.t.grupo;
    try { return fn(); } finally { n.value = bak[0]; c.value = bak[1]; g.value = bak[2]; }
  }

  /* ─── enganches con la generación existente (documento final y vista previa) ─── */
  GF.wrap("validar", _validar => function () {
    const eq = equipoEnUso();
    if (eq) {
      if (!eq.t) { GF.showError("Elige o crea un equipo."); return false; }
      if (!eq.miembros.length) { GF.showError("Marca al menos un integrante del equipo."); return false; }
    }
    return conPrimerMiembro(_validar);
  });

  GF.wrap("recopilarDatosFormulario", _recopilar => function () {
    const eq = equipoEnUso();
    if (!eq || !eq.t || !eq.miembros.length) return conPrimerMiembro(_recopilar);
    const o = conPrimerMiembro(_recopilar);
    if (!o) return o;
    o.nombre = SENT; o.control = "";
    o.grupo = eq.t.grupo || o.grupo;
    if (!o.division && eq.t.division) o.division = eq.t.division;
    o._equipo = { nombre: eq.t.nombre, miembros: eq.miembros.map(m => ({ nombre: m.nombre, control: m.control })) };
    return o;
  });

  // Cada párrafo que lleva el marcador se repite una vez por integrante (uno debajo de otro).
  GF.wrap("aplicarSustitucionesXML", _aplicar => function (xml, opts) {
    let out = _aplicar(xml, opts);
    if (opts && opts._equipo) {
      const ms = opts._equipo.miembros;
      out = out.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, p => {
        if (!p.includes(SENT)) return p;
        return ms.map(m => p.replace(/§§EQUIPO§§\s?/, () => GF.escXml(m.nombre + " " + m.control))).join("");
      });
    }
    return out;
  });

  // Nombre de archivo y mensajes: cambian el marcador por el nombre del equipo
  const slug = () => { const e = equipoEnUso(); return ((e && e.t && e.t.nombre) || "Equipo").trim().replace(/[\\/:*?"<>|\s]+/g, "_"); };
  const _saveAs = window.saveAs;
  if (typeof _saveAs === "function") window.saveAs = function (b, name) { const a = Array.prototype.slice.call(arguments); if (typeof name === "string") a[1] = name.split(SENT).join(slug()); return _saveAs.apply(this, a); };
  GF.wrap("showSuccess", _ok => function (m) { return _ok(typeof m === "string" ? m.split(SENT).join(slug()) : m); });
  GF.wrap("updateStepper", _step => function () { return conPrimerMiembro(_step); });

  /* ─── inicio ─── */
  if (activo && buscar(activo)) elegidos = new Set(buscar(activo).miembros.map(m => m.control)); else activo = null;
  setModo(modo);
})();
