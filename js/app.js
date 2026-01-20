import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// IMPORTAMOS LA BASE DE DATOS GENERADA (80 DIETAS)
import { dietsDatabase } from './dietData.js'; 

const firebaseConfig = {
  apiKey: "AIzaSyAeF56bhecS8ADTSTIg5bIBzhVwiw-UI8s",
  authDomain: "nutri-data-pro.firebaseapp.com",
  projectId: "nutri-data-pro",
  storageBucket: "nutri-data-pro.firebasestorage.app",
  messagingSenderId: "798797976945",
  appId: "1:798797976945:web:7b44251b8ca54c875d92d0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let currentChart = null;

// ==========================================
// 1. RESET Y CARGA MASIVA
// ==========================================
window.resetDatabaseManual = async () => {
    const dietCount = dietsDatabase.length;
    if(!confirm(`⚠️ ¿RESETEAR Y CARGAR ${dietCount} DIETAS? \n\nSe borrará la base de datos actual y se generarán ${dietCount} planes automáticamente.\n\nEsto puede tardar unos segundos.`)) return;

    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Generando y subiendo dietas... Por favor espera.</div>';

    try {
        // 1. Obtener docs actuales
        const q = await getDocs(collection(db, "diet_templates"));
        
        // 2. Borrarlos (limitación de Firebase: uno a uno en este script simple)
        const deletePromises = [];
        q.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, "diet_templates", docSnap.id)));
        });
        await Promise.all(deletePromises);

        // 3. Subir las nuevas dietas
        // Lo hacemos en bloques para no saturar la red
        const chunkSize = 50; 
        for (let i = 0; i < dietsDatabase.length; i += chunkSize) {
            const chunk = dietsDatabase.slice(i, i + chunkSize);
            const uploadPromises = chunk.map(diet => addDoc(collection(db, "diet_templates"), diet));
            await Promise.all(uploadPromises);
        }
        
        alert(`✅ ¡Éxito! Se han cargado ${dietCount} dietas en la base de datos.`);
        loadDiets(); 

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
};

// ==========================================
// 2. LECTURA Y FILTRADO
// ==========================================
let allDietsCache = [];

async function loadDiets() {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Cargando biblioteca NDP...</div>';
    
    const querySnapshot = await getDocs(collection(db, "diet_templates"));
    allDietsCache = []; 

    if (querySnapshot.empty) {
        grid.innerHTML = '<div style="text-align:center; padding:20px;">BD Vacía. <br> Pulsa el botón <b>"Cargar Pack Dietas"</b>.</div>';
        return;
    }

    querySnapshot.forEach((docSnap) => {
        allDietsCache.push({ firestoreId: docSnap.id, ...docSnap.data() });
    });

    renderDietsList(allDietsCache);
}

