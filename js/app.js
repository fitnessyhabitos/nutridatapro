import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, setDoc, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { dietsDatabase, dietGuides } from './dietData.js'; 

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

// VARS GLOBALES
let currentUser = null;
let userData = null; // Datos del doc 'clientes'
let isAdmin = false;
let currentChart = null;
const ADMIN_EMAIL = "toni@nutridatapro.com"; 

// ==========================================
// 1. SISTEMA DE SESIÓN (LOGIN/REGISTRO)
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        isAdmin = (user.email === ADMIN_EMAIL);
        
        // UI
        document.getElementById('authContainer').innerHTML = `<button onclick="logoutApp()" class="btn-danger" style="width:100%"><i class="bi bi-box-arrow-left"></i> Salir</button>`;
        closeModal('loginModal');

        if (isAdmin) {
            initAdminDashboard();
        } else {
            // Cargar datos de atleta
            const docRef = doc(db, "clientes", user.uid);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()){
                userData = docSnap.data();
                initAthleteDashboard();
            } else {
                alert("Error: Perfil de atleta no encontrado.");
            }
        }
    } else {
        // RESET UI
        currentUser = null; isAdmin = false; userData = null;
        document.getElementById('adminNav').style.display = 'none';
        document.getElementById('athleteNav').style.display = 'none';
        document.getElementById('adminView').style.display = 'none';
        document.getElementById('athleteView').style.display = 'none';
        document.getElementById('authContainer').innerHTML = `<button onclick="openModal('loginModal')" class="btn-primary" style="width:100%">Entrar</button>`;
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('loginEmail').value, document.getElementById('loginPass').value);
    } catch (e) { alert("Error: " + e.message); }
});

// Registro Atleta
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const name = document.getElementById('regName').value;
    const alias = document.getElementById('regAlias').value;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        // Crear documento en Firestore vinculado al UID
        await setDoc(doc(db, "clientes", cred.user.uid), {
            name, alias, email, 
            goal: "General", 
            currentDietName: null, 
            dietHistory: [] // Array para guardar dietas pasadas
        });
        alert("¡Cuenta creada! Bienvenido al equipo.");
    } catch (e) { alert("Error al registrar: " + e.message); }
});

window.logoutApp = () => signOut(auth);
window.toggleAuthMode = () => {
    const loginBox = document.getElementById('loginBox');
    const regBox = document.getElementById('registerBox');
    if(loginBox.style.display === 'none') {
        loginBox.style.display = 'block'; regBox.style.display = 'none';
    } else {
        loginBox.style.display = 'none'; regBox.style.display = 'block';
    }
};

// ==========================================
// 2. DASHBOARD ADMIN
// ==========================================
function initAdminDashboard() {
    document.getElementById('adminNav').style.display = 'block';
    document.getElementById('athleteNav').style.display = 'none';
    showAdminSection('clients');
    
    // Escuchar mensajes nuevos
    const q = query(collection(db, "notas"), where("read", "==", false));
    onSnapshot(q, (snapshot) => {
        const icon = document.getElementById('adminNotifIcon');
        const dot = document.getElementById('notifDot');
        if(!snapshot.empty) {
            icon.style.display = 'block';
            dot.style.display = 'block';
        } else {
            icon.style.display = 'none';
        }
    });
}

window.showAdminSection = (id) => {
    document.getElementById('adminView').style.display = 'block';
    document.getElementById('athleteView').style.display = 'none';
    
    ['clients', 'diets', 'inbox'].forEach(s => document.getElementById(s+'-section').style.display = 'none');
    document.getElementById(id+'-section').style.display = 'block';
    
    if(id==='clients') renderClientsAdmin();
    if(id==='diets') loadDietsAdmin();
    if(id==='inbox') renderInbox();
};

