const URL_SISTEMA = "https://script.google.com/macros/s/AKfycby8f7KuTvsJHL-HLcjuJVvbwaHti1q0WSi-lAxng5azJezpYctYKa7z_eyx2aRS339viw/exec"; // REEMPLAZA ESTO
let isProcessing = false;
const html5QrCode = new Html5Qrcode("reader");

// 1. Cargar Talleres dinámicamente
document.addEventListener("DOMContentLoaded", async () => {
    const select = document.getElementById("tallerActual");
    try {
        const res = await fetch(URL_SISTEMA + "?accion=obtenerTalleres");
        const talleres = await res.json();
        select.innerHTML = '<option value="">-- SELECCIONA TU TALLER --</option>';
        talleres.forEach(t => {
            let opt = document.createElement("option");
            opt.value = t.id;
            opt.textContent = t.nombre;
            select.appendChild(opt);
        });
    } catch (e) { select.innerHTML = '<option>Error al cargar</option>'; }
});

function onScanSuccess(decodedText) {
    if (isProcessing) return;
    const tallerId = document.getElementById("tallerActual").value;
    
    if (!tallerId) {
        alert("Selecciona un taller primero");
        return;
    }

    isProcessing = true;
    html5QrCode.pause();
    document.getElementById('resultado').innerHTML = "⏳ PROCESANDO...";

    fetch(URL_SISTEMA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 
            'accion': 'asistencia', 
            'folio': decodedText,
            'idTallerProfe': tallerId 
        })
    })
    .then(r => r.text())
    .then(msg => {
        const resDiv = document.getElementById('resultado');
        resDiv.innerText = msg;
        
        if (msg.includes("✅")) {
            document.getElementById('sound-success').play();
            document.getElementById('count').innerText = parseInt(document.getElementById('count').innerText) + 1;
        } else {
            document.getElementById('sound-error').play();
        }

        setTimeout(() => {
            resDiv.innerText = "LISTO PARA ESCANEAR";
            isProcessing = false;
            html5QrCode.resume();
        }, 3000);
    });
}

html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, onScanSuccess);