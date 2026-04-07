/* ══════════════════════════════════════════
   DATOS DE DESCARGA
   Aquí puedes agregar, editar o borrar descargas
══════════════════════════════════════════ */
const membretes = [
  { id:1, name:"Membrete Oficial PS",        desc:"Uso vertical Superior",               url:"https://drive.google.com/uc?export=download&id=10HmkDc5HWUCwZXx8DwoEngPrnPEt40YZ" },
  { id:2, name:"Membrete Oficial PI",       desc:"Uso vertical Inferior",                 url:"https://drive.google.com/uc?export=download&id=1vBb9mY5NX6r1JB0FaEDcO0RnKJxQ-aUX" },
  { id:3, name:"Membrete Oficial PS Horizontal",  desc:"Uso horizontal Superior",               url:"https://drive.google.com/uc?export=download&id=1-xAeQV0TdWiM4RcIw2wpfrvPxo_cWRlG" },
  { id:4, name:"Membrete Oficial PI Horizontal",          desc:"Uso horizontal Inferior",              url:"https://drive.google.com/uc?export=download&id=1QJwbhkDU_KDQLzc_9bnj68uRqag9ZnTi" },
];

const formatos = [
  { id:1, name:"Formato Probabilidad",  desc:"Lidia González González",                            url:"https://drive.google.com/uc?export=download&id=1KWvFgXadQB92KiBse6GagPoR4bB6xX8C" },
];

const instrumentaciones = [
  { id:1, name:"Instrumentación Algebra Lin",      desc:"Planeación semestral — Ing. en Sistemas",      url:"https://drive.google.com/uc?export=download&id=19vlAwJTEoCbp7EcuyKQVJmK7FmE8t4jR" },
  { id:2, name:"Instrumentación Probabilidad",     desc:"Planeación semestral — Ing. en Sistemas",       url:"https://drive.google.com/uc?export=download&id=1WKMWFkHZDJcKCAsGD2GpVe1SgtWNgTyy" },
  { id:3, name:"Instrumentación Contabilidad",       desc:"Planeación semestral — Ing. en Sistemas", url:"https://drive.google.com/uc?export=download&id=1fbFq6p6c7_IixfQmfKTwZKCfplO4jmUi" },
];

/* ══════════════════════════════════════════
   DATOS — ATRIBUTOS DE EGRESO POR MATERIA
   Aquí agregas o modificas las materias y semestres
══════════════════════════════════════════ */
const materias = [
  {
    id: 1,
    nombre: "Cálculo Integral",
    icono: "📐",
    semestre: "2° Semestre",
    atributo: "Desarrollar un pensamiento lógico-matemático y proporcionar herramientas para modelar fenómenos de contexto.",
    objetivo: "Que el estudiante domine los fundamentos del cálculo diferencial, comprendiendo límites, derivadas y sus aplicaciones en la resolución de problemas reales de ingeniería.",
    generales: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"medio" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"medio" },
      { letra:"d", texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).", alcance:"basico" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"medio" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"basico" },
    ],
    especificos: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"alto" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"alto" },
      { letra:"d", texto:"Resuelve problemas de optimización modelados con derivadas.", alcance:"medio" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"medio" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"medio" },
    ]
  },
  {
    id: 2,
    nombre: "Física General",
    icono: "⚡",
    semestre: "2° Semestre",
    atributo: "Fortalece la comprensión de fenómenos naturales y aplicaciones al mundo real. Análisis y razonamiento crítico para la resolución de problemas profesionales.",
    objetivo: "Que el estudiante comprenda y aplique los principios del electromagnetismo, incluyendo campos eléctricos, magnéticos y circuitos básicos, en contextos de ingeniería.",
    generales: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"alto" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"medio" },
      { letra:"d", texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).", alcance:"medio" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"medio" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"basico" },
    ],
    especificos: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"alto" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"alto" },
      { letra:"d", texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).", alcance:"medio" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"medio" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"basico" },
    ]
  },
  {
    id: 3,
    nombre: "Algebra Lineal",
    icono: "💻",
    semestre: "2° Semestre",
    atributo: "Analizar problemáticas complejas y proponer soluciones innovadoras mediante un enfoque lógico y estructurado basado en fundamentos matemáticos y computacionales. Desarrollar la habilidad de autoaprendizaje para mantenerse actualizado en un entorno tecnológico en constante evolución",
    objetivo: "El Álgebra Lineal aporta al perfil del ingeniero la capacidad para desarrollar un pensamiento lógico, heurístico y algorítmico al modelar fenómenos de naturaleza lineal y resolver problemas.",
    generales: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"medio" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"medio" },
      { letra:"d", texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).", alcance:"medio" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"medio" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"basico" },
    ],
    especificos: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"alto" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"alto" },
      { letra:"d", texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).", alcance:"medio" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"medio" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"basico" },
    ]
  },
  {
    id: 4,
    nombre: "Probabilidad y Estadistica",
    icono: "🔥",
    semestre: "2° Semestre",
    atributo: "Entender, aplicar y desarrollar modelos matemáticos utilizando técnicas estadísticas para la toma de decisiones en ciencias computacionales",
    objetivo: "Que el estudiante comprenda y aplique las leyes de la termodinámica para analizar sistemas abiertos, cerrados y ciclos de potencia en contextos industriales.",
    generales: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"medio" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"medio" },
      { letra:"d", texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).", alcance:"medio" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"alto" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"medio" },
    ],
    especificos: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"alto" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"alto" },
      { letra:"d", texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).", alcance:"medio" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"medio" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"basico" },
    ]
  },
  {
    id: 5,
    nombre: "Contabilidad Financiera",
    icono: "📊",
    semestre: "2° Semestre",
    atributo: "Analizar problemáticas complejas y proponer soluciones integrales mediante el uso de herramientas tecnológicas y financieras.",
    objetivo: "Que el estudiante aplique conceptos de estadística descriptiva e inferencial y teoría de probabilidad para analizar e interpretar datos en proyectos de ingeniería.",
    generales: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"medio" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"medio" },
      { letra:"d", texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).", alcance:"medio" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"medio" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"medio" },
    ],
    especificos: [
      { letra:"a", texto:"Se adapta a situaciones y contextos complejos.", alcance:"alto" },
      { letra:"b", texto:"Hace aportaciones a las actividades académicas desarrolladas.", alcance:"alto" },
      { letra:"c", texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).", alcance:"alto" },
      { letra:"d", texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).", alcance:"medio" },
      { letra:"e", texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.", alcance:"medio" },
      { letra:"f", texto:"Realiza su trabajo de manera autónoma y autorregulada.", alcance:"basico" },
    ]
  },
];


