let currentWorkbook = null;
let selectedTaller = null;

// Sincronización de Controles
document.getElementById('posY').oninput = e => document.getElementById('overlay-data').style.top = e.target.value + "%";
document.getElementById('colorPicker').oninput = e => document.getElementById('overlay-data').style.color = e.target.value;
document.getElementById('fontSelect').onchange = e => document.getElementById('overlay-data').style.fontFamily = e.target.value;

// Función para obtener datos sin importar espacios o mayúsculas en el Excel
function getDato(fila, claveBuscada) {
    const claveReal = Object.keys(fila).find(k => k.trim().toUpperCase().includes(claveBuscada.toUpperCase()));
    return claveReal ? fila[claveReal] : "";
}

// Carga de Plantilla
document.getElementById('imgInput').onchange = e => {
    const reader = new FileReader();
    reader.onload = () => {
        document.getElementById('img-fondo').src = reader.result;
        checkReady();
    };
    reader.readAsDataURL(e.target.files[0]);
};

// Carga de Excel
document.getElementById('excelInput').onchange = e => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const data = new Uint8Array(ev.target.result);
        currentWorkbook = XLSX.read(data, {type: 'array'});
        renderTalleres();
        checkReady();
        document.getElementById('status-msg').innerText = "Excel cargado correctamente";
    };
    reader.readAsArrayBuffer(e.target.files[0]);
};

function renderTalleres() {
    const menu = document.getElementById('deportes-menu');
    menu.innerHTML = '';
    currentWorkbook.SheetNames.forEach(name => {
        if(name.toUpperCase().includes("CUPOS") || name.length < 3) return;
        const btn = document.createElement('button');
        btn.className = 'btn-taller-item';
        btn.innerText = name;
        btn.onclick = () => {
            document.querySelectorAll('.btn-taller-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTaller = name;
            document.getElementById('txt-taller').innerText = "Taller de " + name;
            document.getElementById('btnGenerar').disabled = false;
        };
        menu.appendChild(btn);
    });
}

function checkReady() {
    if(currentWorkbook && document.getElementById('img-fondo').src.includes("data:image")) {
        document.getElementById('controls').classList.remove('hidden');
        document.getElementById('status-dot').classList.add('active');
        document.getElementById('status-msg').innerText = "Sistema listo para procesar";
    }
}

// PROCESO DE GENERACIÓN
document.getElementById('btnGenerar').onclick = async function() {
    const sheet = currentWorkbook.Sheets[selectedTaller];
    const rawData = XLSX.utils.sheet_to_json(sheet);
    
    // FILTRO: Solo los que dicen "APROBADO" en la columna ESTATUS
    const aprobados = rawData.filter(al => {
        const est = getDato(al, "ESTATUS").toString().toUpperCase().trim();
        return est === "APROBADO";
    });

    if(aprobados.length === 0) return alert("No hay alumnos 'APROBADOS' en esta hoja.");

    this.disabled = true;
    const progCont = document.getElementById('progress-container');
    const progBar = document.getElementById('progress-bar');
    const progText = document.getElementById('progress-text');
    
    progCont.classList.remove('hidden');
    const zip = new JSZip();

    for(let i = 0; i < aprobados.length; i++) {
        const al = aprobados[i];
        
        // Mapeo de datos
        const nombre = getDato(al, "Nombre Completo");
        const carrera = getDato(al, "Carrera");
        const folio = getDato(al, "FOLIO"); 

        document.getElementById('txt-nombre').innerText = nombre;
        document.getElementById('txt-carrera').innerText = carrera;
        document.getElementById('txt-folio').innerText = "FOLIO: " + folio;

        await new Promise(r => setTimeout(r, 100)); // Espera para render

        const canvas = await html2canvas(document.getElementById('preview-container'), { scale: 2 });
        const img = canvas.toDataURL('image/jpeg', 0.9);
        
        const pdf = new jspdf.jsPDF('l', 'px', [1123, 794]);
        pdf.addImage(img, 'JPEG', 0, 0, 1123, 794);
        
        // Nombre del archivo basado en FOLIO
        zip.file(`${folio.toString().replace(/ /g, "_")}.pdf`, pdf.output('arraybuffer'));

        // Barra de progreso
        let p = Math.round(((i + 1) / aprobados.length) * 100);
        progBar.style.width = p + "%";
        progText.innerText = `Generando: ${p}% (${i+1}/${aprobados.length})`;
    }

    progText.innerText = "Comprimiendo ZIP...";
    const content = await zip.generateAsync({type: "blob"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `Certificados_${selectedTaller}_Aprobados.zip`;
    link.click();

    this.disabled = false;
    progText.innerText = "¡Todo listo!";
};