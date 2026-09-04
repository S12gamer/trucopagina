/* ═══════════════════════════════════════════════════
   APP.JS — Centro de Recursos Académicos
   Módulos concatenados en orden de ejecución original
═══════════════════════════════════════════════════ */

/* ═══ 1. DATOS Y LÓGICA PRINCIPAL DE LA APP ═══ */
/* ═════════════════════════════════════════
   DATA
═════════════════════════════════════════ */
const membretes = [
  {id:1,name:"Membrete Oficial PS",       desc:"Uso vertical Superior",                         url:"https://drive.google.com/uc?export=download&id=10HmkDc5HWUCwZXx8DwoEngPrnPEt40YZ"},
  {id:2,name:"Membrete Oficial PI",        desc:"Uso vertical Inferior",                          url:"https://drive.google.com/uc?export=download&id=1vBb9mY5NX6r1JB0FaEDcO0RnKJxQ-aUX"},
  {id:3,name:"Membrete Oficial PS Horiz.", desc:"Uso horizontal Superior",                        url:"https://drive.google.com/uc?export=download&id=1-xAeQV0TdWiM4RcIw2wpfrvPxo_cWRlG"},
  {id:4,name:"Membrete Oficial PI Horiz.", desc:"Uso horizontal Inferior",                        url:"https://drive.google.com/uc?export=download&id=1QJwbhkDU_KDQLzc_9bnj68uRqag9ZnTi"},
  {id:5,name:"Membrete Pájaro PS",         desc:"Uso vertical Superior (solo docs oficiales)",    url:"https://drive.google.com/uc?export=download&id=1zoOcVsd0rAsii8j_b4mb9PvNqCfONSNH"},
  {id:6,name:"Membrete Pájaro PI",         desc:"Uso vertical Inferior (solo docs oficiales)",    url:"https://drive.google.com/uc?export=download&id=1JaqsRhII0VOA9rg5zLcZC2R1rnCUPysu"},
];

/* sem: 0=General, 2=2°Sem, 3=3°Sem, 4=4°Sem  (agregue sem a cada item) */
const formatos = [
  /* ── General ── */
  {id:8, sem:0,  name:"Formato en Blanco",      desc:"By: S12/Trucoteca",           url:"https://drive.google.com/uc?export=download&id=1nnNn-clnrsO2IaELLLb6eLd0Jo4ZnNcY"},
  {id:9, sem:0,  name:"Formato Membrete",       desc:"By: S12/Trucoteca",           url:"https://drive.google.com/uc?export=download&id=1AKJGf0J50JLBezSxDx3ToCDeIHivWK2a"},
  {id:11,sem:0,  name:"Portada Institucional",  desc:"By: S12/Trucoteca & CS",      url:"https://drive.google.com/uc?export=download&id=1tXl9qaRw54kI1k7oKZcvU-yfnsNHzxrF"},
  /* ── 2° Semestre ── */
  {id:1, sem:2,  name:"Formato Probabilidad",   desc:"Lidia González González",     url:"https://drive.google.com/uc?export=download&id=1KWvFgXadQB92KiBse6GagPoR4bB6xX8C"},
  {id:2, sem:2,  name:"Formato Física General", desc:"Jessica L. Morales H.",       url:"https://drive.google.com/uc?export=download&id=1WSqHHTgocPbgg-Y_9vTcN_4ujdyBJ6WI"},
  {id:3, sem:2,  name:"Formato Álgebra Lineal", desc:"José Juan Santana Ortiz",     url:"https://drive.google.com/uc?export=download&id=1fGJapgubiQTlxdwj9BNgqejENbc9Mt6Z"},
  {id:4, sem:2,  name:"Formato Contabilidad",   desc:"Miriam Juárez Gutiérrez",     url:"https://drive.google.com/uc?export=download&id=1WgRi46MP3lINGlevafaJyZRFHBf1YyD0"},
  {id:5, sem:2,  name:"Formato Cálculo Int.",   desc:"Brian Antonio Mejía Díaz",    url:"https://drive.google.com/uc?export=download&id=1LByc9bIXhi24O3rP4TVfu1QXUxu1jUJ8"},
  {id:6, sem:2,  name:"Formato POO",            desc:"David Teran Gomez",           url:"https://drive.google.com/uc?export=download&id=1qYJX9Xuqyg6kswRroMZYdaQO5dd9qBfv"},
  {id:7, sem:2,  name:"Formato Reportes POO",   desc:"David Teran Gomez",           url:"https://drive.google.com/uc?export=download&id=1hREa4VMdEWgN6OZKGssuW4QGLQDujICT"},
  {id:10,sem:2,  name:"Portafolio Cálculo Int.", desc:"By: S12/Trucoteca & CS",     url:"https://drive.google.com/uc?export=download&id=1Tfet0QQcinRFSIKr5VCT-GIDr_eU5env"},
  {id:12,sem:2,  name:"Portafolio Conta",        desc:"By: CS",                     url:"https://drive.google.com/uc?export=download&id=1-G1aWJ7nLLRizXx3J4JKRpHmvhxbaDa8"},
  {id:13,sem:2,  name:"Portafolio Física",       desc:"By: S12/Trucoteca",          url:"https://drive.google.com/uc?export=download&id=1C26atG7hMxCDd0GT9-z-p69XZdPcK7gX"},
  {id:14,sem:2,  name:"Portafolio Álgebra Lin.", desc:"By: CS",                     url:"https://drive.google.com/uc?export=download&id=1IH7Q4wjhWU-7zEUQa2a1yE2qXJz0ENI1"},
  /* ── 3° y 4° ── (agrega los tuyos aquí con sem:3 o sem:4) */
  {id:14, sem:3,  name:"Formato Cultura Empresarial",   desc:"M. en TI Edith Flores Morales",     url:"https://drive.google.com/uc?export=download&id=1bQdqI4YcRz0fM9PxyQA8facak7Ct9SUL"},
   /* {id:15, sem:3,  name:"Formato Calculo Vectorial", desc:"Profr. Fernando René barbosa Morales",       url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
   /* {id:16, sem:3,  name:"Formato Investigacíon de Operaciones", desc:"José Juan Santana Ortiz",     url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
   /* {id:17, sem:3,  name:"Formato Sistemas Operativos",   desc:"Oscar Olivares López",     url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
   /* {id:18, sem:3,  name:"Formato Estructura de Datos",   desc:"Luis Antonio Reynoso Sánchez",    url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
   /* {id:19, sem:3,  name:"Formato PEAD",            desc:"Christopher Aron Rico Fonseca",           url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
   /* {id:20, sem:3,  name:"Formato Ingles N5 y N6",   desc:"Karen Dalí Figueroa Vázquez",           url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
   /* {id:21,sem:3,  name:"Portafolio Cálculo Vectorial", desc:"By: S12/Trucoteca & CS",     url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
  {id:22,sem:3,  name:"Portafolio Cultura Empresarial",        desc:"M. en TI Edith Flores Morales",                     url:"https://drive.google.com/uc?export=download&id=1EWf6o0aoVpgXT2jKoy3CY4GoAiO4HYGm"},
   /* {id:23,sem:3,  name:"Portafolio Ingles N5 y N6",       desc:"By: S12/Trucoteca",          url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
   /* {id:24,sem:3,  name:"Portafolio Sitemas Operativos", desc:"By: CS",                     url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
];

const instrumentaciones = [
  {id:1,sem:2,name:"Instrumentación Cálculo Int.",          desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=1n_PpXeGg2JuK6nJbkADMl2yO-S-ZA0cd"},
  {id:2,sem:2,name:"Instrumentación Física General",         desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=1Y7S_qjhCObFferQf_2rA18ZORquL1ds1"},
  {id:3,sem:2,name:"Instrumentación Álgebra Lineal",         desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=19vlAwJTEoCbp7EcuyKQVJmK7FmE8t4jR"},
  {id:4,sem:2,name:"Instrumentación Probabilidad",           desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=1WKMWFkHZDJcKCAsGD2GpVe1SgtWNgTyy"},
  {id:5,sem:2,name:"Instrumentación Contabilidad",           desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=1fbFq6p6c7_IixfQmfKTwZKCfplO4jmUi"},
  {id:6,sem:2,name:"Instrumentación Inglés N3 y N4",         desc:"Planeación — Coord. Lenguas Extranjeras", url:"https://drive.google.com/uc?export=download&id=1k4tEpzfDz2WFzENnyknNk9uLUOUUhB1h"},
  {id:7,sem:2,name:"Instrumentación POO",                    desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=1r0BRhQvbeAI703Muet0h_WhNbEej9Ox1"},
  /* ── 3° y 4° ── (agrega los tuyos aquí con sem:3 o sem:4) */
  {id:8,sem:3,name:"Instrumentación Cultura Empresarial",          desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=19i91lh-_c7NxsOW_OsrLPbvTqqZsX2bp"},
  /* {id:9,sem:3,name:"Instrumentación Calculo Vectorial",         desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
  /* {id:10,sem:3,name:"Instrumentación investigacion de Operaciones",         desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
  /* {id:11,sem:3,name:"Instrumentación Sistemas Operativos",           desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
  /* {id:12,sem:3,name:"Instrumentación Estructura de Datos",           desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
  /* {id:13,sem:3,name:"Instrumentación Inglés N5 y N6",         desc:"Planeación — Coord. Lenguas Extranjeras", url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
  /* {id:14,sem:3,name:"Instrumentación PEAD",                    desc:"Planeación semestral — ISC",              url:"https://drive.google.com/uc?export=download&id=cambiar id del link"},*/
];

const programas = [
  {id:1,name:"Anaconda Spyder 6",       desc:"Brian A. Mejía Díaz / Cálculo Integral",      url:"https://repo.anaconda.com/archive/Anaconda3-2025.12-2-Windows-x86_64.exe"},
  {id:2,name:"Visual Studio Community", desc:"David Teran Gomez / POO",                     url:"https://visualstudio.microsoft.com/es/thank-you-downloading-visual-studio/?sku=Community&channel=Stable&version=VS18&source=VSLandingPage"},
  {id:3,name:"Siigo Aspel COI",         desc:"Miriam Juárez Gutiérrez / Contabilidad",      url:"https://www.siigo.com/mx/prueba-gratis-coi-aspel/"},
  {id:4,name:"GeoGebra Suite",         desc:"Fernando René barbosa Morales / Calculo Vectorial",      url:"https://download.geogebra.org/package/win-suite"},
  {id:5,name:"Oracle VirtualBox",         desc:"Oscar Olivares López / Sistemas operativos",      url:"https://download.virtualbox.org/virtualbox/7.2.16/VirtualBox-7.2.16-174877-Win.exe"},
];

const materias = [
  {id:1,sem:2,nombre:"Cálculo Integral",icono:"📐",semestre:"2° Semestre",
   atributo:"Desarrollar un pensamiento lógico-matemático y proporcionar herramientas para modelar fenómenos de contexto.",
   objetivo:"Que el estudiante domine los fundamentos del cálculo diferencial, comprendiendo límites, derivadas y sus aplicaciones en la resolución de problemas reales de ingeniería.",
   codigo:"NO disponible",
   generales:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"medio"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"medio"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"basico"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ],
   especificos:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"alto"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"alto"},
     {letra:"d",texto:"Resuelve problemas de optimización modelados con derivadas.",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"medio"},
   ]},
  {id:2,sem:2,nombre:"Física General",icono:"⚡",semestre:"2° Semestre",
   atributo:"Fortalece la comprensión de fenómenos naturales y sus aplicaciones al mundo real. Análisis y razonamiento crítico para la resolución de problemas profesionales.",
   objetivo:"Que el estudiante comprenda y aplique los principios del electromagnetismo, incluyendo campos eléctricos, magnéticos y circuitos básicos, en contextos de ingeniería.",
   codigo:"NO disponible",
   generales:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"alto"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"medio"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ],
   especificos:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"alto"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"alto"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ]},
  {id:3,sem:2,nombre:"Álgebra Lineal",icono:"💻",semestre:"2° Semestre",
   atributo:"Analizar problemáticas complejas y proponer soluciones innovadoras mediante un enfoque lógico y estructurado basado en fundamentos matemáticos y computacionales.",
   objetivo:"El Álgebra Lineal aporta al perfil del ingeniero la capacidad para desarrollar un pensamiento lógico, heurístico y algorítmico al modelar fenómenos de naturaleza lineal.",
   codigo:"NO disponible",
   generales:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"medio"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"medio"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ],
   especificos:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"alto"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"alto"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ]},
  {id:4,sem:2,nombre:"Probabilidad y Estadística",icono:"🔥",semestre:"2° Semestre",
   atributo:"Entender, aplicar y desarrollar modelos matemáticos utilizando técnicas estadísticas para la toma de decisiones en ciencias computacionales.",
   objetivo:"Que el estudiante comprenda y aplique la estadística descriptiva e inferencial y la teoría de probabilidad para analizar e interpretar datos en proyectos de ingeniería.",
   codigo:"NO disponible",
   generales:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"medio"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"medio"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"alto"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"medio"},
   ],
   especificos:[
     {letra:"a",texto:"Se adapta a situations y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"alto"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"alto"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ]},
  {id:5,sem:2,nombre:"Contabilidad Financiera",icono:"📊",semestre:"2° Semestre",
   atributo:"Analizar problemáticas complejas y proponer soluciones integrales mediante el uso de herramientas tecnológicas y financieras.",
   objetivo:"Que el estudiante aplique conceptos de contabilidad financiera para analizar e interpretar estados financieros en proyectos de ingeniería.",
   codigo:"NO disponible",
   generales:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"medio"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"medio"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"medio"},
   ],
   especificos:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"alto"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"alto"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ]},
   /* ── 3° y 4° ── (agrega los tuyos aquí con sem:3 o sem:4) */
   {id:6,sem:3,nombre:"Cultura Empresarial",icono:"🏢",semestre:"3° Semestre",
   atributo:"Desarrollar un pensamiento lógico-matemático y proporcionar herramientas para modelar fenómenos de contexto.",
   objetivo:"Que el estudiante domine los fundamentos del cálculo diferencial, comprendiendo límites, derivadas y sus aplicaciones en la resolución de problemas reales de ingeniería.",
   codigo:"93mmilj",
   generales:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"medio"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"medio"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"basico"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ],
   especificos:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"alto"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"alto"},
     {letra:"d",texto:"Resuelve problemas de optimización modelados con derivadas.",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"medio"},
   ]},
   {id:7,sem:3,nombre:"Cálculo Vectorial",icono:"📐",semestre:"3° Semestre",
   atributo:"Desarrollar un pensamiento lógico-matemático y proporcionar herramientas para modelar fenómenos de contexto.",
   objetivo:"Que el estudiante domine los fundamentos del cálculo diferencial, comprendiendo límites, derivadas y sus aplicaciones en la resolución de problemas reales de ingeniería.",
   codigo:"78ufuy0",
   generales:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"medio"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"medio"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"basico"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ],
   especificos:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"alto"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"alto"},
     {letra:"d",texto:"Resuelve problemas de optimización modelados con derivadas.",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"medio"},
   ]},
   {id:8,sem:3,nombre:"Investigacion de Operaciones",icono:"📃",semestre:"3° Semestre",
   atributo:"Desarrollar un pensamiento lógico-matemático y proporcionar herramientas para modelar fenómenos de contexto.",
   objetivo:"Que el estudiante domine los fundamentos del cálculo diferencial, comprendiendo límites, derivadas y sus aplicaciones en la resolución de problemas reales de ingeniería.",
   codigo:"815f5p9",
   generales:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"medio"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"medio"},
     {letra:"d",texto:"Introduce recursos y experiencias que promueven un pensamiento crítico (ej. uso de TICs).",alcance:"basico"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"basico"},
   ],
   especificos:[
     {letra:"a",texto:"Se adapta a situaciones y contextos complejos.",alcance:"alto"},
     {letra:"b",texto:"Hace aportaciones a las actividades académicas desarrolladas.",alcance:"alto"},
     {letra:"c",texto:"Propone y/o explica soluciones o procedimientos no vistos en clase (creatividad).",alcance:"alto"},
     {letra:"d",texto:"Resuelve problemas de optimización modelados con derivadas.",alcance:"medio"},
     {letra:"e",texto:"Incorpora conocimientos y actividades interdisciplinarias en su aprendizaje.",alcance:"medio"},
     {letra:"f",texto:"Realiza su trabajo de manera autónoma y autorregulada.",alcance:"medio"},
   ]},
];

