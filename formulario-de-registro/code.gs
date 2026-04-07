/**
 * MANEJA PETICIONES GET
 */
function doGet(e) {
  const p = e.parameter;
  if (p.accion === "obtenerTalleres") {
    return ContentService.createTextOutput(JSON.stringify(obtenerTalleresConCupo()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (p.accion === "consultarEstatus") {
    return ContentService.createTextOutput(JSON.stringify(consultarEstatus(p.codigoUDG)))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * MANEJA PETICIONES POST
 */
function doPost(e) {
  const p = e.parameter;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (p.accion === "asistencia") {
    return registrarAsistencia(p, ss);
  }
  return registrarNuevoAlumno(p, ss);
}

/**
 * OBTIENE TALLERES, CRUZA CON ÁREAS Y CALCULA CUPOS
 */
function obtenerTalleresConCupo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaTal = ss.getSheetByName("TALLERES");
  const hojaReg = ss.getSheetByName("REGISTROS");
  const hojaArea = ss.getSheetByName("AREAS");
  
  const datosTal = hojaTal.getDataRange().getValues();
  const datosReg = hojaReg.getDataRange().getValues();
  const datosArea = hojaArea.getDataRange().getValues();
  
  // Crear mapa de áreas { "DEP": "Deportes", "CUL": "Cultura" }
  const mapaAreas = {};
  datosArea.forEach(fila => { mapaAreas[fila[0]] = fila[1]; });

  datosTal.shift(); // Quitar cabecera

  return datosTal.filter(r => r[4] === true || r[4] === "True").map(r => {
    const idTaller = r[0];
    const nombreTaller = r[1];
    const idArea = r[2]; 
    const cupoMaximo = r[3];

    // Contar inscritos reales en la hoja REGISTROS
    const inscritos = datosReg.filter(reg => reg[2] === idTaller).length;

    let disponible;
    let esIlimitado = false;

    if (cupoMaximo === "CUPO ILIMITADO") {
      disponible = 999;
      esIlimitado = true;
    } else {
      const calculo = parseInt(cupoMaximo) - inscritos;
      disponible = calculo > 0 ? calculo : 0;
    }

    return {
      id: idTaller,
      nombre: nombreTaller,
      nombreArea: mapaAreas[idArea] || "OTROS",
      disponibles: disponible,
      esIlimitado: esIlimitado
    };
  });
}

/**
 * REGISTRA NUEVO ALUMNO
 */
function registrarNuevoAlumno(p, ss) {
  const hojaReg = ss.getSheetByName("REGISTROS");
  const talleres = obtenerTalleresConCupo();
  
  const tallerInfo = talleres.find(t => t.id === p.taller);
  if (tallerInfo && !tallerInfo.esIlimitado && tallerInfo.disponibles <= 0) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, msg: "Cupo agotado" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const hojaTal = ss.getSheetByName("TALLERES");
  const datosTal = hojaTal.getDataRange().getValues();
  let nTaller = "", idA = "";
  for (let i = 1; i < datosTal.length; i++) {
    if (datosTal[i][0] == p.taller) {
      nTaller = datosTal[i][1];
      idA = datosTal[i][2];
      break;
    }
  }

  const ahora = new Date();
  const tiempo = ahora.getHours().toString() + ahora.getMinutes().toString() + ahora.getSeconds().toString();
  const prefijo = nTaller.substring(0, 3).toUpperCase();
  const folio = `CUCBA-${prefijo}-${tiempo}-${hojaReg.getLastRow()}`;

  hojaReg.appendRow([
    folio, ahora, p.taller, nTaller, idA, 
    p.nombreCompleto.toUpperCase(), p.carrera.toUpperCase(), p.codigoUDG,
    p.telefono, p.nss, p.fechaNacimiento, p.tipoSangre, p.correo.toLowerCase(),
    p.emergenciaNombre.toUpperCase(), p.emergenciaParentesco.toUpperCase(), p.emergenciaTelefono,
    0, "0%", "ACTIVO"
  ]);

  return ContentService.createTextOutput(JSON.stringify({ success: true, folio: folio, taller: nTaller }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * REGISTRA ASISTENCIA (ESCÁNER)
 */
function registrarAsistencia(p, ss) {
  const hojaAsis = ss.getSheetByName("ASISTENCIAS");
  const hojaReg = ss.getSheetByName("REGISTROS");
  const hoy = Utilities.formatDate(new Date(), "GMT-6", "dd/MM/yy");
  const folio = p.folio;
  const idTallerProfe = p.idTallerProfe;

  const datosReg = hojaReg.getDataRange().getValues();
  let indexReg = -1;
  let alumno = {};

  for (let i = 1; i < datosReg.length; i++) {
    if (datosReg[i][0] === folio) {
      if (datosReg[i][2] !== idTallerProfe) {
        return responder("❌ ERROR: Alumno inscrito en " + datosReg[i][3]);
      }
      alumno = { nombre: datosReg[i][5], taller: datosReg[i][3], idT: datosReg[i][2] };
      indexReg = i + 1;
      break;
    }
  }
  
  if (indexReg === -1) return responder("❌ ERROR: Folio no registrado");

  const datosAsis = hojaAsis.getDataRange().getValues();
  const cabecera = datosAsis[0];
  let colFecha = -1;
  for (let c = 0; c < cabecera.length; c++) {
    let fechaCelda = (cabecera[c] instanceof Date) ? Utilities.formatDate(cabecera[c], "GMT-6", "dd/MM/yy") : cabecera[c].toString().trim();
    if (fechaCelda === hoy) { colFecha = c; break; }
  }

  if (colFecha === -1) {
    colFecha = cabecera.length;
    hojaAsis.getRange(1, colFecha + 1).setNumberFormat("@").setValue(hoy);
  }

  let filaAsis = -1;
  const ids = hojaAsis.getRange(1,1,hojaAsis.getLastRow(),1).getValues();
  for (let j = 0; j < ids.length; j++) {
    if (ids[j][0] === folio) { filaAsis = j + 1; break; }
  }

  if (filaAsis === -1) {
    hojaAsis.appendRow([folio, alumno.nombre, alumno.taller, alumno.idT, "ACTIVO"]);
    filaAsis = hojaAsis.getLastRow();
  }

  if (hojaAsis.getRange(filaAsis, colFecha + 1).getValue() === "SÍ") return responder("⚠️ Ya registrado hoy");

  hojaAsis.getRange(filaAsis, colFecha + 1).setValue("SÍ");
  let total = hojaReg.getRange(indexReg, 17).getValue() || 0;
  hojaReg.getRange(indexReg, 17).setValue(total + 1);

  return responder("✅ ASISTENCIA OK: " + alumno.nombre);
}

function responder(msg) {
  return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.TEXT);
}


function consultarEstatus(codigo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName("REGISTROS");
  const datos = hoja.getDataRange().getValues();
  let resultados = [];
  
  const query = String(codigo).trim().toUpperCase();

  for (let i = 1; i < datos.length; i++) {
    const folioEnCelda = String(datos[i][0]).trim().toUpperCase();
    const codigoEnCelda = String(datos[i][7]).trim().toUpperCase();
    
    // Busca coincidencia en Folio O Código UDG
    if (codigoEnCelda === query || folioEnCelda === query) {
      resultados.push({ 
        folio: datos[i][0],
        nombre: datos[i][5],      // Columna F: Nombre Completo
        taller: datos[i][3],      // Columna D: Nombre Taller
        asistencias: datos[i][16], // Columna Q: Asistencias
        porcentaje: datos[i][17],  // Columna R: Porcentaje
        estado: datos[i][18]       // Columna S: Estado
      });
    }
  }
  return resultados;
}