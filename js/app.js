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

// =========================================================
// ⚠️ ATENCIÓN: PON AQUÍ TU EMAIL DE ADMINISTRADOR EXACTO
// =========================================================
const ADMIN_EMAIL = "toni@nutridatapro.es"; // <--- CAMBIA ESTO

// ==========================================
// 1. SISTEMA DE SESIÓN (LOGIN/REGISTRO)
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Comprobación insensible a mayúsculas
        isAdmin = (user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim());
        
        console.log("Usuario logueado:", user.email);
        console.log("Es Admin?:", isAdmin);

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
                // Si entra aquí, es que no es admin y tampoco tiene ficha de atleta
                alert(`⚠️ Atención: Estás logueado como ${user.email} pero no eres Admin ni tienes ficha de atleta.\n\nPara ser Admin, asegúrate de que tu email coincide con la variable ADMIN_EMAIL en app.js.`);
                initAdminDashboard(); // Forzamos vista admin para que puedas ver el error
            }
        }
    } else {
        // RESET UI
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
    
    // Mostrar botones protegidos
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
    
    showAdminSection('clients');
    
    // Escuchar notificaciones
    const q = query(collection(db, "notas"), where("read", "==", false));
    onSnapshot(q, (snapshot) => {
        const dot = document.getElementById('notifDot');
        if(dot) dot.style.display = snapshot.empty ? 'none' : 'block';
    });
}

window.showAdminSection = (id) => {
    document.getElementById('adminView').style.display = 'block';
    document.getElementById('athleteView').style.display = 'none';
    
    ['clients', 'diets', 'inbox'].forEach(s => {
        const el = document.getElementById(s+'-section');
        if(el) el.style.display = 'none';
    });
    
    const target = document.getElementById(id+'-section');
    if(target) target.style.display = 'block';
    
    if(id==='clients') renderClientsAdmin();
    if(id==='diets') loadDietsAdmin();
    if(id==='inbox') renderInbox();
};