/* ═════════════════════════════════════════
   HELPERS
═════════════════════════════════════════ */
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

const badgeLabel={teal:'PNG / JPG',rust:'DOCX',green:'DOCX/PDF',orange:'Software'};
const thumbIcon ={teal:'🖼️',rust:'📝',green:'📋',orange:'💾'};

/* ═════════════════════════════════════════
   RENDER GRID (generic)
═════════════════════════════════════════ */
function renderGrid(gridId,items,color,query=''){
  const grid=document.getElementById(gridId);
  const q=query.toLowerCase();
  const filtered=items.filter(f=>f.name.toLowerCase().includes(q));
  if(!filtered.length){
    grid.innerHTML=`<div class="empty-state"><div class="empty-state-icon">🔍</div><p>Sin resultados para "${escHtml(query)}"</p></div>`;
    return;
  }
  grid.innerHTML=filtered.map((f,i)=>`
    <div class="card card-${color}" style="animation-delay:${i*.055}s">
      <div class="card-thumb thumb-${color}">
        <div class="thumb-icon">${thumbIcon[color]}</div>
        <span class="badge badge-${color}">${badgeLabel[color]}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escHtml(f.name)}</div>
        <div class="card-meta">${escHtml(f.desc||'—')}</div>
        <a class="btn-dl btn-${color}" href="${escHtml(f.url)}" target="_blank" rel="noopener" onclick="rippleBtn(event)">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>Descargar
        </a>
      </div>
    </div>`).join('');
  observeCards();
}
function filterGrid(gridId,items,color,value){renderGrid(gridId,items,color,value)}

/* ══════════════════════════════════════════
   CONTROL DE LA INTRO DE VIDEO (MODO PERSISTENTE)
══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const introContainer = document.getElementById("video-intro");
  const introVideo = document.getElementById("intro-video");

  if (!introContainer || !introVideo) return;

  // 🔍 COMPROBACIÓN ESTILO "UPDATE":
  // Si en el navegador ya está guardado que el usuario vio el video, 
  // lo eliminamos instantáneamente del HTML sin reproducir nada.
  if (localStorage.getItem("intro_video_visto5") === "true") {
    introContainer.remove();
    return; // Detiene el script aquí para que la web cargue normal
  }

  // Función encargada de realizar el fundido
  const finalizarIntro = () => {
    if (introContainer.classList.contains("fade-out")) return;
    
    introContainer.classList.add("fade-out");
    
    // 💾 GUARDAR EL REGISTRO:
    // Guardamos la marca de forma permanente en el navegador del usuario
    localStorage.setItem("intro_video_visto5", "true");
    
    setTimeout(() => {
      introContainer.remove();
    }, 800); // 0.8s de la transición CSS
  };

  // Detección anticipada (1.5 segundos antes de que termine)
  introVideo.addEventListener("timeupdate", () => {
    const segundosAnticipados = 0.5; 
    if (introVideo.duration) {
      const tiempoRestante = introVideo.duration - introVideo.currentTime;
      if (tiempoRestante <= segundosAnticipados) {
        finalizarIntro();
      }
    }
  });

  // Mecanismo de seguridad por si falla el video
  setTimeout(finalizarIntro, 6000); 
});

/* ═════════════════════════════════════════
   SEMESTER SELECTOR + ANIMATED TRANSITION
═════════════════════════════════════════ */
let currentSem='general';
let semTransitioning=false;
const semOrder=['general','2','3','4','5','6','7','8','9'];
/* Colors per semester for pill & accent */
const semColors={general:'#C8893A','2':'#923A28','3':'#2A6545','4':'#5B3E8F','5':'#923A28','6':'#3E5B8F','7':'#8F3E6D','8':'#C97C2A','9':'#54647A'};

function initSemPill(){
  const activeTab=document.querySelector('.sem-tab.active');
  if(!activeTab)return;
  moveSemPill(activeTab,true);
}

function moveSemPill(tabEl,instant=false){
  const pill=document.getElementById('sem-pill');
  const tabsRect=document.getElementById('semTabs').getBoundingClientRect();
  const tabRect=tabEl.getBoundingClientRect();
  if(!pill||!tabsRect.width)return;
  const left=tabRect.left-tabsRect.left;
  const width=tabRect.width;
  if(instant){
    pill.style.transition='none';
    pill.style.left=left+'px';
    pill.style.width=width+'px';
  } else {
    pill.style.transition='left .45s cubic-bezier(.34,1.56,.64,1),width .45s cubic-bezier(.34,1.56,.64,1),background .4s';
    pill.style.left=left+'px';
    pill.style.width=width+'px';
  }
  const c=semColors[tabEl.dataset.sem]||'#C8893A';
  pill.style.background=hexToRgba(c,.12);
  pill.style.border=`1px solid ${hexToRgba(c,.28)}`;
}

