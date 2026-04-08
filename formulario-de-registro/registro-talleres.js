const URL = "https://script.google.com/macros/s/AKfycby8f7KuTvsJHL-HLcjuJVvbwaHti1q0WSi-lAxng5azJezpYctYKa7z_eyx2aRS339viw/exec";
let talleresData = [];
document.addEventListener("DOMContentLoaded", () => { cargarTalleres(); initCaptcha(); });
let correctAnswer = 0;
function initCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    correctAnswer = a + b;
    const elA = document.getElementById("mathA");
    const elB = document.getElementById("mathB");
    if (elA && elB) { elA.textContent = a; elB.textContent = b; }
}
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
    } catch (e) { select.innerHTML = "<option>ERROR AL CARGAR DATOS</option>"; }
}
const form = document.getElementById("formulario");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const trap = document.getElementById("trap_bot");
        if (trap && trap.value !== "") { alert("Actividad de BOT detectada. Envío bloqueado de forma permanente."); return; }
        const userAnswer = parseInt(document.getElementById("mathCaptcha").value);
        if (userAnswer !== correctAnswer) { alert("🛡️ La suma de seguridad es incorrecta. Por favor, inténtalo de nuevo."); initCaptcha(); document.getElementById("mathCaptcha").value = ""; return; }
        const now = Date.now();
        const lastSubmit = localStorage.getItem("lastSubmitTime");
        if (lastSubmit && now - lastSubmit < 30000) { alert("⏳ Estás enviando registros demasiado rápido. Por favor, espera 30 segundos antes de intentar de nuevo."); return; }
        const tallerSeleccionado = document.getElementById("tallerSelect").value;
        const tallerInfo = talleresData.find(t => t.id === tallerSeleccionado);
        if (tallerInfo && !tallerInfo.esIlimitado && tallerInfo.disponibles <= 0) { alert("🚨 Error: Forzamiento detectado. Este taller ya no tiene lugares disponibles."); return; }
        localStorage.setItem("lastSubmitTime", now);
        const btn = document.getElementById("btnEnviar");
        const formData = new FormData(form);
        const codUDG = formData.get("codigoUDG");
        btn.disabled = true;
        btn.textContent = "REGISTRANDO Y GENERANDO FOLIO...";
        try {
            await fetch(URL, { method: "POST", body: new URLSearchParams(formData), mode: "no-cors" });
            let intentos = 0;
            const buscarFolio = setInterval(async () => {
                intentos++;
                const res = await fetch(URL + "?accion=consultarEstatus&codigoUDG=" + codUDG);
                const data = await res.json();
                if (data.length > 0) {
                    clearInterval(buscarFolio);
                    const registro = data[data.length - 1];
                    mostrarExito(registro.folio, registro.taller);
                }
                if (intentos > 10) {
                    clearInterval(buscarFolio);
                    alert("Registro guardado, pero el servidor está lento. Verifica tu folio en la sección de consulta.");
                    btn.disabled = false;
                    btn.textContent = "Reintentar";
                }
            }, 1000);
        } catch (err) { alert("Error de conexión"); btn.disabled = false; }
    });
}
function mostrarExito(folio, taller) {
    document.getElementById("btnEnviar").style.display = "none";
    const divRes = document.getElementById("resultadoRegistro");
    divRes.style.display = "block";
    document.getElementById("folioTexto").textContent = folio;
    document.getElementById("tallerConfirmado").textContent = taller;
    document.getElementById("btnDescargar").style.display = "block";
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = "";
    new QRCode(qrDiv, { text: folio, width: 160, height: 160, correctLevel: QRCode.CorrectLevel.H });
    divRes.scrollIntoView({ behavior: 'smooth' });
}
function validarCupo(select) {
    const taller = talleresData.find(t => t.id === select.value);
    const btn = document.getElementById("btnEnviar");
    if (taller && !taller.esIlimitado && taller.disponibles <= 0) { btn.disabled = true; btn.textContent = "SIN CUPO DISPONIBLE"; }
    else { btn.disabled = false; btn.textContent = "Confirmar Registro y Generar Folio"; }
}
function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const folio = document.getElementById("folioTexto").textContent;
    const nombre = document.getElementById("nombreCompleto").value.toUpperCase();
    const taller = document.getElementById("tallerConfirmado").textContent;
    doc.setFontSize(18); doc.text("COMPROBANTE DE REGISTRO - CUCBA", 20, 20);
    doc.setFontSize(12); doc.text(`Nombre: ${nombre}`, 20, 40); doc.text(`Taller: ${taller}`, 20, 50);
    doc.setFontSize(14); doc.text(`FOLIO: ${folio}`, 20, 70);
    const qrCanvas = document.querySelector("#qrcode canvas");
    if (qrCanvas) { doc.addImage(qrCanvas.toDataURL("image/png"), 'PNG', 70, 85, 60, 60); }
    doc.save(`Comprobante_${folio}.pdf`);
}