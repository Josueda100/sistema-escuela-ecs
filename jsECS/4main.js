// Procesamiento de archivos XLSX
var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};

function filledCell(cell) {
    return cell !== '' && cell != null;
}

function loadFileData(filename) {
    if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
        try {
            var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
            var filteredData = jsonData.filter(row => row.some(filledCell));
            var headerRowIndex = filteredData.findIndex((row, index) =>
                row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
            );
            if (headerRowIndex === -1 || headerRowIndex > 25) {
                headerRowIndex = 0;
            }
            var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
            csv = XLSX.utils.sheet_to_csv(csv, { header: true });
            return csv;
        } catch (e) {
            console.error('Error al procesar el archivo XLSX:', e);
            return "";
        }
    }
    return gk_fileData[filename] || "";
}

// Menú hamburguesa
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.header__menu-toggle');
    const navLinks = document.querySelector('.header__nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('header__nav-links--active');
        });
    }
});

// Desplazamiento suave para los botones (usado en index.html)
document.addEventListener('DOMContentLoaded', () => {
    const scrollButtons = document.querySelectorAll('.values__scroll-btn');
    scrollButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Lógica de contraseña para secretaria.html, docentes.html, y supervisores.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('password-prompt')) {
        const passwords = {
            secretaria: "secretaria123",
            docentes: "docentes256",
            supervisores: "supervisores789"
        };

        window.checkPassword = function(page) {
            const passwordInput = document.getElementById("password-input").value;
            const errorMessage = document.getElementById("error-message");
            const passwordPrompt = document.getElementById("password-prompt");
            const mainContent = document.getElementById("main-content");

            if (passwordInput === passwords[page]) {
                passwordPrompt.style.display = "none";
                mainContent.style.display = "block";
            } else {
                errorMessage.style.display = "block";
                document.getElementById("password-input").value = "";
            }
        };

        // Permitir ingreso con Enter
        document.getElementById("password-input").addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const page = document.getElementById('password-input').dataset.page || 'secretaria';
                checkPassword(page);
            }
        });

        // Asignar página al input para el evento Enter
        let currentPage = 'secretaria';
        if (window.location.pathname.includes('docentes')) currentPage = 'docentes';
        else if (window.location.pathname.includes('supervisores')) currentPage = 'supervisores';
        document.getElementById('password-input').dataset.page = currentPage;
    }
});

// Lógica de filtrado para supervisores.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('califications-table')) {
        // Datos simulados de calificaciones
        const califications = [
            { estudiante: "Juan Pérez", asignatura: "Matemáticas", grado: "Primero", anio: "2024", calificacion: 90, observacion: "Excelente" },
            { estudiante: "María López", asignatura: "Lenguaje", grado: "Segundo", anio: "2024", calificacion: 85, observacion: "Muy bien" },
            { estudiante: "Carlos Gómez", asignatura: "Ciencias", grado: "Tercero", anio: "2023", calificacion: 70, observacion: "Debe mejorar" },
        ];

        window.filterCalifications = function() {
            const estudianteFiltro = document.getElementById("estudiante-filtro").value;
            const anioFiltro = document.getElementById("anio-filtro").value;
            const asignaturaFiltro = document.getElementById("asignatura-filtro").value;
            const gradoFiltro = document.getElementById("grado-filtro").value;

            const filteredCalifications = califications.filter(cal => {
                return (estudianteFiltro === "" || cal.estudiante === estudianteFiltro) &&
                       (anioFiltro === "" || cal.anio === anioFiltro) &&
                       (asignaturaFiltro === "" || cal.asignatura === asignaturaFiltro) &&
                       (gradoFiltro === "" || cal.grado === gradoFiltro);
            });

            const tbody = document.querySelector("#califications-table tbody");
            tbody.innerHTML = "";

            filteredCalifications.forEach(cal => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="table__td">${cal.estudiante}</td>
                    <td class="table__td">${cal.asignatura}</td>
                    <td class="table__td">${cal.grado}</td>
                    <td class="table__td">${cal.anio}</td>
                    <td class="table__td">${cal.calificacion}</td>
                    <td class="table__td">${cal.observacion}</td>
                `;
                tbody.appendChild(row);
            });

            // Actualizar resumen
            updateSummary(filteredCalifications);
        };

        function updateSummary(filteredCalifications) {
            const summary = document.getElementById("summary-section");
            if (!summary) return;

            if (filteredCalifications.length === 0) {
                summary.innerHTML = "<p>No hay calificaciones para mostrar.</p>";
                return;
            }

            const promedio = filteredCalifications.reduce((sum, cal) => sum + cal.calificacion, 0) / filteredCalifications.length;
            const maxCal = filteredCalifications.reduce((max, cal) => cal.calificacion > max.calificacion ? cal : max, filteredCalifications[0]);
            const minCal = filteredCalifications.reduce((min, cal) => cal.calificacion < min.calificacion ? cal : min, filteredCalifications[0]);

            summary.innerHTML = `
                <p><strong>Promedio General:</strong> ${promedio.toFixed(2)}</p>
                <p><strong>Número de Estudiantes:</strong> ${filteredCalifications.length}</p>
                <p><strong>Calificación Más Alta:</strong> ${maxCal.calificacion} (${maxCal.estudiante} - ${maxCal.asignatura})</p>
                <p><strong>Calificación Más Baja:</strong> ${minCal.calificacion} (${minCal.estudiante} - ${minCal.asignatura})</p>
            `;
        }
    }
});