function hexToRgba(hex,a){
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function updateSemCount(n,color){
  const badge=document.getElementById('semCountBadge');
  if(!badge)return;
  badge.textContent=n+' formato'+(n===1?'':'s');
  const c=semColors[color]||semColors[currentSem];
  badge.style.background=hexToRgba(c,.12);
  badge.style.color=c;
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');
}

function switchSemester(sem,tabEl){
  if(sem===currentSem||semTransitioning)return;
  semTransitioning=true;

  const prevIdx=semOrder.indexOf(currentSem);
  const newIdx=semOrder.indexOf(sem);
  const dir=newIdx>prevIdx?1:-1;

  /* Update tabs */
  document.querySelectorAll('.sem-tab').forEach(t=>t.classList.remove('active'));
  tabEl.classList.add('active');
  moveSemPill(tabEl);

  /* Collect current cards */
  const grid=document.getElementById('gridFmt');
  const cards=Array.from(grid.querySelectorAll('.card'));

  const EXIT_STAGGER=38;   /* ms between each card exit */
  const EXIT_DUR=220;      /* each card exit duration */
  const ENTER_STAGGER=55;  /* ms between each card entrance */

  const doEnter=()=>{
    currentSem=sem;
    const filtered=getFmtFiltered();

    if(!filtered.length){
      grid.innerHTML=`<div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <p>No hay formatos para este semestre todavía.<br><small style="opacity:.6">Próximamente…</small></p>
      </div>`;
      updateSemCount(0,sem);
      semTransitioning=false;
      observeCards();
      return;
    }

    /* Render cards in enter-start state (off-screen) */
    grid.innerHTML=filtered.map((f,i)=>`
      <div class="card card-rust"
        style="opacity:0;
               transform:translateX(${dir*70}px) translateY(${dir*12}px) rotate(${dir*3}deg) scale(.88);
               transition:none;">
        <div class="card-thumb thumb-rust">
          <div class="thumb-icon">${thumbIcon.rust}</div>
          <span class="badge badge-rust">${badgeLabel.rust}</span>
        </div>
        <div class="card-body">
          <div class="card-title">${escHtml(f.name)}</div>
          <div class="card-meta">${escHtml(f.desc||'—')}</div>
          <a class="btn-dl btn-rust" href="${escHtml(f.url)}" target="_blank" rel="noopener" onclick="rippleBtn(event)">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>Descargar
          </a>
        </div>
      </div>`).join('');

    updateSemCount(filtered.length,sem);

    /* Spring entrance with stagger */
    const newCards=Array.from(grid.querySelectorAll('.card'));
    newCards.forEach((card,i)=>{
      setTimeout(()=>{
        card.style.transition=`transform .5s cubic-bezier(.34,1.56,.64,1) ${i*0.005}s,opacity .38s ease ${i*0.005}s`;
        card.style.transform='translateX(0) translateY(0) rotate(0deg) scale(1)';
        card.style.opacity='1';
        /* Mark as visible so hover/shine works */
        setTimeout(()=>card.classList.add('visible'),520);
      },i*ENTER_STAGGER);
    });

    setTimeout(()=>{semTransitioning=false},newCards.length*ENTER_STAGGER+600);
  };

  if(!cards.length){
    doEnter();
    return;
  }

  /* Exit: cards fan out in direction */
  cards.forEach((card,i)=>{
    const delay=i*EXIT_STAGGER;
    setTimeout(()=>{
      card.style.transition=`transform ${EXIT_DUR}ms cubic-bezier(.4,0,1,1),opacity ${EXIT_DUR-20}ms ease`;
      card.style.transform=`translateX(${dir*-75}px) translateY(${dir*-10}px) rotate(${dir*-3.5}deg) scale(.86)`;
      card.style.opacity='0';
    },delay);
  });

  /* Total exit time → fire enter */
  setTimeout(doEnter, cards.length*EXIT_STAGGER+EXIT_DUR+40);
}

function getFmtFiltered(query=''){
  const semKey=currentSem==='general'?0:parseInt(currentSem);
  const q=query.toLowerCase();
  return formatos.filter(f=>f.sem===semKey&&f.name.toLowerCase().includes(q));
}

function onFmtSearch(value){
  /* Re-render current semester with search filter */
  const filtered=getFmtFiltered(value);
  const grid=document.getElementById('gridFmt');
  if(!filtered.length){
    grid.innerHTML=`<div class="empty-state"><div class="empty-state-icon">🔍</div><p>Sin resultados para "${escHtml(value)}"</p></div>`;
    updateSemCount(0,currentSem);
    return;
  }
  renderFmtCards(filtered);
  updateSemCount(filtered.length,currentSem);
}

function renderFmtCards(filtered){
  const grid=document.getElementById('gridFmt');
  grid.innerHTML=filtered.map((f,i)=>`
    <div class="card card-rust" style="animation-delay:${i*.055}s">
      <div class="card-thumb thumb-rust">
        <div class="thumb-icon">📝</div>
        <span class="badge badge-rust">DOCX</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escHtml(f.name)}</div>
        <div class="card-meta">${escHtml(f.desc||'—')}</div>
        <a class="btn-dl btn-rust" href="${escHtml(f.url)}" target="_blank" rel="noopener" onclick="rippleBtn(event)">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>Descargar
        </a>
      </div>
    </div>`).join('');
  observeCards();
}

/* ═════════════════════════════════════════
   MATERIAS
═════════════════════════════════════════ */
function renderMaterias(query='',sem='general'){
  const container=document.getElementById('aeContainer');
  const q=query.toLowerCase();
  const semKey=sem==='general'?0:parseInt(sem);
  let filtered=materias.filter(m=>m.nombre.toLowerCase().includes(q));
  if(sem!=='general') filtered=filtered.filter(m=>m.sem===semKey);
  if(!filtered.length){
    container.innerHTML=`<div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:.8rem;padding:3rem 0;animation:cardIn .4s var(--smooth) both">
      <div style="font-size:3rem;animation:emptyFloat 2.5s ease-in-out infinite">📂</div>
      <p style="font-size:.86rem;color:var(--ink-faint)">${q?`Sin materias para "${escHtml(query)}"`:sem!=='general'?'No hay materias para este semestre todavía.<br><small style="opacity:.6">Próximamente…</small>':'Sin materias disponibles.'}</p>
    </div>`;
    return;
  }
  container.innerHTML=filtered.map((m,idx)=>`
    <div class="materia-card" id="mat-${m.id}" style="animation-delay:${idx*.06}s">
      <div class="materia-header" onclick="toggleMateria(${m.id})">
        <div class="materia-icon">${m.icono}</div>
        <div class="materia-info">
          <h3>${escHtml(m.nombre)}</h3>
          <span class="materia-sub">${escHtml(m.semestre)}</span>
        </div>
        <span class="materia-badge">Ver detalle</span>
        <svg class="materia-chevron" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="materia-body">
        <div class="materia-body-inner">
          <div class="atributo-box">
            <div class="box-label">Atributo de egreso</div>
            <p>${escHtml(m.atributo)}</p>
          </div>
          <div class="objetivo-box">
            <div class="box-label">Objetivo</div>
            <p>${escHtml(m.objetivo)}</p>
          </div>
          <div class="codigo-box">
            <div class="box-label">Codigo de clase</div>
            <p>${escHtml(m.codigo)}</p>
          </div>
          <div class="ind-section-title general">Indicadores de alcance generales</div>
          ${m.generales.map(ind=>indRow(ind,'general')).join('')}
          <div class="ind-section-title especifico" style="margin-top:1.5rem">Indicadores de alcance específicos</div>
          ${m.especificos.map(ind=>indRow(ind,'especifico')).join('')}
        </div>
      </div>
    </div>`).join('');
  observeCards();
}

function indRow(ind,tipo){
  const alcLabel={alto:'Alcance alto',medio:'Alcance medio',basico:'Alcance básico'};
  const tipoLabel=tipo==='general'?'General':'Específico';
  const bars=`<span class="alc-bar ${ind.alcance}">
    <span class="${ind.alcance==='alto'||ind.alcance==='medio'||ind.alcance==='basico'?'lit':''}"></span>
    <span class="${ind.alcance==='alto'||ind.alcance==='medio'?'lit':''}"></span>
    <span class="${ind.alcance==='alto'?'lit':''}"></span>
  </span>`;
  return `<div class="ind-row">
    <div class="ind-letter letter-${tipo}">${ind.letra}</div>
    <div class="ind-content">
      <div class="ind-text">${escHtml(ind.texto)}</div>
      <div class="ind-meta-row">
        <span class="ind-tipo tipo-${tipo}">${tipoLabel}</span>
        <span class="ind-alcance alc-${ind.alcance}">${alcLabel[ind.alcance]||ind.alcance}</span>
        ${bars}
      </div>
    </div>
  </div>`;
}

function toggleMateria(id){
  const card=document.getElementById('mat-'+id);
  card.classList.toggle('open');
  /* Animate ind-rows on open */
  if(card.classList.contains('open')){
    setTimeout(()=>{
      card.querySelectorAll('.ind-row').forEach((row,i)=>{
        row.style.animationDelay=i*.04+'s';
        row.classList.add('visible');
      });
    },80);
  } else {
    card.querySelectorAll('.ind-row').forEach(row=>row.classList.remove('visible'));
  }
}
function filterMaterias(v){renderMaterias(v,currentAtrSem)}

/* ═════════════════════════════════════════
   NAV PILL & PAGE SWITCH
═════════════════════════════════════════ */
function moveNavPill(linkEl){
  const pill=document.getElementById('nav-pill');
  const navLinks=document.getElementById('navLinks');
  const rect=linkEl.getBoundingClientRect();
  const containerRect=navLinks.getBoundingClientRect();
  const offsetTop=rect.top-containerRect.top+navLinks.scrollTop;
  pill.style.top=offsetTop+'px';
  pill.style.height=rect.height+'px';
}

document.getElementById('popup-cta').addEventListener('click', function(e) {
    e.preventDefault(); // Evita que el navegador intente navegar a la página "formatos"
    
    // Obtenemos el valor del href
    let textoHref = this.getAttribute('href'); 
    let botonCorrespondiente = document.querySelector(`[onclick*="showPage('${textoHref}'"]`);
    
    // 2. Llamamos a la función original pasándole la sección y el BOTÓN REAL
    if (botonCorrespondiente) {
        showPage(textoHref, botonCorrespondiente);
        closeNotice();
    } else {
        // Fallback por si acaso no encuentra el botón exacto en el nav
        showPage(textoHref, null);
        closeNotice(); 
    }
  });

function showPage(pageId,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+pageId).classList.add('active');
  btn.classList.add('active');
  moveNavPill(btn);
  if(pageId === 'formatos') initSemPill();
  if(pageId === 'instrumentaciones') initInstSemPill();
  if(pageId === 'atributos') initAtrSemPill();
  setTimeout(observeCards,60);
  refreshBackground(pageId);
}

/* ═════════════════════════════════════════
   INTERSECTION OBSERVER — REVEAL
═════════════════════════════════════════ */
let observer;
function observeCards(){
  if(observer)observer.disconnect();
  observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },{threshold:.06});
  document.querySelectorAll('.card:not(.visible),.materia-card:not(.visible)').forEach(el=>observer.observe(el));
}

/* ═════════════════════════════════════════
   3D TILT
═════════════════════════════════════════ */
function initTilt(){
  const content=document.getElementById('mainContent');
  content.addEventListener('mousemove',e=>{
    const card=e.target.closest('.card');
    if(!card)return;
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transition='transform .08s ease,box-shadow .3s';
    card.style.transform=`perspective(700px) rotateY(${x*11}deg) rotateX(${-y*9}deg) translateY(-6px) scale(1.02)`;
  });
  content.addEventListener('mouseleave',e=>{
    if(e.target.closest?.('.card')){
      const card=e.target.closest('.card');
      if(card){card.style.transition='transform .5s cubic-bezier(.34,1.56,.64,1),box-shadow .35s';card.style.transform=''}
    }
  },true);
  /* Also reset when mouse leaves a card naturally */
  document.addEventListener('mouseout',e=>{
    const card=e.target.closest?.('.card');
    if(card&&!card.contains(e.relatedTarget)){
      card.style.transition='transform .5s cubic-bezier(.34,1.56,.64,1),box-shadow .35s';
      card.style.transform='';
    }
  });
}

