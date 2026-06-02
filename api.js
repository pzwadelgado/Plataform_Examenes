// --- SECCIÓN 1: CONFIGURACIÓN ---
const API_URL = "https://script.google.com/macros/s/AKfycbxKnjmMoSk4th35mkqtjDvP58aA74DAPOaN54RQhxjsV5H3bRWRxa7WJEkFWpPAkGfo/exec";
// --- SECCIÓN 2: CONEXIÓN REAL CON GOOGLE SHEETS ---
async function fetchUserFromDB(employeeId) {
    try {
        const response = await fetch(`${API_URL}?action=getUser&id=${employeeId}`);
        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const data = await response.json();
        
        // ESTE RADAR NOS DIRÁ QUÉ ESTÁ LEYENDO GOOGLE REALMENTE
        console.log("Respuesta del servidor de Google:", data);

        if (data.success) {
            return data.user; 
        } else {
            console.warn("Motivo del rechazo:", data.message);
            return null;
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        throw new Error("No se pudo conectar con la base de datos.");
    }
}

// --- SECCIÓN 3: ENVÍO DE RESULTADOS REAL ---
async function saveResultToDB(employeeId, courseId, score, passed) {
    try {
        // Aseguramos que el nombre del curso sea el que espera el backend
        let cursoFormateado = courseId;
        if (courseId === "limpieza_operativa") {
            cursoFormateado = "LIMPIEZA OPERATIVA";
        }

        // Estructuramos la URL exactamente igual a la del Login
        const url = `${API_URL}?action=saveResult&id=${employeeId}&name=${encodeURIComponent(currentUser.name)}&dept=${encodeURIComponent(currentUser.dept)}&course=${encodeURIComponent(cursoFormateado)}&score=${score}&passed=${passed}`;
        
        // 🔴 CRUCIAL PARA EVITAR CORS: Quitamos cabeceras complejas y usamos 'no-cors' o modo plano
        const response = await fetch(url, {
            method: "GET",
            mode: "cors", // Forzamos el modo cors estándar sin cabeceras personalizadas
            headers: {
                "Accept": "application/json"
            }
        });
        
        const data = await response.json();

        if (data.success) {
            console.log("✅ Resultado guardado en la nube con éxito:", data.message);
            return true;
        } else {
            console.error("❌ El servidor rechazó el guardado:", data.error);
            return false;
        }
    } catch (error) {
        console.error("Error de red o procesamiento:", error);
        // Si el examen se guardó en el Excel (lo puedes verificar en tu Sheets) pero el navegador 
        // da un error al procesar la respuesta JSON por culpa de redirecciones de Google:
        return false;
    }
}
