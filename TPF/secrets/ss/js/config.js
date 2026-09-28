// ============================================================================
// CONFIGURACIÓN DE LA BÓVEDA DEL NODO
// Edita este archivo con tus propios datos. No necesitas tocar ningún otro
// archivo del proyecto para poner la app en marcha. Instrucciones completas
// en README.md.
// ============================================================================

// 1) Pega aquí el objeto "firebaseConfig" que Firebase te da al crear la app
//    web (Configuración del proyecto → tus apps → ícono </> ). Ejemplo real:
//
//    export const firebaseConfig = {
//      apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
//      authDomain: "boveda-del-nodo.firebaseapp.com",
//      databaseURL: "https://boveda-del-nodo-default-rtdb.firebaseio.com",
//      projectId: "boveda-del-nodo",
//      storageBucket: "boveda-del-nodo.appspot.com",
//      messagingSenderId: "123456789012",
//      appId: "1:123456789012:web:abcdef1234567890abcdef"
//    };
//
//    "databaseURL" es la dirección de tu Realtime Database. Si creaste la
//    Realtime Database ANTES de registrar la app web, Firebase ya la incluye
//    sola en este bloque. Si la creaste DESPUÉS, cópiala a mano desde
//    Compilación → Realtime Database (aparece arriba de la tabla de datos,
//    algo como "https://tu-proyecto-default-rtdb.firebaseio.com" o con
//    "-region-" en medio) y pégala aquí.
//
//    Esta clave "apiKey" NO es secreta: identifica tu proyecto, no da acceso
//    por sí sola. Quien lea los datos de verdad necesita pasar el código de
//    acceso de abajo Y las reglas de seguridad de Realtime Database/Storage
//    (ver README.md) deben estar activas.
export const firebaseConfig = {
  apiKey: "AIzaSyBc0QdiNhj421frBs53joWgI2GCWmdtxFs",
  authDomain: "dbvibesoo.firebaseapp.com",
  databaseURL: "https://dbvibesoo-default-rtdb.firebaseio.com",
  projectId: "dbvibesoo",
  storageBucket: "dbvibesoo.firebasestorage.app",
  messagingSenderId: "1044293106076",
  appId: "1:1044293106076:web:1dd40ff9903a25be363059",
  measurementId: "G-7R55G62DB4"
};

// 2) Código de acceso del grupo (el que van a escribir Jefatura, Subjefatura
//    y los 10 titulares/suplentes para entrar). Por seguridad NO se guarda
//    en texto plano: se guarda su huella SHA-256.
//
//    Para generar la huella de un código nuevo:
//      a. Abre esta misma página en el navegador (ya con Firebase configurado).
//      b. Abre la consola del navegador (F12 → pestaña "Console").
//      c. Escribe:  await bovedaHashCode("tu-codigo-nuevo")
//      d. Copia el texto largo que te devuelve y pégalo abajo, reemplazando
//         el valor de ACCESS_CODE_HASH.
//
//    El código de fábrica de este proyecto es:  nodo2026
//    CÁMBIALO antes de compartir la app con el grupo.
export const ACCESS_CODE_HASH =
  "b1bb6458b4308b5040d2f208bcee2de0f2f4adcd347d559174868a8e078a654d"; // huella de "nodo2026" — cámbialo

// 3) Nombre que se muestra en la barra superior y en la pantalla de acceso.
export const APP_NAME = "Bóveda del Nodo";

// 4) Subida de evidencias (fotos). Ponlo en `false` para deshabilitar
//    TEMPORALMENTE que se tomen/suban fotos nuevas en la sección Evidencias
//    (por ejemplo, mientras terminas de configurar Storage). Las evidencias
//    que ya existan se pueden seguir viendo, editando y borrando igual;
//    esto solo bloquea el botón de subir. Vuelve a ponerlo en `true` cuando
//    quieras reactivarlo — no hay que tocar nada más.
export const EVIDENCE_UPLOADS_ENABLED = false;

// 5) Asistente IA (OPCIONAL). Solo aplica si desplegaste la Cloud Function
//    de functions/index.js (ver README.md, sección "Asistente IA"). Si no
//    la desplegaste, deja esto como está: la pestaña Asistente mostrará un
//    aviso en vez de fallar.
//    Debe coincidir con la región usada en functions/index.js (REGION).
export const AI_REGION = "us-central1";
