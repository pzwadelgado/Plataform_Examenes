// --- SECCIÓN 1: ESTADO GLOBAL (Con Iconos Corporativos) ---
let currentUser = null;
const allCourses = [
    { id: "hot_work", name: "Trabajos en Caliente", icon: '<i class="fa-solid fa-fire" style="color: var(--amarillo-marca);"></i>' },
    { id: "heights", name: "Trabajos en Alturas", icon: '<i class="fa-solid fa-person-arrow-up-from-line" style="color: var(--amarillo-marca);"></i>' },
    { id: "loto", name: "LOTOTO", icon: '<i class="fa-solid fa-lock" style="color: var(--amarillo-marca);"></i>' },
    { id: "lifting", name: "Levantamiento de Cargas", icon: '<i class="fa-solid fa-truck-ramp-box" style="color: var(--amarillo-marca);"></i>' },
    { id: "chemicals", name: "Seguridad Química", icon: '<i class="fa-solid fa-flask-vial" style="color: var(--amarillo-marca);"></i>' },
    { id: "confined", name: "Espacios Confinados", icon: '<i class="fa-solid fa-door-closed" style="color: var(--amarillo-marca);"></i>' },
    { id: "ppe", name: "Uso de EPP", icon: '<i class="fa-solid fa-hard-hat" style="color: var(--amarillo-marca);"></i>' }
];

// --- SECCIÓN 2: NAVEGACIÓN DE VISTAS ---
function switchView(viewId) {
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));
    
    const targetSection = document.getElementById(viewId);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error(`Error: No se encontró la vista con ID '${viewId}'`);
    }
}

// --- SECCIÓN 3: AUTENTICACIÓN ---
async function login() {
    const inputId = document.getElementById('employee-id').value.trim();
    const errorMsg = document.getElementById('login-error');
    
    if (!inputId) {
        errorMsg.textContent = "Por favor, ingresa un código.";
        return;
    }

    errorMsg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando empleado...'; 
    
    try {
        if (typeof fetchUserFromDB !== 'function') {
            throw new Error("El archivo api.js no está conectado o tiene un error de sintaxis.");
        }

        const user = await fetchUserFromDB(inputId);
        
        if (user) {
            currentUser = { id: inputId, ...user };
            errorMsg.textContent = "";
            renderDashboard();
            switchView('dashboard-section');
        } else {
            errorMsg.textContent = "Empleado no encontrado en la base de datos.";
        }
    } catch (error) {
        console.error("Error detectado:", error);
        errorMsg.textContent = "Error del sistema: " + error.message;
    }
}

window.iniciarSesion = login;

function logout() {
    currentUser = null;
    document.getElementById('employee-id').value = '';
    switchView('login-section');
}

// --- SECCIÓN 4: RENDERIZADO DEL DASHBOARD (Tarjetas Flexbox) ---
function renderDashboard() {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-dept').textContent = currentUser.dept;
    
    const container = document.getElementById('courses-container');
    container.innerHTML = ''; 

    allCourses.forEach(course => {
        const isAllowed = currentUser.allowedCourses.includes(course.id);
        
        const card = document.createElement('div');
        card.className = `card course-card ${isAllowed ? '' : 'locked'}`;
        card.style.cursor = isAllowed ? 'pointer' : 'not-allowed';
        card.style.opacity = isAllowed ? '1' : '0.6';
        
        // Magia Flexbox para alinear todas las tarjetas
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        card.style.padding = '25px 15px';
        card.style.height = '100%'; 
        card.style.width = '100%';
        
        card.innerHTML = `
            <div style="font-size: 45px; height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                ${course.icon}
            </div>
            <h3 style="margin-bottom: 15px; font-size: 16px; text-align: center; height: 45px; display: flex; align-items: center; justify-content: center;">
                ${course.name}
            </h3>
            <div style="margin-top: auto;">
                ${isAllowed 
                    ? '<span style="background-color: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;"><i class="fa-solid fa-check-circle"></i> Disponible</span>' 
                    : '<span style="background-color: #fee2e2; color: #991b1b; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;"><i class="fa-solid fa-lock"></i> Bloqueado</span>'}
            </div>
        `;

        if (isAllowed) {
            card.onmouseover = () => { card.style.transform = 'translateY(-5px)'; card.style.boxShadow = '0 12px 25px rgba(221, 8, 20, 0.15)'; };
            card.onmouseout = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; };
            card.onclick = () => startExam(course);
        }

        container.appendChild(card);
    });
}

