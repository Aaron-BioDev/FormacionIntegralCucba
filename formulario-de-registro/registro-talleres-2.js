// --- 1. GENERADOR DE FOLIO ÚNICO Y SEGURO ---
function generarFolioUnico(taller, codigo) {
    const ahora = new Date();
    const siglas = taller.substring(0, 3).toUpperCase();
    const timestamp = ahora.getTime().toString().slice(-6); 
    return `CUCBA-${siglas}-${codigo.slice(-4)}-${timestamp}`;
}

// --- 2. FUNCIÓN PARA EL PDF (IMPRESIÓN LIMPIA) ---
function generarPDF() {
    const estiloPrint = document.createElement('style');
    estiloPrint.innerHTML = `
        @media print {
            body * { visibility: hidden; }
            #ticket-exito, #ticket-exito * { visibility: visible; }
            #ticket-exito { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                border: none !important; 
                box-shadow: none !important;
            }
        }
    `;
    document.head.appendChild(estiloPrint);
    window.print();
    document.head.removeChild(estiloPrint);
}

document.getElementById('formulario').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const btn = document.getElementById('btnEnviar');
    const resp = document.getElementById('respuesta');
    const selectorTalleres = document.getElementById('tallerSelect');
    
    const nombreTallerTexto = selectorTalleres.options[selectorTalleres.selectedIndex].text;
    const nombreEnMinusculas = nombreTallerTexto.toLowerCase().trim();
    const codigoAlumno = document.getElementsByName('codigoUDG')[0].value;

    // --- ENRUTAMIENTO DE COORDINACIONES ---
    const LINKS = {
        deportes: "https://script.google.com/macros/s/AKfycbxToh1I5uhKKrHbZBZHiucxQi9JZidQIQAMC1-fiSNke3gUh9ENnhCVUfKxNNSijMEHtQ/exec",
        cultura:  "https://script.google.com/macros/s/AKfycbyY6OSDJLgsCjc9ahQiVXim2SbpD194g7GjFDYzk64Edc-go9of8yH4fUTXHKA2OKnn/exec",
        emprende: "https://script.google.com/macros/s/AKfycbwLJuiZir4mOoFhk1V1qvoJj97e_98cjrqXqtBQB0iR1jIWZNtZwnIlkhgNGP9CUB5p/exec", 
        salud:    "https://script.google.com/macros/s/AKfycbxmRYxmP-kIsxc8SvnB6eqM5lEAR3d5cbDHra_hTnTN8eXpkzmDs0x2gMQ0d30oTd6R/exec",
        social:   "https://script.google.com/macros/s/AKfycbxDGhW7cCKBk-p6kLqNniTTFFEmIb1X3yqgruqdYNFPk3RjciO6dzQOvnH1CTfZ20tgfw/exec",
        idiomas:  "https://script.google.com/macros/s/AKfycbzGc8CeOLnZy1RWiE-i4Zoy9fgjzjVfmYg7wUWzsbGBGFY2aGrDL4-FVquRN9uZD39d/exec"
    };

    let urlDestino = LINKS.deportes; 
    let coord = "Deportes";

    const filtros = {
        cultura: ["jazz", "teatro", "danza", "pintura", "música", "guitarra", "fotografía", "dibujo", "canto", "baile", "ritmos", "cerveza", "crochet", "k-pop"],
        emprende: ["diafanización", "diafanizacion", "etología", "etologia", "financiera", "educación"],
        salud: ["yoga", "huertos", "estimulantes"],
        social: ["brigada", "braille", "fuego", "ambiente"],
        idiomas: ["chino", "nahuatl", "náhuatl", "alemán", "aleman", "idioma"]
    };

    if (filtros.cultura.some(p => nombreEnMinusculas.includes(p))) { urlDestino = LINKS.cultura; coord = "Arte y Cultura"; }
    else if (filtros.emprende.some(p => nombreEnMinusculas.includes(p))) { urlDestino = LINKS.emprende; coord = "Formación y Emprendimiento"; }
    else if (filtros.salud.some(p => nombreEnMinusculas.includes(p))) { urlDestino = LINKS.salud; coord = "Salud"; }
    else if (filtros.social.some(p => nombreEnMinusculas.includes(p))) { urlDestino = LINKS.social; coord = "Responsabilidad Social"; }
    else if (filtros.idiomas.some(p => nombreEnMinusculas.includes(p))) { urlDestino = LINKS.idiomas; coord = "Idiomas"; }

    btn.disabled = true;
    btn.innerHTML = "⏳ Guardando Registro...";

    // --- PREPARACIÓN DE DATOS Y FOLIO ---
    const miFolio = generarFolioUnico(nombreTallerTexto, codigoAlumno);
    
    // Usamos URLSearchParams para asegurar que Google Apps Script reciba los datos correctamente
    const datosEnvio = new URLSearchParams(new FormData(this));
    datosEnvio.append("folio", miFolio); 

    fetch(urlDestino, {
        method: 'POST',
        mode: 'no-cors', 
        body: datosEnvio 
    })
    .then(() => {
        // --- MOTOR DE QR ---
        const qrPrincipal = `https://chart.googleapis.com/chart?chs=350x350&cht=qr&chl=${encodeURIComponent(miFolio)}&choe=UTF-8`;
        const qrRespaldo = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(miFolio)}`;

        resp.innerHTML = `
            <div id="ticket-exito" style="background: white; border: 4px solid #1a73e8; border-radius: 20px; padding: 25px; margin-top: 20px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.15); font-family: Arial, sans-serif;">
                <h2 style="color: #1a73e8; margin-top: 0;">✅ ¡REGISTRO EXITOSO!</h2>
                <p style="color: #555; margin-bottom: 20px;">Presenta este QR oficial en cada sesión</p>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 15px; display: inline-block; border: 1px solid #ddd; margin-bottom: 15px;">
                    <img src="${qrPrincipal}" 
                         alt="QR Asistencia" 
                         style="width: 250px; height: 250px; display: block;"
                         onerror="this.onerror=null; this.src='${qrRespaldo}';">
                </div>

                <div style="background: #1a73e8; color: white; padding: 12px; border-radius: 10px; font-family: monospace; font-size: 1.3em; font-weight: bold;">
                    ${miFolio}
                </div>

                <div style="text-align: left; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #eee; font-size: 0.9em;">
                    <p style="margin: 4px 0;"><b>📍 Taller:</b> ${nombreTallerTexto}</p>
                    <p style="margin: 4px 0;"><b>🏢 Coordinación:</b> ${coord}</p>
                </div>

                <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 8px; margin-top: 20px; font-weight: bold; font-size: 12px; border: 1px solid #ffeeba;">
                    📸 TOMA CAPTURA DE PANTALLA
                </div>

                <button onclick="generarPDF()" style="width: 100%; background: #34a853; color: white; border: none; padding: 12px; border-radius: 10px; margin-top: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    📄 Guardar como PDF / Imprimir
                </button>
            </div>
        `;

        document.getElementById('ticket-exito').scrollIntoView({ behavior: 'smooth' });
        this.reset();
    })
    .catch(error => {
        alert("❌ Error de conexión.");
        console.error(error);
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = "Confirmar Registro ✉️";
    });
});