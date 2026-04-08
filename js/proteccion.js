/**
 * CLOAK & SHIELD - Seguridad CUCBA
 * Este script desactiva funciones básicas del inspector para dificultar la ingeniería inversa.
 */

// 1. Bloqueo de Clic Derecho (Menú Contextual)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);

// 2. Bloqueo de Atajos de Teclado (F12, Ctrl+U, Ctrl+Shift+I/C/J)
document.onkeydown = function(e) {
    // F12
    if (e.keyCode == 123) {
        return false;
    }
    // Ctrl+Shift+I (Inspector)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    // Ctrl+Shift+C (Inspeccionar elemento)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    // Ctrl+Shift+J (Consola)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    // Ctrl+U (Ver código fuente)
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
    // Ctrl+S (Guardar página)
    if (e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) {
        return false;
    }
};

// 3. Advertencia en Consola
console.log("%c🛑 ¡ALTO! EXCLUSIVO CUCBA", "color: red; font-size: 30px; font-weight: bold; text-shadow: 2px 2px 0 black;");
console.log("%cEl uso de estas herramientas para copiar el código es una violación de los términos del sistema.", "font-size: 16px; color: #555;");
console.log("%cSi eres alumno del CUCBA y te interesa el código, solicita acceso oficial al repositorio.", "font-size: 14px; color: #888;");
