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
            csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
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

// Lógica de contraseña para secretaria.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('password-prompt')) {
        const correctPassword = "secretaria123"; // Cambia esta contraseña según desees

        window.checkPassword = function() {
            const passwordInput = document.getElementById("password-input").value;
            const errorMessage = document.getElementById("error-message");
            const passwordPrompt = document.getElementById("password-prompt");
            const mainContent = document.getElementById("main-content");

            if (passwordInput === correctPassword) {
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
                checkPassword();
            }
        });
    }
});