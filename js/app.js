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
let userData = null;
let isAdmin = false;
let currentChart = null;
// ¡¡¡IMPORTANTE: CAMBIA ESTE EMAIL POR EL TUYO PARA SER ADMIN!!!
const ADMIN_EMAIL = "tu_email_real@ejemplo.com"; 

// ==========================================
// 1. SISTEMA DE SESIÓN (LOGIN/REGISTRO)
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        isAdmin = (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
        
        document.getElementById('authContainer').innerHTML = `<button onclick="logoutApp()" class="btn-danger" style="width:100%"><i class="bi bi-box-arrow-left"></i> Salir</button>`;
        closeModal('loginModal');

        if (isAdmin) {
            initAdminDashboard();
        } else {
            const docRef = doc(db, "clientes", user.uid);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()){
                userData = docSnap.data();
                initAthleteDashboard();
            } else {
                // Si es admin pero no tiene doc de cliente, forzamos admin
                 if(!isAdmin) alert("Error: Perfil de atleta no encontrado.");
                 else initAdminDashboard();
            }
        }
    } else {
        currentUser = null; isAdmin = false; userData = null;
        document.getElementById('adminNav').style.display = 'none';
        document.getElementById('athleteNav').style.display = 'none';
        document.getElementById('adminView').style.display = 'none';
        document.getElementById('athleteView').style.display = 'none';
        document.getElementById('authContainer').innerHTML = `<button onclick="openModal('loginModal')" class="btn-primary" style="width:100%">Acceder</button>`;
        document.getElementById('adminNotifIcon').style.display = 'none';
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('loginEmail').value, document.getElementById('loginPass').value);
    } catch (e) { alert("Error de acceso: " + e.message); }
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
        await setDoc(doc(db, "clientes", cred.user.uid), {
            name, alias, email, 
            goal: "General", 
            currentDietName: null, 
            dietHistory: []
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
    document.getElementById('adminNotifIcon').style.display = 'block';
    showAdminSection('clients');
    
    // Escuchar notificaciones
    const q = query(collection(db, "notas"), where("read", "==", false));
    onSnapshot(q, (snapshot) => {
        const dot = document.getElementById('notifDot');
        dot.style.display = snapshot.empty ? 'none' : 'block';
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
            <small style="color:#888">Plan: <span style="color:var(--brand-red)">${c.currentDietName || 'Ninguno'}</span></small>
            <button class="btn-assign" onclick="openDietAssignModal('${docSnap.id}', '${c.alias}')">Asignar Dieta</button>
        `;
        grid.appendChild(card);
    });
}

window.openDietAssignModal = async (clientId, alias) => {
    const dietName = prompt(`Asignar a ${alias}. Escribe nombre exacto de la dieta:`);
    if(dietName) {
        const q = query(collection(db, "diet_templates"), where("name", "==", dietName));
        const snap = await getDocs(q);
        
        if(!snap.empty) {
            const dietData = snap.docs[0].data();
            const clientRef = doc(db, "clientes", clientId);
            const clientSnap = await getDoc(clientRef);
            const history = clientSnap.data().dietHistory || [];
            
            history.unshift({
                name: dietData.name,
                date: new Date().toLocaleDateString(),
                category: dietData.category
            });

            await updateDoc(clientRef, {
                currentDietName: dietData.name,
                currentDietData: dietData,
                dietHistory: history
            });
            alert("Dieta asignada correctamente.");
            renderClientsAdmin();
        } else {
            alert("No encontré esa dieta. Revisa el nombre exacto.");
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
    renderDietVisual(userData.currentDietData, container);
}

function renderEducation() {
    const container = document.getElementById('eduContent');
    if(!userData.currentDietData) {
        container.innerHTML = "<p class='card'>Necesitas un plan activo para ver tu guía.</p>";
        return;
    }
    
    const cat = userData.currentDietData.category;
    const guide = dietGuides[cat] || dietGuides["Volumen"];

    let html = `
        <div class="card glass-panel" style="border-left:4px solid var(--brand-red); margin-bottom:25px;">
            <h3 style="color:var(--brand-red); display:flex; align-items:center; gap:10px;"><i class="bi bi-lightbulb-fill"></i> TIPS CLAVE: ${cat.toUpperCase()}</h3>
            <ul style="padding-left:20px; color:#ddd; margin-top:15px;">
                ${guide.tips.map(t => `<li style="margin-bottom:8px;">${t}</li>`).join('')}
            </ul>
        </div>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:25px;">
            <div class="glass-panel" style="background:rgba(76, 175, 80, 0.1); padding:20px; border-radius:var(--radius-l); border:1px solid rgba(76, 175, 80, 0.3);">
                <h4 style="color:#4caf50; margin:0 0 15px 0; display:flex; align-items:center; gap:10px;"><i class="bi bi-check-circle-fill"></i> PERMITIDOS</h4>
                <ul style="padding-left:20px; margin:0; font-size:0.95rem;">${guide.allowed.map(t => `<li style="margin-bottom:5px;">${t}</li>`).join('')}</ul>
            </div>
            <div class="glass-panel" style="background:rgba(244, 67, 54, 0.1); padding:20px; border-radius:var(--radius-l); border:1px solid rgba(244, 67, 54, 0.3);">
                <h4 style="color:#f44336; margin:0 0 15px 0; display:flex; align-items:center; gap:10px;"><i class="bi bi-x-circle-fill"></i> A EVITAR</h4>
                <ul style="padding-left:20px; margin:0; font-size:0.95rem;">${guide.forbidden.map(t => `<li style="margin-bottom:5px;">${t}</li>`).join('')}</ul>
            </div>
        </div>

        <h3 style="margin-bottom:20px;">🔄 Sustituciones Inteligentes</h3>
        <div class="grid-container">
            ${guide.replacements.map(r => `
                <div class="card glass-panel" style="padding:15px;">
                    <small style="color:#888">Si no tienes...</small>
                    <div style="color:var(--brand-red); font-weight:bold; font-size:1.1rem; margin-bottom:5px;">${r.original}</div>
                    <small style="color:#888">Usa esto:</small>
                    <div style="color:#4caf50; font-weight:bold; font-size:1.1rem;">${r.substitute}</div>
                </div>
            `).join('')}
        </div>
    `;
    container.innerHTML = html;
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if(!userData.dietHistory || userData.dietHistory.length === 0) {
        list.innerHTML = "<p class='card'>No hay historial previo.</p>";
        return;
    }
    list.innerHTML = userData.dietHistory.map(h => `
        <div class="card">
            <small style="color:var(--brand-red)">${h.date}</small>
            <h3>${h.name}</h3>
            <span class="status-badge" style="background:#333; align-self:flex-start;">${h.category}</span>
        </div>
    `).join('');
}

window.sendAthleteNote = async () => {
    const txt = document.getElementById('athleteNoteInput').value;
    if(!txt) return;
    await addDoc(collection(db, "notas"), {
        uid: currentUser.uid, author: userData.alias, text: txt, date: new Date().toLocaleString(), read: false
    });
    document.getElementById('athleteNoteInput').value = "";
    alert("Nota enviada.");
    renderNotesHistory();
};

async function renderNotesHistory() {
    const q = query(collection(db, "notas"), where("uid", "==", currentUser.uid), orderBy("date", "desc"));
    const snap = await getDocs(q);
    document.getElementById('myNotesHistory').innerHTML = snap.docs.map(d => `
        <div class="card glass-panel" style="padding:15px; margin-bottom:10px;">
            <small style="color:#666">${d.data().date}</small>
            <p style="margin:5px 0; color:#ddd;">${d.data().text}</p>
        </div>
    `).join('');
}

// ==========================================
// 4. BUZÓN ADMIN (Inbox)
// ==========================================
async function renderInbox() {
    const list = document.getElementById('inbox-list');
    list.innerHTML = '<div class="loading-spinner">Cargando mensajes...</div>';
    const q = query(collection(db, "notas"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    
    list.innerHTML = snap.docs.map(doc => {
        const n = doc.data();
        const unreadClass = !n.read ? 'unread' : '';
        return `
        <div class="card ${unreadClass}" style="margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <strong style="color:var(--brand-red); font-size:1.1rem;">${n.author}</strong>
                <small style="color:#666">${n.date}</small>
            </div>
            <p style="font-size:1rem; color:#eee;">${n.text}</p>
            ${!n.read ? `<button class="btn-primary" onclick="markRead('${doc.id}')" style="padding:8px 15px; font-size:0.8rem; align-self:flex-start; margin-top:10px;"><i class="bi bi-check2-all"></i> Marcar Leído</button>` : '<small style="color:#888; margin-top:10px; display:block;"><i class="bi bi-check2-all"></i> Leído</small>'}
        </div>`;
    }).join('');
}

window.markRead = async (id) => { await updateDoc(doc(db, "notas", id), { read: true }); renderInbox(); };

// ==========================================
// 5. UTILS & VISUALIZADOR COMÚN
// ==========================================
function renderDietVisual(diet, container) {
    let mealsHtml = '';
    const renderOptions = (opts) => opts.map((o,i) => `
        <div class="option-card">
            <div style="color:var(--text-muted); font-size:0.75rem; font-weight:800; margin-bottom:5px; letter-spacing:1px;">OPCIÓN ${String.fromCharCode(65+i)}</div>
            <div style="color:#eee; font-size:0.95rem; line-height:1.5;">${o.desc}</div>
        </div>
    `).join('');

    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section"><h4 class="meal-title"><i class="bi bi-cup-hot-fill" style="margin-right:10px;"></i> Desayuno</h4>${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section"><h4 class="meal-title"><i class="bi bi-egg-fried" style="margin-right:10px;"></i> Comida</h4>${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack) mealsHtml += `<div class="meal-section"><h4 class="meal-title"><i class="bi bi-apple" style="margin-right:10px;"></i> Snack</h4>${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section"><h4 class="meal-title"><i class="bi bi-moon-stars-fill" style="margin-right:10px;"></i> Cena</h4>${renderOptions(diet.plan.dinner)}</div>`;

    const kcalDisplay = diet.isAdLibitum ? 'SACIEDAD (Ad Libitum)' : `${diet.calories} kcal`;

    container.innerHTML = `
        <div class="diet-header-grid">
            <div>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <span class="status-badge" style="background:var(--brand-red);">${diet.category}</span>
                    <span class="status-badge" style="border:1px solid rgba(255,255,255,0.3);">${kcalDisplay}</span>
                </div>
                <h2 style="color:white; margin-bottom:15px; font-size:1.8rem;">${diet.name}</h2>
                <p style="color:#ccc; margin-bottom:25px; font-size:1.05rem; line-height:1.6;">${diet.description}</p>
                
                <div class="hydration-box" style="margin-bottom:20px; display:flex; align-items:center; gap:15px;">
                    <i class="bi bi-droplet-fill" style="font-size:1.5rem;"></i>
                    <div><strong>Hidratación Mañanera:</strong><br>Nada más despertar: 500ml agua + pizca sal + limón.</div>
                </div>
                <div class="warning-box">
                    <strong>⚠️ REGLAS DE ORO:</strong>
                    <ul><li>Pesar en CRUDO.</li><li>Cocinar con Oliva/Coco (el aceite cuenta kcal).</li><li>Prohibidos aceites semillas.</li></ul>
                </div>
            </div>
            
            <div class="glass-panel" style="padding:20px; border-radius:var(--radius-l); text-align:center; display:flex; flex-direction:column; justify-content:center;">
                <h5 style="color:var(--text-muted); margin:0 0 15px 0; letter-spacing:1px;">DISTRIBUCIÓN MACROS</h5>
                <div style="height:160px; position:relative;">
                    <canvas id="macrosChart"></canvas>
                    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-weight:800; font-size:1.2rem; color:white;">
                        ${diet.macros.p}% P<br>${diet.macros.c}% C<br>${diet.macros.f}% G
                    </div>
                </div>
            </div>
        </div>
        ${mealsHtml}
    `;
    
    setTimeout(() => {
        if(currentChart) currentChart.destroy();
        const ctx = document.getElementById('macrosChart');
        currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{ data: [diet.macros.p, diet.macros.c, diet.macros.f], backgroundColor: ['#D32F2F', '#ffffff', '#333333'], borderWidth:0, cutout:'70%' }]
            },
            options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{enabled:false}} }
        });
    }, 100);
}

