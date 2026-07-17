/**
 * MÓDULO DE IA PARA GENERACIÓN DE DOCUMENTOS (Frontend Puro)
 */

// 1. Bóveda de Seguridad (Fase de Pruebas Cerrada)
function obtenerApiKey() {
    let keyGuardada = localStorage.getItem('gemini_api_key');
    
    // Si no hay llave en la memoria del navegador, la pedimos
    if (!keyGuardada) {
        keyGuardada = prompt("🔒 Acceso Restringido (Fase de Pruebas)\n\nPor favor, ingresa la Key proporcionada por el administrador:");
        
        // Validamos que al menos tenga el tamaño típico de una llave de Google
        if (keyGuardada && keyGuardada.trim().length > 30) {
            localStorage.setItem('gemini_api_key', keyGuardada.trim());
        } else {
            alert("⚠ Llave inválida o cancelada. La generación por IA ha sido abortada.");
            return null; // Detenemos el proceso
        }
    }
    return keyGuardada.trim();
}

// Opcional: Función global por si alguien pega mal la llave y necesita resetearla
window.resetearApiKey = function() {
    localStorage.removeItem('gemini_api_key');
    alert("✓ Llave borrada del sistema. Se te pedirá de nuevo la próxima vez que uses la IA.");
}; 

// 2. Sistema de Plantillas Dinámicas
// Se obliga a la IA a devolver un formato HTML estricto sin usar Markdown
const PROMPT_TEMPLATES = {
    ensayo: "Escribe un ensayo académico formal sobre el siguiente tema. Es OBLIGATORIO usar etiquetas HTML <h3> para subtítulos, <p> para párrafos y <ul>/<li> para listas. NO uses sintaxis markdown (como ** o ##). Tema: ",
    ensayo1: `Actúa como un estudiante universitario. Escribe un ensayo académico formal, objetivo y con vocabulario culto. 
    REGLAS DE FORMATO CRÍTICAS:
    1. Devuelve ÚNICAMENTE código HTML puro. No incluyas \`\`\`html al inicio ni al final.
    2. Usa <h3> para los subtítulos, <p> para los párrafos, y <ul>/<li> para viñetas si son necesarias.
    3. PROHIBIDO usar Markdown (no uses **, *, #, ni _). Aplica negritas usando la etiqueta HTML <strong>.
    `,
    reporte: "Escribe un reporte técnico estructurado. Es OBLIGATORIO usar etiquetas HTML <h3> para secciones, <p> para párrafos y <ul>/<li> para listas. NO uses sintaxis markdown. Tema: ",
    reporte1: `Actúa como un estudiante de Ingeniería en Sistemas Computacionales. Escribe un reporte técnico estructurado, directo y analítico.
    REGLAS DE FORMATO CRÍTICAS:
    1. Devuelve ÚNICAMENTE código HTML puro. No incluyas \`\`\`html al inicio ni al final.
    2. Usa <h3> para los nombres de las secciones, <p> para el contenido, y <ul>/<li> para listar especificaciones.
    3. PROHIBIDO usar Markdown. Aplica negritas usando <strong>.
    `,
    arquitectura: "Describe detalladamente la arquitectura de software requerida. Es OBLIGATORIO usar etiquetas HTML <h3> para componentes, <p> para descripciones y <ul>/<li> para características. NO uses sintaxis markdown. Tema: ",
    arquitectura1: `Actúa como un Arquitecto de Software. Describe detalladamente la arquitectura técnica, componentes o infraestructura requerida.
    REGLAS DE FORMATO CRÍTICAS:
    1. Devuelve ÚNICAMENTE código HTML puro. No incluyas \`\`\`html al inicio ni al final.
    2. Usa <h3> para dividir los módulos/componentes, <p> para las descripciones técnicas, y <ul>/<li> para características de cada módulo.
    3. PROHIBIDO usar Markdown. Aplica negritas usando <strong>.
    `,
    libre: "Desarrolla el siguiente tema de forma detallada. Es OBLIGATORIO usar etiquetas HTML <h3> para títulos, <p> para texto y <ul>/<li> para viñetas. NO uses sintaxis markdown. Tema: ",
    libre1 : `Desarrolla el siguiente tema de forma detallada, clara y bien estructurada.
    REGLAS DE FORMATO CRÍTICAS:
    1. Devuelve ÚNICAMENTE código HTML puro. No incluyas \`\`\`html al inicio ni al final.
    2. Usa <h3> para los títulos principales, <p> para el texto, y <ul>/<li> para listados.
    3. PROHIBIDO usar Markdown. Aplica negritas usando <strong>.
    `
};

