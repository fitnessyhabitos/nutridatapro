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
const ADMIN_EMAIL = "toni@nutridatapro.es"; // <--- TU EMAIL

// AUTH & INIT
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
            else { if(isAdmin)initAdminDashboard(); else alert("Perfil no encontrado"); }
        }
    } else {
        currentUser=null; isAdmin=false;
        ['adminNav','athleteNav','adminView','athleteView'].forEach(id=>document.getElementById(id).style.display='none');
        document.getElementById('authContainer').innerHTML = `<button onclick="openModal('loginModal')" class="btn-primary" style="width:100%">Acceder</button>`;
    }
});

// LOGIN/REGISTER HANDLERS
document.getElementById('loginForm').addEventListener('submit', async(e)=>{e.preventDefault(); try{await signInWithEmailAndPassword(auth,document.getElementById('loginEmail').value,document.getElementById('loginPass').value);}catch(e){alert(e.message);}});
document.getElementById('registerForm').addEventListener('submit', async(e)=>{e.preventDefault(); try{const c=await createUserWithEmailAndPassword(auth,document.getElementById('regEmail').value,document.getElementById('regPass').value); await setDoc(doc(db,"clientes",c.user.uid),{name:document.getElementById('regName').value, alias:document.getElementById('regAlias').value, email:document.getElementById('regEmail').value, goal:"General", currentDietName:null, dietHistory:[]}); alert("Creado.");}catch(e){alert(e.message);}});
window.logoutApp=()=>signOut(auth);
window.toggleAuthMode=()=>{const l=document.getElementById('loginBox'), r=document.getElementById('registerBox'); l.style.display=l.style.display==='none'?'block':'none'; r.style.display=r.style.display==='none'?'block':'none';};

// ADMIN DASHBOARD
function initAdminDashboard() {
    document.getElementById('adminNav').style.display = 'block';
    showAdminSection('clients');
    // Botón Manual
    const toolbar = document.querySelector('#diets-section .toolbar');
    if(!document.getElementById('btnManualDiet')){
        const btn = document.createElement('button');
        btn.id = 'btnManualDiet'; btn.className = 'btn-primary'; btn.innerHTML = '<i class="bi bi-plus-circle"></i> Crear Manual';
        btn.onclick = () => openModal('manualDietModal');
        toolbar.appendChild(btn);
    }
}
window.showAdminSection = (id) => {
    document.getElementById('adminView').style.display='block'; document.getElementById('athleteView').style.display='none';
    ['clients','diets','inbox'].forEach(s=>document.getElementById(s+'-section').style.display='none');
    document.getElementById(id+'-section').style.display='block';
    if(id==='clients') renderClientsAdmin(); if(id==='diets') loadDietsAdmin(); if(id==='inbox') renderInbox();
};

// CREAR DIETA MANUAL
window.createManualDiet = async (e) => {
    e.preventDefault();
    const name = document.getElementById('mdName').value;
    const kcal = document.getElementById('mdKcal').value;
    const cat = document.getElementById('mdCat').value;
    // Construir objeto dieta manual simple
    const manualDiet = {
        name, category: cat, calories: kcal, mealsPerDay: 3, 
        isAdLibitum: false, description: "Dieta personalizada manual.",
        macros: {p:30,c:40,f:30},
        plan: {
            breakfast: [{title:"Opción Única", desc: document.getElementById('mdBreakfast').value}],
            lunch: [{title:"Opción Única", desc: document.getElementById('mdLunch').value}],
            dinner: [{title:"Opción Única", desc: document.getElementById('mdDinner').value}]
        }
    };
    await addDoc(collection(db, "diet_templates"), manualDiet);
    closeModal('manualDietModal'); alert("Dieta manual guardada."); loadDietsAdmin();
};

