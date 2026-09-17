/**
 * MÓDULO DE IA PARA GENERACIÓN DE DOCUMENTOS (Frontend)
 * ---------------------------------------------------------------
 * Este módulo YA NO llama directamente a Google AI Studio ni guarda
 * la API key de Gemini en el navegador. La API key real vive como
 * secreto del lado del servidor, dentro del Cloudflare Worker
 * (worker.js). El frontend solo envía el prompt ya construido al
 * Worker, y el Worker es quien habla con Gemini.
 *
 * Lo único que se pide aquí es un "código de acceso" simple para
 * controlar el uso durante la fase de pruebas cerrada — NO es la
 * API key de Gemini, así que aunque alguien lo vea no puede usar
 * tu cuota de Google directamente.
 */

// ============================================================
// 0. CONFIGURACIÓN
// ============================================================
// Cambia esto por la URL de tu Worker ya desplegado, por ejemplo:
// "https://cda-ai-worker.tu-usuario.workers.dev/api/generate"
const AI_WORKER_URL = "https://cda-ai-worker.disp-12-a.workers.dev/api/generate";

// true  = fase de pruebas cerrada: se pide un código de acceso antes de usar la IA.
// false = prueba abierta: cualquiera puede usar el botón, sin código.
//         El control de abuso pasa a hacerlo el Worker con límites por IP
//         y un límite global diario (DAILY_LIMIT_PER_IP / GLOBAL_DAILY_LIMIT
//         en wrangler.toml), así que igual queda protegida tu cuota de Gemini.
const REQUIRE_ACCESS_CODE = false;
 
// ============================================================
// 1. Código de acceso (solo aplica si REQUIRE_ACCESS_CODE = true)
// ============================================================
function obtenerCodigoAcceso() {
    let codigo = localStorage.getItem('cda_access_code');
 
    // Si no hay código guardado, lo pedimos
    if (!codigo) {
        codigo = prompt("🔒 Acceso Restringido (Fase de Pruebas)\n\nPor favor, ingresa el código proporcionado por el administrador:");
 
        if (codigo && codigo.trim().length >= 4) {
            localStorage.setItem('cda_access_code', codigo.trim());
        } else {
            alert("⚠ Código inválido o cancelado. La generación por IA ha sido abortada.");
            return null; // Detenemos el proceso
        }
    }
    return codigo.trim();
}
 
// Se conserva el nombre "resetearApiKey" porque el HTML ya tiene un botón
// con onclick="resetearApiKey()". Internamente ahora solo borra el código
// de acceso, nunca una llave real de Gemini (esa nunca toca el navegador).
window.resetearApiKey = function() {
    localStorage.removeItem('cda_access_code');
    alert("✓ Código borrado del sistema. Se te pedirá de nuevo la próxima vez que uses la IA.");
};
 
// ============================================================
// 2. Sistema de Plantillas Dinámicas
// Se obliga a la IA a devolver un formato HTML estricto sin usar Markdown
// ============================================================
const PROMPT_TEMPLATES = {
    ensayo1: `Actúa como un estudiante universitario. Escribe un ensayo académico formal, objetivo y con vocabulario culto.
    REGLAS DE FORMATO CRÍTICAS:
    1. Devuelve ÚNICAMENTE código HTML puro. No incluyas \`\`\`html al inicio ni al final.
    2. Usa <h3> para los subtítulos, <p> para los párrafos, y <ul>/<li> para viñetas si son necesarias.
    3. PROHIBIDO usar Markdown (no uses **, *, #, ni _). Aplica negritas usando la etiqueta HTML <strong>.
    `,
    reporte1: `Actúa como un estudiante de Ingeniería en Sistemas Computacionales. Escribe un reporte técnico estructurado, directo y analítico.
    REGLAS DE FORMATO CRÍTICAS:
    1. Devuelve ÚNICAMENTE código HTML puro. No incluyas \`\`\`html al inicio ni al final.
    2. Usa <h3> para los nombres de las secciones, <p> para el contenido, y <ul>/<li> para listar especificaciones.
    3. PROHIBIDO usar Markdown. Aplica negritas usando <strong>.
    `,
    arquitectura1: `Actúa como un Arquitecto de Software. Describe detalladamente la arquitectura técnica, componentes o infraestructura requerida.
    REGLAS DE FORMATO CRÍTICAS:
    1. Devuelve ÚNICAMENTE código HTML puro. No incluyas \`\`\`html al inicio ni al final.
    2. Usa <h3> para dividir los módulos/componentes, <p> para las descripciones técnicas, y <ul>/<li> para características de cada módulo.
    3. PROHIBIDO usar Markdown. Aplica negritas usando <strong>.
    `,
    libre1: `Desarrolla el siguiente tema de forma detallada, clara y bien estructurada.
    REGLAS DE FORMATO CRÍTICAS:
    1. Devuelve ÚNICAMENTE código HTML puro. No incluyas \`\`\`html al inicio ni al final.
    2. Usa <h3> para los títulos principales, <p> para el texto, y <ul>/<li> para listados.
    3. PROHIBIDO usar Markdown. Aplica negritas usando <strong>.
    `
};
 