/* ═════════════════════════════════════════
   RIPPLE
═════════════════════════════════════════ */
function rippleBtn(e){
  const btn=e.currentTarget;
  const circle=document.createElement('span');
  const d=Math.max(btn.clientWidth,btn.clientHeight);
  const r=d/2;
  const rect=btn.getBoundingClientRect();
  circle.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-rect.left-r}px;top:${e.clientY-rect.top-r}px`;
  circle.classList.add('ripple');
  btn.querySelector('.ripple')?.remove();
  btn.appendChild(circle);
}

/* ═════════════════════════════════════════
   CURSOR GLOW
═════════════════════════════════════════ */
function initCursorGlow(){
  const glow=document.getElementById('cursor-glow');
  const content=document.getElementById('mainContent');
  content.addEventListener('mouseenter',()=>glow.classList.add('active'));
  content.addEventListener('mouseleave',()=>glow.classList.remove('active'));
  document.addEventListener('mousemove',e=>{
    glow.style.left=e.clientX+'px';
    glow.style.top=e.clientY+'px';
  });
}

/* ═════════════════════════════════════════
   NAV ENTRANCE STAGGER
═════════════════════════════════════════ */
function animateNavEntrance(){
  const links=document.querySelectorAll('.nav-link');
  links.forEach((link,i)=>{
    setTimeout(()=>{
      link.classList.add('nav-entered');
    },120+i*70);
  });
}

/* ═════════════════════════════════════════
   NOTICE SYSTEM  (personalizable desde aviso.txt)
═════════════════════════════════════════ */

/* Paleta de temas reutilizando las variables de color propias del sitio,
   para garantizar coherencia visual sea cual sea el tema elegido. */
const POPUP_TEMAS={
  amber:  {c1:'#C8893A',c2:'#923A28'},
  rust:   {c1:'#923A28',c2:'#C8893A'},
  teal:   {c1:'#1B7A6E',c2:'#23A090'},
  green:  {c1:'#2A6545',c2:'#37896B'},
  purple: {c1:'#5B3E8F',c2:'#8F3E6D'},
  blue:   {c1:'#3E5B8F',c2:'#1B7A6E'},
  rose:   {c1:'#8F3E6D',c2:'#E83E8C'},
  crimson:{c1:'#8F3E4E',c2:'#923A28'},
  slate:  {c1:'#54647A',c2:'#3E5B8F'},
  sepia:  {c1:'#735343',c2:'#C8893A'},
  orange: {c1:'#C97C2A',c2:'#E89A3C'},
  pink:   {c1:'#E83E8C',c2:'#B534B3'},
  orchid: {c1:'#B534B3',c2:'#8F3E6D'}
};
function popupHexToRgb(hex){
  const h=hex.replace('#','');
  const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}
function popupFechaEnRango(cfg){
  const hoy=new Date();hoy.setHours(0,0,0,0);
  if(cfg.fecha_inicio){const fi=new Date(cfg.fecha_inicio+'T00:00:00');if(!isNaN(fi)&&hoy<fi)return false}
  if(cfg.fecha_fin){const ff=new Date(cfg.fecha_fin+'T23:59:59');if(!isNaN(ff)&&hoy>ff)return false}
  return true;
}
function aplicarPersonalizacionPopup(config){
  const content=document.getElementById('popup-content');
  const overlay=document.getElementById('notice-popup');

  /* Tema de color */
  const temaKey=(config.tema||'amber').toLowerCase();
  const tema=POPUP_TEMAS[temaKey]||POPUP_TEMAS.amber;
  const rgb=popupHexToRgb(tema.c1);
  content.style.setProperty('--popup-c1',tema.c1);
  content.style.setProperty('--popup-c2',tema.c2);
  content.style.setProperty('--popup-glow-a',`rgba(${rgb},0)`);
  content.style.setProperty('--popup-glow-b',`rgba(${rgb},.35)`);
  content.style.setProperty('--popup-icon-bg',`rgba(${rgb},.14)`);

  /* Tamaño */
  content.classList.remove('tam-sm','tam-md','tam-lg');
  const tamano=['sm','md','lg'].includes((config.tamano||'').toLowerCase())?config.tamano.toLowerCase():'md';
  content.classList.add('tam-'+tamano);

  /* Animación de borde: ninguno | recorrido | pulso | brillo | arcoiris */
  content.classList.remove('borde-recorrido','borde-pulso','borde-brillo','borde-arcoiris');
  const borde=(config.borde||'ninguno').toLowerCase();
  if(['recorrido','pulso','brillo','arcoiris'].includes(borde))content.classList.add('borde-'+borde);

  /* Posición: centro (modal clásico) | esquina (toast no bloqueante) */
  overlay.classList.remove('pos-esquina');
  if((config.posicion||'').toLowerCase()==='esquina')overlay.classList.add('pos-esquina');

  /* Banner de imagen */
  const banner=document.getElementById('popup-banner');
  const bannerImg=document.getElementById('popup-banner-img');
  if(config.imagen){banner.style.display='';bannerImg.src=config.imagen}
  else{banner.style.display='none';bannerImg.src=''}

  /* Insignia de icono flotante */
  const badge=document.getElementById('popup-icon-badge');
  if(config.icono){badge.style.display='';badge.textContent=config.icono}
  else{badge.style.display='none';badge.textContent=''}
  badge.classList.remove('anim-girar','anim-latido','anim-rebote');
  const iconoAnim=(config.icono_animacion||'flotar').toLowerCase();
  if(['girar','latido','rebote'].includes(iconoAnim))badge.classList.add('anim-'+iconoAnim);

  /* Botón de acción (CTA) opcional */
  const cta=document.getElementById('popup-cta');
  if(config.boton_texto&&config.boton_link){
    cta.style.display='';cta.textContent=config.boton_texto;cta.href=config.boton_link;
  }else{cta.style.display='none';cta.removeAttribute('href')}

  /* Estilo de entrada: caida | deslizar | zoom | rebote | desvanecer */
  content.classList.remove('entra-caida','entra-deslizar','entra-zoom','entra-rebote','entra-desvanecer');
  const entrada=(config.entrada||'caida').toLowerCase();
  const entradasValidas=['caida','deslizar','zoom','rebote','desvanecer'];
  content.classList.add('entra-'+(entradasValidas.includes(entrada)?entrada:'caida'));

  /* Etiqueta / badge sobre el título (ej. "NUEVO", "URGENTE") */
  const label=document.getElementById('popup-label');
  if(config.etiqueta){label.style.display='';label.textContent=config.etiqueta}
  else{label.style.display='none';label.textContent=''}

  /* Textura de grano opcional, coherente con la textura de fondo del sitio */
  content.classList.toggle('con-textura',(config.textura||'').toLowerCase()==='true');

  /* Intensidad de sombra: suave | media | fuerte | ninguna */
  content.classList.remove('sombra-suave','sombra-media','sombra-fuerte','sombra-ninguna');
  const sombra=(config.sombra||'fuerte').toLowerCase();
  content.classList.add('sombra-'+(['suave','media','fuerte','ninguna'].includes(sombra)?sombra:'fuerte'));

  /* Resplandor ambiental tipo "orb" (mismo motivo del fondo del sitio) */
  const orbe=document.getElementById('popup-orbe');
  orbe.style.display=(config.orbe||'').toLowerCase()==='true'?'':'none';

  /* Enlace secundario "Recordarme más tarde" (snooze) */
  const recordar=document.getElementById('popup-recordar');
  if((config.boton_recordar||'').toLowerCase()==='true'){
    recordar.style.display='';
    recordar.textContent=config.recordar_texto||'Recordarme más tarde';
  }else{recordar.style.display='none';recordar.textContent=''}
}

function popupSnooze(){
  const cfg=window.currentNoticeConfig||{};
  const horas=parseFloat(cfg.recordar_horas)||24;
  localStorage.setItem('academic_notice_snooze_until',String(Date.now()+horas*3600*1000));
  closeNotice();
}
function checkAcademicNotice(){
  fetch('aviso.txt')
    .then(r=>{if(!r.ok)throw new Error('no aviso.txt');return r.text()})
    .then(text=>{
      if(!text.trim())return;
      let config={
        modo:'MANUAL',duracion:5000,version:'1.0',titulo:'',
        tema:'amber',borde:'ninguno',tamano:'md',posicion:'centro',
        icono:'',imagen:'',boton_texto:'',boton_link:'',
        fecha_inicio:'',fecha_fin:'',
        entrada:'caida',etiqueta:'',textura:'false',
        boton_recordar:'false',recordar_horas:'24',recordar_texto:'Recordarme más tarde',
        sombra:'fuerte',orbe:'false',icono_animacion:'flotar'
      };
      let mensaje=text;
      if(text.includes('---')){
        const p=text.split('---');
        mensaje=p.slice(1).join('---').trim();
        p[0].split('\n').forEach(l=>{const m=l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$/);if(m)config[m[1].toLowerCase()]=m[2].trim()});
      }
      if(!mensaje.length)return;
      if(!popupFechaEnRango(config))return;
      const modo=config.modo.toUpperCase();
      if(modo==='SESION'&&sessionStorage.getItem('academic_notice_displayed')==='true')return;
      if(modo==='UPDATE'&&localStorage.getItem('academic_app_version')===config.version)return;
      if((config.boton_recordar||'').toLowerCase()==='true'){
        const snoozeUntil=parseInt(localStorage.getItem('academic_notice_snooze_until')||'0');
        if(Date.now()<snoozeUntil)return;
      }
      window.currentNoticeConfig=config;
      aplicarPersonalizacionPopup(config);
      document.getElementById('notice-body').textContent=mensaje;
      const titleEl=document.getElementById('popup-title');
      if(titleEl){
        if(config.titulo)titleEl.textContent=config.titulo;
        else if(modo==='UPDATE')titleEl.textContent='✨ ¡Nueva Actualización! (v'+config.version+')';
        else titleEl.textContent='📢 Aviso Importante';
      }
      setTimeout(()=>{
        document.getElementById('notice-popup').classList.add('active');
        if(modo==='TIEMPO')setTimeout(closeNotice,parseInt(config.duracion)||5000);
        if(modo==='SESION')sessionStorage.setItem('academic_notice_displayed','true');
      },1000);
    })
    .catch(err=>console.log('Avisos:',err.message));
}
function closeNotice(){
  document.getElementById('notice-popup').classList.remove('active');
  if(window.currentNoticeConfig?.modo?.toUpperCase()==='UPDATE')
    localStorage.setItem('academic_app_version',window.currentNoticeConfig.version);
}
function closeNoticeOnBackdrop(e){if(e.target.id==='notice-popup')closeNotice()}

/* ═════════════════════════════════════════
   INIT
═════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  /* Render all grids */
  renderGrid('gridMem',membretes,'teal');
  renderGrid('gridProg',programas,'orange');

  /* Init formatos with General tab */
  currentSem='3';
  const fmtFiltered=getFmtFiltered();
  renderFmtCards(fmtFiltered);
  updateSemCount(fmtFiltered.length,'3');

  /* Init instrumentaciones with General tab */
  currentInstSem='3';
  const instFiltered=getInstFiltered();
  renderInstCards(instFiltered);
  updateInstCount(instFiltered.length,'3');

  /* Init atributos with General tab */
  currentAtrSem='3';
  renderMaterias('',currentAtrSem);
  updateAtrCount(materias.filter(m=>m.sem===0).length,'3');

  /* Nav pill */
  const activeLink=document.querySelector('.nav-link.active');
  if(activeLink)setTimeout(()=>moveNavPill(activeLink),60);

  /* Semester pills */
  setTimeout(initSemPill,80);
  setTimeout(initInstSemPill,80);
  setTimeout(initAtrSemPill,80);

  /* Interactions */
  initTilt();
  initCursorGlow();
  animateNavEntrance();
  observeCards();

  /* Animated background — init with first page (membretes) */
  generarFondo('membretes');

  /* Notices */
  checkAcademicNotice();
});

/* ═════════════════════════════════════════
   INSTRUMENTACIONES SEMESTER SELECTOR
═════════════════════════════════════════ */
let currentInstSem='general';
let instTransitioning=false;

function initInstSemPill(){
  const activeTab=document.querySelector('#instSemTabs .sem-tab.active');
  if(!activeTab)return;
  moveInstSemPill(activeTab,true);
}

function moveInstSemPill(tabEl,instant=false){
  const pill=document.getElementById('inst-sem-pill');
  const tabsEl=document.getElementById('instSemTabs');
  if(!pill||!tabsEl)return;
  const tabsRect=tabsEl.getBoundingClientRect();
  const tabRect=tabEl.getBoundingClientRect();
  if(!tabsRect.width)return;
  const left=tabRect.left-tabsRect.left;
  const width=tabRect.width;
  if(instant){
    pill.style.transition='none';
    pill.style.left=left+'px';
    pill.style.width=width+'px';
  } else {
    pill.style.transition='left .45s cubic-bezier(.34,1.56,.64,1),width .45s cubic-bezier(.34,1.56,.64,1),background .4s';
    pill.style.left=left+'px';
    pill.style.width=width+'px';
  }
  const c=semColors[tabEl.dataset.sem]||'#2A6545';
  pill.style.background=hexToRgba(c,.12);
  pill.style.border=`1px solid ${hexToRgba(c,.28)}`;
}

function updateInstCount(n,sem){
  const badge=document.getElementById('instCountBadge');
  if(!badge)return;
  badge.textContent=n+' instrumentación'+(n===1?'':'es');
  const c=semColors[sem]||semColors['general'];
  badge.style.background=hexToRgba(c,.12);
  badge.style.color=c;
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');
}

function getInstFiltered(query=''){
  const semKey=currentInstSem==='general'?0:parseInt(currentInstSem);
  const q=query.toLowerCase();
  return instrumentaciones.filter(f=>f.sem===semKey&&f.name.toLowerCase().includes(q));
}

function onInstSearch(value){
  const filtered=getInstFiltered(value);
  const grid=document.getElementById('gridInst');
  if(!filtered.length){
    grid.innerHTML=`<div class="empty-state"><div class="empty-state-icon">🔍</div><p>Sin resultados para "${escHtml(value)}"</p></div>`;
    updateInstCount(0,currentInstSem);
    return;
  }
  renderInstCards(filtered);
  updateInstCount(filtered.length,currentInstSem);
}

function renderInstCards(filtered){
  const grid=document.getElementById('gridInst');
  grid.innerHTML=filtered.map((f,i)=>`
    <div class="card card-green" style="animation-delay:${i*.055}s">
      <div class="card-thumb thumb-green">
        <div class="thumb-icon">📋</div>
        <span class="badge badge-green">DOCX/PDF</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escHtml(f.name)}</div>
        <div class="card-meta">${escHtml(f.desc||'—')}</div>
        <a class="btn-dl btn-green" href="${escHtml(f.url)}" target="_blank" rel="noopener" onclick="rippleBtn(event)">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>Descargar
        </a>
      </div>
    </div>`).join('');
  observeCards();
}

function switchInstSem(sem,tabEl){
  if(sem===currentInstSem||instTransitioning)return;
  instTransitioning=true;

  const prevIdx=semOrder.indexOf(currentInstSem);
  const newIdx=semOrder.indexOf(sem);
  const dir=newIdx>prevIdx?1:-1;

  document.querySelectorAll('#instSemTabs .sem-tab').forEach(t=>t.classList.remove('active'));
  tabEl.classList.add('active');
  moveInstSemPill(tabEl);

  const grid=document.getElementById('gridInst');
  const cards=Array.from(grid.querySelectorAll('.card'));

  const EXIT_STAGGER=38,EXIT_DUR=220,ENTER_STAGGER=55;

  const doEnter=()=>{
    currentInstSem=sem;
    const filtered=getInstFiltered(document.getElementById('instSearch')?.value||'');
    if(!filtered.length){
      grid.innerHTML=`<div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <p>No hay instrumentaciones para este semestre todavía.<br><small style="opacity:.6">Próximamente…</small></p>
      </div>`;
      updateInstCount(0,sem);
      instTransitioning=false;
      observeCards();
      return;
    }
    grid.innerHTML=filtered.map((f,i)=>`
      <div class="card card-green"
        style="opacity:0;transform:translateX(${dir*70}px) translateY(${dir*12}px) rotate(${dir*3}deg) scale(.88);transition:none;">
        <div class="card-thumb thumb-green">
          <div class="thumb-icon">📋</div>
          <span class="badge badge-green">DOCX/PDF</span>
        </div>
        <div class="card-body">
          <div class="card-title">${escHtml(f.name)}</div>
          <div class="card-meta">${escHtml(f.desc||'—')}</div>
          <a class="btn-dl btn-green" href="${escHtml(f.url)}" target="_blank" rel="noopener" onclick="rippleBtn(event)">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>Descargar
          </a>
        </div>
      </div>`).join('');
    updateInstCount(filtered.length,sem);
    const newCards=Array.from(grid.querySelectorAll('.card'));
    newCards.forEach((card,i)=>{
      setTimeout(()=>{
        card.style.transition=`transform .5s cubic-bezier(.34,1.56,.64,1) ${i*0.005}s,opacity .38s ease ${i*0.005}s`;
        card.style.transform='translateX(0) translateY(0) rotate(0deg) scale(1)';
        card.style.opacity='1';
        setTimeout(()=>card.classList.add('visible'),520);
      },i*ENTER_STAGGER);
    });
    setTimeout(()=>{instTransitioning=false},newCards.length*ENTER_STAGGER+600);
  };

  if(!cards.length){doEnter();return;}
  cards.forEach((card,i)=>{
    const delay=i*EXIT_STAGGER;
    setTimeout(()=>{
      card.style.transition=`transform ${EXIT_DUR}ms cubic-bezier(.4,0,1,1),opacity ${EXIT_DUR-20}ms ease`;
      card.style.transform=`translateX(${dir*-75}px) translateY(${dir*-10}px) rotate(${dir*-3.5}deg) scale(.86)`;
      card.style.opacity='0';
    },delay);
  });
  setTimeout(doEnter,cards.length*EXIT_STAGGER+EXIT_DUR+40);
}

/* ═════════════════════════════════════════
   ATRIBUTOS SEMESTER SELECTOR
═════════════════════════════════════════ */
let currentAtrSem='general';

function initAtrSemPill(){
  const activeTab=document.querySelector('#atrSemTabs .sem-tab.active');
  if(!activeTab)return;
  moveAtrSemPill(activeTab,true);
}

function moveAtrSemPill(tabEl,instant=false){
  const pill=document.getElementById('atr-sem-pill');
  const tabsEl=document.getElementById('atrSemTabs');
  if(!pill||!tabsEl)return;
  const tabsRect=tabsEl.getBoundingClientRect();
  const tabRect=tabEl.getBoundingClientRect();
  if(!tabsRect.width)return;
  const left=tabRect.left-tabsRect.left;
  const width=tabRect.width;
  if(instant){
    pill.style.transition='none';
    pill.style.left=left+'px';
    pill.style.width=width+'px';
  } else {
    pill.style.transition='left .45s cubic-bezier(.34,1.56,.64,1),width .45s cubic-bezier(.34,1.56,.64,1),background .4s';
    pill.style.left=left+'px';
    pill.style.width=width+'px';
  }
  const c=semColors[tabEl.dataset.sem]||'#5B3E8F';
  pill.style.background=hexToRgba(c,.12);
  pill.style.border=`1px solid ${hexToRgba(c,.28)}`;
}

function updateAtrCount(n,sem){
  const badge=document.getElementById('atrCountBadge');
  if(!badge)return;
  badge.textContent=n+' materia'+(n===1?'':'s');
  const c=semColors[sem]||semColors['general'];
  badge.style.background=hexToRgba(c,.12);
  badge.style.color=c;
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');
}

function onAtrSearch(value){
  renderMaterias(value,currentAtrSem);
  const semKey=currentAtrSem==='general'?0:parseInt(currentAtrSem);
  const count=materias.filter(m=>(currentAtrSem==='general'?m.sem===0:m.sem===semKey)&&m.nombre.toLowerCase().includes(value.toLowerCase())).length;
  updateAtrCount(count,currentAtrSem);
}

function switchAtrSem(sem,tabEl){
  if(sem===currentAtrSem)return;

  document.querySelectorAll('#atrSemTabs .sem-tab').forEach(t=>t.classList.remove('active'));
  tabEl.classList.add('active');
  moveAtrSemPill(tabEl);

  currentAtrSem=sem;
  const query=document.getElementById('atrSearch')?.value||'';
  renderMaterias(query,currentAtrSem);
  const semKey=sem==='general'?0:parseInt(sem);
  const count=materias.filter(m=>sem==='general'?m.sem===0:m.sem===semKey).length;
  updateAtrCount(count,sem);
}

/* ═════════════════════════════════════════
   ANIMATED BACKGROUND — SECTION-AWARE
═════════════════════════════════════════ */

/* All SVG shapes (same as TPF original) */
const BG_SHAPES=(()=>{
  const pentagono= `<svg viewBox="0 0 100 100">
  <rect x="20" y="10" width="60" height="80" rx="3" fill="none" stroke="COLOR" stroke-width="4"/>
  <path d="M44 18 L56 18 L54 28 L50 32 L46 28 Z" fill="COLOR"/>
  <line x1="26" y1="22" x2="38" y2="22" stroke="COLOR" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="22" x2="74" y2="22" stroke="COLOR" stroke-width="3" stroke-linecap="round"/>
  <line x1="28" y1="45" x2="72" y2="45" stroke="COLOR" stroke-width="2" stroke-dasharray="3,3"/>
  <circle cx="65" cy="72" r="7" fill="none" stroke="COLOR" stroke-width="3"/>
  <line x1="28" y1="75" x2="50" y2="75" stroke="COLOR" stroke-width="3" stroke-linecap="round"/>