// VISUALIZADOR DE DIETA (KCAL POR COMIDA + REGLAS)
window.previewDietVisual = (diet) => {
    const container = document.getElementById('diet-detail-content');
    const chartId = `chart-${Math.random().toString(36).substr(2,9)}`;
    const kcalDisplay = diet.isAdLibitum ? 'SACIEDAD' : `${diet.calories} kcal`;
    const guide = dietGuides[diet.category] || dietGuides["Volumen"];

    // Calcular Kcal por comida (Estimado)
    const totalKcal = parseInt(diet.calories) || 2000;
    const mealsCount = diet.mealsPerDay || 3;
    const bkKcal = Math.round(totalKcal * 0.25);
    const lnKcal = Math.round(totalKcal * 0.40);
    const snKcal = Math.round(totalKcal * 0.10);
    const dnKcal = Math.round(totalKcal * 0.25);

    let mealsHtml = '';
    const renderOptions = (opts) => opts.map((o,i) => `
        <div class="option-card">
            <div style="color:var(--text-muted); font-size:0.75rem; font-weight:800; margin-bottom:5px;">OPCIÓN ${String.fromCharCode(65+i)}</div>
            <div style="color:#eee; font-size:0.95rem;">${o.desc}</div>
        </div>`).join('');
    
    // Función para cabecera de comida
    const mealHeader = (icon, title, kc) => `<h4 class="meal-title"><span><i class="${icon}"></i> ${title}</span> <span class="meal-kcal">${diet.isAdLibitum?'':kc+' kcal'}</span></h4>`;

    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section">${mealHeader('bi-cup-hot-fill','Desayuno',bkKcal)}${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section">${mealHeader('bi-egg-fried','Comida',lnKcal)}${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack) mealsHtml += `<div class="meal-section">${mealHeader('bi-apple','Snack',snKcal)}${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section">${mealHeader('bi-moon-stars-fill','Cena',dnKcal)}${renderOptions(diet.plan.dinner)}</div>`;

    container.innerHTML = `
        <div class="diet-header-grid">
            <div>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <span class="status-badge" style="background:var(--brand-red);">${diet.category}</span>
                    <span class="status-badge" style="border:1px solid #555;">${kcalDisplay}</span>
                    <span class="status-badge" style="background:#333;">${diet.mealsPerDay} COMIDAS</span>
                </div>
                <h2 style="color:white; margin-bottom:15px;">${diet.name}</h2>
                <div class="warning-box">
                    <strong>⚠️ REGLAS DE ORO:</strong>
                    <ul>
                        <li>🚫 NO picar entre horas.</li>
                        <li>🚫 EVITAR leche en café (Pico Insulina).</li>
                        <li>Pesar todo en CRUDO.</li>
                    </ul>
                </div>
            </div>
            <div class="glass-panel" style="padding:15px; border-radius:16px; text-align:center; min-height:220px;">
                <h5 style="color:#aaa; margin-bottom:10px;">MACROS</h5>
                <div style="height:180px;"><canvas id="${chartId}"></canvas></div>
            </div>
        </div>
        ${mealsHtml}
    `;

    // Render Chart
    setTimeout(() => {
        const ctx = document.getElementById(chartId);
        if(ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [diet.macros.p, diet.macros.c, diet.macros.f],
                        backgroundColor: ['#D32F2F', '#ffffff', '#333333'],
                        borderWidth: 0
                    }]
                },
                options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:true, position:'bottom', labels:{color:'#ccc'}}}, cutout:'60%' }
            });
        }
    }, 250);
}

// RESET DB
window.resetDatabaseManual = async () => {
    if(!isAdmin) return;
    if(!confirm("⚠️ Se borrarán TODAS las dietas y se generarán las nuevas (+100).")) return;
    const grid = document.getElementById('diets-grid'); grid.innerHTML = '<div class="loading-spinner">Generando...</div>';
    try {
        const q = await getDocs(collection(db,"diet_templates"));
        const delP = []; q.forEach(d=>delP.push(deleteDoc(doc(db,"diet_templates",d.id)))); await Promise.all(delP);
        const batchSize=50; for(let i=0; i<dietsDatabase.length; i+=batchSize){ const chunk=dietsDatabase.slice(i,i+batchSize); await Promise.all(chunk.map(d=>addDoc(collection(db,"diet_templates"),d))); }
        alert("¡Actualizado!"); loadDietsAdmin();
    } catch(e) { alert("Error: "+e.message); }
};

