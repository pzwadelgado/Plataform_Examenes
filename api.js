// --- SECCIÓN 1: CONFIGURACIÓN ---
const API_URL = "https://script.google.com/macros/s/AKfycbySWCCZh_GZvYmWy8Mu-My5p8PP7bdrhZs5IkBXamUugO6TEpRzWtQdkAEGEae0b1w6Nw/exec";

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
        const url = `${API_URL}?action=saveResult&id=${employeeId}&name=${encodeURIComponent(currentUser.name)}&dept=${encodeURIComponent(currentUser.dept)}&course=${courseId}&score=${score}&passed=${passed}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            console.log("✅ Resultado guardado en la nube con éxito.");
        } else {
            console.error("❌ Error al guardar:", data.error);
        }
        return data.success;
    } catch (error) {
        console.error("Error de red:", error);
        return false;
    }
}