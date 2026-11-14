// 1) Crea una carpeta en Drive y pega su ID aquí (la parte final de la URL de la carpeta).
const FOLDER_ID = 'PEGA_AQUI_EL_ID_DE_LA_CARPETA';

// 2) Implementar > Nueva implementación > Aplicación web
//    Ejecutar como: Yo | Quién tiene acceso: Cualquier usuario
// 3) Copia la URL (termina en /exec) y pégala en script_url dentro de tarea.txt

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const root = DriveApp.getFolderById(FOLDER_ID);
    const nombre = (d.alumno || 'Sin nombre').trim();
    const it = root.getFoldersByName(nombre);
    const sub = it.hasNext() ? it.next() : root.createFolder(nombre);
    const blob = Utilities.newBlob(Utilities.base64Decode(d.data), d.mime || 'application/octet-stream', d.name);
    const f = sub.createFile(blob);
    return out({ ok: true, url: f.getUrl() });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}
function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
