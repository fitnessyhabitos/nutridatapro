import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { 
    getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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
const auth = getAuth(app);

let currentUser = null;
let currentChart = null;
let allDietsCache = [];

// ==========================================
// 1. AUTH & ADMIN SYSTEM
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('authContainer').innerHTML = `
            <button onclick="logoutApp()" class="btn-danger" style="width:100%; font-size:0.8rem;">
                <i class="bi bi-box-arrow-left"></i> Salir (${user.email})
            </button>
        `;
        // Mostrar botones de Admin
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
        console.log("Admin logueado:", user.email);
    } else {
        currentUser = null;
        document.getElementById('authContainer').innerHTML = `
            <button onclick="openModal('loginModal')" class="btn-primary" style="width:100%">
                <i class="bi bi-lock-fill"></i> Acceso Admin
            </button>
        `;
        // Ocultar botones de Admin
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        closeModal('loginModal');
        alert("Bienvenido Admin");
    } catch (error) {
        alert("Error de acceso: " + error.message);
    }
});

window.logoutApp = () => signOut(auth);

// ==========================================
// 2. LÓGICA DE DATOS
// ==========================================

// Reset Database (Solo Admin)
window.resetDatabaseManual = async () => {
    if(!currentUser) return alert("Solo admins.");
    if(!confirm("⚠️ ¿RESETEAR Y CARGAR 100+ DIETAS?")) return;

    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Generando base de datos...</div>';

    try {
        const q = await getDocs(collection(db, "diet_templates"));
        const deletePromises = [];
        q.forEach((docSnap) => deletePromises.push(deleteDoc(doc(db, "diet_templates", docSnap.id))));
        await Promise.all(deletePromises);

        const chunkSize = 50; 
        for (let i = 0; i < dietsDatabase.length; i += chunkSize) {
            const chunk = dietsDatabase.slice(i, i + chunkSize);
            const uploadPromises = chunk.map(diet => addDoc(collection(db, "diet_templates"), diet));
            await Promise.all(uploadPromises);
        }
        alert("Base de datos actualizada.");
        loadDiets(); 
    } catch (e) { alert("Error: " + e.message); }
};

// Cargar Dietas
async function loadDiets() {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Cargando biblioteca...</div>';
    const q = await getDocs(collection(db, "diet_templates"));
    allDietsCache = [];
    q.forEach(doc => allDietsCache.push({ firestoreId: doc.id, ...doc.data() }));
    renderDietsList(allDietsCache);
}

function renderDietsList(list) {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '';
    // Ordenar: primero las que tienen numero, luego las ad libitum
    list.sort((a,b) => (parseInt(a.calories)||9999) - (parseInt(b.calories)||9999));

    list.forEach(diet => {
        const card = document.createElement('div');
        card.className = 'card';
        let color = '#333';
        if(diet.category === 'Déficit') color = '#b71c1c';
        if(diet.category === 'Volumen') color = '#1b5e20';
        if(diet.category === 'Salud') color = '#f57f17';

        // Si es Ad Libitum no mostramos "kcal"
        const kcalDisplay = diet.isAdLibitum ? 'SACIEDAD' : `${diet.calories} kcal`;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span class="status-badge" style="background:${color}; color:white">${diet.category}</span>
                <span class="status-badge" style="border:1px solid #555">${kcalDisplay}</span>
            </div>
            <h3>${diet.name}</h3>
            <p>${diet.description.substring(0,50)}...</p>
            <button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(diet).replace(/'/g, "&apos;")})'>
                <i class="bi bi-eye"></i> Ver Plan
            </button>
        `;
        grid.appendChild(card);
    });
}

// ==========================================
// 3. VISTA DETALLE & CHART
// ==========================================
window.previewDietVisual = (diet) => {
    const container = document.getElementById('diet-detail-content');
    let mealsHtml = '';
    
    const renderOptions = (opts) => opts.map((o,i) => `
        <div class="option-card">
            <div style="color:#666; font-size:0.7rem; font-weight:bold; margin-bottom:4px;">OPCIÓN ${i+1}</div>
            <div style="color:#eee; font-size:0.9rem;">${o.desc}</div>
        </div>
    `).join('');

    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Desayuno</h4>${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Comida</h4>${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Snack</h4>${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Cena</h4>${renderOptions(diet.plan.dinner)}</div>`;

    container.innerHTML = `
        <div class="diet-header-grid">
            <div>
                <h2 style="color:white; font-size:1.5rem; margin-bottom:10px;">${diet.name}</h2>
                <div class="warning-box">
                    <strong>⚠️ AVISOS IMPORTANTES:</strong>
                    <ul>
                        <li>Todos los alimentos se pesan en <strong>CRUDO</strong>.</li>
                        <li>Cocinar solo con <strong>Aceite de Oliva, Coco o Ghee</strong>.</li>
                        <li>Prohibidos aceites de semillas (Girasol, Soja, etc).</li>
                    </ul>
                </div>
                <div class="hydration-box" style="background:rgba(33,150,243,0.1); padding:10px; border-radius:5px; color:#64b5f6; font-size:0.9rem; margin-bottom:20px;">
                    💧 <strong>Al despertar:</strong> 500ml agua + pizca sal + limón.
                </div>
            </div>
            <div style="background:#111; padding:10px; border-radius:8px; text-align:center;">
                <div style="height:180px;"><canvas id="macrosChart"></canvas></div>
            </div>
        </div>
        ${mealsHtml}
    `;

    openModal('dietViewModal');

    // Gráfico con Leyenda
    if(currentChart) currentChart.destroy();
    const ctx = document.getElementById('macrosChart');
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'bottom', labels: { color: '#ccc', font:{size:10} } }
            }
        }
    });
}