async function renderClientsAdmin() {
    const grid = document.getElementById('clients-grid');
    grid.innerHTML = '<div class="loading-spinner">Cargando...</div>';
    const q = await getDocs(collection(db, "clientes"));
    grid.innerHTML = '';
    q.forEach(docSnap => {
        const c = docSnap.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${c.alias}</h3>
            <p>${c.name}</p>
            <small style="color:#666">Plan: <span style="color:var(--brand-red)">${c.currentDietName || 'Ninguno'}</span></small>
            <button class="btn-assign" onclick="openDietAssignModal('${docSnap.id}', '${c.alias}')">Asignar Dieta</button>
        `;
        grid.appendChild(card);
    });
}

// Asignar Dieta con Historial
window.openDietAssignModal = async (clientId, alias) => {
    const dietName = prompt(`Asignar a ${alias}. Escribe nombre exacto:`);
    if(dietName) {
        // Buscar la dieta completa en biblioteca para guardarla en historial
        const q = query(collection(db, "diet_templates"), where("name", "==", dietName));
        const snap = await getDocs(q);
        
        if(!snap.empty) {
            const dietData = snap.docs[0].data();
            const clientRef = doc(db, "clientes", clientId);
            const clientSnap = await getDoc(clientRef);
            const history = clientSnap.data().dietHistory || [];
            
            // Añadir al historial con fecha
            history.unshift({
                name: dietData.name,
                date: new Date().toLocaleDateString(),
                category: dietData.category
            });

            await updateDoc(clientRef, {
                currentDietName: dietData.name,
                currentDietData: dietData, // Guardamos copia completa para que el atleta la vea rápido
                dietHistory: history
            });
            alert("Dieta asignada y guardada en historial.");
            renderClientsAdmin();
        } else {
            alert("No encontré esa dieta en la biblioteca. Revisa el nombre.");
        }
    }
};

// ==========================================
// 3. DASHBOARD ATLETA
// ==========================================
function initAthleteDashboard() {
    document.getElementById('adminNav').style.display = 'none';
    document.getElementById('athleteNav').style.display = 'block';
    document.getElementById('athleteGreeting').innerText = `Hola, ${userData.alias}`;
    showAthleteSection('myPlan');
}

window.showAthleteSection = (id) => {
    document.getElementById('adminView').style.display = 'none';
    document.getElementById('athleteView').style.display = 'block';
    
    ['myPlan', 'education', 'history', 'notes'].forEach(s => document.getElementById(s+'-section').style.display = 'none');
    document.getElementById(id+'-section').style.display = 'block';

    if(id === 'myPlan') renderMyPlan();
    if(id === 'education') renderEducation();
    if(id === 'history') renderHistory();
    if(id === 'notes') renderNotesHistory();
};

function renderMyPlan() {
    const container = document.getElementById('myCurrentDietContainer');
    if(!userData.currentDietData) {
        container.innerHTML = `<div class="warning-box">Tu entrenador aún no te ha asignado un plan activo.</div>`;
        return;
    }
    // Usamos la misma función visual que el modal
    renderDietVisual(userData.currentDietData, container);
}

function renderEducation() {
    const container = document.getElementById('eduContent');
    if(!userData.currentDietData) {
        container.innerHTML = "<p>Necesitas un plan activo para ver tu guía.</p>";
        return;
    }
    
    const cat = userData.currentDietData.category; // "Déficit", "Volumen", "Salud"
    const guide = dietGuides[cat] || dietGuides["Volumen"]; // Fallback

    let html = `
        <div class="card" style="border-left:4px solid var(--brand-red); margin-bottom:20px;">
            <h3 style="color:var(--brand-red)">TIPS CLAVE PARA ${cat.toUpperCase()}</h3>
            <ul style="padding-left:20px; color:#ddd; margin-top:10px;">
                ${guide.tips.map(t => `<li style="margin-bottom:5px;">${t}</li>`).join('')}
            </ul>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
            <div style="background:rgba(0,255,0,0.1); padding:15px; border-radius:8px; border:1px solid green;">
                <h4 style="color:#4caf50; margin:0 0 10px 0;">✅ PERMITIDOS</h4>
                <ul style="padding-left:15px; margin:0; font-size:0.9rem;">
                     ${guide.allowed.map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>
            <div style="background:rgba(255,0,0,0.1); padding:15px; border-radius:8px; border:1px solid red;">
                <h4 style="color:#f44336; margin:0 0 10px 0;">❌ PROHIBIDOS</h4>
                <ul style="padding-left:15px; margin:0; font-size:0.9rem;">
                     ${guide.forbidden.map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>
        </div>

        <h3>🔄 Tabla de Sustituciones (Índice Glucémico)</h3>
        <div class="grid-container">
            ${guide.replacements.map(r => `
                <div class="card" style="padding:10px;">
                    <small style="color:#888">Si no tienes...</small>
                    <div style="color:var(--brand-red); font-weight:bold;">${r.original}</div>
                    <small style="color:#888">Usa esto:</small>
                    <div style="color:#4caf50; font-weight:bold;">${r.substitute}</div>
                </div>
            `).join('')}
        </div>
    `;
    container.innerHTML = html;
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if(!userData.dietHistory || userData.dietHistory.length === 0) {
        list.innerHTML = "<p>No hay historial previo.</p>";
        return;
    }
    list.innerHTML = userData.dietHistory.map(h => `
        <div class="card">
            <small>${h.date}</small>
            <h3>${h.name}</h3>
            <span class="status-badge" style="background:#333">${h.category}</span>
        </div>
    `).join('');
}

// NOTAS DEL ATLETA
window.sendAthleteNote = async () => {
    const txt = document.getElementById('athleteNoteInput').value;
    if(!txt) return;
    
    await addDoc(collection(db, "notas"), {
        uid: currentUser.uid,
        author: userData.alias,
        text: txt,
        date: new Date().toLocaleString(),
        read: false
    });
    document.getElementById('athleteNoteInput').value = "";
    alert("Nota enviada al entrenador.");
    renderNotesHistory();
};

async function renderNotesHistory() {
    const q = query(collection(db, "notas"), where("uid", "==", currentUser.uid), orderBy("date", "desc"));
    const snap = await getDocs(q);
    document.getElementById('myNotesHistory').innerHTML = snap.docs.map(d => `
        <div style="border-bottom:1px solid #333; padding:10px 0;">
            <small style="color:#666">${d.data().date}</small>
            <p style="margin:5px 0;">${d.data().text}</p>
        </div>
    `).join('');
}

// ==========================================
// 4. BUZÓN ADMIN (Inbox)
// ==========================================
async function renderInbox() {
    const list = document.getElementById('inbox-list');
    list.innerHTML = "Cargando...";
    // Leer todas las notas (idealmente filtrar por read=false primero)
    const q = query(collection(db, "notas"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    
    list.innerHTML = snap.docs.map(doc => {
        const n = doc.data();
        const bg = n.read ? 'transparent' : 'rgba(211, 47, 47, 0.1)';
        return `
        <div class="card" style="background:${bg}; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between;">
                <strong>${n.author}</strong>
                <small>${n.date}</small>
            </div>
            <p>${n.text}</p>
            ${!n.read ? `<button class="btn-primary" onclick="markRead('${doc.id}')" style="padding:5px; font-size:0.7rem;">Marcar Leído</button>` : '<small style="color:#666">Leído</small>'}
        </div>`;
    }).join('');
}

window.markRead = async (id) => {
    await updateDoc(doc(db, "notas", id), { read: true });
    renderInbox();
};

// ==========================================
// 5. UTILS & VISUALIZADOR COMÚN
// ==========================================
function renderDietVisual(diet, container) {
    let mealsHtml = '';
    const renderOptions = (opts) => opts.map((o,i) => `
        <div class="option-card">
            <div style="color:#666; font-size:0.7rem; font-weight:bold;">OPCIÓN ${i+1}</div>
            <div>${o.desc}</div>
        </div>
    `).join('');

    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Desayuno</h4>${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Comida</h4>${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Snack</h4>${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Cena</h4>${renderOptions(diet.plan.dinner)}</div>`;

    container.innerHTML = `
        <div class="diet-header-grid">
            <div>
                <h2 style="color:white;">${diet.name}</h2>
                <div class="warning-box">
                    <strong>⚠️ REGLAS DE ORO:</strong>
                    <ul><li>Pesar en CRUDO.</li><li>Cocinar con Oliva/Coco.</li><li>Prohibidos aceites semillas.</li></ul>
                </div>
                <div class="hydration-box" style="background:rgba(33,150,243,0.1); padding:10px; border-radius:5px; color:#64b5f6;">
                    💧 <strong>Despertar:</strong> 500ml agua + sal + limón.
                </div>
            </div>
            <div style="background:#111; padding:10px; border-radius:8px; text-align:center;">
                <div style="height:150px;"><canvas id="chart-${Math.random()}"></canvas></div>
            </div>
        </div>
        ${mealsHtml}
    `;
    
    // Render Chart
    setTimeout(() => {
        const canvas = container.querySelector('canvas');
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Prot', 'Carb', 'Grasa'],
                datasets: [{ data: [diet.macros.p, diet.macros.c, diet.macros.f], backgroundColor: ['#D32F2F', '#ffffff', '#424242'], borderWidth:0 }]
            },
            options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} }
        });
    }, 100);
}

// Funciones básicas Admin
window.resetDatabaseManual = async () => { /* ... (COPIAR LA MISMA DE ANTES) ... */ };
async function loadDietsAdmin() { /* ... (COPIAR LA MISMA DE ANTES para renderDietsList) ... */ };
window.filterDiets = () => { /* ... (COPIAR LA MISMA DE ANTES) ... */ };
window.toggleSidebar = () => { document.getElementById('sidebar').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active'); };
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

window.openModal = (id) => document.getElementById(id).style.display = 'block';
