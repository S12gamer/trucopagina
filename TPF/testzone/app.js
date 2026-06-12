/* ══════════════════════════════════════════
   DATOS DE DESCARGA
══════════════════════════════════════════ */
const membretes = [
  { id:1, name:"Membrete Oficial PS", desc:"Uso vertical Superior", url:"https://drive.google.com/uc?export=download&id=10HmkDc5HWUCwZXx8DwoEngPrnPEt40YZ" },
  { id:2, name:"Membrete Oficial PI", desc:"Uso vertical Inferior", url:"https://drive.google.com/uc?export=download&id=1vBb9mY5NX6r1JB0FaEDcO0RnKJxQ-aUX" },
  { id:3, name:"Membrete Oficial PS Horizontal", desc:"Uso horizontal Superior", url:"https://drive.google.com/uc?export=download&id=1-xAeQV0TdWiM4RcIw2wpfrvPxo_cWRlG" },
  { id:4, name:"Membrete Oficial PI Horizontal", desc:"Uso horizontal Inferior", url:"https://drive.google.com/uc?export=download&id=1QJwbhkDU_KDQLzc_9bnj68uRqag9ZnTi" },
  { id:5, name:"Membrete Oficial Pajaro PS", desc:"Uso vertical Superior (solo en docs oficiales)", url:"https://drive.google.com/uc?export=download&id=1zoOcVsd0rAsii8j_b4mb9PvNqCfONSNH" },
  { id:6, name:"Membrete Oficial Pajaro PI", desc:"Uso vertical Inferior(solo en docs oficiales)", url:"https://drive.google.com/uc?export=download&id=1JaqsRhII0VOA9rg5zLcZC2R1rnCUPysu" },
];

const formatos = [
  { id:1, name:"Formato Probabilidad", desc:"Lidia González González", url:"https://drive.google.com/uc?export=download&id=1KWvFgXadQB92KiBse6GagPoR4bB6xX8C" },
  { id:2, name:"Formato Fisica Gen", desc:"Jessica Linnete Morales Hernández", url:"https://drive.google.com/uc?export=download&id=1WSqHHTgocPbgg-Y_9vTcN_4ujdyBJ6WI" },
  { id:3, name:"Formato Algebra Lin", desc:"José Juan santana Ortiz", url:"https://drive.google.com/uc?export=download&id=1fGJapgubiQTlxdwj9BNgqejENbc9Mt6Z" },
  { id:4, name:"Formato Contabilidad", desc:"Miriam Juárez Gutiérrez", url:"https://drive.google.com/uc?export=download&id=1WgRi46MP3lINGlevafaJyZRFHBf1YyD0" },
  { id:5, name:"Formato Calculo Int", desc:"Brian Antonio Mejía Díaz", url:"https://drive.google.com/uc?export=download&id=1LByc9bIXhi24O3rP4TVfu1QXUxu1jUJ8" },
  { id:6, name:"Formato Programación Orientada a Objetos", desc:"David Teran Gomez", url:"https://drive.google.com/uc?export=download&id=1qYJX9Xuqyg6kswRroMZYdaQO5dd9qBfv" },
  { id:7, name:"Formato Reportes POO", desc:"David Teran Gomez", url:"https://drive.google.com/uc?export=download&id=1hREa4VMdEWgN6OZKGssuW4QGLQDujICT" },
  { id:8, name:"Formato en Blanco", desc:"By: S12/Trucoteca", url:"https://drive.google.com/uc?export=download&id=1nnNn-clnrsO2IaELLLb6eLd0Jo4ZnNcY" },
  { id:9, name:"Formato Membrete", desc:"By: S12/Trucoteca", url:"https://drive.google.com/uc?export=download&id=1AKJGf0J50JLBezSxDx3ToCDeIHivWK2a" },
  { id:10, name:"Portafolio Calculo Int", desc:"By: S12/Trucoteca & CS", url:"https://drive.google.com/uc?export=download&id=1Tfet0QQcinRFSIKr5VCT-GIDr_eU5env" },
  { id:11, name:"Portada Institucional", desc:"By: S12/Trucoteca & CS", url:"https://drive.google.com/uc?export=download&id=1tXl9qaRw54kI1k7oKZcvU-yfnsNHzxrF" },
  { id:12, name:"Portafolio Conta", desc:"By: CS", url:"https://drive.google.com/uc?export=download&id=1-G1aWJ7nLLRizXx3J4JKRpHmvhxbaDa8" },
  { id:13, name:"Portafolio Fisica", desc:"By: S12/Trucoteca", url:"https://drive.google.com/uc?export=download&id=1C26atG7hMxCDd0GT9-z-p69XZdPcK7gX" },
  { id:14, name:"Portafolio Algebra Lin", desc:"By: CS", url:"https://drive.google.com/uc?export=download&id=1IH7Q4wjhWU-7zEUQa2a1yE2qXJz0ENI1" },
];

