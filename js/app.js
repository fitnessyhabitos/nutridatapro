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
const ADMIN_EMAIL = "toni@nutridatapro.es"; // <--- CAMBIA ESTO

// --- AUTH ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        isAdmin = (user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim());
        document.getElementById('authContainer').innerHTML = `<button onclick="logoutApp()" class="btn-primary" style="width:100%; background:rgba(255,255,255,0.1); border:1px solid #555;">Cerrar Sesión</button>`;
        closeModal('loginModal');
        if (isAdmin) initAdminDashboard();
        else {
            const snap = await getDoc(doc(db,"clientes",user.uid));
            if(snap.exists()){ userData=snap.data(); initAthleteDashboard(); }
            else { if(isAdmin)initAdminDashboard(); else alert("Perfil no encontrado."); }
        }
    } else {
        currentUser=null; isAdmin=false;
        ['adminNav','athleteNav','adminView','athleteView','adminNotifIcon'].forEach(id=>document.getElementById(id).style.display='none');
        document.getElementById('authContainer').innerHTML = `<button onclick="openModal('loginModal')" class="btn-primary" style="width:100%">Acceder</button>`;
    }
});

// HANDLERS
document.getElementById('loginForm').addEventListener('submit', async(e)=>{e.preventDefault(); try{await signInWithEmailAndPassword(auth,document.getElementById('loginEmail').value,document.getElementById('loginPass').value);}catch(err){alert(err.message);}});
document.getElementById('registerForm').addEventListener('submit', async(e)=>{e.preventDefault(); try{const c=await createUserWithEmailAndPassword(auth,document.getElementById('regEmail').value,document.getElementById('regPass').value); await setDoc(doc(db,"clientes",c.user.uid),{name:document.getElementById('regName').value, alias:document.getElementById('regAlias').value, email:document.getElementById('regEmail').value, goal:"General", currentDietName:null, dietHistory:[]}); alert("Creado.");}catch(err){alert(err.message);}});
window.logoutApp=()=>signOut(auth);
window.toggleAuthMode=()=>{const l=document.getElementById('loginBox'), r=document.getElementById('registerBox'); l.style.display=l.style.display==='none'?'block':'none'; r.style.display=r.style.display==='none'?'block':'none';};

