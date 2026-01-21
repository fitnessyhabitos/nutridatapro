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
let dietToAssign = null;
// 👇 TU EMAIL AQUÍ 👇
const ADMIN_EMAIL = "toni@nutridatapro.es"; 

// --- AUTH ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        isAdmin = (user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim());
        document.getElementById('authContainer').innerHTML = `<button onclick="logoutApp()" class="btn-assign">Cerrar Sesión</button>`;
        closeModal('loginModal');
        if (isAdmin) initAdminDashboard();
        else {
            const snap = await getDoc(doc(db,"clientes",user.uid));
            if(snap.exists()){ userData=snap.data(); initAthleteDashboard(); }
            else if(isAdmin) initAdminDashboard(); 
        }
    } else {
        currentUser=null; isAdmin=false;
        ['adminNav','athleteNav','adminView','athleteView','adminNotifIcon'].forEach(id=>document.getElementById(id).style.display='none');
        document.getElementById('authContainer').innerHTML = `<button onclick="openModal('loginModal')" class="btn-primary">Acceder</button>`;
    }
});

document.getElementById('loginForm').addEventListener('submit', async(e)=>{e.preventDefault(); try{await signInWithEmailAndPassword(auth,document.getElementById('loginEmail').value,document.getElementById('loginPass').value);}catch(err){alert(err.message);}});
document.getElementById('registerForm').addEventListener('submit', async(e)=>{e.preventDefault(); try{const c=await createUserWithEmailAndPassword(auth,document.getElementById('regEmail').value,document.getElementById('regPass').value); await setDoc(doc(db,"clientes",c.user.uid),{name:document.getElementById('regName').value, alias:document.getElementById('regAlias').value, email:document.getElementById('regEmail').value, goal:"General", currentDietName:null, dietHistory:[]}); alert("Creado.");}catch(err){alert(err.message);}});
window.logoutApp=()=>signOut(auth);
window.toggleAuthMode=()=>{const l=document.getElementById('loginBox'), r=document.getElementById('registerBox'); l.style.display=l.style.display==='none'?'block':'none'; r.style.display=r.style.display==='none'?'block':'none';};

// --- CREADOR MANUAL AVANZADO ---
window.createManualDiet = async (e) => {
    e.preventDefault();
    const name = document.getElementById('mdName').value;
    const kcal = document.getElementById('mdKcal').value;
    const cat = document.getElementById('mdCat').value;

    const getOptions = (prefix) => {
        const opts = [];
        const a = document.getElementById(prefix + '_A').value;
        const b = document.getElementById(prefix + '_B').value;
        const c = document.getElementById(prefix + '_C').value;
        if(a) opts.push({ title: "Opción A", desc: a });
        if(b) opts.push({ title: "Opción B", desc: b });
        if(c) opts.push({ title: "Opción C", desc: c });
        if(opts.length === 0) opts.push({ title: "Opción Única", desc: "Según macros." });
        return opts;
    };

    const manualDiet = {
        name, category: cat, calories: kcal, mealsPerDay: 3, isAdLibitum: false, 
        description: "Plan personalizado creado manualmente.",
        macros: {p:30,c:40,f:30}, // Macros default
        plan: {
            breakfast: getOptions('mdBk'),
            lunch: getOptions('mdLn'),
            dinner: getOptions('mdDn'),
            snack: [] 
        }
    };

    try {
        await addDoc(collection(db, "diet_templates"), manualDiet);
        closeModal('manualDietModal'); 
        alert("✅ Dieta manual guardada."); 
        loadDietsAdmin();
    } catch (error) { alert("Error: " + error.message); }
};

