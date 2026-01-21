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
// CAMBIA ESTO POR TU EMAIL
const ADMIN_EMAIL = "toni@nutridatapro.es"; 

// --- AUTH ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        isAdmin = (user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim());
        document.getElementById('authContainer').innerHTML = `<button onclick="logoutApp()" class="btn-danger" style="width:100%">Salir</button>`;
        closeModal('loginModal');
        if (isAdmin) initAdminDashboard();
        else {
            const snap = await getDoc(doc(db,"clientes",user.uid));
            if(snap.exists()){ userData=snap.data(); initAthleteDashboard(); }
            else { if(isAdmin) initAdminDashboard(); else alert("Perfil no encontrado."); }
        }
    } else {
        currentUser=null; isAdmin=false;
        ['adminNav','athleteNav','adminView','athleteView','adminNotifIcon'].forEach(id=>document.getElementById(id).style.display='none');
        document.getElementById('authContainer').innerHTML = `<button onclick="openModal('loginModal')" class="btn-primary" style="width:100%">Acceder</button>`;
    }
});

// LOGIN & REGISTER
document.getElementById('loginForm').addEventListener('submit', async(e)=>{e.preventDefault(); try{await signInWithEmailAndPassword(auth,document.getElementById('loginEmail').value,document.getElementById('loginPass').value);}catch(err){alert(err.message);}});
document.getElementById('registerForm').addEventListener('submit', async(e)=>{e.preventDefault(); try{const c=await createUserWithEmailAndPassword(auth,document.getElementById('regEmail').value,document.getElementById('regPass').value); await setDoc(doc(db,"clientes",c.user.uid),{name:document.getElementById('regName').value, alias:document.getElementById('regAlias').value, email:document.getElementById('regEmail').value, goal:"General", currentDietName:null, dietHistory:[]}); alert("Cuenta creada.");}catch(err){alert(err.message);}});
window.logoutApp=()=>signOut(auth);
window.toggleAuthMode=()=>{const l=document.getElementById('loginBox'), r=document.getElementById('registerBox'); l.style.display=l.style.display==='none'?'block':'none'; r.style.display=r.style.display==='none'?'block':'none';};

