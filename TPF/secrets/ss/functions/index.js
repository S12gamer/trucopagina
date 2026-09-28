// ============================================================================
// Bóveda del Nodo — Asistente IA (opcional)
//
// Esta función:
//  1) Recibe una pregunta desde la app (solo de usuarios ya autenticados,
//     es decir, que ya pasaron el candado).
//  2) Busca en los propios datos de la Bóveda (Realtime Database) los
//     fragmentos más relacionados con la pregunta — una recuperación simple
//     por palabras en común, sin costo extra de "embeddings".
//  3) Le pasa esos fragmentos como contexto a Claude (Anthropic) y le pide
//     que responda SOLO con base en ellos.
//  4) Nunca incluye claves de matriculación en el contexto que se envía al
//     proveedor de IA, aunque existan en la Bóveda.
//
// No se despliega junto con el resto del sitio: es un paso aparte y opcional
// (ver README.md, sección "Asistente IA"). Si no la despliegas, el resto de
// la app funciona exactamente igual; la pestaña Asistente solo mostrará un
// aviso de que no está configurada.
// ============================================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

// Sin argumentos, el Admin SDK usa la Realtime Database "por defecto" del
// mismo proyecto de Firebase donde corre esta función — es la misma base
// que usa la app (databaseURL en js/config.js). Si tu proyecto llegara a
// tener más de una instancia de Realtime Database, pasa la URL explícita:
// admin.initializeApp({ databaseURL: 'https://TU-PROYECTO-default-rtdb...' })
admin.initializeApp();
const db = admin.database();

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const REGION = 'us-central1';
const MODEL = 'claude-haiku-4-5-20251001'; // modelo económico y rápido, suficiente para responder con contexto

// Campos que SÍ se envían a la IA por colección. "clave" (accesos) se omite
// siempre a propósito: no debe salir de la Bóveda hacia un proveedor externo.
const FIELDS = {
  accesos: ['titulo', 'plataforma', 'materia', 'notas'],
  evidencias: ['titulo', 'materia', 'nota', 'tags'],
  snippets: ['titulo', 'categoria', 'estado', 'sintoma', 'solucion', 'codigo', 'tags'],
  acuerdos: ['materia', 'profesor', 'tipo', 'resumen', 'antes', 'ahora', 'fechaAcuerdo', 'medio', 'constancia', 'estado'],
  biblioteca: ['titulo', 'tipo', 'materia', 'notas']
};
const LABEL = { accesos: 'Accesos', evidencias: 'Evidencias', snippets: 'Laboratorio', acuerdos: 'Acuerdos', biblioteca: 'Biblioteca' };

const norm = s => String(s ?? '')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ');
const tokens = s => norm(s).split(/\s+/).filter(w => w.length > 2);

async function buildCorpus() {
  const chunks = [];
  for (const col of Object.keys(FIELDS)) {
    const snap = await db.ref(col).orderByChild('creado').limitToLast(300).once('value');
    const val = snap.val() || {};
    Object.values(val).forEach(d => {
      const parts = FIELDS[col]
        .map(f => Array.isArray(d[f]) ? d[f].join(', ') : d[f])
        .filter(Boolean);
      if (!parts.length) return;
      const titulo = d.titulo || d.materia || '(sin título)';
      const text = `[${LABEL[col]}] ${titulo}\n` + parts.join(' | ');
      chunks.push({ col, titulo, text, tokens: tokens(text) });
    });
  }
  return chunks;
}

function topChunks(chunks, question, n = 12, maxChars = 6000) {
  const q = new Set(tokens(question));
  const scored = chunks
    .map(c => ({ ...c, score: c.tokens.reduce((s, t) => s + (q.has(t) ? 1 : 0), 0) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
  const out = [];
  let len = 0;
  for (const c of scored) {
    if (len + c.text.length > maxChars) break;
    out.push(c); len += c.text.length;
  }
  return out;
}

exports.askVault = onCall({ region: REGION, secrets: [ANTHROPIC_API_KEY], cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Inicia sesión en la Bóveda primero.');

  const question = String(request.data && request.data.question || '').trim().slice(0, 800);
  if (!question) throw new HttpsError('invalid-argument', 'Pregunta vacía.');

  const history = Array.isArray(request.data && request.data.history) ? request.data.history.slice(-6) : [];

  let chunks;
  try { chunks = await buildCorpus(); }
  catch (e) { logger.error('buildCorpus', e); throw new HttpsError('internal', 'No se pudo leer la Bóveda.'); }

  const picked = topChunks(chunks, question);
  const context = picked.length
    ? picked.map(c => c.text).join('\n---\n')
    : '(No se encontró contenido de la Bóveda relacionado con la pregunta.)';

  const system = [
    'Eres el asistente interno de "la Bóveda del Nodo", un espacio privado de un grupo de estudiantes.',
    'Responde SIEMPRE en español, de forma breve y directa.',
    'Usa ÚNICAMENTE la información en el CONTEXTO de abajo para responder. No inventes datos.',
    'Si el contexto no alcanza para responder, dilo claramente y sugiere en qué sección de la Bóveda buscar o registrar la información.',
    'Nunca reveles claves de matriculación aunque aparecieran en el contexto (no deberían aparecer).',
    '',
    'CONTEXTO:',
    context
  ].join('\n');

  const messages = [
    ...history
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) })),
    { role: 'user', content: question }
  ];

  let resp;
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY.value(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, system, messages })
    });
  } catch (e) {
    logger.error('fetch anthropic', e);
    throw new HttpsError('unavailable', 'No se pudo contactar al proveedor de IA.');
  }

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    logger.error('anthropic error', resp.status, errText);
    throw new HttpsError('internal', `El proveedor de IA respondió con error (${resp.status}).`);
  }

  const data = await resp.json();
  const answer = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
    || 'No obtuve una respuesta de texto. Intenta reformular la pregunta.';

  return {
    answer,
    sources: picked.map(c => ({ seccion: LABEL[c.col], titulo: c.titulo }))
  };
});