// --- VISUALIZADOR DIETA (CON BOTÓN DE ASIGNAR) ---
window.previewDietVisual = (diet) => {
    const container = document.getElementById('diet-detail-content');
    const chartId = `chart-${Math.random().toString(36).substr(2,9)}`;
    const guide = dietGuides[diet.category] || dietGuides["Volumen"];
    const kcalDisplay = diet.isAdLibitum ? 'SACIEDAD' : `${diet.calories} kcal`;

    const total = parseInt(diet.calories) || 2000;
    const bk = Math.round(total * 0.25); const ln = Math.round(total * 0.35); const sn = Math.round(total * 0.15); const dn = Math.round(total * 0.25);

    let mealsHtml = '';
    const renderOptions = (opts) => opts.map((o,i) => `<div class="option-card"><div style="color:var(--text-muted); font-size:0.8rem; font-weight:800; margin-bottom:5px;">OPCIÓN ${String.fromCharCode(65+i)}</div><div style="color:#eee; line-height:1.4;">${o.desc}</div></div>`).join('');
    const header = (ico, tit, k) => `<div class="meal-title"><span style="display:flex; gap:10px; align-items:center;"><i class="${ico}"></i> ${tit}</span> <span style="font-weight:normal; color:#888;">${diet.isAdLibitum?'':k+' kcal'}</span></div>`;

    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section">${header('bi-cup-hot-fill','DESAYUNO',bk)}${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section">${header('bi-egg-fried','COMIDA',ln)}${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack) mealsHtml += `<div class="meal-section">${header('bi-apple','SNACK',sn)}${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section">${header('bi-moon-stars-fill','CENA',dn)}${renderOptions(diet.plan.dinner)}</div>`;

    // BOTÓN ADMIN DE ASIGNAR
    const adminActionBtn = isAdmin ? 
        `<div style="margin-top:40px; padding-top:20px; border-top:1px solid #333;">
            <button class="btn-primary" style="padding:15px; font-size:1.1rem; background:linear-gradient(135deg, #2E7D32, #1B5E20);" onclick='openClientSelector(${JSON.stringify(diet).replace(/'/g, "&apos;")})'>
                <i class="bi bi-person-check-fill"></i> ASIGNAR A UN ATLETA
            </button>
         </div>` : '';

    container.innerHTML = `
        <div class="diet-hero">
            <div>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <span class="status-badge" style="background:var(--brand-red);">${diet.category}</span>
                    <span class="status-badge" style="border:1px solid #555;">${kcalDisplay}</span>
                </div>
                <h1 style="color:white; margin-bottom:10px; font-size:1.8rem; line-height:1.2;">${diet.name}</h1>
                <p style="color:#ccc; margin-bottom:20px;">${guide.benefit || diet.description}</p>
                <div class="hydration-box"><i class="bi bi-droplet-fill"></i><div><strong>Al despertar:</strong><br>500ml agua + pizca sal + limón.</div></div>
            </div>
            <div class="glass-panel" style="padding:20px; border-radius:16px; text-align:center; min-height:220px; display:flex; justify-content:center; align-items:center;">
                <div style="height:160px; width:160px; position:relative;"><canvas id="${chartId}"></canvas></div>
            </div>
        </div>
        ${mealsHtml}
        <h2 style="margin-top:40px; margin-bottom:20px; border-top:1px solid #333; padding-top:20px; color:white;">Guía & Reglas</h2>
        <div class="warning-box"><strong>⚠️ REGLAS:</strong><ul style="padding-left:20px; margin-top:10px; color:#ffcc80;">${guide.tips.map(t=>`<li>${t}</li>`).join('')}<li>Pesar todo en CRUDO.</li></ul></div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-top:20px;">
            <div class="card" style="background:rgba(76, 175, 80, 0.1); border-color:rgba(76, 175, 80, 0.3);"><h4 style="color:#66bb6a; margin:0 0 10px 0;">PRIORIZAR</h4><ul style="padding-left:20px; color:#ddd;">${guide.allowed.map(i=>`<li>${i}</li>`).join('')}</ul></div>
            <div class="card" style="background:rgba(244, 67, 54, 0.1); border-color:rgba(244, 67, 54, 0.3);"><h4 style="color:#ef5350; margin:0 0 10px 0;">EVITAR</h4><ul style="padding-left:20px; color:#ddd;">${guide.forbidden.map(i=>`<li>${i}</li>`).join('')}</ul></div>
        </div>
        ${adminActionBtn}
    `;

    setTimeout(() => {
        const ctx = document.getElementById(chartId);
        if(ctx) new Chart(ctx, { type: 'doughnut', data: { labels: ['Prot', 'Carb', 'Grasa'], datasets: [{ data: [diet.macros.p, diet.macros.c, diet.macros.f], backgroundColor: ['#D32F2F', '#ffffff', '#333333'], borderWidth: 0 }] }, options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:true, position:'bottom', labels:{color:'#ccc'}}}, cutout:'65%' } });
    }, 250);
}

