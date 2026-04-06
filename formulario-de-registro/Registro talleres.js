const URL = "https://script.google.com/macros/s/AKfycbyVVzDWoCEGsNG_p7i8npOQtxPgrCl4OAQ7LRqJ4QVSvIMxrB20iIqzqvLlk_fDNLBacA/exec"; 
let talleresData = [];

document.addEventListener("DOMContentLoaded", cargarTalleres);

/**
 * 1. CARGA TALLERES DESDE EL SCRIPT
 */
async function cargarTalleres() {
    const select = document.getElementById("tallerSelect");
    if (!select) return;

    try {
        const res = await fetch(URL + "?accion=obtenerTalleres");
        talleresData = await res.json();
        
        select.innerHTML = "<option value=''>-- SELECCIONA UN TALLER --</option>";
        
        const grupos = {};
        talleresData.forEach(t => {
            const area = t.nombreArea || "OTROS";
            if (!grupos[area]) grupos[area] = [];
            grupos[area].push(t);
        });

        for (const area in grupos) {
            const optgroup = document.createElement("optgroup");
            optgroup.label = area.toUpperCase();
            
            grupos[area].forEach(t => {
                const option = document.createElement("option");
                option.value = t.id;
                option.textContent = t.esIlimitado ? `${t.nombre} (ILIMITADO)` : `${t.nombre} (${t.disponibles} LUGARES)`;
                if (!t.esIlimitado && t.disponibles <= 0) option.disabled = true;
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }
    } catch (e) {
        select.innerHTML = "<option>ERROR AL CARGAR DATOS</option>";
    }
}

/**
 * 2. ENVÍO Y BÚSQUEDA DEL FOLIO REAL
 */
const form = document.getElementById("formulario");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btnEnviar");
        
        // Obtenemos el código UDG para buscarlo después
        const formData = new FormData(form);
        const codUDG = formData.get("codigoUDG");

        btn.disabled = true;
        btn.textContent = "REGISTRANDO Y GENERANDO FOLIO...";

        try {
            // Enviamos el POST
            await fetch(URL, { method: "POST", body: new URLSearchParams(formData), mode: "no-cors" });

            // POLLING: Preguntar a Google cada segundo hasta que aparezca el folio
            let intentos = 0;
            const buscarFolio = setInterval(async () => {
                intentos++;
                const res = await fetch(URL + "?accion=consultarEstatus&codigoUDG=" + codUDG);
                const data = await res.json();

                if (data.length > 0) {
                    clearInterval(buscarFolio);
                    const registro = data[data.length - 1]; // El más nuevo
                    mostrarExito(registro.folio, registro.taller);
                }

                if (intentos > 10) { // Si pasa 10 segundos y no hay nada
                    clearInterval(buscarFolio);
                    alert("Registro guardado, pero el servidor está lento. Verifica tu folio en la sección de consulta.");
                    btn.disabled = false;
                    btn.textContent = "Reintentar";
                }
            }, 1000);

        } catch (err) {
            alert("Error de conexión");
            btn.disabled = false;
        }
    });
}

/**
 * 3. MOSTRAR QR Y RESULTADO
 */
function mostrarExito(folio, taller) {
    document.getElementById("btnEnviar").style.display = "none";
    const divRes = document.getElementById("resultadoRegistro");
    divRes.style.display = "block";
    
    document.getElementById("folioTexto").textContent = folio;
    document.getElementById("tallerConfirmado").textContent = taller;
    document.getElementById("btnDescargar").style.display = "block";

    // Limpiar QR anterior y crear el nuevo con el Folio real
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = ""; 
    new QRCode(qrDiv, {
        text: folio,
        width: 160,
        height: 160,
        correctLevel: QRCode.CorrectLevel.H
    });

    divRes.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 4. VALIDACIÓN DE CUPO
 */
function validarCupo(select) {
    const taller = talleresData.find(t => t.id === select.value);
    const btn = document.getElementById("btnEnviar");
    if (taller && !taller.esIlimitado && taller.disponibles <= 0) {
        btn.disabled = true;
        btn.textContent = "SIN CUPO DISPONIBLE";
    } else {
        btn.disabled = false;
        btn.textContent = "Confirmar Registro y Generar Folio";
    }
}

/**
 * 5. GENERAR PDF
 */
function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const folio = document.getElementById("folioTexto").textContent;
    const nombre = document.getElementById("nombreCompleto").value.toUpperCase();
    const taller = document.getElementById("tallerConfirmado").textContent;

    doc.setFontSize(18);
    doc.text("COMPROBANTE DE REGISTRO - CUCBA", 20, 20);
    doc.setFontSize(12);
    doc.text(`Nombre: ${nombre}`, 20, 40);
    doc.text(`Taller: ${taller}`, 20, 50);
    doc.setFontSize(14);
    doc.text(`FOLIO: ${folio}`, 20, 70);

    const qrCanvas = document.querySelector("#qrcode canvas");
    if (qrCanvas) {
        doc.addImage(qrCanvas.toDataURL("image/png"), 'PNG', 70, 85, 60, 60);
    }
    doc.save(`Comprobante_${folio}.pdf`);
}