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

// Lógica de contraseña para secretaria.html, docentes.html, supervisores.html, direccion.html, e informes.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('password-prompt')) {
        const passwords = {
            secretaria: "secretaria123",
            docentes: "docentes456",
            supervisores: "supervisores789",
            direccion: "direccion101",
            informes: "informes202"
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

        document.getElementById("password-input").addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const page = document.getElementById('password-input').dataset.page || 'secretaria';
                checkPassword(page);
            }
        });

        let currentPage = 'secretaria';
        if (window.location.pathname.includes('docentes')) currentPage = 'docentes';
        else if (window.location.pathname.includes('supervisores')) currentPage = 'supervisores';
        else if (window.location.pathname.includes('direccion')) currentPage = 'direccion';
        else if (window.location.pathname.includes('informes')) currentPage = 'informes';
        document.getElementById('password-input').dataset.page = currentPage;
    }
});

// Lógica de filtrado para supervisores.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('califications-table') && window.location.pathname.includes('supervisores')) {
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
                <p><strong>Calificación Más Baja:</strong> ${minCal.calificacion} (${minCal.estudiante} - ${maxCal.asignatura})</p>
            `;
        }
    }
});

// Lógica de filtrado para informes.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('informes')) {
        const students = [
            { estudiante: "Juan Pérez", grado: "Primero", anio: "2024", estado: "Activo" },
            { estudiante: "María López", grado: "Segundo", anio: "2024", estado: "Activo" },
            { estudiante: "Carlos Gómez", grado: "Tercero", anio: "2023", estado: "Inactivo" },
        ];

        window.filterStudents = function() {
            const gradoFiltro = document.getElementById("grado-filtro").value;
            const anioFiltro = document.getElementById("anio-filtro").value;

            const filteredStudents = students.filter(student => {
                return (gradoFiltro === "" || student.grado === gradoFiltro) &&
                       (anioFiltro === "" || student.anio === anioFiltro);
            });

            const tbody = document.querySelector("#students-table tbody");
            tbody.innerHTML = "";

            filteredStudents.forEach(student => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="table__td">${student.estudiante}</td>
                    <td class="table__td">${student.grado}</td>
                    <td class="table__td">${student.anio}</td>
                    <td class="table__td">${student.estado}</td>
                `;
                tbody.appendChild(row);
            });
        };

        const califications = [
            { asignatura: "Matemáticas", anio: "2024", promedio: 90, numEstudiantes: 1 },
            { asignatura: "Lenguaje", anio: "2024", promedio: 85, numEstudiantes: 1 },
            { asignatura: "Ciencias", anio: "2023", promedio: 70, numEstudiantes: 1 },
        ];

        window.filterCalificationsInformes = function() {
            const asignaturaFiltro = document.getElementById("asignatura-filtro").value;
            const anioFiltro = document.getElementById("anio-calif-filtro").value;

            const filteredCalifications = califications.filter(cal => {
                return (asignaturaFiltro === "" || cal.asignatura === asignaturaFiltro) &&
                       (anioFiltro === "" || cal.anio === anioFiltro);
            });

            const tbody = document.querySelector("#califications-table tbody");
            tbody.innerHTML = "";

            filteredCalifications.forEach(cal => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="table__td">${cal.asignatura}</td>
                    <td class="table__td">${cal.anio}</td>
                    <td class="table__td">${cal.promedio}</td>
                    <td class="table__td">${cal.numEstudiantes}</td>
                `;
                tbody.appendChild(row);
            });
        };

        const attendance = [
            { estudiante: "Juan Pérez", anio: "2024", asistencias: 170, faltas: 10, porcentaje: 94 },
            { estudiante: "María López", anio: "2024", asistencias: 165, faltas: 15, porcentaje: 92 },
            { estudiante: "Carlos Gómez", anio: "2023", asistencias: 160, faltas: 20, porcentaje: 89 },
        ];

        window.filterAttendance = function() {
            const estudianteFiltro = document.getElementById("estudiante-asist-filtro").value;
            const anioFiltro = document.getElementById("anio-asist-filtro").value;

            const filteredAttendance = attendance.filter(record => {
                return (estudianteFiltro === "" || record.estudiante === estudianteFiltro) &&
                (anioFiltro === "" || record.anio === anioFiltro);
            });

            const tbody = document.querySelector("#attendance-table tbody");
            tbody.innerHTML = "";

            filteredAttendance.forEach(record => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="table__td">${record.estudiante}</td>
                    <td class="table__td">${record.anio}</td>
                    <td class="table__td">${record.asistencias}</td>
                    <td class="table__td">${record.falta}</td>
                    <td class="table__td">${record.porcentaje}%</td>
                `;
                tbody.appendChild(row);
            });
        };
    });