// ... RESTO DE FUNCIONES (loadDietsAdmin, renderClientsAdmin, etc) ... 
// (Copia las del paso anterior, no han cambiado, solo previewDietVisual y la lógica de Manual)
async function loadDietsAdmin() { const g=document.getElementById('diets-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"diet_templates")); window.allDietsCache=[]; q.forEach(d=>window.allDietsCache.push({firestoreId:d.id,...d.data()})); renderDietsListAdmin(window.allDietsCache); }
function renderDietsListAdmin(list) { const g=document.getElementById('diets-grid'); g.innerHTML=''; list.sort((a,b)=>(parseInt(a.calories)||9999)-(parseInt(b.calories)||9999)); list.forEach(d=>{ let color='#333'; if(d.category==='Déficit')color='#D32F2F'; if(d.category==='Volumen')color='#2E7D32'; if(d.category==='Salud')color='#F57C00'; if(d.category==='Senior')color='#0288D1'; g.innerHTML+=`<div class="card"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span class="status-badge" style="background:${color}">${d.category}</span><span class="status-badge" style="border:1px solid #555">${d.isAdLibitum?'SACIEDAD':d.calories+' kcal'}</span></div><h3>${d.name}</h3><div style="font-size:0.8rem; color:#888; margin-bottom:10px;"><i class="bi bi-egg-fried"></i> ${d.mealsPerDay} Comidas</div><button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(d).replace(/'/g,"&apos;")}); openModal("dietViewModal");'><i class="bi bi-eye"></i> Ver</button></div>`; }); }
async function renderClientsAdmin(){ const g=document.getElementById('clients-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"clientes")); g.innerHTML=''; q.forEach(d=>{const c=d.data(); g.innerHTML+=`<div class="card"><h3>${c.alias}</h3><p>${c.name}</p><small style="color:#888">Plan: <span style="color:var(--brand-red)">${c.currentDietName||'Ninguno'}</span></small><button class="btn-assign" onclick="openDietAssignModal('${d.id}','${c.alias}')">Asignar</button></div>`;}); }
window.openDietAssignModal=async(id,alias)=>{const n=prompt("Nombre exacto de la dieta:"); if(n){const q=query(collection(db,"diet_templates"),where("name","==",n)); const s=await getDocs(q); if(!s.empty){const d=s.docs[0].data(); await updateDoc(doc(db,"clientes",id),{currentDietName:d.name,currentDietData:d, dietHistory:(await getDoc(doc(db,"clientes",id))).data().dietHistory||[]}); alert("Asignada"); renderClientsAdmin();}else alert("No encontrada");}};
window.filterDiets=()=>{const t=document.getElementById('searchKcal').value.toLowerCase(); renderDietsListAdmin(window.allDietsCache.filter(d=>d.name.toLowerCase().includes(t)||d.calories.toString().includes(t)));};

window.toggleSidebar=()=>{document.getElementById('sidebar').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active');};
window.closeModal=(id)=>document.getElementById(id).style.display='none';
window.openModal=(id)=>document.getElementById(id).style.display='block';
// INBOX
async function renderInbox() { const l=document.getElementById('inbox-list'); l.innerHTML='Cargando...'; const q=query(collection(db,"notas"),orderBy("date","desc")); const s=await getDocs(q); l.innerHTML=s.docs.map(d=>{const n=d.data(); return `<div class="card" style="margin-bottom:10px; border-left:4px solid ${n.read?'#333':'var(--brand-red)'}"><strong>${n.author}</strong><p>${n.text}</p>${!n.read?`<button class="btn-primary" onclick="markRead('${d.id}')" style="padding:5px 10px; font-size:0.7rem">Leído</button>`:''}</div>`}).join(''); }
window.markRead=async(id)=>{await updateDoc(doc(db,"notas",id),{read:true}); renderInbox();};
// ATHLETE
function initAthleteDashboard(){document.getElementById('athleteNav').style.display='block'; document.getElementById('athleteGreeting').innerText=`Hola, ${userData.alias}`; showAthleteSection('myPlan');}
window.showAthleteSection=(id)=>{document.getElementById('athleteView').style.display='block'; ['myPlan','education','history','notes'].forEach(s=>document.getElementById(s+'-section').style.display='none'); document.getElementById(id+'-section').style.display='block'; if(id==='myPlan') renderMyPlan();};
function renderMyPlan(){const c=document.getElementById('myCurrentDietContainer'); if(!userData.currentDietData){c.innerHTML='<div class="warning-box">Sin plan.</div>';return;} previewDietVisual(userData.currentDietData);}