// --- RENDERIZADO DIETA COMPLETO (VISUAL + TIPS + REGLAS) ---
window.previewDietVisual = (diet) => {
    const container = document.getElementById('diet-detail-content');
    const chartId = `chart-${Math.random().toString(36).substr(2,9)}`;
    const kcalDisplay = diet.isAdLibitum ? 'SACIEDAD' : `${diet.calories} kcal`;
    
    // Obtener Guía Educativa
    const guide = dietGuides[diet.category] || dietGuides["Volumen"];

    // Cálculo Kcal
    const total = parseInt(diet.calories) || 2000;
    const bk = Math.round(total * 0.25);
    const ln = Math.round(total * 0.35);
    const sn = Math.round(total * 0.15);
    const dn = Math.round(total * 0.25);

    let mealsHtml = '';
    const renderOptions = (opts) => opts.map((o,i) => `
        <div class="option-card">
            <div style="color:var(--text-muted); font-size:0.75rem; font-weight:800; margin-bottom:5px;">OPCIÓN ${String.fromCharCode(65+i)}</div>
            <div style="color:#eee; font-size:0.95rem; line-height:1.5;">${o.desc}</div>
        </div>`).join('');
    
    const header = (ico, tit, k) => `<div class="meal-title"><span style="display:flex; gap:10px; align-items:center;"><i class="${ico}"></i> ${tit}</span> <span style="font-size:0.85rem; color:#aaa; font-weight:normal;">${diet.isAdLibitum?'':k+' kcal'}</span></div>`;

    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section">${header('bi-cup-hot-fill','DESAYUNO',bk)}${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section">${header('bi-egg-fried','COMIDA',ln)}${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack) mealsHtml += `<div class="meal-section">${header('bi-apple','SNACK',sn)}${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section">${header('bi-moon-stars-fill','CENA',dn)}${renderOptions(diet.plan.dinner)}</div>`;

    container.innerHTML = `
        <div class="diet-header-grid">
            <div>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <span class="status-badge" style="background:var(--brand-red);">${diet.category}</span>
                    <span class="status-badge" style="border:1px solid rgba(255,255,255,0.3);">${kcalDisplay}</span>
                    <span class="status-badge" style="background:#222;">${diet.mealsPerDay} COMIDAS</span>
                </div>
                <h2 style="color:white; margin-bottom:15px; font-size:1.8rem; line-height:1.2;">${diet.name}</h2>
                <p style="color:#ccc; margin-bottom:20px; font-size:1rem;">${guide.benefit || diet.description}</p>
                
                <div class="hydration-box">
                    <i class="bi bi-droplet-fill" style="font-size:1.5rem;"></i>
                    <div><strong>Al Despertar:</strong><br>500ml agua + pizca sal + limón.</div>
                </div>
            </div>
            
            <div class="glass-panel" style="padding:20px; border-radius:16px; text-align:center; min-height:220px; display:flex; flex-direction:column; justify-content:center;">
                <h5 style="color:#aaa; margin-bottom:15px;">MACROS</h5>
                <div style="height:160px; position:relative;"><canvas id="${chartId}"></canvas></div>
            </div>
        </div>

        ${mealsHtml}

        <h3 style="margin-top:30px; margin-bottom:20px; color:white; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
            <i class="bi bi-journal-text"></i> Guía del Plan
        </h3>

        <div class="warning-box" style="margin-bottom:20px;">
            <strong>⚠️ REGLAS DE ORO:</strong>
            <ul style="padding-left:20px; margin-top:10px; color:#ffcc80;">
                ${guide.tips.map(t => `<li>${t}</li>`).join('')}
                <li>Pesar todo en CRUDO.</li>
            </ul>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
            <div class="glass-panel" style="padding:20px; background:rgba(76, 175, 80, 0.05); border-color:rgba(76, 175, 80, 0.2);">
                <h4 style="color:#66bb6a; margin:0 0 10px 0;"><i class="bi bi-check-circle"></i> PRIORIZAR</h4>
                <ul style="padding-left:20px; color:#ddd;">${guide.allowed.map(i=>`<li>${i}</li>`).join('')}</ul>
            </div>
            <div class="glass-panel" style="padding:20px; background:rgba(244, 67, 54, 0.05); border-color:rgba(244, 67, 54, 0.2);">
                <h4 style="color:#ef5350; margin:0 0 10px 0;"><i class="bi bi-x-circle"></i> EVITAR</h4>
                <ul style="padding-left:20px; color:#ddd;">${guide.forbidden.map(i=>`<li>${i}</li>`).join('')}</ul>
            </div>
        </div>

        <h4 style="margin-top:25px; color:#aaa;">🔄 Sustituciones Inteligentes</h4>
        <div class="tips-grid">
            ${guide.replacements.map(r => `
                <div class="tip-card">
                    <small style="color:#888">Si no tienes...</small>
                    <div style="color:white; font-weight:bold;">${r.original}</div>
                    <small style="color:#888; margin-top:5px; display:block;">Usa esto:</small>
                    <div style="color:#66bb6a; font-weight:bold;">${r.substitute}</div>
                </div>`).join('')}
        </div>
    `;

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
                        borderWidth: 0
                    }]
                },
                options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:true, position:'bottom', labels:{color:'#ccc'}}}, cutout:'65%' }
            });
        }
    }, 250);
}

// RESET DB
window.resetDatabaseManual = async () => {
    if(!isAdmin) return alert("Solo admin");
    if(!confirm("⚠️ Se borrarán TODAS las dietas y se crearán las nuevas (+100).")) return;
    const g=document.getElementById('diets-grid'); g.innerHTML='<div class="loading-spinner">Generando...</div>';
    try {
        const q=await getDocs(collection(db,"diet_templates")); const p=[]; q.forEach(d=>p.push(deleteDoc(doc(db,"diet_templates",d.id)))); await Promise.all(p);
        const bs=50; for(let i=0; i<dietsDatabase.length; i+=bs){ const ch=dietsDatabase.slice(i,i+bs); await Promise.all(ch.map(d=>addDoc(collection(db,"diet_templates"),d))); }
        alert("¡Base de datos actualizada!"); loadDietsAdmin();
    } catch(e) { alert("Error: "+e.message); }
};