// ============================================================
// 3. Lógica principal: construye el prompt y llama al Worker
// ============================================================
async function generarTextoConIA() {
    let codigoAcceso = null;
    if (REQUIRE_ACCESS_CODE) {
        codigoAcceso = obtenerCodigoAcceso();
        if (!codigoAcceso) return;
    }
 
    const templateKey = document.getElementById('ai_template_select').value;
    const btnGenerar = document.getElementById('btn_ai_generate');
 
    // 1. Leer el contenido actual del editor Quill en texto plano
    let contenidoEditor = "";
    if (typeof quill !== 'undefined') {
        contenidoEditor = quill.getText().trim();
    }
 
    // 2. Validar que el usuario haya escrito algo en el editor
    if (!contenidoEditor || contenidoEditor.length < 3) {
        if (typeof showError === 'function') showError("Escribe una idea, borrador o instrucción en el editor primero para que la IA lo desarrolle.");
        return;
    }
 
    // 3. Seguir leyendo la materia para dar contexto académico
    const materiaSelect = document.getElementById('asignatura_select').value;
    let nombreMateria = materiaSelect;
    if (materiaSelect === '__vacio__') {
        nombreMateria = document.getElementById('materia_manual').value.trim() || "Materia no especificada";
    }
 
    // 4. Construir el prompt final (igual que antes, esto sigue viviendo en el cliente)
    const contexto = `El texto es para la asignatura de "${nombreMateria}".
    Basándote en las siguientes instrucciones o borrador del usuario, desarrolla el documento completo:
    "${contenidoEditor}"`;
    const finalconext = `No deberas de incluir el nombre de que materia al principio deberas de continuar lo pedido directamente a menos que sea solicitado`;
 
    const template = PROMPT_TEMPLATES[templateKey + '1'];
    if (!template) {
        if (typeof showError === 'function') showError("Tipo de documento de IA no reconocido.");
        return;
    }
    const promptFinal = template + contexto + finalconext;
 
    try {
        // Bloquear UI
        btnGenerar.disabled = true;
        btnGenerar.innerHTML = "⏳ Redactando...";
        if (typeof showLoading === 'function') showLoading("Consultando a CDA AI...");
 
        // Llamada al Worker de Cloudflare (nunca directo a Google desde el navegador)
        const headers = { 'Content-Type': 'application/json' };
        if (REQUIRE_ACCESS_CODE && codigoAcceso) {
            headers['X-Access-Code'] = codigoAcceso;
        }
 
        const response = await fetch(AI_WORKER_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ prompt: promptFinal })
        });
 
        if (response.status === 401) {
            // Código de acceso rechazado por el Worker: lo borramos para que se vuelva a pedir
            localStorage.removeItem('cda_access_code');
            throw new Error('Código de acceso inválido. Vuelve a intentarlo.');
        }
 
        if (response.status === 429) {
            // Límite de uso alcanzado (por IP o global) — modo prueba abierta
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || 'Alcanzaste el límite de uso de la IA por hoy. Intenta de nuevo mañana.');
        }
 
        if (!response.ok) {
            let mensaje = `Error HTTP: ${response.status}`;
            try {
                const errBody = await response.json();
                if (errBody && errBody.error) mensaje = errBody.error;
                if (errBody && errBody.detalle) mensaje += ` — ${errBody.detalle}`;
            } catch (_) { /* respuesta sin cuerpo JSON */ }
            throw new Error(mensaje);
        }
 
        const data = await response.json();
        let htmlGenerado = data.text || "";
 
        if (!htmlGenerado.trim()) {
            throw new Error("La IA no devolvió contenido. Intenta reformular tu instrucción.");
        }
 
        // 5. Limpieza del output (seguro extra por si el Worker no lo hizo)
        htmlGenerado = htmlGenerado.replace(/```html/gi, '').replace(/```/gi, '').trim();
 
        // SEGURO ANTI-MARKDOWN: Por si la IA ignora las reglas
        htmlGenerado = htmlGenerado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlGenerado = htmlGenerado.replace(/\*(.*?)\*/g, '<em>$1</em>');
        htmlGenerado = htmlGenerado.replace(/^### (.*$)/gim, '<h3>$1</h3>');
 
        // 6. Inyección en Quill.js
        if (typeof quill !== 'undefined') {
            quill.clipboard.dangerouslyPasteHTML(htmlGenerado);
            if (typeof actualizarVistaPrevia === 'function') actualizarVistaPrevia();
 
            let mensajeExito = "✓ Contenido redactado y formateado por IA.";
            if (typeof data.restantes_hoy === 'number') {
                mensajeExito += ` (Te quedan ${data.restantes_hoy} generaciones hoy)`;
            }
            if (typeof showSuccess === 'function') showSuccess(mensajeExito);
        } else {
            console.error("No se detectó la instancia de Quill.");
        }
 
    } catch (error) {
        console.error("Error en módulo IA:", error);
        if (typeof showError === 'function') {
            showError(error.message || "Hubo un error al generar el texto. Revisa la consola.");
        }
    } finally {
        // Restaurar estado del botón
        btnGenerar.disabled = false;
        btnGenerar.innerHTML = "✨ Auto-redactar";
    }
}
 
// ============================================================
// 4. Asignar el evento de click al cargar el DOM
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const btnGenerar = document.getElementById('btn_ai_generate');
    if (btnGenerar) {
        btnGenerar.addEventListener('click', generarTextoConIA);
    }
});