// 3. Lógica principal de conexión y generación
async function generarTextoConIA() {
    const GEMINI_API_KEY = obtenerApiKey();
    if (!GEMINI_API_KEY) return;
    const templateKey = document.getElementById('ai_template_select').value;
    const evidenciaDesc = document.getElementById('evidencia').value.trim();
    const btnGenerar = document.getElementById('btn_ai_generate');
    // 1. Leer el contenido actual del editor Quill en texto plano
    // Usamos getText() en lugar de innerHTML para no enviarle a la IA etiquetas basura de Quill
    let contenidoEditor = "";
    if (typeof quill !== 'undefined') {
        contenidoEditor = quill.getText().trim();
    }

    // 2. Validar que el usuario haya escrito algo en el editor
    if (!contenidoEditor || contenidoEditor.length < 3) {
        if (typeof showError === 'function') showError("Escribe una idea, borrador o instrucción en el editor primero para que la IA lo desarrolle.");
        return;
    }

    // 3. Opcional pero recomendado: Seguir leyendo la materia para dar contexto académico
    const materiaSelect = document.getElementById('asignatura_select').value;
    let nombreMateria = materiaSelect;
    if (materiaSelect === '__vacio__') {
        nombreMateria = document.getElementById('materia_manual').value.trim() || "Materia no especificada";
    }

    // 4. Construir el nuevo prompt
    const contexto = `El texto es para la asignatura de "${nombreMateria}". 
    Basándote en las siguientes instrucciones o borrador del usuario, desarrolla el documento completo: 
    "${contenidoEditor}"`;
    const finalconext = `No deberas de incluir el nombre de que materia al principio deberas de continuar lo pedido directamente a menos que sea solicitado`;
    const promptFinal = PROMPT_TEMPLATES[templateKey + 1] + contexto + finalconext;

    try {
        // Bloquear UI...
        btnGenerar.disabled = true;
        btnGenerar.innerHTML = "⏳ Redactando...";
        if (typeof showLoading === 'function') showLoading("Consultando a CDA AI...");
        // Llamada a Google AI Studio
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptFinal }] }],
                generationConfig: { 
                    temperature: 0.7 // Temperatura balanceada para redacción académica
                }
            })
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        let htmlGenerado = data.candidates[0].content.parts[0].text;

        // 4. Limpieza del output
        // A veces Gemini envuelve el HTML en bloques de código Markdown (```html ... ```). Hay que removerlos.
        htmlGenerado = htmlGenerado.replace(/```html/gi, '').replace(/```/gi, '').trim();
        
        // SEGURO ANTI-MARKDOWN: Por si la IA ignora las reglas
        // Convierte **texto** a <strong>texto</strong>
        htmlGenerado = htmlGenerado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Convierte *texto* a <em>texto</em> (cursivas)
        htmlGenerado = htmlGenerado.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Convierte ## Título a <h3>Título</h3> (por si acaso)
        htmlGenerado = htmlGenerado.replace(/^### (.*$)/gim, '<h3>$1</h3>');

        // 5. Inyección en Quill.js
        if (typeof quill !== 'undefined') {
            // Se reemplaza el contenido del editor con la estructura HTML de la IA
            quill.clipboard.dangerouslyPasteHTML(htmlGenerado);
            
            // Forzamos la actualización de la vista previa lateral
            if (typeof actualizarVistaPrevia === 'function') actualizarVistaPrevia();
            if (typeof showSuccess === 'function') showSuccess("✓ Contenido redactado y formateado por IA.");
        } else {
            console.error("No se detectó la instancia de Quill.");
        }

    } catch (error) {
        console.error("Error en módulo IA:", error);
        if (typeof showError === 'function') showError("Hubo un error al generar el texto. Revisa la consola.");
    } finally {
        // Restaurar estado del botón
        btnGenerar.disabled = false;
        btnGenerar.innerHTML = "✨ Auto-redactar";
    }
}

// 6. Asignar el evento de click al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const btnGenerar = document.getElementById('btn_ai_generate');
    if (btnGenerar) {
        btnGenerar.addEventListener('click', generarTextoConIA);
    }
});