// --- LOGICA DE ASIGNACIÓN ---
window.openClientSelector = async (diet) => {
    dietToAssign = diet; 
    const list = document.getElementById('clientSelectorList');
    list.innerHTML = '<div class="loading-spinner">Cargando atletas...</div>';
    openModal('clientSelectorModal');
    
    const q = await getDocs(collection(db, "clientes"));
    list.innerHTML = '';
    if(q.empty) { list.innerHTML = '<p>No hay atletas registrados.</p>'; return; }

    q.forEach(docSnap => {
        const c = docSnap.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.style.marginBottom = '10px'; card.style.cursor = 'pointer'; card.style.borderLeft = '4px solid #333';
        card.onclick = () => assignDietFromModal(docSnap.id, c.alias);
        card.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><div><h4 style="margin:0; color:white;">${c.alias}</h4><small style="color:#888;">${c.name}</small></div><div style="text-align:right;"><span class="status-badge" style="background:#222;">${c.goal}</span><br><small style="color:var(--brand-red);">${c.currentDietName ? 'Tiene Plan' : 'Sin Plan'}</small></div></div>`;
        list.appendChild(card);
    });
};

window.assignDietFromModal = async (clientId, clientName) => {
    if(!dietToAssign) return;
    if(!confirm(`¿Asignar "${dietToAssign.name}" a ${clientName}?`)) return;
    
    const clientRef = doc(db, "clientes", clientId);
    const clientSnap = await getDoc(clientRef);
    const history = clientSnap.data().dietHistory || [];
    
    history.unshift({ name: dietToAssign.name, date: new Date().toLocaleDateString(), category: dietToAssign.category });
    await updateDoc(clientRef, { currentDietName: dietToAssign.name, currentDietData: dietToAssign, dietHistory: history });
    
    alert(`✅ ¡Plan asignado a ${clientName}!`);
    closeModal('clientSelectorModal'); closeModal('dietViewModal');
};

// ... RESTO DE FUNCIONES (ADMIN/RESET) ...
window.resetDatabaseManual = async () => {
    if(!isAdmin) return alert("Solo admin");
    if(!confirm("⚠️ Resetear DB?")) return;
    const g=document.getElementById('diets-grid'); g.innerHTML='<div class="loading-spinner">Generando...</div>';
    try {
        const q=await getDocs(collection(db,"diet_templates")); const p=[]; q.forEach(d=>p.push(deleteDoc(doc(db,"diet_templates",d.id)))); await Promise.all(p);
        const bs=50; for(let i=0; i<dietsDatabase.length; i+=bs){const ch=dietsDatabase.slice(i,i+bs); await Promise.all(ch.map(d=>addDoc(collection(db,"diet_templates"),d)));}
        alert("Hecho"); loadDietsAdmin();
    } catch(e) { alert("Error: "+e.message); }
};

function initAdminDashboard() {
    document.getElementById('adminNav').style.display='block'; showAdminSection('clients');
    const tb = document.querySelector('#diets-section .toolbar');
    if(!document.getElementById('filterCategory')){
        const sel = document.createElement('select'); sel.id = 'filterCategory'; sel.className = 'glass-input'; sel.style.width = 'auto'; sel.style.margin = '0';
        sel.innerHTML = `<option value="all">Todas</option><option value="Déficit">Déficit</option><option value="Volumen">Volumen</option><option value="Salud">Salud</option><option value="Senior">Senior</option>`;
        sel.onchange = filterDiets; tb.insertBefore(sel, document.getElementById('searchKcal').parentNode);
    }
    if(!document.getElementById('btnManual')){
        const b=document.createElement('button'); b.id='btnManual'; b.className='btn-primary'; b.innerHTML='<i class="bi bi-plus-lg"></i> Manual'; b.style.marginLeft='10px'; b.onclick=()=>openModal('manualDietModal'); tb.appendChild(b);
    }
}
window.showAdminSection = (id) => { document.getElementById('adminView').style.display='block'; document.getElementById('athleteView').style.display='none'; ['clients','diets','inbox'].forEach(s=>document.getElementById(s+'-section').style.display='none'); document.getElementById(id+'-section').style.display='block'; if(id==='clients')renderClientsAdmin(); if(id==='diets')loadDietsAdmin(); if(id==='inbox')renderInbox(); };
async function loadDietsAdmin() { const g=document.getElementById('diets-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"diet_templates")); window.allDietsCache=[]; q.forEach(d=>window.allDietsCache.push({firestoreId:d.id,...d.data()})); renderDietsListAdmin(window.allDietsCache); }
function renderDietsListAdmin(l) { const g=document.getElementById('diets-grid'); g.innerHTML=''; l.sort((a,b)=>(parseInt(a.calories)||9999)-(parseInt(b.calories)||9999)); l.forEach(d=>{ let c='#333'; if(d.category==='Déficit')c='#D32F2F'; if(d.category==='Volumen')c='#2E7D32'; if(d.category==='Salud')c='#F57C00'; if(d.category==='Senior')c='#0288D1'; g.innerHTML+=`<div class="card"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span class="status-badge" style="background:${c}">${d.category}</span><span class="status-badge" style="border:1px solid #555">${d.isAdLibitum?'SACIEDAD':d.calories+' kcal'}</span></div><h3>${d.name}</h3><p>${d.description.substring(0,50)}...</p><button class="btn-assign" onclick='previewDietVisual(${JSON.stringify(d).replace(/'/g,"&apos;")}); openModal("dietViewModal");'><i class="bi bi-eye"></i> Ver Plan</button></div>`; }); }
window.filterDiets = () => { const term = document.getElementById('searchKcal').value.toLowerCase(); const cat = document.getElementById('filterCategory') ? document.getElementById('filterCategory').value : 'all'; if(!window.allDietsCache) return; const filtered = window.allDietsCache.filter(d => { const matchText = d.name.toLowerCase().includes(term) || d.calories.toString().includes(term); const matchCat = cat === 'all' || d.category === cat; return matchText && matchCat; }); renderDietsListAdmin(filtered); };
async function renderClientsAdmin(){ const g=document.getElementById('clients-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"clientes")); g.innerHTML=''; q.forEach(d=>{const c=d.data(); g.innerHTML+=`<div class="card"><h3>${c.alias}</h3><p>${c.name}</p><small style="color:#888">Plan: <span style="color:var(--brand-red)">${c.currentDietName||'Ninguno'}</span></small><button class="btn-assign" onclick="openDietAssignModal('${d.id}','${c.alias}')">Asignar</button></div>`;}); }
window.openDietAssignModal=async(id,alias)=>{const n=prompt("Nombre exacto:"); if(n){const q=query(collection(db,"diet_templates"),where("name","==",n)); const s=await getDocs(q); if(!s.empty){const d=s.docs[0].data(); await updateDoc(doc(db,"clientes",id),{currentDietName:d.name,currentDietData:d, dietHistory:(await getDoc(doc(db,"clientes",id))).data().dietHistory||[]}); alert("Asignada"); renderClientsAdmin();}else alert("No encontrada");}};
async function renderInbox() { const l=document.getElementById('inbox-list'); l.innerHTML='Cargando...'; const q=query(collection(db,"notas"),orderBy("date","desc")); const s=await getDocs(q); l.innerHTML=s.docs.map(d=>{const n=d.data(); return `<div class="card" style="margin-bottom:10px; border-left:4px solid ${n.read?'#333':'var(--brand-red)'}"><strong>${n.author}</strong><p>${n.text}</p>${!n.read?`<button class="btn-primary" onclick="markRead('${d.id}')" style="padding:5px; font-size:0.7rem">Leído</button>`:''}</div>`}).join(''); }
window.markRead=async(id)=>{await updateDoc(doc(db,"notas",id),{read:true}); renderInbox();};
function initAthleteDashboard(){document.getElementById('athleteNav').style.display='block'; document.getElementById('athleteGreeting').innerText=`Hola, ${userData.alias}`; showAthleteSection('myPlan');}
window.showAthleteSection=(id)=>{document.getElementById('athleteView').style.display='block'; ['myPlan','education','history','notes'].forEach(s=>document.getElementById(s+'-section').style.display='none'); document.getElementById(id+'-section').style.display='block'; if(id==='myPlan') renderMyPlan(); if(id==='education') renderEducation();};
function renderMyPlan(){const c=document.getElementById('myCurrentDietContainer'); if(!userData.currentDietData){c.innerHTML='<div class="warning-box">Sin plan.</div>';return;} previewDietVisual(userData.currentDietData);}
function renderEducation(){ const c=document.getElementById('eduContent'); if(!userData.currentDietData){c.innerHTML='Sin plan';return;} const guide=dietGuides[userData.currentDietData.category]||dietGuides["Volumen"]; c.innerHTML=`<div class="warning-box"><h3>Tips ${userData.currentDietData.category}</h3><ul>${guide.tips.map(t=>`<li>${t}</li>`).join('')}</ul></div>`; }
window.toggleSidebar=()=>{document.getElementById('sidebar').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active');};
window.closeModal=(id)=>document.getElementById(id).style.display='none';
window.openModal=(id)=>document.getElementById(id).style.display='block';