const instrumentaciones = [
  { id:1, name:"Instrumentación Cálculo Int", desc:"Planeación semestral", url:"https://drive.google.com/uc?export=download&id=1n_PpXeGg2JuK6nJbkADMl2yO-S-ZA0cd" },
  { id:2, name:"Instrumentación Física Gen", desc:"Planeación semestral", url:"https://drive.google.com/uc?export=download&id=1Y7S_qjhCObFferQf_2rA18ZORquL1ds1" },
  { id:3, name:"Instrumentación Algebra Lin", desc:"Planeación semestral", url:"https://drive.google.com/uc?export=download&id=19vlAwJTEoCbp7EcuyKQVJmK7FmE8t4jR" },
  { id:4, name:"Instrumentación Probabilidad", desc:"Planeación semestral", url:"https://drive.google.com/uc?export=download&id=1WKMWFkHZDJcKCAsGD2GpVe1SgtWNgTyy" },
  { id:5, name:"Instrumentación Contabilidad", desc:"Planeación semestral", url:"https://drive.google.com/uc?export=download&id=1fbFq6p6c7_IixfQmfKTwZKCfplO4jmUi" },
  { id:6, name:"Instrumentación Nivel 3 y 4 Ingles", desc:"Planeación semestral", url:"https://drive.google.com/uc?export=download&id=1k4tEpzfDz2WFzENnyknNk9uLUOUUhB1h" },
  { id:7, name:"Instrumentación Programacion Ori a Objs", desc:"Planeación semestral", url:"https://drive.google.com/uc?export=download&id=1r0BRhQvbeAI703Muet0h_WhNbEej9Ox1" },
];

const programas = [
  { id:1, name:"Anaconda Spyder 6", desc:"Brian Antonio Mejía Díaz/Calculo Integral", url:"https://repo.anaconda.com/archive/Anaconda3-2025.12-2-Windows-x86_64.exe" },
  { id:2, name:"Visual Studio Community", desc:"David Teran Gomez/Programacion Ori a Objs", url:"https://visualstudio.microsoft.com/es/thank-you-downloading-visual-studio/" },
  { id:3, name:"Siigo Aspel COI", desc:"Miriam Juárez Gutiérrez/Contabilidad Financiera", url:"https://www.siigo.com/mx/prueba-gratis-coi-aspel/" },
];

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
   LÓGICA DE INTERFAZ Y NAVEGACIÓN
══════════════════════════════════════ */
const badgeLabel = { blue:'PNG / JPG', red:'DOCX Sem 2', green:'DOCX/PDF Sem 2'};
const thumbIcon  = { blue:'🖼️', red:'📝', green:'📋'};