// Lógica de filtrado para galeria.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('galeria')) {
        window.filterGallery = function() {
            const categoriaFiltro = document.getElementById("categoria-filtro").value;
            const galleryItems = document.querySelectorAll(".gallery__item");

            galleryItems.forEach(item => {
                const category = item.getAttribute("data-category");
                if (categoriaFiltro === "" || category === categoriaFiltro) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });
});

// Lógica de dashboard.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard')) {
        // Toggle Sidebar
        const sidebarToggle = document.querySelector('.dashboard__sidebar-toggle');
        const sidebar = document.querySelector('.dashboard__sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('dashboard__sidebar--collapsed');
            });
        });

        // Cerrar Sesión
        const logoutButton = document.querySelector('.dashboard__header-logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        });

        // Gráfico de estudiantes por grado
        const studentChartCtx = document.getElementById('studentChart').getContext('2d');
        new Chart(studentChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Primero', 'Segundo', 'Tercero'],
                datasets: [{
                    label: 'Estudiantes por Grado',
                    data: [40, 50, 30],
                    backgroundColor: ['#005f73', '#ee9b00', '#f4f4f4'],
                    borderColor: ['#333'],
                    borderWidth: [2]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de promedio de calificaciones por asignatura
        const gradesChartCtx = document.getElementById('gradesChart').getContext('2d');
        new Chart(gradesChartCtx, {
            type: 'bar',
            data: {
                labels: ['Matemáticas', 'Lenguaje', 'Ciencias'],
                datasets: [{
                    label: 'Promedio de Calificaciones',
                    data: [90, 85, 70],
                    backgroundColor: '#005f73',
                    borderColor: '#ee9b00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Calificación Promedio',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Asignatura',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de evolución de calificaciones por año
        const supervisorChartCtx = document.getElementById('supervisorChart').getContext('2d');
        new Chart(supervisorChartCtx, {
            type: 'line',
            data: {
                labels: ['2023', '2024', '2025'],
                datasets: [{
                    label: 'Promedio de Calificaciones',
                    data: [70, 87.5, 85],
                    borderColor: '#ee9b00',
                    backgroundColor: 'rgba(238, 155, 0, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Calificación Promedio',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Año',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de docentes por asignatura
        const directorChartCtx = document.getElementById('directorChart').getContext('2d');
        new Chart(directorChartCtx, {
            type: 'pie',
            data: {
                labels: ['Matemáticas', 'Lenguaje', 'Ciencias'],
                datasets: [{
                    label: 'Docentes por Asignatura',
                    data: [5, 6, 4],
                    backgroundColor: ['#005f73', '#ee9b00', '#f4f4f4'],
                    borderColor: '#333'],
                    borderWidth: [2]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de porcentaje de asistencia por estudiante
        const attendanceChartCtx = document.getElementById('attendanceChart').getContext('2d');
        new Chart(attendanceChartCtx, {
            type: 'bar',
            data: {
                labels: ['Juan Pérez', 'María López', 'Carlos Gómez'],
                datasets: ['{
                    label: 'Porcentaje de Asistencia',
                    data: [94, 92, 89],
                    backgroundColor: '#005f73',
                    borderColor: '#ee9b00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Porcentaje de Asistencia',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Estudiante',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de fotos por categoría
        const galleryChartCtx = document.getElementById('galleryChart').getContext('2d');
        new Chart(galleryChartCtx, {
            type: 'pie',
            data: {
                labels: ['Reuniónes Docentes', 'Capacitaciones', 'Actividades Internas'],
                datasets: [{
                    label: 'Fotos por Categoría',
                    data: [3, 3, 3],
                    backgroundColor: ['#005f73', '#ee9b00', '#f4f4f4'],
                    borderColor: ['#333'],
                    borderWidth: [2]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de consultas de soporte por categoría
        const supportChartCtx = document.getElementById('supportChart').getContext('2d');
        new Chart(supportChartCtx, {
            type: 'bar',
            data: {
                labels: ['Técnico', 'Acceso', 'General'],
                datasets: [{
                    label: 'Consultas de Soporte',
                    data: [2, 6, 2],
                    backgroundColor: '#005f73',
                    borderColor: '#ee9b00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Consultas',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Categoría',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });
    });
});
</script>