// ... RESTO DE FUNCIONES (ADMIN & ATLETA) MANTENER IGUAL QUE ANTES ...
function initAdminDashboard() { document.getElementById('adminNav').style.display='block'; showAdminSection('clients'); const tb = document.querySelector('#diets-section .toolbar'); if(!document.getElementById('btnManual')){ const b=document.createElement('button'); b.id='btnManual'; b.className='btn-primary'; b.innerHTML='<i class="bi bi-plus-lg"></i> Manual'; b.style.marginLeft='10px'; b.onclick=()=>openModal('manualDietModal'); tb.appendChild(b); } }
window.showAdminSection = (id) => { document.getElementById('adminView').style.display='block'; document.getElementById('athleteView').style.display='none'; ['clients','diets','inbox'].forEach(s=>document.getElementById(s+'-section').style.display='none'); document.getElementById(id+'-section').style.display='block'; if(id==='clients')renderClientsAdmin(); if(id==='diets')loadDietsAdmin(); if(id==='inbox')renderInbox(); };
async function loadDietsAdmin() { const g=document.getElementById('diets-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"diet_templates")); window.allDietsCache=[]; q.forEach(d=>window.allDietsCache.push({firestoreId:d.id,...d.data()})); renderDietsListAdmin(window.allDietsCache); }
function renderDietsListAdmin(l) { const g=document.getElementById('diets-grid'); g.innerHTML=''; l.sort((a,b)=>(parseInt(a.calories)||9999)-(parseInt(b.calories)||9999)); l.forEach(d=>{ let c='#333'; if(d.category==='Déficit')c='#D32F2F'; if(d.category==='Volumen')c='#2E7D32'; if(d.category==='Salud')c='#F57C00'; if(d.category==='Senior')c='#0288D1'; g.innerHTML+=`<div class="card"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span class="status-badge" style="background:${c}">${d.category}</span><span class="status-badge" style="border:1px solid #555">${d.isAdLibitum?'SACIEDAD':d.calories+' kcal'}</span></div><h3>${d.name}</h3><p>${d.description.substring(0,50)}...</p><button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(d).replace(/'/g,"&apos;")}); openModal("dietViewModal");'><i class="bi bi-eye"></i> Ver</button></div>`; }); }
async function renderClientsAdmin(){ const g=document.getElementById('clients-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"clientes")); g.innerHTML=''; q.forEach(d=>{const c=d.data(); g.innerHTML+=`<div class="card"><h3>${c.alias}</h3><p>${c.name}</p><small style="color:#888">Plan: <span style="color:var(--brand-red)">${c.currentDietName||'Ninguno'}</span></small><button class="btn-assign" onclick="openDietAssignModal('${d.id}','${c.alias}')">Asignar</button></div>`;}); }
window.openDietAssignModal=async(id,alias)=>{const n=prompt("Nombre exacto:"); if(n){const q=query(collection(db,"diet_templates"),where("name","==",n)); const s=await getDocs(q); if(!s.empty){const d=s.docs[0].data(); await updateDoc(doc(db,"clientes",id),{currentDietName:d.name,currentDietData:d, dietHistory:(await getDoc(doc(db,"clientes",id))).data().dietHistory||[]}); alert("Asignada"); renderClientsAdmin();}else alert("No encontrada");}};
window.filterDiets=()=>{const t=document.getElementById('searchKcal').value.toLowerCase(); renderDietsListAdmin(window.allDietsCache.filter(d=>d.name.toLowerCase().includes(t)||d.calories.toString().includes(t)));};
async function renderInbox() { const l=document.getElementById('inbox-list'); l.innerHTML='Cargando...'; const q=query(collection(db,"notas"),orderBy("date","desc")); const s=await getDocs(q); l.innerHTML=s.docs.map(d=>{const n=d.data(); return `<div class="card" style="margin-bottom:10px; border-left:4px solid ${n.read?'#333':'var(--brand-red)'}"><strong>${n.author}</strong><p>${n.text}</p>${!n.read?`<button class="btn-primary" onclick="markRead('${d.id}')" style="padding:5px; font-size:0.7rem">Leído</button>`:''}</div>`}).join(''); }
window.markRead=async(id)=>{await updateDoc(doc(db,"notas",id),{read:true}); renderInbox();};
function initAthleteDashboard(){document.getElementById('athleteNav').style.display='block'; document.getElementById('athleteGreeting').innerText=`Hola, ${userData.alias}`; showAthleteSection('myPlan');}
window.showAthleteSection=(id)=>{document.getElementById('athleteView').style.display='block'; ['myPlan','education','history','notes'].forEach(s=>document.getElementById(s+'-section').style.display='none'); document.getElementById(id+'-section').style.display='block'; if(id==='myPlan') renderMyPlan();};
function renderMyPlan(){const c=document.getElementById('myCurrentDietContainer'); if(!userData.currentDietData){c.innerHTML='<div class="warning-box">Sin plan.</div>';return;} previewDietVisual(userData.currentDietData);}
window.toggleSidebar=()=>{document.getElementById('sidebar').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active');};
window.closeModal=(id)=>document.getElementById(id).style.display='none';
window.openModal=(id)=>document.getElementById(id).style.display='block';