</svg>`;
  const cancha=`<svg viewBox="0 0 100 100">
  <rect x="25" y="20" width="50" height="65" rx="5" fill="none" stroke="COLOR" stroke-width="4"/>
  <rect x="40" y="10" width="20" height="15" rx="3" fill="none" stroke="COLOR" stroke-width="4"/>
  <path d="M35 45 L40 50 L50 38" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M35 65 L40 70 L50 58" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="60" y1="45" x2="70" y2="45" stroke="COLOR" stroke-width="4" stroke-linecap="round"/>
  <line x1="60" y1="65" x2="70" y2="65" stroke="COLOR" stroke-width="4" stroke-linecap="round"/>
</svg>`;
  const trofeo=`<svg viewBox="0 0 100 100">
  <path d="M15 30 L50 30 C70 30, 70 55, 50 55 L35 55 C15 55, 15 80, 35 80 L85 80" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round"/>
  <circle cx="25" cy="30" r="6" fill="COLOR"/>
  <circle cx="58" cy="55" r="6" fill="COLOR"/>
  <circle cx="70" cy="80" r="6" fill="COLOR"/>
  <path d="M25 30 L25 16 L37 20 L25 24" fill="none" stroke="COLOR" stroke-width="3" stroke-linejoin="round"/>
  <path d="M58 55 L58 41 L70 45 L58 49" fill="none" stroke="COLOR" stroke-width="3" stroke-linejoin="round"/>
</svg>`;
  const silbato=`<svg viewBox="0 0 100 100">
  <rect x="15" y="25" width="70" height="45" rx="5" fill="none" stroke="COLOR" stroke-width="4"/>
  <path d="M15 70 L85 70 L90 80 L10 80 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="50" cy="75" r="3" fill="COLOR"/>
  <rect x="25" y="35" width="15" height="20" rx="2" fill="none" stroke="COLOR" stroke-width="3"/>
  <rect x="45" y="35" width="15" height="20" rx="2" fill="none" stroke="COLOR" stroke-width="3"/>
  <rect x="65" y="35" width="10" height="20" rx="2" fill="none" stroke="COLOR" stroke-width="3"/>
</svg>`;
  const zapato=`<svg viewBox="0 0 100 100">
  <polygon points="10,35 50,55 90,35 50,15" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/>
  <path d="M30 45 C30 55 70 55 70 45 L70 35 M30 35" fill="none" stroke="COLOR" stroke-width="4"/>
  <path d="M50 15 L50 40 L60 45" fill="none" stroke="COLOR" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 70 A40 40 0 0 0 80 70" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round"/>
  <polygon points="50,60 55,75 70,80 55,85 50,100 45,85 30,80 45,75" fill="COLOR"/>
</svg>`;
  const tarjetas=`<svg viewBox="0 0 100 100">
  <rect x="15" y="15" width="42" height="42" rx="5" fill="none" stroke="COLOR" stroke-width="4"/>
  <path d="M26 31 L21 36 L26 41 M36 31 L41 36 L36 41" fill="none" stroke="COLOR" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  
  <rect x="42" y="42" width="43" height="43" rx="5" fill="none" stroke="COLOR" stroke-width="4"/>
  <circle cx="63" cy="63" r="10" fill="none" stroke="COLOR" stroke-width="3"/>
  <circle cx="63" cy="63" r="4" fill="COLOR"/>
  
  <rect x="22" y="55" width="28" height="28" rx="4" fill="none" stroke="COLOR" stroke-width="3"/>
  <line x1="29" y1="73" x2="29" y2="67" stroke="COLOR" stroke-width="3" stroke-linecap="round"/>
  <line x1="36" y1="73" x2="36" y2="62" stroke="COLOR" stroke-width="3" stroke-linecap="round"/>
  <line x1="43" y1="73" x2="43" y2="69" stroke="COLOR" stroke-width="3" stroke-linecap="round"/>