// Funciones Admin Dietas
window.resetDatabaseManual = async () => {
    if(!currentUser || !isAdmin) return alert("Solo admin.");
    if(!confirm("⚠️ ¿RESETEAR BASE DE DATOS? Se borrarán las dietas actuales.")) return;
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Generando dietas...</div>';
    try {
        const q = await getDocs(collection(db, "diet_templates"));
        const dl = []; q.forEach(d => dl.push(deleteDoc(doc(db, "diet_templates", d.id)))); await Promise.all(dl);
        const ch = 50; for(let i=0; i<dietsDatabase.length; i+=ch) { const chunk = dietsDatabase.slice(i,i+ch); await Promise.all(chunk.map(d => addDoc(collection(db, "diet_templates"), d))); }
        alert("Base de datos actualizada."); loadDietsAdmin(); 
    } catch (e) { alert("Error: " + e.message); }
};
async function loadDietsAdmin() {
    const grid = document.getElementById('diets-grid'); grid.innerHTML = '<div class="loading-spinner">Cargando...</div>';
    const q = await getDocs(collection(db, "diet_templates"));
    allDietsCache = []; q.forEach(d => allDietsCache.push({ firestoreId: d.id, ...d.data() }));
    renderDietsListAdmin(allDietsCache);
}
function renderDietsListAdmin(list) {
    const grid = document.getElementById('diets-grid'); grid.innerHTML = '';
    list.sort((a,b) => (parseInt(a.calories)||9999) - (parseInt(b.calories)||9999));
    list.forEach(d => {
        const card = document.createElement('div'); card.className = 'card';
        const kcalDisplay = d.isAdLibitum ? 'SACIEDAD' : `${d.calories} kcal`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;"><span class="status-badge" style="background:var(--brand-red);">${d.category}</span><span class="status-badge" style="border:1px solid rgba(255,255,255,0.3)">${kcalDisplay}</span></div>
            <h3 style="font-size:1.2rem;">${d.name}</h3> <p>${d.description.substring(0,60)}...</p>
            <button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(d).replace(/'/g, "&apos;")}); openModal("dietViewModal");'><i class="bi bi-eye-fill"></i> Ver Plan</button>
        `;
        grid.appendChild(card);
    });
}
window.filterDiets = () => {
    const term = document.getElementById('searchKcal').value.toLowerCase();
    const filtered = allDietsCache.filter(d => d.name.toLowerCase().includes(term) || (d.calories && d.calories.toString().includes(term)));
    renderDietsListAdmin(filtered);
};

window.toggleSidebar = () => { document.getElementById('sidebar').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active'); };
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
window.openModal = (id) => document.getElementById(id).style.display = 'block';
window.previewDietVisual = previewDietVisual; // Exponer para el onclick del admin