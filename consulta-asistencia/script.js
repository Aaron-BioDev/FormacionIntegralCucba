// URL del Web App de Google Apps Script
const URL_API = "https://script.google.com/macros/s/AKfycby8f7KuTvsJHL-HLcjuJVvbwaHti1q0WSi-lAxng5azJezpYctYKa7z_eyx2aRS339viw/exec";

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const btnSearch = document.getElementById("btnSearch");
    const loading = document.getElementById("loading");
    const results = document.getElementById("results");
    const noResults = document.getElementById("noResults");
    const talleresList = document.getElementById("talleresList");
    const studentName = document.getElementById("studentName");

    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        // Reset UI
        results.style.display = "none";
        noResults.style.display = "none";
        loading.style.display = "block";
        talleresList.innerHTML = "";

        try {
            // Se hace la petición al Apps Script
            // Se usa el parámetro codigoUDG para la búsqueda (como está definido en el code.gs)
            const response = await fetch(`${URL_API}?accion=consultarEstatus&codigoUDG=${encodeURIComponent(query)}`);
            const data = await response.json();

            loading.style.display = "none";

            if (data && data.length > 0) {
                results.style.display = "block";
                
                // Mostrar el nombre del alumno (está en todos los registros del mismo alumno)
                const nombre = data[0].nombre || "Alumno";
                studentName.textContent = `📋 Expediente: ${nombre}`;

                data.forEach(item => {
                    const card = document.createElement("div");
                    card.className = "taller-card";
                    
                    // Manejo de valores por si vienen nulos o indefinidos
                    const asistencias = item.asistencias || 0;
                    const porcentaje = item.porcentaje || "0%";
                    const estado = item.estado || "ACTIVO"; // Valor por defecto si no viene del backend
                    const taller = item.taller || "Taller no especificado";

                    card.innerHTML = `
                        <h3>${taller}</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Asistencias</span>
                                <span class="stat-value">${asistencias}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Porcentaje</span>
                                <span class="stat-value">${porcentaje}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Estado</span>
                                <span class="status-badge ${estado === 'ACTIVO' ? 'status-active' : 'status-inactive'}">
                                    ${estado}
                                </span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Folio</span>
                                <span style="font-size: 0.8rem; font-weight: 500;">${item.folio || 'N/A'}</span>
                            </div>
                        </div>
                    `;
                    talleresList.appendChild(card);
                });
            } else {
                noResults.style.display = "flex";
            }
        } catch (error) {
            console.error("Error en la consulta:", error);
            loading.style.display = "none";
            alert("Hubo un error al conectar con el servidor. Intenta de nuevo más tarde.");
        }
    }

    btnSearch.addEventListener("click", handleSearch);
    
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    });
});