</svg>`;
  const pelota=`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="COLOR" stroke-width="4"/><polygon points="50,35 63,44 58,59 42,59 37,44" fill="none" stroke="COLOR" stroke-width="4"/><line x1="50" y1="35" x2="50" y2="10" stroke="COLOR" stroke-width="4"/><line x1="63" y1="44" x2="84" y2="31" stroke="COLOR" stroke-width="4"/><line x1="58" y1="59" x2="74" y2="82" stroke="COLOR" stroke-width="4"/><line x1="42" y1="59" x2="26" y2="82" stroke="COLOR" stroke-width="4"/><line x1="37" y1="44" x2="16" y2="31" stroke="COLOR" stroke-width="4"/></svg>`;
  const camiseta=`<svg viewBox="0 0 100 100"><path d="M35 20 L20 32 L28 44 L36 38 L36 80 L64 80 L64 38 L72 44 L80 32 L65 20 C60 25, 40 25, 35 20 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><line x1="36" y1="45" x2="64" y2="45" stroke="COLOR" stroke-width="2"/></svg>`;
  const mundial26=`<svg viewBox="0 0 100 100"><path d="M18 38 C18 22, 45 22, 45 38 C45 52, 18 55, 18 75 L48 75" fill="none" stroke="COLOR" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M78 28 C63 28, 54 45, 54 60 C54 75, 82 75, 82 58 C82 45, 54 45, 54 58" fill="none" stroke="COLOR" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const banderin=`<svg viewBox="0 0 100 100"><line x1="30" y1="15" x2="30" y2="85" stroke="COLOR" stroke-width="5" stroke-linecap="round"/><polygon points="30,15 75,32 30,50" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><line x1="15" y1="85" x2="55" y2="85" stroke="COLOR" stroke-width="5" stroke-linecap="round"/></svg>`;
  const cronometro=`<svg viewBox="0 0 100 100"><circle cx="50" cy="55" r="30" fill="none" stroke="COLOR" stroke-width="4"/><rect x="45" y="12" width="10" height="10" fill="COLOR"/><line x1="38" y1="12" x2="62" y2="12" stroke="COLOR" stroke-width="4"/><line x1="50" y1="55" x2="50" y2="35" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="55" x2="68" y2="45" stroke="COLOR" stroke-width="3" stroke-linecap="round"/></svg>`;
  const medalla=`<svg viewBox="0 0 100 100"><path d="M32 15 L50 48 L68 15" fill="none" stroke="COLOR" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="50" cy="65" r="20" fill="none" stroke="COLOR" stroke-width="4"/><circle cx="50" cy="65" r="8" fill="COLOR"/></svg>`;
  const estadio=`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="32" fill="none" stroke="COLOR" stroke-width="4"/><ellipse cx="50" cy="50" rx="32" ry="20" fill="none" stroke="COLOR" stroke-width="3"/><rect x="36" y="42" width="28" height="16" rx="2" fill="none" stroke="COLOR" stroke-width="3"/><line x1="50" y1="18" x2="50" y2="30" stroke="COLOR" stroke-width="3"/><line x1="50" y1="70" x2="50" y2="82" stroke="COLOR" stroke-width="3"/><line x1="5" y1="50" x2="18" y2="50" stroke="COLOR" stroke-width="3"/><line x1="82" y1="50" x2="95" y2="50" stroke="COLOR" stroke-width="3"/></svg>`;
  const copa=`<svg viewBox="0 0 100 100"><path d="M35 85 L65 85 L62 70 L38 70 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><line x1="36.5" y1="77" x2="63.5" y2="77" stroke="COLOR" stroke-width="3"/><path d="M42 70 C42 55, 30 48, 38 36 C43 30, 48 34, 50 38 C52 34, 57 30, 62 36 C70 48, 58 55, 58 70" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="24" r="13" fill="none" stroke="COLOR" stroke-width="4"/><path d="M40 20 Q50 26 60 20" fill="none" stroke="COLOR" stroke-width="3"/></svg>`;
  const viajeMundial=`<svg viewBox="0 0 100 100"><path d="M50 12 L55 35 L88 55 L56 55 L50 85 L44 55 L12 55 L45 35 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><path d="M20 25 A40 40 0 0 1 80 25" fill="none" stroke="COLOR" stroke-width="3" stroke-dasharray="6,4" stroke-linecap="round"/></svg>`;
  const porteria=`<svg viewBox="0 0 100 100"><path d="M10 80 L10 25 L90 25 L90 80" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="10" y1="43" x2="90" y2="43" stroke="COLOR" stroke-width="2"/><line x1="10" y1="61" x2="90" y2="61" stroke="COLOR" stroke-width="2"/><line x1="36" y1="25" x2="36" y2="80" stroke="COLOR" stroke-width="2"/><line x1="64" y1="25" x2="64" y2="80" stroke="COLOR" stroke-width="2"/><circle cx="36" cy="43" r="7" fill="COLOR"/></svg>`;
  const logoOficial26=`<svg viewBox="0 0 100 100"><path d="M40 10 C25 10, 20 25, 30 35 L50 55 C60 65, 55 80, 40 80 L60 80" fill="none" stroke="COLOR" stroke-width="8" stroke-linecap="round"/><path d="M80 20 C65 20, 60 35, 60 50 C60 65, 80 65, 80 50 C80 35, 60 35, 60 50" fill="none" stroke="COLOR" stroke-width="8" stroke-linecap="round"/><path d="M42 85 L58 85 L56 75 L44 75 Z" fill="COLOR"/><path d="M50 75 C50 65, 42 60, 44 52 C46 48, 50 50, 50 52 C50 50, 54 48, 56 52 C58 60, 50 65, 50 75" fill="none" stroke="COLOR" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="46" r="7" fill="none" stroke="COLOR" stroke-width="3"/></svg>`;
  const banderasHost=`<svg viewBox="0 0 100 100"><rect x="5" y="25" width="25" height="50" rx="2" fill="none" stroke="COLOR" stroke-width="3"/><path d="M17.5 35 L19 41 L25 40 L21 45 L23 51 L17.5 48 L12 51 L14 45 L10 40 L16 41 Z" fill="COLOR"/><rect x="37.5" y="25" width="25" height="50" rx="2" fill="none" stroke="COLOR" stroke-width="3"/><rect x="37.5" y="25" width="12" height="15" fill="COLOR"/><line x1="50" y1="31" x2="62.5" y2="31" stroke="COLOR" stroke-width="2"/><line x1="37.5" y1="37" x2="62.5" y2="37" stroke="COLOR" stroke-width="2"/><line x1="37.5" y1="43" x2="62.5" y2="43" stroke="COLOR" stroke-width="2"/><rect x="70" y="25" width="25" height="50" rx="2" fill="none" stroke="COLOR" stroke-width="3"/><line x1="78.3" y1="25" x2="78.3" y2="75" stroke="COLOR" stroke-width="2"/><line x1="86.6" y1="25" x2="86.6" y2="75" stroke="COLOR" stroke-width="2"/><circle cx="82.5" cy="50" r="4" fill="COLOR"/></svg>`;
  const fanCelebrando=`<svg viewBox="0 0 100 100"><circle cx="50" cy="25" r="10" fill="none" stroke="COLOR" stroke-width="4"/><path d="M20 40 Q50 30, 80 40 L75 55 Q50 45, 25 55 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><path d="M35 52 L35 90 M65 52 L65 90" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><path d="M20 40 L10 15 M80 40 L90 15" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round"/></svg>`;
  const guantePortero=`<svg viewBox="0 0 100 100"><rect x="35" y="72" width="30" height="15" rx="2" fill="none" stroke="COLOR" stroke-width="4"/><path d="M30 72 L30 40 C30 32, 40 32, 40 40 L40 30 C40 22, 50 22, 50 30 L50 28 C50 20, 60 20, 60 28 L60 35 C60 27, 70 27, 70 35 L70 72 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><path d="M30 60 Q18 55, 22 45 Q30 45, 34 55" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/></svg>`;
  const brazaleteCapitan=`<svg viewBox="0 0 100 100"><rect x="15" y="30" width="70" height="40" rx="5" fill="none" stroke="COLOR" stroke-width="4"/><path d="M60 42 C44 42, 40 46, 40 50 C40 54, 44 58, 60 58" fill="none" stroke="COLOR" stroke-width="6" stroke-linecap="round"/><line x1="15" y1="50" x2="25" y2="50" stroke="COLOR" stroke-width="3"/><line x1="75" y1="50" x2="85" y2="50" stroke="COLOR" stroke-width="3"/></svg>`;
  const ticketMundial=`<svg viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="50" rx="4" fill="none" stroke="COLOR" stroke-width="4"/><line x1="65" y1="25" x2="65" y2="75" stroke="COLOR" stroke-width="4" stroke-dasharray="4,4"/><circle cx="65" cy="25" r="6" fill="COLOR"/><circle cx="65" cy="75" r="6" fill="COLOR"/><line x1="25" y1="40" x2="55" y2="40" stroke="COLOR" stroke-width="4"/><line x1="25" y1="52" x2="45" y2="52" stroke="COLOR" stroke-width="3"/><line x1="25" y1="62" x2="35" y2="62" stroke="COLOR" stroke-width="2"/></svg>`;
  const camaraTransmision=`<svg viewBox="0 0 100 100"><rect x="15" y="25" width="45" height="30" rx="3" fill="none" stroke="COLOR" stroke-width="4"/><polygon points="60,32 82,20 82,58 60,48" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><circle cx="30" cy="40" r="6" fill="COLOR"/><line x1="37" y1="55" x2="20" y2="85" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="37" y1="55" x2="55" y2="85" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="37" y1="55" x2="37" y2="85" stroke="COLOR" stroke-width="3"/></svg>`;
  const sprayEspuma=`<svg viewBox="0 0 100 100"><rect x="35" y="45" width="30" height="40" rx="3" fill="none" stroke="COLOR" stroke-width="4"/><rect x="43" y="37" width="14" height="8" fill="none" stroke="COLOR" stroke-width="3"/><path d="M50 37 L50 30 L42 33" fill="none" stroke="COLOR" stroke-width="3" stroke-linecap="round"/><circle cx="35" cy="20" r="6" fill="COLOR"/><circle cx="50" cy="15" r="8" fill="COLOR"/><circle cx="65" cy="22" r="5" fill="COLOR"/></svg>`;
  const autobusEquipo=`<svg viewBox="0 0 100 100"><path d="M10 35 L80 35 C88 35, 90 42, 90 50 L90 70 L10 70 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><circle cx="30" cy="72" r="8" fill="none" stroke="COLOR" stroke-width="4"/><circle cx="70" cy="72" r="8" fill="none" stroke="COLOR" stroke-width="4"/><line x1="10" y1="48" x2="85" y2="48" stroke="COLOR" stroke-width="3"/><line x1="35" y1="35" x2="35" y2="48" stroke="COLOR" stroke-width="2"/><line x1="60" y1="35" x2="60" y2="48" stroke="COLOR" stroke-width="2"/></svg>`;
  const fiestaEstadio=`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="5" fill="COLOR"/><line x1="50" y1="35" x2="50" y2="15" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="65" x2="50" y2="85" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="35" y1="50" x2="15" y2="50" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="65" y1="50" x2="85" y2="50" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><line x1="39" y1="39" x2="25" y2="25" stroke="COLOR" stroke-width="3" stroke-linecap="round"/><line x1="61" y1="61" x2="75" y2="75" stroke="COLOR" stroke-width="3" stroke-linecap="round"/><line x1="61" y1="39" x2="75" y2="25" stroke="COLOR" stroke-width="3" stroke-linecap="round"/><line x1="39" y1="61" x2="25" y2="75" stroke="COLOR" stroke-width="3" stroke-linecap="round"/></svg>`;
  const estrellaVictoria=`<svg viewBox="0 0 100 100"><polygon points="50,12 63,38 92,38 68,55 77,85 50,68 23,85 32,55 8,38 37,38" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="50" r="7" fill="COLOR"/></svg>`;
  const pasaporteViajero=`<svg viewBox="0 0 100 100"><rect x="20" y="15" width="45" height="65" rx="4" fill="none" stroke="COLOR" stroke-width="4" transform="rotate(-10 42 50)"/><rect x="35" y="20" width="45" height="65" rx="4" fill="none" stroke="COLOR" stroke-width="4" transform="rotate(5 57 52)"/><circle cx="58" cy="50" r="10" fill="none" stroke="COLOR" stroke-width="3"/><path d="M52 50 L64 50 M58 44 L58 56" stroke="COLOR" stroke-width="2"/></svg>`;
  const hojaMaple=`<svg viewBox="0 0 100 100"><path d="M50 85 L50 70 L32 75 L38 58 L15 52 L35 45 L25 25 L46 32 L50 10 L54 32 L75 25 L65 45 L85 52 L62 58 L68 75 L50 70" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/></svg>`;
  const naturalezaCanada=`<svg viewBox="0 0 100 100"><path d="M10 75 L45 30 L75 65 L90 50 L95 75 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><polygon points="25,75 25,62 18,62 28,48 38,62 31,62 31,75" fill="COLOR"/></svg>`;
  const estatuaLibertad=`<svg viewBox="0 0 100 100"><path d="M35 75 L38 52 C38 42, 62 42, 62 52 L65 75" fill="none" stroke="COLOR" stroke-width="4"/><path d="M34 48 L18 42 M39 44 L25 25 M45 42 L45 12 M55 42 L55 12 M61 44 L75 25 M66 48 L82 42" fill="none" stroke="COLOR" stroke-width="4" stroke-linecap="round"/><path d="M72 75 L72 50 L68 50 L66 42 L78 42 L76 50 L72 50" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><path d="M72 42 C68 32, 72 25, 72 25 C72 25, 76 32, 72 42" fill="COLOR"/></svg>`;
  const aguilaUSA=`<svg viewBox="0 0 100 100"><path d="M20 70 C20 40, 40 25, 65 25 C72 25, 76 30, 72 40 L85 46 L68 58 C60 75, 35 75, 20 70 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><path d="M68 40 L85 46 L68 58 C64 52, 64 45, 68 40 Z" fill="COLOR"/><circle cx="55" cy="40" r="3" fill="COLOR"/></svg>`;
  const piramideMexico=`<svg viewBox="0 0 100 100"><path d="M10 80 L20 62 L30 44 L40 30 L60 30 L70 44 L80 62 L90 80 Z" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><line x1="20" y1="62" x2="80" y2="62" stroke="COLOR" stroke-width="3"/><line x1="30" y1="44" x2="70" y2="44" stroke="COLOR" stroke-width="3"/><rect x="42" y="16" width="16" height="14" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><polygon points="44,80 46,30 54,30 56,80" fill="none" stroke="COLOR" stroke-width="3"/></svg>`;
  const sombreroMexico=`<svg viewBox="0 0 100 100"><path d="M30 60 C30 25, 42 15, 50 15 C58 15, 70 25, 70 60" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><path d="M8 60 Q50 82 92 60 Q50 48 8 60" fill="none" stroke="COLOR" stroke-width="4" stroke-linejoin="round"/><path d="M31 52 Q50 58 69 52" stroke="COLOR" stroke-width="3" stroke-dasharray="4,2"/><circle cx="50" cy="70" r="5" fill="COLOR"/></svg>`;

  return [
    pentagono, cancha, trofeo, silbato, zapato, tarjetas, pelota, camiseta,
    mundial26, banderin, cronometro, medalla, estadio, copa, viajeMundial, porteria,
    logoOficial26, banderasHost, fanCelebrando, guantePortero, brazaleteCapitan,
    ticketMundial, camaraTransmision, sprayEspuma, autobusEquipo, fiestaEstadio,
    estrellaVictoria, pasaporteViajero, hojaMaple, naturalezaCanada, estatuaLibertad,
    aguilaUSA, piramideMexico, sombreroMexico
  ];
})();

