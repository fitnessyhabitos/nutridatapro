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

let currentUser = null;
let userData = null;
let isAdmin = false;
let currentChart = null;

// 👇 PON TU EMAIL AQUÍ 👇
const ADMIN_EMAIL = "toni@nutridatapro.es"; 

// ... (El bloque de autenticación onAuthStateChanged y Logins se mantiene igual) ...
// Para ahorrar espacio, asumo que copiaste el anterior. Si necesitas el archivo entero, dímelo.
// VOY DIRECTO A LAS FUNCIONES QUE NECESITAN ARREGLO (GRÁFICO Y RENDERIZADO)

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Normalizamos el email para evitar errores de mayúsculas
        isAdmin = (user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim());
        
        document.getElementById('authContainer').innerHTML = `<button onclick="logoutApp()" class="btn-danger" style="width:100%">Salir</button>`;
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
                if(!isAdmin) alert("Error: Perfil no encontrado.");
                else initAdminDashboard();
            }
        }
    } else {
        currentUser = null; isAdmin = false;
        document.getElementById('adminNav').style.display = 'none';
        document.getElementById('athleteNav').style.display = 'none';
        document.getElementById('adminView').style.display = 'none';
        document.getElementById('athleteView').style.display = 'none';
        document.getElementById('authContainer').innerHTML = `<button onclick="openModal('loginModal')" class="btn-primary" style="width:100%">Acceder</button>`;
    }
});

// ... (Listeners de Login y Registro iguales que antes) ...
document.getElementById('loginForm').addEventListener('submit', async (e) => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, document.getElementById('loginEmail').value, document.getElementById('loginPass').value); } catch (e) { alert(e.message); } });
document.getElementById('registerForm').addEventListener('submit', async (e) => { e.preventDefault(); try { const c = await createUserWithEmailAndPassword(auth, document.getElementById('regEmail').value, document.getElementById('regPass').value); await setDoc(doc(db,"clientes",c.user.uid),{name:document.getElementById('regName').value, alias:document.getElementById('regAlias').value, email:document.getElementById('regEmail').value, goal:"General", currentDietName:null, dietHistory:[]}); alert("Cuenta creada."); } catch (e) { alert(e.message); } });
window.logoutApp = () => signOut(auth);
window.toggleAuthMode = () => { const l=document.getElementById('loginBox'), r=document.getElementById('registerBox'); l.style.display=l.style.display==='none'?'block':'none'; r.style.display=r.style.display==='none'?'block':'none'; };

// DASHBOARD ADMIN
function initAdminDashboard() {
    document.getElementById('adminNav').style.display = 'block';
    document.getElementById('athleteNav').style.display = 'none';
    document.getElementById('adminNotifIcon').style.display = 'block';
    showAdminSection('clients');
    const q = query(collection(db, "notas"), where("read", "==", false));
    onSnapshot(q, (s) => { document.getElementById('notifDot').style.display = s.empty?'none':'block'; });
}

window.showAdminSection = (id) => {
    document.getElementById('adminView').style.display = 'block';
    document.getElementById('athleteView').style.display = 'none';
    ['clients','diets','inbox'].forEach(s => document.getElementById(s+'-section').style.display = 'none');
    document.getElementById(id+'-section').style.display = 'block';
    if(id==='clients') renderClientsAdmin();
    if(id==='diets') loadDietsAdmin();
    if(id==='inbox') renderInbox();
};