// --- VISUALIZADOR DE DIETA (CORAZÓN DE LA APP) ---
window.previewDietVisual = (diet) => {
    const container = document.getElementById('diet-detail-content');
    const chartId = `chart-${Math.random().toString(36).substr(2,9)}`;
    const kcalDisplay = diet.isAdLibitum ? 'SACIEDAD' : `${diet.calories} kcal`;
    
    // Obtener guía educativa
    const guide = dietGuides[diet.category] || dietGuides["Volumen"];

    // HTML Comidas
    let mealsHtml = '';
    const renderOptions = (opts) => opts.map((o,i) => `
        <div class="option-card">
            <div style="color:var(--text-muted); font-size:0.75rem; font-weight:800; margin-bottom:5px;">OPCIÓN ${String.fromCharCode(65+i)}</div>
            <div style="color:#eee; font-size:0.95rem; line-height:1.5;">${o.desc}</div>
        </div>`).join('');
    
    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section"><h4 class="meal-title"><i class="bi bi-cup-hot-fill"></i> Desayuno</h4>${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section"><h4 class="meal-title"><i class="bi bi-egg-fried"></i> Comida</h4>${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack) mealsHtml += `<div class="meal-section"><h4 class="meal-title"><i class="bi bi-apple"></i> Snack</h4>${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section"><h4 class="meal-title"><i class="bi bi-moon-stars-fill"></i> Cena</h4>${renderOptions(diet.plan.dinner)}</div>`;

    // HTML Completo
    container.innerHTML = `
        <div class="diet-header-grid">
            <div>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <span class="status-badge" style="background:var(--brand-red);">${diet.category}</span>
                    <span class="status-badge" style="border:1px solid rgba(255,255,255,0.3);">${kcalDisplay}</span>
                </div>
                <h2 style="color:white; margin-bottom:10px; font-size:1.6rem;">${diet.name}</h2>
                <p style="color:#ccc; font-size:0.95rem; margin-bottom:20px;">${guide.benefit || diet.description}</p>
                
                <div class="hydration-box" style="margin-bottom:15px;">
                    💧 <strong>Despertar:</strong> 500ml agua + pizca sal + limón.
                </div>
                <div class="warning-box">
                    <strong>⚠️ AVISO IMPORTANTE:</strong>
                    <ul><li>Pesar en CRUDO (Arroz, Pasta, Carne).</li><li>El Aceite cuenta: Mídelo con cuchara.</li></ul>
                </div>
            </div>
            
            <div class="glass-panel" style="padding:15px; border-radius:16px; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:220px;">
                <h5 style="color:#aaa; margin-bottom:10px;">MACRONUTRIENTES</h5>
                <div style="height:180px; position:relative;">
                    <canvas id="${chartId}"></canvas>
                </div>
            </div>
        </div>

        ${mealsHtml}

        <div style="margin-top:30px; border-top:1px solid #333; padding-top:20px;">
            <h3 style="color:white; margin-bottom:20px;">📚 Guía del Protocolo</h3>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                <div class="glass-panel" style="padding:15px; border-radius:12px; background:rgba(76, 175, 80, 0.05); border:1px solid rgba(76, 175, 80, 0.3);">
                    <h4 style="color:#4caf50; margin:0 0 10px 0;"><i class="bi bi-check-circle"></i> PRIORIZAR</h4>
                    <ul style="padding-left:20px; font-size:0.9rem; color:#ddd;">${guide.allowed.map(i=>`<li>${i}</li>`).join('')}</ul>
                </div>
                <div class="glass-panel" style="padding:15px; border-radius:12px; background:rgba(244, 67, 54, 0.05); border:1px solid rgba(244, 67, 54, 0.3);">
                    <h4 style="color:#f44336; margin:0 0 10px 0;"><i class="bi bi-x-circle"></i> EVITAR</h4>
                    <ul style="padding-left:20px; font-size:0.9rem; color:#ddd;">${guide.forbidden.map(i=>`<li>${i}</li>`).join('')}</ul>
                </div>
            </div>

            <div class="card" style="margin-top:20px; background:#111;">
                <h4 style="color:var(--brand-red); margin:0 0 10px 0;">💡 TIPS CLAVE</h4>
                <ul style="padding-left:20px; color:#ccc;">${guide.tips.map(t=>`<li style="margin-bottom:5px;">${t}</li>`).join('')}</ul>
            </div>

            <h4 style="margin-top:25px; color:#aaa;">🔄 Sustituciones Inteligentes</h4>
            <div class="grid-container" style="margin-top:10px;">
                ${guide.replacements.map(r => `
                    <div class="card" style="padding:15px; background:#111;">
                        <small style="color:#666">Si no tienes...</small>
                        <div style="color:white; font-weight:bold;">${r.original}</div>
                        <small style="color:#666; margin-top:5px;">Usa esto:</small>
                        <div style="color:#4caf50; font-weight:bold;">${r.substitute}</div>
                    </div>`).join('')}
            </div>
        </div>
    `;

    // Render Chart
    setTimeout(() => {
        const ctx = document.getElementById(chartId);
        if(ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [`Proteína (${diet.macros.p}%)`, `Carbohidratos (${diet.macros.c}%)`, `Grasas (${diet.macros.f}%)`],
                    datasets: [{
                        data: [diet.macros.p, diet.macros.c, diet.macros.f],
                        backgroundColor: ['#D32F2F', '#ffffff', '#424242'],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom', labels: { color: '#ccc', font: { size: 11 }, boxWidth: 12 } },
                        tooltip: { enabled: true }
                    },
                    cutout: '55%' // Más grueso
                }
            });
        }
    }, 250);
}

// --- ADMIN FUNCTIONS ---
window.resetDatabaseManual = async () => {
    if(!isAdmin) return alert("Solo admin");
    if(!confirm("⚠️ Se borrarán TODAS las dietas y se generarán +130 nuevas.")) return;
    const grid = document.getElementById('diets-grid'); grid.innerHTML = '<div class="loading-spinner">Generando...</div>';
    try {
        const q = await getDocs(collection(db,"diet_templates"));
        const delP = []; q.forEach(d=>delP.push(deleteDoc(doc(db,"diet_templates",d.id)))); await Promise.all(delP);
        
        const batchSize=50; 
        for(let i=0; i<dietsDatabase.length; i+=batchSize){
            const chunk=dietsDatabase.slice(i,i+batchSize);
            await Promise.all(chunk.map(d=>addDoc(collection(db,"diet_templates"),d)));
        }
        alert("¡Base de datos actualizada!"); loadDietsAdmin();
    } catch(e) { alert("Error: "+e.message); }
};