// ==========================================
// FUNCIÓN RESET CORREGIDA
// ==========================================
window.resetDatabaseManual = async () => {
    if(!currentUser) return alert("Error: No estás logueado.");
    
    // Comprobación doble
    if(!isAdmin) {
        alert(`NO TIENES PERMISO.\nEmail actual: ${currentUser.email}\nEmail Admin requerido: ${ADMIN_EMAIL}`);
        return;
    }

    if(!confirm("⚠️ ¿ESTÁS SEGURO? \n\nSe borrarán todas las dietas de la base de datos y se subirán las nuevas (+100 variantes).")) return;

    // Feedback visual
    const btn = event.target; 
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading-spinner" style="width:15px; height:15px; border-width:2px;"></span> Trabajando...';
    btn.disabled = true;

    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="card" style="text-align:center;"><h3>🔄 Regenerando Base de Datos...</h3><p>Esto puede tardar unos segundos.</p></div>';

    try {
        // 1. Borrar actuales
        const q = await getDocs(collection(db, "diet_templates"));
        const deletePromises = [];
        q.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, "diet_templates", docSnap.id)));
        });
        await Promise.all(deletePromises);
        console.log(`Borradas ${deletePromises.length} dietas antiguas.`);

        // 2. Subir nuevas (por lotes de 50 para no saturar)
        const batchSize = 50;
        const total = dietsDatabase.length;
        
        for (let i = 0; i < total; i += batchSize) {
            const chunk = dietsDatabase.slice(i, i + batchSize);
            const uploadPromises = chunk.map(diet => addDoc(collection(db, "diet_templates"), diet));
            await Promise.all(uploadPromises);
            console.log(`Subido lote ${i} a ${i+batchSize}`);
        }
        
        alert(`✅ Éxito: Se han cargado ${total} dietas correctamente.`);
        loadDietsAdmin(); // Recargar vista

    } catch (error) {
        console.error("Error en reset:", error);
        alert("❌ Error crítico: " + error.message + "\n\nRevisa la consola (F12) para más detalles.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

async function loadDietsAdmin() {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Cargando biblioteca...</div>';
    
    try {
        const q = await getDocs(collection(db, "diet_templates"));
        let allDietsCache = [];
        q.forEach(doc => allDietsCache.push({ firestoreId: doc.id, ...doc.data() }));
        
        // Hacerla global para el filtro
        window.allDietsCache = allDietsCache;
        renderDietsListAdmin(allDietsCache);
        
    } catch(e) {
        grid.innerHTML = `<p style="color:red">Error cargando dietas: ${e.message}</p>`;
    }
}

function renderDietsListAdmin(list) {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '';
    
    if(list.length === 0) {
        grid.innerHTML = '<p style="padding:20px; color:#aaa;">La base de datos está vacía. Pulsa "Reset DB" para llenarla.</p>';
        return;
    }

    list.sort((a,b) => (parseInt(a.calories)||9999) - (parseInt(b.calories)||9999));

    list.forEach(d => {
        const card = document.createElement('div');
        card.className = 'card';
        const kcalDisplay = d.isAdLibitum ? 'SACIEDAD' : `${d.calories} kcal`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <span class="status-badge" style="background:var(--brand-red);">${d.category}</span>
                <span class="status-badge" style="border:1px solid rgba(255,255,255,0.3)">${kcalDisplay}</span>
            </div>
            <h3 style="font-size:1.2rem;">${d.name}</h3>
            <p>${d.description ? d.description.substring(0,60) : 'Sin descripción'}...</p>
            <button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(d).replace(/'/g, "&apos;")}); openModal("dietViewModal");'>
                <i class="bi bi-eye-fill"></i> Ver Plan
            </button>
        `;
        grid.appendChild(card);
    });
}

// RESTO DE FUNCIONES (CLIENTES, FILTROS, ETC) - Mantén las anteriores o copia esto:

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

window.filterDiets = () => {
    const term = document.getElementById('searchKcal').value.toLowerCase();
    if(!window.allDietsCache) return;
    const filtered = window.allDietsCache.filter(d => d.name.toLowerCase().includes(term) || (d.calories && d.calories.toString().includes(term)));
    renderDietsListAdmin(filtered);
};

// ... (El resto de funciones de atleta initAthleteDashboard, etc. se mantienen igual del código anterior) ...
// Para ahorrar espacio, asumo que las tienes del paso anterior. 
// Si las borraste, avísame y te pego el bloque del dashboard atleta también.

window.toggleSidebar = () => { document.getElementById('sidebar').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active'); };
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
window.openModal = (id) => document.getElementById(id).style.display = 'block';

// Función para renderizar dieta visual (Necesaria para Admin también)
window.previewDietVisual = (diet) => {
    const container = document.getElementById('diet-detail-content');
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
                <div class="hydration-box" style="margin-bottom:20px;">💧 <strong>Despertar:</strong> 500ml agua + sal + limón.</div>
                <div class="warning-box"><strong>⚠️ REGLAS:</strong> Pesar en CRUDO. Usar Aceite Oliva/Coco. Evitar semillas.</div>
            </div>
            <div class="glass-panel" style="padding:20px; border-radius:16px; text-align:center;">
                <h5 style="color:#aaa; margin-bottom:15px;">MACROS</h5>
                <div style="height:160px;"><canvas id="macrosChart"></canvas></div>
            </div>
        </div>
        ${mealsHtml}
    `;
    
    setTimeout(() => {
        if(currentChart) currentChart.destroy();
        const ctx = document.getElementById('macrosChart');
        currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: { datasets: [{ data: [diet.macros.p, diet.macros.c, diet.macros.f], backgroundColor: ['#D32F2F', '#ffffff', '#333333'], borderWidth:0 }] },
            options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} }
        });
    }, 100);
}

// INBOX ADMIN
async function renderInbox() {
    const list = document.getElementById('inbox-list');
    list.innerHTML = '<div class="loading-spinner">Cargando mensajes...</div>';
    const q = query(collection(db, "notas"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    list.innerHTML = snap.docs.map(doc => {
        const n = doc.data();
        const unreadClass = !n.read ? 'border-left:4px solid var(--brand-red); background:rgba(211,47,47,0.1);' : 'border-left:4px solid #333;';
        return `<div class="card" style="margin-bottom:15px; ${unreadClass}">
            <div style="display:flex; justify-content:space-between;"><strong>${n.author}</strong><small>${n.date}</small></div>
            <p>${n.text}</p>
            ${!n.read ? `<button class="btn-primary" onclick="markRead('${doc.id}')" style="padding:5px 10px; font-size:0.7rem; margin-top:10px;">Marcar Leído</button>` : ''}
        </div>`;
    }).join('');
}
window.markRead = async (id) => { await updateDoc(doc(db, "notas", id), { read: true }); renderInbox(); };