function renderDietsList(dietsArray) {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '';

    if(dietsArray.length === 0) {
        grid.innerHTML = '<p style="color:gray;">No se encontraron dietas con esos filtros.</p>';
        return;
    }

    // Ordenar por Kcal
    dietsArray.sort((a, b) => a.calories - b.calories);

    dietsArray.forEach((diet) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let badgeColor = '#333';
        if(diet.category === 'Déficit') badgeColor = '#b71c1c'; // Rojo oscuro
        if(diet.category === 'Volumen') badgeColor = '#1b5e20'; // Verde oscuro
        if(diet.category === 'Mantenimiento') badgeColor = '#0d47a1'; // Azul oscuro
        if(diet.category === 'Salud') badgeColor = '#f57f17'; // Naranja

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <span class="status-badge" style="background:${badgeColor}; color:white">${diet.category}</span>
                <span style="font-weight:bold; font-size:0.9rem; color:white;">${diet.calories} kcal</span>
            </div>
            <h3 style="color:white; margin-bottom:5px;">${diet.name}</h3>
            <p>${diet.description.substring(0, 50)}...</p>
            <div style="margin-top:10px; font-size:0.8rem; color:#666;">
                <i class="bi bi-egg-fried"></i> ${diet.mealsPerDay} Comidas/día
            </div>
            <button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(diet).replace(/'/g, "&apos;")})'>
                <i class="bi bi-eye"></i> Ver Plan
            </button>
        `;
        grid.appendChild(card);
    });
}

window.filterDiets = () => {
    const searchKcal = document.getElementById('searchKcal').value;
    const searchType = document.getElementById('searchType').value;

    const filtered = allDietsCache.filter(diet => {
        const typeMatch = (searchType === 'all') || (diet.category === searchType);
        let kcalMatch = true;
        if(searchKcal) {
            const target = parseInt(searchKcal);
            kcalMatch = (diet.calories >= target - 200) && (diet.calories <= target + 200);
        }
        return typeMatch && kcalMatch;
    });
    renderDietsList(filtered);
};

// ==========================================
// 3. VISUALIZACIÓN DETALLADA
// ==========================================
window.previewDietVisual = (diet) => {
    const container = document.getElementById('diet-detail-content');
    let mealsHtml = '';
    
    const renderOptions = (optionsArray) => {
        if(!optionsArray) return '';
        return optionsArray.map((opt, i) => `
            <div class="option-card">
                <span class="opt-badge">OPCIÓN ${i + 1}</span>
                <span class="opt-desc">${opt.desc}</span>
            </div>
        `).join('');
    };

    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section"><h4 class="meal-title">🥞 Desayuno</h4>${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section"><h4 class="meal-title">🍖 Almuerzo / Comida</h4>${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack && diet.plan.snack.length > 0) mealsHtml += `<div class="meal-section"><h4 class="meal-title">🥪 Snack / Merienda</h4>${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section"><h4 class="meal-title">🐟 Cena</h4>${renderOptions(diet.plan.dinner)}</div>`;

    container.innerHTML = `
        <div class="diet-header-grid">
            <div>
                <h2 style="color:white; margin-bottom:10px;">${diet.name}</h2>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <span class="status-badge" style="background:#D32F2F;">${diet.category}</span>
                    <span class="status-badge" style="border:1px solid #fff">${diet.calories} kcal</span>
                </div>
                <p style="color:#aaa;">${diet.description}</p>
                
                <div class="hydration-box">
                    <i class="bi bi-droplet-fill" style="font-size:1.5rem;"></i>
                    <div>
                        <strong>Hidratación Mañanera:</strong>
                        <br>Nada más despertar: 500ml agua + pizca sal rosa + limón.
                    </div>
                </div>
            </div>
            
            <div style="background:#111; padding:15px; border-radius:12px; border:1px solid #333; text-align:center;">
                <h5 style="color:#888; margin:0 0 10px 0;">Distribución Macros</h5>
                <div style="height:150px; display:flex; justify-content:center;">
                    <canvas id="macrosChart"></canvas>
                </div>
            </div>
        </div>
        <div>${mealsHtml}</div>
    `;

    openModal('dietViewModal');

    if(currentChart) currentChart.destroy();
    const ctx = document.getElementById('macrosChart');
    if(diet.macros) {
        currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Proteína', 'Carbohidratos', 'Grasas'],
                datasets: [{
                    data: [diet.macros.p, diet.macros.c, diet.macros.f],
                    backgroundColor: ['#D32F2F', '#ffffff', '#424242'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
}

// ==========================================
// 4. CLIENTES Y UTILS
// ==========================================
async function renderClients() {
    const grid = document.getElementById('clients-grid');
    grid.innerHTML = '<div class="loading-spinner">Cargando...</div>';
    const querySnapshot = await getDocs(collection(db, "clientes"));
    grid.innerHTML = '';
    
    querySnapshot.forEach((docSnap) => {
        const client = docSnap.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="margin-bottom:10px;"><span class="status-badge" style="background:#222; color:#ccc">${client.goal || 'General'}</span></div>
            <h3>${client.name}</h3>
            <p>${client.email}</p>
            <div style="margin-top:15px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1)">
                <small style="color:#666">Dieta Actual:</small><br>
                <span style="color: var(--brand-red)">${client.currentDietName || 'Sin asignar'}</span>
            </div>
            <button class="btn-assign" onclick="openDietAssignModal('${docSnap.id}', '${client.name}')">
                <i class="bi bi-pencil-square"></i> Asignar Plan
            </button>
        `;
        grid.appendChild(card);
    });
}

document.getElementById('addClientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('clientName').value;
    const email = document.getElementById('clientEmail').value;
    const goal = document.getElementById('clientGoal').value;
    await addDoc(collection(db, "clientes"), { name, email, goal, currentDietName: null });
    closeModal('clientModal');
    renderClients();
});

window.openDietAssignModal = async (clientId, clientName) => {
    const dietName = prompt(`Escribe el nombre de la dieta para ${clientName}:`);
    if(dietName) {
        const dietRef = doc(db, "clientes", clientId);
        await updateDoc(dietRef, { currentDietName: dietName });
        alert("Plan asignado correctamente.");
        renderClients();
    }
};

window.showSection = (id) => {
    document.getElementById('clients-section').style.display = 'none';
    document.getElementById('diets-section').style.display = 'none';
    document.getElementById(id + '-section').style.display = 'block';
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if(id === 'diets') loadDiets();
    if(id === 'clients') renderClients();
}

window.openModal = (id) => document.getElementById(id).style.display = 'block';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

// INICIO
renderClients();