/* ══════════════════════════════════════
   LÓGICA INTERNA DE LA PLATAFORMA
   (No necesitas modificar nada de aquí para abajo)
══════════════════════════════════════ */
const badgeLabel = { teal:'PNG / JPG', rust:'DOCX Sem 2', green:'DOCX/PDF Sem 2' };
const thumbIcon  = { teal:'🖼️', rust:'📝', green:'📋' };

function renderGrid(gridId, items, color, query='') {
  const grid = document.getElementById(gridId);
  const q = query.toLowerCase();
  const filtered = items.filter(f => f.name.toLowerCase().includes(q));
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-msg">⚠️ Sin resultados para "${escHtml(query)}".</div>`;
    return;
  }
  grid.innerHTML = filtered.map((f,i) => `
    <div class="card card-${color}" style="animation-delay:${i*0.05}s">
      <div class="card-thumb thumb-${color}">
        <div class="thumb-icon">${thumbIcon[color]}</div>
        <span class="badge badge-${color}">${badgeLabel[color]}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escHtml(f.name)}</div>
        <div class="card-meta">${escHtml(f.desc||'—')}</div>
        <a class="btn-dl btn-${color}" href="${escHtml(f.url)}" target="_blank" rel="noopener">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar
        </a>
      </div>
    </div>`).join('');
}
function filterGrid(gridId, items, color, value) { renderGrid(gridId, items, color, value); }

function renderMaterias(query='') {
  const container = document.getElementById('aeContainer');
  const q = query.toLowerCase();
  const filtered = materias.filter(m => m.nombre.toLowerCase().includes(q));

  if (!filtered.length) {
    container.innerHTML = `<p style="color:#bbb;padding:2rem 0;font-size:.88rem;">⚠️ Sin materias para "${escHtml(query)}".</p>`;
    return;
  }

  container.innerHTML = filtered.map((m, idx) => `
    <div class="materia-card" id="mat-${m.id}" style="animation-delay:${idx*0.05}s">

      <div class="materia-header" onclick="toggleMateria(${m.id})">
        <div class="materia-icon">${m.icono}</div>
        <div class="materia-info">
          <h3>${escHtml(m.nombre)}</h3>
          <span class="materia-sub">${escHtml(m.semestre)}</span>
        </div>
        <span class="materia-badge">Ver detalle</span>
        <svg class="materia-chevron" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <div class="materia-body">
        <div class="materia-body-inner">

          <div class="atributo-box">
            <div class="box-label">🏆 Atributo de egreso</div>
            <p>${escHtml(m.atributo)}</p>
          </div>

          <div class="objetivo-box">
            <div class="box-label" style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--gold);margin-bottom:.5rem;display:flex;align-items:center;gap:.4rem;">🎯 Objetivo</div>
            <p>${escHtml(m.objetivo)}</p>
          </div>

          <div class="ind-section-title general">📋 Indicadores de alcance generales</div>
          ${m.generales.map(ind => indRow(ind, 'general')).join('')}

          <div class="ind-section-title especifico" style="margin-top:1.6rem;">🎯 Indicadores de alcance específicos</div>
          ${m.especificos.map(ind => indRow(ind, 'especifico')).join('')}

        </div>
      </div>
    </div>`).join('');
}

function indRow(ind, tipo) {
  const alcLabel = { alto:'Alcance alto', medio:'Alcance medio', basico:'Alcance básico' };
  const tipoLabel = tipo === 'general' ? 'General' : 'Específico';
  return `
    <div class="ind-row">
      <div class="ind-letter letter-${tipo}">${ind.letra}</div>
      <div class="ind-content">
        <div class="ind-text">${escHtml(ind.texto)}</div>
        <div class="ind-meta-row">
          <span class="ind-tipo tipo-${tipo}">${tipoLabel}</span>
          <span class="ind-alcance alc-${ind.alcance}">${alcLabel[ind.alcance]||ind.alcance}</span>
        </div>
      </div>
    </div>`;
}

function toggleMateria(id) { document.getElementById('mat-'+id).classList.toggle('open'); }
function filterMaterias(value) { renderMaterias(value); }

function showPage(pageId, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  document.getElementById('page-'+pageId).classList.add('active');
  btn.classList.add('active');
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  renderGrid('gridMem',  membretes,         'teal');
  renderGrid('gridFmt',  formatos,          'rust');
  renderGrid('gridInst', instrumentaciones, 'green');
  renderMaterias();
});