function initAdminDashboard() { document.getElementById('adminNav').style.display='block'; showAdminSection('clients'); }
window.showAdminSection = (id) => { document.getElementById('adminView').style.display='block'; ['clients','diets','inbox'].forEach(s=>document.getElementById(s+'-section').style.display='none'); document.getElementById(id+'-section').style.display='block'; if(id==='clients') renderClientsAdmin(); if(id==='diets') loadDietsAdmin(); if(id==='inbox') renderInbox(); };
async function loadDietsAdmin() { const g=document.getElementById('diets-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"diet_templates")); window.allDietsCache=[]; q.forEach(d=>window.allDietsCache.push({firestoreId:d.id,...d.data()})); renderDietsListAdmin(window.allDietsCache); }
function renderDietsListAdmin(list) {
    const g=document.getElementById('diets-grid'); g.innerHTML='';
    list.sort((a,b)=>(parseInt(a.calories)||9999)-(parseInt(b.calories)||9999));
    list.forEach(d=>{
        let color='#333'; if(d.category==='Déficit')color='#D32F2F'; if(d.category==='Volumen')color='#2E7D32'; if(d.category==='Salud')color='#F57C00'; if(d.category==='Senior')color='#0288D1';
        g.innerHTML+=`<div class="card"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span class="status-badge" style="background:${color}">${d.category}</span><span class="status-badge" style="border:1px solid #555">${d.isAdLibitum?'SACIEDAD':d.calories+' kcal'}</span></div><h3>${d.name}</h3><p>${d.description.substring(0,50)}...</p><button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(d).replace(/'/g,"&apos;")}); openModal("dietViewModal");'><i class="bi bi-eye"></i> Ver</button></div>`;
    });
}
async function renderClientsAdmin(){ const g=document.getElementById('clients-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"clientes")); g.innerHTML=''; q.forEach(d=>{const c=d.data(); g.innerHTML+=`<div class="card"><h3>${c.alias}</h3><p>${c.name}</p><small style="color:#888">Plan: <span style="color:var(--brand-red)">${c.currentDietName||'Ninguno'}</span></small><button class="btn-assign" onclick="openDietAssignModal('${d.id}','${c.alias}')">Asignar</button></div>`;}); }
window.openDietAssignModal=async(id,alias)=>{const n=prompt("Nombre exacto de la dieta:"); if(n){const q=query(collection(db,"diet_templates"),where("name","==",n)); const s=await getDocs(q); if(!s.empty){const d=s.docs[0].data(); await updateDoc(doc(db,"clientes",id),{currentDietName:d.name,currentDietData:d, dietHistory:(await getDoc(doc(db,"clientes",id))).data().dietHistory||[]}); alert("Asignada"); renderClientsAdmin();}else alert("No encontrada");}};
window.filterDiets=()=>{const t=document.getElementById('searchKcal').value.toLowerCase(); renderDietsListAdmin(window.allDietsCache.filter(d=>d.name.toLowerCase().includes(t)||d.calories.toString().includes(t)));};

// --- ATLETA ---
function initAthleteDashboard(){document.getElementById('athleteNav').style.display='block'; document.getElementById('athleteGreeting').innerText=`Hola, ${userData.alias}`; showAthleteSection('myPlan');}
window.showAthleteSection=(id)=>{document.getElementById('athleteView').style.display='block'; ['myPlan','education','history','notes'].forEach(s=>document.getElementById(s+'-section').style.display='none'); document.getElementById(id+'-section').style.display='block'; if(id==='myPlan'){const c=document.getElementById('myCurrentDietContainer'); if(userData.currentDietData) previewDietVisual(userData.currentDietData); else c.innerHTML='<div class="warning-box">Sin plan activo.</div>';} };

// Utils
window.toggleSidebar=()=>{document.getElementById('sidebar').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active');};
window.closeModal=(id)=>document.getElementById(id).style.display='none';
window.openModal=(id)=>document.getElementById(id).style.display='block';