/*
  Section → shape indices
  0=pentagono,1=cancha,2=trofeo,3=silbato,4=zapato,5=tarjetas,6=pelota,7=camiseta,
  8=mundial26,9=banderin,10=cronometro,11=medalla,12=estadio,13=copa,14=viajeMundial,
  15=porteria,16=logoOficial26,17=banderasHost,18=fanCelebrando,19=guantePortero,
  20=brazaleteCapitan,21=ticketMundial,22=camaraTransmision,23=sprayEspuma,
  24=autobusEquipo,25=fiestaEstadio,26=estrellaVictoria,27=pasaporteViajero,
  28=hojaMaple,29=naturalezaCanada,30=estatuaLibertad,31=aguilaUSA,
  32=piramideMexico,33=sombreroMexico
*/
const SECTION_SHAPES={
  membretes: [0],       /* camiseta, estadio, banderas, fan, 26, logo, fiesta, pasaporte, aguila, sombrero */
  formatos:  [1],          /* ticket, tarjetas, crono, banderin, spray, silbato, brazalete, viaje, pasaporte, maple */
  instrumentaciones:[2],    /* cancha, pelota, porteria, estadio, banderin, pentag, guante, autobus, zapato, estatua */
  programas: [3,5],          /* camara, autobus, 26, crono, logo, pentag, natura, piramide, silbato, viaje */
  atributos: [4]         /* trofeo, medalla, copa, estrella, brazalete, fan, fiesta, sombrero, aguila, banderas */
};

function generarFondo(pageId='membretes'){
  const bgContainer=document.getElementById('worldcup-bg');
  if(!bgContainer)return;

  /* Clear old shapes */
  bgContainer.innerHTML='';

  const colors=['#C8893A','#923A28','#1B7A6E','#5B3E8F','#2A6545'];
  const animations=['floatRandom1','floatRandom2','floatRandom3'];
  const shapeIndices=SECTION_SHAPES[pageId]||SECTION_SHAPES.membretes;
  const numShapes=40;

  for(let i=0;i<numShapes;i++){
    const div=document.createElement('div');
    const size=Math.random()*200+30;
    const color=colors[Math.floor(Math.random()*colors.length)];
    const idx=shapeIndices[Math.floor(Math.random()*shapeIndices.length)];
    const svgCode=BG_SHAPES[idx].replace(/COLOR/g,color);

    div.innerHTML=svgCode;
    div.className='bg-shape';

    div.style.left=(Math.random()*120-10)+'vw';
    div.style.top=(Math.random()*120-10)+'vh';
    div.style.width=size+'px';
    div.style.height=size+'px';
    div.style.opacity=(Math.random()*0.065+0.03).toFixed(3);

    const anim=animations[Math.floor(Math.random()*animations.length)];
    const duration=Math.random()*40+30;
    const delay=Math.random()*-50;
    div.style.animation=`${anim} ${duration}s infinite ease-in-out ${delay}s`;

    bgContainer.appendChild(div);
  }
}

function refreshBackground(pageId){
  /* Fade out → regenerate → fade in */
  const bg=document.getElementById('worldcup-bg');
  if(!bg)return;
  bg.style.transition='opacity .5s ease';
  bg.style.opacity='0';
  setTimeout(()=>{
    generarFondo(pageId);
    bg.style.opacity='1';
  },500);
}

/* ═══ 2. PWA: SERVICE WORKER + BANNER DE INSTALACIÓN ═══ */
(function(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => console.warn('SW no registrado:', err));
    });
  }

  const DISMISS_KEY = 'pwa_install_dismissed';
  let deferredPrompt = null;
  const banner = document.getElementById('pwa-install-banner');
  const installBtn = document.getElementById('pwa-install-btn');
  const dismissBtn = document.getElementById('pwa-dismiss-btn');

  function yaFueRechazado(){
    try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch(e){ return false; }
  }
  function estaInstalada(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!yaFueRechazado() && !estaInstalada()) banner.classList.add('show');
  });

  installBtn && installBtn.addEventListener('click', async () => {
    banner.classList.remove('show');
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  dismissBtn && dismissBtn.addEventListener('click', () => {
    banner.classList.remove('show');
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch(e){}
  });

  window.addEventListener('appinstalled', () => banner.classList.remove('show'));
})();

/* ═══ 3. ONESIGNAL: NOTIFICACIONES PUSH ═══ */
  // ⚠️ Reemplaza esto con tu App ID real (Settings → Keys & IDs en OneSignal)
  const ONESIGNAL_APP_ID = '387e44d8-7f65-4180-9faa-ed312429932a';

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function (OneSignal) {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      serviceWorkerPath: 'trucopagina/TPF/testzone/sw.js',
      serviceWorkerParam: { scope: '/trucopagina/TPF/testzone/' },
      notifyButton: { enable: false }, // usamos nuestro propio botón 🔔
      allowLocalhostAsSecureOrigin: true // útil si pruebas en localhost
    });

    const btn = document.getElementById('pwa-notify-btn');
    if (!btn) return;

    function actualizarBoton() {
      const activo = OneSignal.User.PushSubscription.optedIn;
      btn.classList.toggle('activo', !!activo);
      btn.title = activo ? 'Notificaciones activadas (clic para desactivar)' : 'Activar notificaciones';
    }

    actualizarBoton();
    OneSignal.User.PushSubscription.addEventListener('change', actualizarBoton);

    btn.addEventListener('click', async () => {
      try {
        if (OneSignal.User.PushSubscription.optedIn) {
          await OneSignal.User.PushSubscription.optOut();
        } else {
          await OneSignal.Notifications.requestPermission();
          await OneSignal.User.PushSubscription.optIn();
        }
      } catch (err) {
        console.warn('No se pudo cambiar el estado de la suscripción:', err);
      }
    });
  });