// ... (renderClientsAdmin, openDietAssignModal... iguales que antes) ...
async function renderClientsAdmin() { /* Copiar del anterior */ const g=document.getElementById('clients-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"clientes")); g.innerHTML=''; q.forEach(d=>{const c=d.data(); g.innerHTML+=`<div class="card"><h3>${c.alias}</h3><p>${c.name}</p><small style="color:#888">Plan: <span style="color:var(--brand-red)">${c.currentDietName||'Ninguno'}</span></small><button class="btn-assign" onclick="openDietAssignModal('${d.id}','${c.alias}')">Asignar</button></div>`;}); }
window.openDietAssignModal = async (id, alias) => { const n=prompt(`Asignar a ${alias}. Nombre exacto:`); if(n){ const q=query(collection(db,"diet_templates"),where("name","==",n)); const s=await getDocs(q); if(!s.empty){ const d=s.docs[0].data(); const r=doc(db,"clientes",id); const c=await getDoc(r); const h=c.data().dietHistory||[]; h.unshift({name:d.name, date:new Date().toLocaleDateString(), category:d.category}); await updateDoc(r,{currentDietName:d.name, currentDietData:d, dietHistory:h}); alert("Asignada."); renderClientsAdmin(); }else alert("No encontrada."); } };

// DASHBOARD ATLETA
function initAthleteDashboard() {
    document.getElementById('adminNav').style.display = 'none';
    document.getElementById('athleteNav').style.display = 'block';
    document.getElementById('athleteGreeting').innerText = `Hola, ${userData.alias}`;
    showAthleteSection('myPlan');
}
window.showAthleteSection = (id) => {
    document.getElementById('adminView').style.display = 'none';
    document.getElementById('athleteView').style.display = 'block';
    ['myPlan','education','history','notes'].forEach(s => document.getElementById(s+'-section').style.display = 'none');
    document.getElementById(id+'-section').style.display = 'block';
    if(id==='myPlan') renderMyPlan();
    if(id==='education') renderEducation(); // (Mantener función renderEducation del script anterior)
    if(id==='history') renderHistory(); // (Mantener función renderHistory del script anterior)
    if(id==='notes') renderNotesHistory(); // (Mantener función renderNotesHistory del script anterior)
};
// ... (Funciones auxiliares renderMyPlan, renderEducation, etc. iguales) ...
function renderMyPlan() { const c=document.getElementById('myCurrentDietContainer'); if(!userData.currentDietData){c.innerHTML='<div class="warning-box">Sin plan activo.</div>'; return;} renderDietVisual(userData.currentDietData, c); }
// ... (Asegúrate de tener renderEducation, renderHistory, sendAthleteNote, renderNotesHistory definidos abajo) ...
// (Por brevedad, asumo que los tienes. Si no, pídemelos).

// ==========================================
// RENDERIZADO VISUAL & GRÁFICO (CORREGIDO)
// ==========================================
window.previewDietVisual = (diet) => {
    const container = document.getElementById('diet-detail-content');
    
    // Generar ID único para el gráfico para evitar colisiones
    const chartId = `chart-${Math.random().toString(36).substr(2, 9)}`;
    
    let mealsHtml = '';
    const renderOptions = (opts) => opts.map((o,i) => `
        <div class="option-card">
            <div style="color:var(--text-muted); font-size:0.75rem; font-weight:800; margin-bottom:5px;">OPCIÓN ${String.fromCharCode(65+i)}</div>
            <div style="color:#eee; font-size:0.95rem;">${o.desc}</div>
        </div>
    `).join('');

    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Desayuno</h4>${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Comida</h4>${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Snack</h4>${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section"><h4 class="meal-title">Cena</h4>${renderOptions(diet.plan.dinner)}</div>`;

    container.innerHTML = `
        <div class="diet-header-grid">
            <div>
                <h2 style="color:white; font-size:1.6rem; margin-bottom:15px;">${diet.name}</h2>
                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    <span class="status-badge" style="background:var(--brand-red);">${diet.category}</span>
                    <span class="status-badge" style="border:1px solid #555;">${diet.isAdLibitum ? 'SACIEDAD' : diet.calories + ' kcal'}</span>
                </div>
                <p style="color:#ccc; margin-bottom:20px;">${diet.description}</p>
            </div>
            
            <div class="glass-panel" style="padding:20px; border-radius:16px; text-align:center; min-height:200px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <h5 style="color:#aaa; margin-bottom:10px;">MACROS</h5>
                <div style="position:relative; height:150px; width:150px;">
                    <canvas id="${chartId}"></canvas>
                </div>
            </div>
        </div>
        ${mealsHtml}
    `;

    // DIBUJAR GRÁFICO (Con retraso para asegurar que el DOM existe)
    setTimeout(() => {
        const ctx = document.getElementById(chartId);
        if(ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Prot', 'Carb', 'Grasa'],
                    datasets: [{
                        data: [diet.macros.p, diet.macros.c, diet.macros.f],
                        backgroundColor: ['#D32F2F', '#ffffff', '#333333'],
                        borderWidth: 0,
                        cutout: '75%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    animation: { animateScale: true }
                }
            });
        }
    }, 200); // 200ms de margen
}

// RESET DB (Masivo)
window.resetDatabaseManual = async () => {
    if(!isAdmin) return alert("Solo admin.");
    if(!confirm("⚠️ Se borrarán todas las dietas y se crearán +130 nuevas. ¿Seguro?")) return;
    
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Generando dietas (puede tardar)...</div>';
    
    try {
        const q = await getDocs(collection(db, "diet_templates"));
        const delPromises = [];
        q.forEach(d => delPromises.push(deleteDoc(doc(db, "diet_templates", d.id))));
        await Promise.all(delPromises);

        const batchSize = 50;
        for (let i = 0; i < dietsDatabase.length; i += batchSize) {
            const chunk = dietsDatabase.slice(i, i + batchSize);
            await Promise.all(chunk.map(d => addDoc(collection(db, "diet_templates"), d)));
        }
        alert("¡Base de datos actualizada con éxito!");
        loadDietsAdmin();
    } catch(e) { alert("Error: " + e.message); }
};

// RENDERIZADO DE LISTA (Con colores)
async function loadDietsAdmin() {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Cargando...</div>';
    const q = await getDocs(collection(db, "diet_templates"));
    window.allDietsCache = [];
    q.forEach(d => window.allDietsCache.push({ firestoreId: d.id, ...d.data() }));
    renderDietsListAdmin(window.allDietsCache);
}

function renderDietsListAdmin(list) {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '';
    list.sort((a,b) => (parseInt(a.calories)||9999) - (parseInt(b.calories)||9999));

    list.forEach(d => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let color = '#333';
        if(d.category === 'Déficit') color = '#D32F2F'; // Rojo
        if(d.category === 'Volumen') color = '#2E7D32'; // Verde
        if(d.category === 'Salud') color = '#F57C00';   // Naranja
        if(d.category === 'Senior') color = '#0288D1';  // Azul

        const kcalDisplay = d.isAdLibitum ? 'SACIEDAD' : `${d.calories} kcal`;
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <span class="status-badge" style="background:${color}; color:white;">${d.category}</span>
                <span class="status-badge" style="border:1px solid rgba(255,255,255,0.3)">${kcalDisplay}</span>
            </div>
            <h3 style="font-size:1.2rem;">${d.name}</h3>
            <p>${d.description ? d.description.substring(0,50) : ''}...</p>
            <button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(d).replace(/'/g, "&apos;")}); openModal("dietViewModal");'>
                <i class="bi bi-eye-fill"></i> Ver Plan
            </button>
        `;
        grid.appendChild(card);
    });
}

// Filtro
window.filterDiets = () => {
    const term = document.getElementById('searchKcal').value.toLowerCase();
    const filtered = window.allDietsCache.filter(d => d.name.toLowerCase().includes(term) || (d.calories && d.calories.toString().includes(term)));
    renderDietsListAdmin(filtered);
};

// Utils UI
window.toggleSidebar = () => { document.getElementById('sidebar').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active'); };
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
window.openModal = (id) => document.getElementById(id).style.display = 'block';