// ==========================================
// 4. CLIENTES (Nombre y Alias)
// ==========================================
async function renderClients() {
    const grid = document.getElementById('clients-grid');
    grid.innerHTML = '<div class="loading-spinner">Cargando...</div>';
    const q = await getDocs(collection(db, "clientes"));
    grid.innerHTML = '';
    
    q.forEach((docSnap) => {
        const c = docSnap.data();
        const card = document.createElement('div');
        card.className = 'card';
        
        // Solo Admin ve el botón de asignar
        const assignBtn = currentUser ? `
            <button class="btn-assign" onclick="openDietAssignModal('${docSnap.id}', '${c.alias}')">
                <i class="bi bi-pencil-square"></i> Asignar
            </button>` : '';

        card.innerHTML = `
            <span class="status-badge" style="align-self:start; background:#222; margin-bottom:10px;">${c.goal}</span>
            <h3 style="margin-bottom:2px;">${c.alias}</h3>
            <small style="color:#666; margin-bottom:10px;">${c.name}</small>
            <div style="border-top:1px solid #333; padding-top:10px; margin-top:10px;">
                <small style="color:#888;">Plan Actual:</small><br>
                <span style="color:var(--brand-red)">${c.currentDietName || 'Sin asignar'}</span>
            </div>
            ${assignBtn}
        `;
        grid.appendChild(card);
    });
}

document.getElementById('addClientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!currentUser) return alert("Solo admin");
    
    const name = document.getElementById('clientName').value;
    const alias = document.getElementById('clientAlias').value;
    const email = document.getElementById('clientEmail').value;
    const goal = document.getElementById('clientGoal').value;

    await addDoc(collection(db, "clientes"), { name, alias, email, goal, currentDietName: null });
    closeModal('clientModal');
    renderClients();
});

window.openDietAssignModal = async (clientId, clientAlias) => {
    const dietName = prompt(`Asignar dieta a ${clientAlias}: (Escribe el nombre exacto o copia de biblioteca)`);
    if(dietName) {
        await updateDoc(doc(db, "clientes", clientId), { currentDietName: dietName });
        alert("Asignado.");
        renderClients();
    }
};

// UI Utils
window.filterDiets = () => {
    // ... (Mismo filtro que antes, no cambia mucho)
    const term = document.getElementById('searchKcal').value.toLowerCase();
    const type = document.getElementById('searchType').value;
    const filtered = allDietsCache.filter(d => {
        const matchType = (type === 'all' || d.category === type);
        const matchTerm = d.name.toLowerCase().includes(term) || (d.calories && d.calories.toString().includes(term));
        return matchType && matchTerm;
    });
    renderDietsList(filtered);
};

window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
};
window.showSection = (id) => {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById(id+'-section').style.display = 'block';
    if(id === 'diets') loadDiets();
    if(id === 'clients') renderClients();
};
window.openModal = (id) => document.getElementById(id).style.display = 'block';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

// Init
onAuthStateChanged(auth, u => { if(u) loadDiets(); renderClients(); });