function renderGrid(gridId, items, color, query='') {
  const grid = document.getElementById(gridId);
  const q = query.toLowerCase();
  const filtered = items.filter(f => f.name.toLowerCase().includes(q));
  if (!filtered.length) { grid.innerHTML = `<div class="empty-msg">⚠️ Sin resultados.</div>`; return; }
  grid.innerHTML = filtered.map((f,i) => `
    <div class="card card-${color}" style="animation-delay:${i*0.05}s">
      <div class="card-thumb thumb-${color}">
        <div class="thumb-icon">${thumbIcon[color] || '💾'}</div>
        <span class="badge badge-${color}">${badgeLabel[color] || 'Software / App'}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escHtml(f.name)}</div>
        <div class="card-meta">${escHtml(f.desc||'—')}</div>
        <a class="btn-dl btn-${color}" href="${escHtml(f.url)}" target="_blank" rel="noopener">Descargar</a>
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
function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

document.addEventListener("DOMContentLoaded", () => {
  renderGrid('gridMem',  membretes,         'blue');
  renderGrid('gridFmt',  formatos,          'red');
  renderGrid('gridInst', instrumentaciones, 'green');
  renderGrid('gridProg', programas,         'blue');
  renderMaterias();
});

/* ══════════════════════════════════════════
   GENERADOR DE FONDO ANIMADO MUNDIALISTA
══════════════════════════════════════════ */
function generarFondoTrionda() {
  const bgContainer = document.getElementById('worldcup-bg');
  if (!bgContainer) return;
  
  // Colores principales de la paleta Trionda
  const colors = ['#e20047', '#0044ff', '#00cc44'];
  const numShapes = 200; 
  
  // Figuras SVG relacionadas al mundial
  const pentagono = `<svg viewBox="0 0 100 100"><polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="COLOR" stroke-width="5"/><circle cx="50" cy="53" r="10" fill="COLOR"/></svg>`;
  const cancha = `<svg viewBox="0 0 100 100"><rect x="10" y="15" width="80" height="70" rx="5" fill="none" stroke="COLOR" stroke-width="4"/><line x1="50" y1="15" x2="50" y2="85" stroke="COLOR" stroke-width="4"/><circle cx="50" cy="50" r="12" fill="none" stroke="COLOR" stroke-width="4"/></svg>`;
  const trofeo = `<svg viewBox="0 0 100 100"><path d="M30 20 C30 10, 70 10, 70 20 C70 45, 55 55, 55 70 L45 70 C45 55, 30 45, 30 20 Z" fill="none" stroke="COLOR" stroke-width="4"/><rect x="35" y="70" width="30" height="15" fill="none" stroke="COLOR" stroke-width="4"/><line x1="15" y1="20" x2="30" y2="20" stroke="COLOR" stroke-width="4"/><line x1="70" y1="20" x2="85" y2="20" stroke="COLOR" stroke-width="4"/></svg>`;
  const silbato = `<svg viewBox="0 0 100 100"><circle cx="65" cy="50" r="20" fill="none" stroke="COLOR" stroke-width="5"/><path d="M15 45 L45 45 L45 55 L15 55 Z" fill="COLOR"/><circle cx="65" cy="50" r="6" fill="COLOR"/></svg>`;
  const zapato = `<svg viewBox="0 0 100 100"><path d="M15 70 L85 70 C90 70, 95 60, 90 50 C80 35, 55 35, 45 25 L20 25 L15 70 Z" fill="none" stroke="COLOR" stroke-width="4"/><circle cx="25" cy="75" r="4" fill="COLOR"/><circle cx="50" cy="75" r="4" fill="COLOR"/><circle cx="75" cy="75" r="4" fill="COLOR"/></svg>`;
  const tarjetas = `<svg viewBox="0 0 100 100"><rect x="20" y="15" width="35" height="50" rx="3" fill="none" stroke="COLOR" stroke-width="4" transform="rotate(-15 37 40)"/><rect x="45" y="25" width="35" height="50" rx="3" fill="none" stroke="COLOR" stroke-width="4" transform="rotate(10 62 50)"/></svg>`;
  const pelota = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="COLOR" stroke-width="4"/><polygon points="50,35 63,44 58,59 42,59 37,44" fill="none" stroke="COLOR" stroke-width="4"/><line x1="50" y1="35" x2="50" y2="10" stroke="COLOR" stroke-width="4"/><line x1="63" y1="44" x2="84" y2="31" stroke="COLOR" stroke-width="4"/><line x1="58" y1="59" x2="74" y2="82" stroke="COLOR" stroke-width="4"/><line x1="42" y1="59" x2="26" y2="82" stroke="COLOR" stroke-width="4"/><line x1="37" y1="44" x2="16" y2="31" stroke="COLOR" stroke-width="4"/></svg>`;
  const camiseta = `<svg viewBox="0 0 100 100"><path d="M35 20 L20 32 L28 44 L36 38 L36 80 L64 80 L64 38 L72 44 L80 32 L65 20 C60 25, 40 25, 35 20 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><line x1="36" y1="45" x2="64" y2="45" stroke="COLOR" stroke-width="2"/></svg>`;
  const mundial26 = `<svg viewBox="0 0 100 100"><path d="M18 38 C18 22, 45 22, 45 38 C45 52, 18 55, 18 75 L48 75" fill="none" stroke="COLOR" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M78 28 C63 28, 54 45, 54 60 C54 75, 82 75, 82 58 C82 45, 54 45, 54 58" fill="none" stroke="COLOR" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const banderin = `<svg viewBox="0 0 100 100"><line x1="30" y1="15" x2="30" y2="85" stroke="COLOR" stroke-width="5" stroke-linecap="round"/><polygon points="30,15 75,32 30,50" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><line x1="15" y1="85" x2="55" y2="85" stroke="COLOR" stroke-width="5" stroke-linecap="round"/></svg>`;
  const cronometro = `<svg viewBox="0 0 100 100"><circle cx="50" cy="55" r="30" fill="none" stroke="COLOR" stroke-width="4"/><rect x="45" y="12" width="10" height="10" fill="COLOR"/><line x1="38" y1="12" x2="62" y2="12" stroke="COLOR" stroke-width="4"/><line x1="50" y1="55" x2="50" y2="35" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="55" x2="68" y2="45" stroke="COLOR" stroke-width="3" stroke-linecap="round"/></svg>`;
  const medalla = `<svg viewBox="0 0 100 100"><path d="M32 15 L50 48 L68 15" fill="none" stroke="COLOR" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="50" cy="65" r="20" fill="none" stroke="COLOR" stroke-width="4"/><circle cx="50" cy="65" r="8" fill="COLOR"/></svg>`;
  const estadio = `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="32" fill="none" stroke="COLOR" stroke-width="4"/><ellipse cx="50" cy="50" rx="32" ry="20" fill="none" stroke="COLOR" stroke-width="3"/><rect x="36" y="42" width="28" height="16" rx="2" fill="none" stroke="COLOR" stroke-width="3"/><line x1="50" y1="18" x2="50" y2="30" stroke="COLOR" stroke-width="3"/><line x1="50" y1="70" x2="50" y2="82" stroke="COLOR" stroke-width="3"/><line x1="5" y1="50" x2="18" y2="50" stroke="COLOR" stroke-width="3"/><line x1="82" y1="50" x2="95" y2="50" stroke="COLOR" stroke-width="3"/></svg>`;
  const copa = `<svg viewBox="0 0 100 100"><path d="M35 85 L65 85 L62 70 L38 70 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><line x1="36.5" y1="77" x2="63.5" y2="77" stroke="COLOR" stroke-width="3"/><path d="M42 70 C42 55, 30 48, 38 36 C43 30, 48 34, 50 38 C52 34, 57 30, 62 36 C70 48, 58 55, 58 70" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="24" r="13" fill="none" stroke="COLOR" stroke-width="4"/><path d="M40 20 Q50 26 60 20" fill="none" stroke="COLOR" stroke-width="3"/></svg>`;
  const viajeMundial = `<svg viewBox="0 0 100 100"><path d="M50 12 L55 35 L88 55 L56 55 L50 85 L44 55 L12 55 L45 35 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><path d="M20 25 A40 40 0 0 1 80 25" fill="none" stroke="COLOR" stroke-width="3" stroke-dasharray="6,4" stroke-linecap="round"/></svg>`;
  const porteria = `<svg viewBox="0 0 100 100"><path d="M10 80 L10 25 L90 25 L90 80" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="10" y1="43" x2="90" y2="43" stroke="COLOR" stroke-width="2"/><line x1="10" y1="61" x2="90" y2="61" stroke="COLOR" stroke-width="2"/><line x1="36" y1="25" x2="36" y2="80" stroke="COLOR" stroke-width="2"/><line x1="64" y1="25" x2="64" y2="80" stroke="COLOR" stroke-width="2"/><circle cx="36" cy="43" r="7" fill="COLOR"/></svg>`;
  const logoOficial26 = `<svg viewBox="0 0 100 100">
  <!-- El número 26 vertical de fondo (grueso) -->
  <path d="M40 10 C25 10, 20 25, 30 35 L50 55 C60 65, 55 80, 40 80 L60 80" fill="none" stroke="COLOR" stroke-width="8" stroke-linecap="round"/>
  <path d="M80 20 C65 20, 60 35, 60 50 C60 65, 80 65, 80 50 C80 35, 60 35, 60 50" fill="none" stroke="COLOR" stroke-width="8" stroke-linecap="round"/>
  <!-- La Copa FIFA en el centro (más fina para contrastar y superpuesta) -->
  <path d="M42 85 L58 85 L56 75 L44 75 Z" fill="COLOR"/>
  <path d="M50 75 C50 65, 42 60, 44 52 C46 48, 50 50, 50 52 C50 50, 54 48, 56 52 C58 60, 50 65, 50 75" fill="none" stroke="COLOR" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="50" cy="46" r="7" fill="none" stroke="COLOR" stroke-width="3"/>
</svg>`;
  const banderasHost = `<svg viewBox="0 0 100 100">
  <!-- CANADÁ (Izquierda: Hoja de maple estilizada) -->
  <rect x="5" y="25" width="25" height="50" rx="2" fill="none" stroke="COLOR" stroke-width="3"/>
  <path d="M17.5 35 L19 41 L25 40 L21 45 L23 51 L17.5 48 L12 51 L14 45 L10 40 L16 41 Z" fill="COLOR"/>
  
  <!-- USA (Centro: Barras y zona de estrellas) -->
  <rect x="37.5" y="25" width="25" height="50" rx="2" fill="none" stroke="COLOR" stroke-width="3"/>
  <rect x="37.5" y="25" width="12" height="15" fill="COLOR"/>
  <line x1="50" y1="31" x2="62.5" y2="31" stroke="COLOR" stroke-width="2"/>
  <line x1="37.5" y1="37" x2="62.5" y2="37" stroke="COLOR" stroke-width="2"/>
  <line x1="37.5" y1="43" x2="62.5" y2="43" stroke="COLOR" stroke-width="2"/>
  
  <!-- MÉXICO (Derecha: Tricolor y escudo central) -->
  <rect x="70" y="25" width="25" height="50" rx="2" fill="none" stroke="COLOR" stroke-width="3"/>
  <line x1="78.3" y1="25" x2="78.3" y2="75" stroke="COLOR" stroke-width="2"/>
  <line x1="86.6" y1="25" x2="86.6" y2="75" stroke="COLOR" stroke-width="2"/>
  <circle cx="82.5" cy="50" r="4" fill="COLOR"/>
</svg>`;
  const fanCelebrando = `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="25" r="10" fill="none" stroke="COLOR" stroke-width="4"/>
  <path d="M20 40 Q50 30, 80 40 L75 55 Q50 45, 25 55 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/>
  <path d="M35 52 L35 90 M65 52 L65 90" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round"/>
  <path d="M20 40 L10 15 M80 40 L90 15" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round"/>
</svg>`;

  const shapes = [pentagono, cancha, trofeo, silbato, zapato, tarjetas, pelota, camiseta, mundial26, banderin, cronometro, medalla, estadio, copa, viajeMundial, porteria, logoOficial26, banderasHost, fanCelebrando];
  const animations = ['floatRandom1', 'floatRandom2', 'floatRandom3'];

  for (let i = 0; i < numShapes; i++) {
    const div = document.createElement('div');
    const size = Math.random() * 70 + 35; 
    const color = colors[Math.floor(Math.random() * colors.length)];
    const svgCode = shapes[Math.floor(Math.random() * shapes.length)].replace(/COLOR/g, color);
    
    div.innerHTML = svgCode;
    div.className = 'bg-shape';
    
    div.style.left = (Math.random() * 120 - 10) + 'vw';
    div.style.top = (Math.random() * 120 - 10) + 'vh';
    div.style.width = size + 'px';
    div.style.height = size + 'px';
    
    // Aumenté la opacidad (entre 6% y 15%) para que sí se vean
    div.style.opacity = Math.random() * 0.09 + 0.06; 
    
    const anim = animations[Math.floor(Math.random() * animations.length)];
    const duration = Math.random() * 40 + 30; 
    const delay = Math.random() * -50; 
    
    div.style.animation = `${anim} ${duration}s infinite ease-in-out ${delay}s`;
    
    bgContainer.appendChild(div);
  }
}

document.addEventListener('DOMContentLoaded', generarFondoTrionda);
// ── SISTEMA DE AVISOS CONFIGURABLES DESDE TXT ──

/**
 * Lee aviso.txt, procesa su configuración inicial y despliega el pop-up según el modo indicado.
 */
function checkAcademicNotice() {
  fetch('aviso.txt')
    .then(response => {
      if (!response.ok) throw new Error('No se encontró el archivo aviso.txt');
      return response.text();
    })
    .then(text => {
      if (!text.trim()) return;

      // Valores por defecto en caso de que no se especifiquen en el txt
      let config = {
        modo: 'MANUAL',
        duracion: 5000,
        version: '1.0',
        titulo: ''
      };
      let mensaje = text;

      // Detectar si existe la línea divisoria de configuración
      if (text.includes('---')) {
        const partes = text.split('---');
        const lineasConfig = partes[0];
        // Volvemos a unir el resto por si el mensaje contiene caracteres "---"
        mensaje = partes.slice(1).join('---').trim(); 

        // Leer y mapear cada línea de configuración (CLAVE=VALOR)
        lineasConfig.split('\n').forEach(linea => {
          const coincidencia = linea.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$/);
          if (coincidencia) {
            const clave = coincidencia[1].toLowerCase();
            const valor = coincidencia[2].trim();
            config[clave] = valor;
          }
        });
      }

      // Si después del procesamiento el mensaje quedó vacío, no mostramos nada
      if (mensaje.length === 0) return;

      const modoActivo = config.modo.toUpperCase();

      // Control del modo SESION: si ya se mostró en esta pestaña, romper ejecución
      if (modoActivo === 'SESION') {
        if (sessionStorage.getItem('academic_notice_displayed') === 'true') {
          return;
        }
      }

      // Control del modo UPDATE: si la versión coincide con la leída localmente, no interrumpir al usuario
      if (modoActivo === 'UPDATE') {
        const versionGuardada = localStorage.getItem('academic_app_version');
        if (versionGuardada === config.version) {
          return;
        }
      }

      // Almacenar configuración de forma global temporal para resolver el evento de cierre
      window.currentNoticeConfig = config;

      // Inyectar el cuerpo del texto en el contenedor HTML
      document.getElementById('notice-body').textContent = mensaje;
      
      // Personalizar dinámicamente el título según configuración o modo
      const titleEl = document.querySelector('#notice-popup h3');
      if (titleEl) {
        if (config.titulo) {
          titleEl.textContent = config.titulo;
        } else if (modoActivo === 'UPDATE') {
          titleEl.innerHTML = '✨ ¡Nueva Actualización Disponible! (v' + config.version + ')';
        } else {
          titleEl.innerHTML = '📢 Aviso Importante';
        }
      }

      // Lanzar el pop-up de forma fluida a un segundo de la carga
      setTimeout(() => {
        document.getElementById('notice-popup').classList.add('active');
        
        // Ejecutar auto-cierre si el modo es por TIEMPO
        if (modoActivo === 'TIEMPO') {
          const milisegundos = parseInt(config.duracion) || 5000;
          setTimeout(closeNotice, milisegundos);
        }

        // Registrar que ya se mostró si el modo es SESION
        if (modoActivo === 'SESION') {
          sessionStorage.setItem('academic_notice_displayed', 'true');
        }
      }, 1000);
    })
    .catch(error => {
      console.log('Sistema de Avisos:', error.message);
    });
}

function closeNotice() {
  document.getElementById('notice-popup').classList.remove('active');
  
  // Al cerrar un aviso tipo UPDATE, guardamos de forma persistente que el usuario ya vio esta versión
  if (window.currentNoticeConfig && window.currentNoticeConfig.modo.toUpperCase() === 'UPDATE') {
    localStorage.setItem('academic_app_version', window.currentNoticeConfig.version);
  }
}

function closeNoticeOnBackdrop(event) {
  if (event.target.id === 'notice-popup') {
    closeNotice();
  }
}

// Registrar el inicio automático del sistema de avisos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  checkAcademicNotice();
});