// Función blindada para volver al panel principal
window.showDashboard = () => { 
    switchView('dashboard-section'); 
    window.scrollTo(0, 0); // Sube la pantalla al inicio
};

// --- SECCIÓN 5: LÓGICA DEL EXAMEN ---
let currentExamData = [];
let currentQuestionIndex = 0;
let currentScore = 0;
let currentCourseId = '';

async function startExam(course) {
    document.getElementById('exam-title').innerHTML = `${course.icon} Evaluación: ${course.name}`;
    document.getElementById('exam-results').style.display = 'none';
    document.getElementById('question-container').style.display = 'block';
    
    // Mostramos el botón de volver arriba al iniciar el examen
    const btnHeader = document.getElementById('btn-volver-header');
    if (btnHeader) btnHeader.style.display = 'block';

    switchView('exam-section');

    currentQuestionIndex = 0;
    currentScore = 0;
    currentCourseId = course.id;

    try {
        document.getElementById('question-text').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cargando preguntas...';
        document.getElementById('options-container').innerHTML = '';
        
        const response = await fetch(`${course.id}.json`);
        
        if (!response.ok) {
            throw new Error("El archivo del examen no se encontró.");
        }

        currentExamData = await response.json();
        renderQuestion(); 

    } catch (error) {
        console.error(error);
        document.getElementById('question-text').textContent = `Error: No se encontró el examen para ${course.name} (${course.id}.json).`;
    }
}

function renderQuestion() {
    const questionData = currentExamData[currentQuestionIndex];
    
    document.getElementById('question-text').textContent = questionData.pregunta;
    document.getElementById('question-counter').innerHTML = `<i class="fa-solid fa-list-ol"></i> Pregunta ${currentQuestionIndex + 1} de ${currentExamData.length}`;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = ''; 

    // Magia para cargar la imagen si la pregunta lo requiere
    let oldImg = document.getElementById('img-pregunta');
    if (oldImg) oldImg.remove();

    if (questionData.imagen) {
        const imgElement = document.createElement('img');
        imgElement.id = 'img-pregunta';
        imgElement.src = questionData.imagen;
        imgElement.style.maxWidth = '100%';
        imgElement.style.borderRadius = '8px';
        imgElement.style.marginBottom = '20px';
        optionsContainer.parentNode.insertBefore(imgElement, optionsContainer);
    }

    questionData.opciones.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.textContent = optionText;
        btn.onclick = () => selectOption(index);
        optionsContainer.appendChild(btn);
    });
}

function selectOption(selectedIndex) {
    const questionData = currentExamData[currentQuestionIndex];
    
    if (selectedIndex === questionData.correcta) {
        currentScore++;
    }

    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentExamData.length) {
        renderQuestion();
    } else {
        finishExam();
    }
}

async function finishExam() {
    document.getElementById('question-container').style.display = 'none';
    const resultsContainer = document.getElementById('exam-results');
    resultsContainer.style.display = 'block';

    // Ocultamos el botón de volver de arriba al terminar el examen
    const btnHeader = document.getElementById('btn-volver-header');
    if (btnHeader) btnHeader.style.display = 'none';

    const finalGrade = Math.round((currentScore / currentExamData.length) * 100);
    const passed = finalGrade >= 80; 

    document.getElementById('score-text').textContent = `Tu nota: ${finalGrade}% (${currentScore}/${currentExamData.length})`;
    
    const statusText = document.getElementById('pass-fail-text');
    if (passed) {
        statusText.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Aprobado!';
        statusText.style.color = "#166534"; 
    } else {
        statusText.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> No aprobado. Debes repetir la evaluación.';
        statusText.style.color = "var(--rojo-marca)"; 
    }

    await saveResultToDB(currentUser.id, currentCourseId, finalGrade, passed);
}