/* ═══ 4. GENERADOR DE SCRIPTS WINGET ═══ */
(function(){

  /* Catálogo de programas: id winget, nombre, categoría, color de categoría */
  const wgCategorias = [
    { key:'nav',   nombre:'Navegadores',                         color:'#3E5B8F' },
    { key:'util',  nombre:'Utilidades y Compresores',             color:'#C8893A' },
    { key:'chat',  nombre:'Comunicación y Chat',                  color:'#1B7A6E' },
    { key:'media', nombre:'Multimedia y Reproductores',           color:'#923A28' },
    { key:'dev',   nombre:'Desarrollo y Programación',            color:'#5B3E8F' },
    { key:'data',  nombre:'Ciencia de Datos y Virtualización',    color:'#54647A' },
    { key:'ofim',  nombre:'Ofimática y Lectores',                 color:'#2A6545' },
    { key:'games', nombre:'Juegos y Plataformas',                 color:'#8F3E6D' },
  ];

  const wgProgramas = [
    // Navegadores
    { id:'Google.Chrome',                 nombre:'Google Chrome',            cat:'nav' },
    { id:'Mozilla.Firefox',               nombre:'Mozilla Firefox',          cat:'nav' },
    { id:'Brave.Brave',                   nombre:'Brave',                    cat:'nav' },
    { id:'Opera.Opera',                   nombre:'Opera',                    cat:'nav' },
    { id:'Microsoft.Edge',                nombre:'Microsoft Edge',           cat:'nav' },

    // Utilidades y Compresores
    { id:'7zip.7zip',                     nombre:'7-Zip',                    cat:'util' },
    { id:'RARLab.WinRAR',                 nombre:'WinRAR',                   cat:'util' },
    { id:'Bitwarden.Bitwarden',           nombre:'Bitwarden',                cat:'util' },
    { id:'KeePassXCTeam.KeePassXC',       nombre:'KeePassXC',                cat:'util' },
    { id:'Microsoft.PowerToys',           nombre:'PowerToys',                cat:'util' },
    { id:'Rufus.Rufus',                   nombre:'Rufus',                    cat:'util' },
    { id:'voidtools.Everything',          nombre:'Everything',               cat:'util' },

    // Comunicación y Chat
    { id:'Discord.Discord',               nombre:'Discord',                  cat:'chat' },
    { id:'Telegram.TelegramDesktop',      nombre:'Telegram',                 cat:'chat' },
    { id:'WhatsApp.WhatsApp',             nombre:'WhatsApp',                 cat:'chat' },
    { id:'SlackTechnologies.Slack',       nombre:'Slack',                    cat:'chat' },
    { id:'Zoom.Zoom',                     nombre:'Zoom',                     cat:'chat' },
    { id:'Microsoft.Teams',               nombre:'Microsoft Teams',          cat:'chat' },

    // Multimedia y Reproductores
    { id:'VideoLAN.VLC',                  nombre:'VLC Media Player',         cat:'media' },
    { id:'Audacity.Audacity',             nombre:'Audacity',                 cat:'media' },
    { id:'OBSProject.OBSStudio',          nombre:'OBS Studio',               cat:'media' },
    { id:'Spotify.Spotify',               nombre:'Spotify',                  cat:'media' },
    { id:'HandBrake.HandBrake',           nombre:'HandBrake',                cat:'media' },
    { id:'GIMP.GIMP',                     nombre:'GIMP',                     cat:'media' },
    { id:'KDE.Krita',                     nombre:'Krita',                    cat:'media' },

    // Desarrollo y Programación
    { id:'Microsoft.VisualStudioCode',    nombre:'Visual Studio Code',       cat:'dev' },
    { id:'Git.Git',                       nombre:'Git',                      cat:'dev' },
    { id:'OpenJS.NodeJS.LTS',             nombre:'Node.js LTS',              cat:'dev' },
    { id:'Python.Python.3.11',            nombre:'Python 3',                 cat:'dev' },
    { id:'JetBrains.PyCharm.Community',   nombre:'PyCharm Community',        cat:'dev' },
    { id:'Postman.Postman',               nombre:'Postman',                  cat:'dev' },
    { id:'Microsoft.WindowsTerminal',     nombre:'Windows Terminal',         cat:'dev' },
    { id:'Microsoft.PowerShell',          nombre:'PowerShell 7',             cat:'dev' },

    // Ciencia de Datos y Virtualización
    { id:'Anaconda.Anaconda3',            nombre:'Anaconda Distribution',    cat:'data' },
    { id:'Anaconda.Miniconda3',           nombre:'Miniconda',                cat:'data' },
    { id:'RStudio.RStudio',               nombre:'RStudio',                  cat:'data' },
    { id:'Oracle.VirtualBox',             nombre:'VirtualBox',               cat:'data' },
    { id:'Docker.DockerDesktop',          nombre:'Docker Desktop',           cat:'data' },
    { id:'Hashicorp.Vagrant',             nombre:'Vagrant',                  cat:'data' },
    { id:'DBeaver.DBeaver',               nombre:'DBeaver Community',        cat:'data' },
    { id:'Oracle.MySQL',                  nombre:'MySQL Community Server',   cat:'data' },
    { id:'MongoDB.Server',                nombre:'MongoDB Community Server', cat:'data' },

    // Ofimática y Lectores
    { id:'TheDocumentFoundation.LibreOffice', nombre:'LibreOffice',          cat:'ofim' },
    { id:'Adobe.Acrobat.Reader.64-bit',   nombre:'Adobe Acrobat Reader',     cat:'ofim' },
    { id:'Foxit.FoxitReader',             nombre:'Foxit Reader',             cat:'ofim' },
    { id:'Obsidian.Obsidian',             nombre:'Obsidian',                 cat:'ofim' },
    { id:'Notion.Notion',                 nombre:'Notion',                   cat:'ofim' },

    // Juegos y Plataformas
    { id:'Valve.Steam',                   nombre:'Steam',                    cat:'games' },
    { id:'EpicGames.EpicGamesLauncher',   nombre:'Epic Games Launcher',      cat:'games' },
    { id:'Ubisoft.Connect',               nombre:'Ubisoft Connect',          cat:'games' },
    { id:'ElectronicArts.EADesktop',      nombre:'EA App',                   cat:'games' },
  ];

  const wgSeleccion = new Set();
  let wgInitDone = false;

  function wgInit(){
    if(wgInitDone) return;
    wgInitDone = true;
    const catalog = document.getElementById('wgCatalog');
    catalog.innerHTML = wgCategorias.map(cat=>{
      const items = wgProgramas.filter(p=>p.cat===cat.key);
      return `
      <div class="wg-cat-card" data-cat="${cat.key}">
        <div class="wg-cat-head">
          <div class="wg-cat-title"><span class="wg-cat-dot" style="background:${cat.color}"></span>${cat.nombre}</div>
          <div class="wg-cat-tools">
            <span class="wg-cat-badge" id="wgBadge-${cat.key}">0/${items.length}</span>
            <button type="button" class="wg-cat-mini" onclick="wgSelectCategory('${cat.key}',true)">Todos</button>
            <button type="button" class="wg-cat-mini" onclick="wgSelectCategory('${cat.key}',false)">Ninguno</button>
          </div>
        </div>
        <div class="wg-cat-body">
          ${items.map(p=>`
            <label class="wg-item" data-name="${p.nombre.toLowerCase()}" data-id="${p.id}">
              <input type="checkbox" onchange="wgToggle('${p.id}',this)"/>
              <span>${p.nombre}<small>${p.id}</small></span>
            </label>
          `).join('')}
        </div>
      </div>`;
    }).join('');
    wgUpdateAll();
  }

  function wgToggle(id, checkbox){
    if(checkbox.checked) wgSeleccion.add(id); else wgSeleccion.delete(id);
    checkbox.closest('.wg-item').classList.toggle('checked', checkbox.checked);
    wgUpdateAll();
  }

  window.wgSelectAll = function(estado){
    document.querySelectorAll('#wgCatalog .wg-item:not(.hidden) input[type="checkbox"]').forEach(cb=>{
      cb.checked = estado;
      const id = cb.closest('.wg-item').dataset.id;
      if(estado) wgSeleccion.add(id); else wgSeleccion.delete(id);
      cb.closest('.wg-item').classList.toggle('checked', estado);
    });
    wgUpdateAll();
  };

  window.wgSelectCategory = function(catKey, estado){
    document.querySelectorAll(`.wg-cat-card[data-cat="${catKey}"] .wg-item:not(.hidden) input[type="checkbox"]`).forEach(cb=>{
      cb.checked = estado;
      const id = cb.closest('.wg-item').dataset.id;
      if(estado) wgSeleccion.add(id); else wgSeleccion.delete(id);
      cb.closest('.wg-item').classList.toggle('checked', estado);
    });
    wgUpdateAll();
  };

  window.wgFilter = function(texto){
    const q = texto.trim().toLowerCase();
    document.querySelectorAll('#wgCatalog .wg-item').forEach(item=>{
      const match = !q || item.dataset.name.includes(q) || item.dataset.id.toLowerCase().includes(q);
      item.classList.toggle('hidden', !match);
    });
    document.querySelectorAll('.wg-cat-card').forEach(card=>{
      const visibles = card.querySelectorAll('.wg-item:not(.hidden)').length;
      card.style.display = visibles === 0 ? 'none' : '';
    });
  };

  function wgUpdateAll(){
    wgCategorias.forEach(cat=>{
      const total = wgProgramas.filter(p=>p.cat===cat.key).length;
      const marcados = wgProgramas.filter(p=>p.cat===cat.key && wgSeleccion.has(p.id)).length;
      const badge = document.getElementById('wgBadge-'+cat.key);
      if(badge) badge.textContent = `${marcados}/${total}`;
    });
    document.getElementById('wgCountBadge').textContent = `${wgSeleccion.size} seleccionados`;
    document.getElementById('wgScriptCount').textContent = `${wgSeleccion.size} programa${wgSeleccion.size===1?'':'s'}`;
    wgRenderScript();
  }

  function wgRenderScript(){
    const pre = document.getElementById('wgScript');
    if(wgSeleccion.size === 0){
      pre.textContent = '// Selecciona programas para generar el script…';
      return;
    }
    const seleccionados = wgProgramas.filter(p=>wgSeleccion.has(p.id));
    pre.textContent = wgBuildScript(seleccionados);
  }

  function wgBuildScript(lista){
    const fecha = new Date().toLocaleString('es-MX');
    const lineasInstall = lista.map(p=>`
# ── ${p.nombre} ──────────────────────────────
Write-Host ""
Write-Host "▶ Instalando ${p.nombre}..." -ForegroundColor Cyan
try {
    winget install --id ${p.id} --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✔ ${p.nombre} instalado correctamente." -ForegroundColor Green
        $exitosos += "${p.nombre}"
    } else {
        Write-Host "⚠ ${p.nombre} finalizó con código $LASTEXITCODE." -ForegroundColor Yellow
        $fallidos += "${p.nombre}"
    }
} catch {
    Write-Host "✖ Error al instalar ${p.nombre}: $($_.Exception.Message)" -ForegroundColor Red
    $fallidos += "${p.nombre}"
}`).join('\n');

    return `# ══════════════════════════════════════════════════════
# Script de instalación masiva generado automáticamente
# Generado: ${fecha}
# Total de programas: ${lista.length}
# Requiere: Windows Package Manager (winget) y PowerShell como Administrador
# ══════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
$exitosos = @()
$fallidos = @()

# Verificación de winget
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "✖ No se encontró 'winget' en este sistema. Instala 'App Installer' desde Microsoft Store." -ForegroundColor Red
    exit 1
}

Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  INICIANDO INSTALACIÓN MASIVA (${lista.length} programas)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
${lineasInstall}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  RESUMEN DE INSTALACIÓN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "Instalados correctamente: $($exitosos.Count)" -ForegroundColor Green
$exitosos | ForEach-Object { Write-Host "   ✔ $_" -ForegroundColor Green }
if ($fallidos.Count -gt 0) {
    Write-Host "Con errores: $($fallidos.Count)" -ForegroundColor Red
    $fallidos | ForEach-Object { Write-Host "   ✖ $_" -ForegroundColor Red }
}
Write-Host ""
Write-Host "Proceso finalizado." -ForegroundColor Cyan
`;
  }

  function wgToast(mensaje){
    let toast = document.getElementById('wgToastEl');
    if(!toast){
      toast = document.createElement('div');
      toast.id = 'wgToastEl';
      toast.className = 'wg-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(()=>toast.classList.remove('show'), 2200);
  }

  window.wgCopyScript = function(){
    const texto = document.getElementById('wgScript').textContent;
    if(!wgSeleccion.size){ wgToast('Selecciona al menos un programa'); return; }
    navigator.clipboard.writeText(texto).then(()=>{
      wgToast('Script copiado al portapapeles ✔');
    }).catch(()=>{
      const ta = document.createElement('textarea');
      ta.value = texto; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
      wgToast('Script copiado al portapapeles ✔');
    });
  };

  window.wgDownloadScript = function(){
    if(!wgSeleccion.size){ wgToast('Selecciona al menos un programa'); return; }
    const texto = document.getElementById('wgScript').textContent;
    const blob = new Blob([texto], { type:'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instalar-programas.ps1';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    wgToast('Descargando instalar-programas.ps1 ✔');
  };

  window.wgToggle = wgToggle;

  /* Inicializar la primera vez que se entra a la página */
  const origShowPage = window.showPage;
  window.showPage = function(pageId, btn){
    origShowPage(pageId, btn);
    if(pageId === 'winget') wgInit();
  };

})();
