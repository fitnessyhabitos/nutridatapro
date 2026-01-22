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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Variables Globales
let currentUser = null;
let userData = null;
let isAdmin = false;
let dietToAssign = null;
const ADMIN_EMAIL = "toni@nutridatapro.es"; 

// ======================================================
// 1. INICIALIZACIÓN Y EVENTOS (CORE)
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("APP INICIADA OK");

    // --- GESTIÓN DE VISTAS LOGIN/REGISTRO ---
    const boxLogin = document.getElementById('boxLogin');
    const boxRegister = document.getElementById('boxRegister');
    const btnShowRegister = document.getElementById('btnShowRegister');
    const btnShowLogin = document.getElementById('btnShowLogin');

    // Botón: Ir a Registro
    if(btnShowRegister) {
        btnShowRegister.addEventListener('click', (e) => {
            e.preventDefault();
            boxLogin.style.display = 'none';
            boxRegister.style.display = 'block';
        });
    }

    // Botón: Ir a Login
    if(btnShowLogin) {
        btnShowLogin.addEventListener('click', (e) => {
            e.preventDefault();
            boxRegister.style.display = 'none';
            boxLogin.style.display = 'block';
        });
    }

    // --- LOGIN SUBMIT ---
    const formLogin = document.getElementById('formLogin');
    if(formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPass').value;
            
            try {
                // Intento de login
                await signInWithEmailAndPassword(auth, email, pass);
                // Si funciona, onAuthStateChanged se encarga del resto
            } catch(error) {
                console.error(error);
                alert("❌ Error al entrar: " + error.message);
            }
        });
    }

    // --- REGISTER SUBMIT ---
    const formRegister = document.getElementById('formRegister');
    if(formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const alias = document.getElementById('regAlias').value;
            const email = document.getElementById('regEmail').value;
            const pass = document.getElementById('regPass').value;

            try {
                const cred = await createUserWithEmailAndPassword(auth, email, pass);
                // Crear perfil en Base de Datos
                await setDoc(doc(db, "clientes", cred.user.uid), {
                    name: name,
                    alias: alias,
                    email: email,
                    goal: "General",
                    currentDietName: null,
                    dietHistory: []
                });
                alert("✅ ¡Cuenta creada! Accediendo...");
            } catch(error) {
                console.error(error);
                alert("❌ Error al registrar: " + error.message);
            }
        });
    }

    // --- RESTO DE BOTONES (ASIGNAR CLICK LISTENERS) ---
    const assignClick = (id, func) => { const el = document.getElementById(id); if(el) el.addEventListener('click', func); };
    
    assignClick('btnLogout', () => signOut(auth));
    assignClick('btnOpenClientModal', () => openModal('clientModal'));
    assignClick('btnResetDB', resetDatabaseManual);
    assignClick('btnOpenManualModal', () => openModal('manualDietModal'));
    assignClick('btnOpenCheckinModal', () => openModal('checkinModal'));
    assignClick('btnSendNote', sendAthleteNote);

    // Filtros
    const search = document.getElementById('searchKcal'); if(search) search.addEventListener('input', filterDiets);
    const cat = document.getElementById('filterCategory'); if(cat) cat.addEventListener('change', filterDiets);

    // Cerrar Modales
    ['btnCloseDietModal', 'btnCloseSelectorModal', 'btnCloseClientModal', 'btnCloseCheckinModal', 'btnCloseManualModal'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.addEventListener('click', () => {
            if(id === 'btnCloseDietModal') closeModal('dietViewModal');
            else if(id === 'btnCloseSelectorModal') closeModal('clientSelectorModal');
            else if(id === 'btnCloseManualModal') closeModal('manualDietModal');
            else if(id === 'btnCloseClientModal') closeModal('clientModal');
            else if(id === 'btnCloseCheckinModal') closeModal('checkinModal');
        });
    });
});

// ======================================================
// 2. MONITOR DE ESTADO (LOGIN/LOGOUT)
// ======================================================
onAuthStateChanged(auth, async (user) => {
    const landing = document.getElementById('landingSection');
    const appLayout = document.getElementById('appLayout');

    if (user) {
        // USUARIO LOGUEADO
        currentUser = user;
        isAdmin = (user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim());
        
        landing.style.display = 'none';
        appLayout.style.display = 'block';
        
        if (isAdmin) {
            initAdminDashboard();
        } else {
            // Cargar datos si es atleta
            const snap = await getDoc(doc(db,"clientes",user.uid));
            if(snap.exists()){ 
                userData = snap.data(); 
                initAthleteDashboard(); 
            } else {
                if(isAdmin) initAdminDashboard(); // Fallback si admin no tiene ficha
            }
        }
    } else {
        // USUARIO DESCONECTADO
        currentUser = null;
        userData = null;
        isAdmin = false;
        
        landing.style.display = 'flex';
        appLayout.style.display = 'none';
        
        // Resetear vista login
        document.getElementById('boxRegister').style.display = 'none';
        document.getElementById('boxLogin').style.display = 'block';
    }
});

// ======================================================
// 3. FUNCIONES DE UI Y NAVEGACIÓN
// ======================================================
function openModal(id){ const m = document.getElementById(id); if(m) m.style.display='block'; }
function closeModal(id){ const m = document.getElementById(id); if(m) m.style.display='none'; }

function renderMenus(items) {
    const d = document.getElementById('desktopMenu'); 
    const m = document.getElementById('mobileMenu');
    d.innerHTML = ''; m.innerHTML = '';
    
    items.forEach(i => {
        // Botones escritorio
        const btnD = document.createElement('button');
        btnD.className = 'nav-link'; btnD.id = `desk-${i.id}`;
        btnD.innerHTML = `<i class="bi ${i.icon}"></i> ${i.label}`;
        btnD.onclick = () => navigate(i.id);
        d.appendChild(btnD);

        // Botones móvil
        const btnM = document.createElement('button');
        btnM.className = 'mobile-nav-btn'; btnM.id = `mob-${i.id}`;
        btnM.innerHTML = `<i class="bi ${i.icon}"></i><span>${i.label}</span>`;
        btnM.onclick = () => navigate(i.id);
        m.appendChild(btnM);
    });
    navigate(items[0].id);
}

function navigate(sid) {
    // Ocultar todo
    document.getElementById('adminView').style.display = 'none'; 
    document.getElementById('athleteView').style.display = 'none';
    
    // Mostrar contenedor principal
    const view = isAdmin ? 'adminView' : 'athleteView';
    document.getElementById(view).style.display = 'block';
    
    // Mostrar sección específica
    const sections = ['clients','diets','inbox', 'myPlan','evolution','education','history','notes'];
    sections.forEach(x => { 
        const el = document.getElementById(x+'-section'); 
        if(el) el.style.display = (x===sid) ? 'block' : 'none'; 
    });

    // Activar estilo en botones
    document.querySelectorAll('.nav-link, .mobile-nav-btn').forEach(b => b.classList.remove('active'));
    const ad = document.getElementById(`desk-${sid}`); if(ad) ad.classList.add('active');
    const am = document.getElementById(`mob-${sid}`); if(am) am.classList.add('active');
    
    // Cargar datos
    if(sid==='clients') renderClientsAdmin();
    if(sid==='diets') loadDietsAdmin();
    if(sid==='inbox') renderInbox();
    if(sid==='myPlan' && !isAdmin) renderMyPlan();
    if(sid==='evolution' && !isAdmin) loadEvolutionData();
    if(sid==='education' && !isAdmin) renderEducation();
}

function initAdminDashboard() { 
    renderMenus([
        {id:'clients', label:'Atletas', icon:'bi-people-fill'},
        {id:'diets', label:'Biblioteca', icon:'bi-collection-fill'},
        {id:'inbox', label:'Mensajes', icon:'bi-chat-left-text-fill'}
    ]); 
}

function initAthleteDashboard() { 
    document.getElementById('athleteGreeting').innerText = `Hola, ${userData.alias}`; 
    renderMenus([
        {id:'myPlan', label:'Plan', icon:'bi-calendar-check-fill'},
        {id:'evolution', label:'Progreso', icon:'bi-graph-up-arrow'},
        {id:'education', label:'Guía', icon:'bi-book-half'},
        {id:'history', label:'Historial', icon:'bi-clock-history'},
        {id:'notes', label:'Notas', icon:'bi-pencil-square'}
    ]); 
}

// ======================================================
// 4. LÓGICA DE NEGOCIO (DIETAS, GRAFICOS)
// ======================================================

// VISUALIZADOR DE DIETA
window.previewDietVisual = (diet) => {
    openModal('dietViewModal');
    const container = document.getElementById('diet-detail-content');
    const chartId = `chart-${Math.random().toString(36).substr(2,9)}`;
    const guide = dietGuides[diet.category] || dietGuides["Volumen"];
    const kcalDisplay = diet.isAdLibitum ? 'SACIEDAD' : `${diet.calories} kcal`;
    const total = parseInt(diet.calories) || 2000;
    
    // Cálculos
    const pGrams = Math.round((total*(diet.macros.p/100))/4);
    const cGrams = Math.round((total*(diet.macros.c/100))/4);
    const fGrams = Math.round((total*(diet.macros.f/100))/9);
    const bk = Math.round(total*0.25); const ln = Math.round(total*0.35); const sn = Math.round(total*0.15); const dn = Math.round(total*0.25);

    let mealsHtml = '';
    const renderOptions = (opts) => {
        if(!opts) return '';
        return opts.map((o,i) => `<div class="option-card"><div style="color:var(--text-muted); font-size:0.75rem; font-weight:800; margin-bottom:5px;">OPCIÓN ${String.fromCharCode(65+i)}</div><div style="color:#eee; line-height:1.4; font-size:0.95rem;">${o.desc}</div></div>`).join('');
    }
    const header = (ico, tit, k) => `<div class="meal-title"><span style="display:flex; gap:10px; align-items:center;"><i class="${ico}"></i> ${tit}</span> <span style="font-weight:normal; color:#888;">${diet.isAdLibitum?'':k+' kcal'}</span></div>`;

    if(diet.plan.breakfast) mealsHtml += `<div class="meal-section">${header('bi-cup-hot-fill','DESAYUNO',bk)}${renderOptions(diet.plan.breakfast)}</div>`;
    if(diet.plan.lunch) mealsHtml += `<div class="meal-section">${header('bi-egg-fried','COMIDA',ln)}${renderOptions(diet.plan.lunch)}</div>`;
    if(diet.plan.snack && diet.plan.snack.length > 0) mealsHtml += `<div class="meal-section">${header('bi-apple','SNACK',sn)}${renderOptions(diet.plan.snack)}</div>`;
    if(diet.plan.dinner) mealsHtml += `<div class="meal-section">${header('bi-moon-stars-fill','CENA',dn)}${renderOptions(diet.plan.dinner)}</div>`;

    // Botón Asignar
    const dietJson = encodeURIComponent(JSON.stringify(diet));
    const adminBtn = isAdmin ? `<div style="margin-top:30px; border-top:1px solid #333; padding-top:20px;"><button class="btn-primary" onclick="window.prepareAssign('${dietJson}')">📲 ASIGNAR A ATLETA</button></div>` : '';

    container.innerHTML = `
        <div class="diet-hero">
            <div>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <span class="status-badge" style="background:var(--brand-red);">${diet.category}</span>
                    <span class="status-badge" style="border:1px solid #555;">${kcalDisplay}</span>
                </div>
                <h2 style="color:white; margin-bottom:10px; line-height:1.2;">${diet.name}</h2>
                <p style="color:#ccc; margin-bottom:20px; font-size:0.95rem;">${guide.benefit || diet.description}</p>
                <div class="hydration-box"><i class="bi bi-droplet-fill"></i><div><strong>Al despertar:</strong><br>500ml agua + pizca sal + limón.</div></div>
            </div>
            <div class="glass-panel" style="padding:20px; border-radius:16px; text-align:center; min-height:220px; display:flex; justify-content:center; align-items:center;">
                <div style="height:170px; width:100%; position:relative;"><canvas id="${chartId}"></canvas></div>
            </div>
        </div>
        ${mealsHtml}
        <h3 style="margin-top:40px; margin-bottom:20px; border-top:1px solid #333; padding-top:20px; color:white;">Guía & Reglas</h3>
        <div class="warning-box"><strong>⚠️ REGLAS:</strong><ul style="padding-left:20px; margin-top:10px; color:#ffcc80;">${guide.tips.map(t=>`<li>${t}</li>`).join('')}<li>Pesar todo en CRUDO.</li></ul></div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:15px; margin-top:20px;">
            <div class="card" style="background:rgba(76, 175, 80, 0.1); border-color:rgba(76, 175, 80, 0.3);"><h4 style="color:#66bb6a; margin:0 0 10px 0;">PRIORIZAR</h4><ul style="padding-left:20px; color:#ddd; font-size:0.9rem;">${guide.allowed.map(i=>`<li>${i}</li>`).join('')}</ul></div>
            <div class="card" style="background:rgba(244, 67, 54, 0.1); border-color:rgba(244, 67, 54, 0.3);"><h4 style="color:#ef5350; margin:0 0 10px 0;">EVITAR</h4><ul style="padding-left:20px; color:#ddd; font-size:0.9rem;">${guide.forbidden.map(i=>`<li>${i}</li>`).join('')}</ul></div>
        </div>
        ${adminBtn}
    `;
    setTimeout(() => {
        const ctx = document.getElementById(chartId);
        if(ctx) new Chart(ctx, { type: 'doughnut', data: { labels: [`P: ${pGrams}g`, `C: ${cGrams}g`, `G: ${fGrams}g`], datasets: [{ data: [diet.macros.p, diet.macros.c, diet.macros.f], backgroundColor: ['#D32F2F', '#ffffff', '#333333'], borderWidth: 0 }] }, options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:true, position:'bottom', labels:{color:'#ccc', font:{size:11}, boxWidth:10}}}, cutout:'65%' } });
    }, 250);
}

// BRIDGE FUNCTION
window.prepareAssign = (dietEncoded) => {
    dietToAssign = JSON.parse(decodeURIComponent(dietEncoded));
    openClientSelector();
}

window.createManualDiet = async (e) => { e.preventDefault(); const getOpt = (p) => { const o = []; const a=document.getElementById(p+'_A').value; const b=document.getElementById(p+'_B').value; const c=document.getElementById(p+'_C').value; if(a)o.push({title:"A",desc:a}); if(b)o.push({title:"B",desc:b}); if(c)o.push({title:"C",desc:c}); return o.length?o:[{title:"Única",desc:"Según macros."}]; }; const manualDiet = { name: document.getElementById('mdName').value, category: document.getElementById('mdCat').value, calories: document.getElementById('mdKcal').value, mealsPerDay: 3, isAdLibitum: false, description: "Plan manual.", macros: {p:30,c:40,f:30}, plan: { breakfast: getOpt('mdBk'), lunch: getOpt('mdLn'), dinner: getOpt('mdDn'), snack: [] } }; try { await addDoc(collection(db, "diet_templates"), manualDiet); closeModal('manualDietModal'); alert("Guardada."); loadDietsAdmin(); } catch (e) { alert(e.message); } };

async function openClientSelector() { 
    const list = document.getElementById('clientSelectorList'); list.innerHTML = '<div class="loading-spinner">Cargando...</div>'; openModal('clientSelectorModal'); const q = await getDocs(collection(db, "clientes")); list.innerHTML = ''; if(q.empty) { list.innerHTML = '<p>No hay atletas.</p>'; return; } 
    q.forEach(docSnap => { 
        const c = docSnap.data(); const card = document.createElement('div'); card.className = 'card'; card.style.marginBottom='10px'; card.style.cursor='pointer'; card.style.borderLeft='4px solid #333'; 
        card.addEventListener('click', () => assignDietFromModal(docSnap.id, c.alias));
        card.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><div><h4 style="margin:0; color:white;">${c.alias}</h4><small style="color:#888;">${c.name}</small></div><div style="text-align:right;"><span class="status-badge" style="background:#222;">${c.goal}</span><br><small style="color:var(--brand-red);">${c.currentDietName ? 'Tiene Plan' : 'Sin Plan'}</small></div></div>`; list.appendChild(card); 
    }); 
};

async function assignDietFromModal(clientId, clientName) { 
    if(!dietToAssign || !confirm(`¿Asignar "${dietToAssign.name}" a ${clientName}?`)) return; 
    const clientRef = doc(db, "clientes", clientId); const h = (await getDoc(clientRef)).data().dietHistory || []; 
    h.unshift({ name: dietToAssign.name, date: new Date().toLocaleDateString(), category: dietToAssign.category }); 
    await updateDoc(clientRef, { currentDietName: dietToAssign.name, currentDietData: dietToAssign, dietHistory: h }); 
    alert(`✅ Asignado a ${clientName}`); closeModal('clientSelectorModal'); closeModal('dietViewModal'); 
};

async function resetDatabaseManual() { if(!isAdmin) return alert("Solo admin"); if(!confirm("⚠️ Resetear DB?")) return; try { const q=await getDocs(collection(db,"diet_templates")); const p=[]; q.forEach(d=>p.push(deleteDoc(doc(db,"diet_templates",d.id)))); await Promise.all(p); const bs=50; for(let i=0; i<dietsDatabase.length; i+=bs){const ch=dietsDatabase.slice(i,i+bs); await Promise.all(ch.map(d=>addDoc(collection(db,"diet_templates"),d)));} alert("Hecho"); loadDietsAdmin(); } catch(e) { alert(e.message); } };
async function loadDietsAdmin() { const g=document.getElementById('diets-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"diet_templates")); window.allDietsCache=[]; q.forEach(d=>window.allDietsCache.push({firestoreId:d.id,...d.data()})); renderDietsListAdmin(window.allDietsCache); }
function renderDietsListAdmin(l) { const g=document.getElementById('diets-grid'); g.innerHTML=''; l.sort((a,b)=>(parseInt(a.calories)||9999)-(parseInt(b.calories)||9999)); l.forEach(d=>{ let c='#333'; if(d.category==='Déficit')c='#D32F2F'; if(d.category==='Volumen')c='#2E7D32'; if(d.category==='Salud')c='#F57C00'; if(d.category==='Senior')c='#0288D1'; const card = document.createElement('div'); card.className = 'card'; card.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span class="status-badge" style="background:${c}">${d.category}</span><span class="status-badge" style="border:1px solid #555">${d.isAdLibitum?'SACIEDAD':d.calories+' kcal'}</span></div><h3>${d.name}</h3><p style="font-size:0.9rem; color:#aaa;">${d.description.substring(0,50)}...</p>`; const btn = document.createElement('button'); btn.className = 'btn-assign'; btn.innerHTML = '<i class="bi bi-eye"></i> Ver Plan'; btn.onclick = () => window.previewDietVisual(d); card.appendChild(btn); g.appendChild(card); }); }
function filterDiets() { const t=document.getElementById('searchKcal').value.toLowerCase(); const cat=document.getElementById('filterCategory').value; if(!window.allDietsCache)return; renderDietsListAdmin(window.allDietsCache.filter(d=>(d.name.toLowerCase().includes(t)||d.calories.toString().includes(t))&&(cat==='all'||d.category===cat))); }
async function renderClientsAdmin(){ const g=document.getElementById('clients-grid'); g.innerHTML='Cargando...'; const q=await getDocs(collection(db,"clientes")); g.innerHTML=''; q.forEach(d=>{const c=d.data(); g.innerHTML+=`<div class="card"><h3>${c.alias}</h3><p>${c.name}</p><small style="color:#888">Plan: <span style="color:var(--brand-red)">${c.currentDietName||'Ninguno'}</span></small><button class="btn-assign" onclick="openDietAssignModal('${d.id}','${c.alias}')">Asignar</button></div>`;}); }
async function renderInbox() { const l=document.getElementById('inbox-list'); l.innerHTML='Cargando...'; const q=query(collection(db,"notas"),orderBy("date","desc")); const s=await getDocs(q); l.innerHTML=s.docs.map(d=>{const n=d.data(); return `<div class="card" style="margin-bottom:10px; border-left:4px solid ${n.read?'#333':'var(--brand-red)'}"><strong>${n.author}</strong><p>${n.text}</p>${!n.read?`<button class="btn-primary" onclick="window.markRead('${d.id}')" style="padding:5px; font-size:0.7rem">Leído</button>`:''}</div>`}).join(''); }
window.markRead=async(id)=>{await updateDoc(doc(db,"notas",id),{read:true}); renderInbox();};
function initAthleteDashboard(){document.getElementById('athleteNav').style.display='block'; document.getElementById('athleteGreeting').innerText=`Hola, ${userData.alias}`; showAthleteSection('myPlan');}
window.showAthleteSection=(id)=>{document.getElementById('athleteView').style.display='block'; ['myPlan','education','history','notes'].forEach(s=>document.getElementById(s+'-section').style.display='none'); document.getElementById(id+'-section').style.display='block'; if(id==='myPlan') renderMyPlan(); if(id==='education') renderEducation();};
function renderMyPlan(){const c=document.getElementById('myCurrentDietContainer'); if(!userData.currentDietData){c.innerHTML='<div class="warning-box">Sin plan.</div>';return;} previewDietVisual(userData.currentDietData);}
function renderEducation(){ const c=document.getElementById('eduContent'); if(!userData.currentDietData){c.innerHTML='Sin plan';return;} const guide=dietGuides[userData.currentDietData.category]||dietGuides["Volumen"]; c.innerHTML=`<div class="warning-box"><h3>Tips ${userData.currentDietData.category}</h3><ul>${guide.tips.map(t=>`<li>${t}</li>`).join('')}</ul></div>`; }
async function loadEvolutionData() { const l = document.getElementById('weightHistoryList'); l.innerHTML="Cargando..."; const q=query(collection(db,"checkins"),where("uid","==",currentUser.uid),orderBy("date","asc")); const snap=await getDocs(q); const d=[], lbl=[]; let html=''; snap.forEach(doc=>{ const r=doc.data(); d.push(r.weight); lbl.push(r.date.substring(5)); html=`<div class="card" style="flex-direction:row;justify-content:space-between;padding:15px;margin-bottom:10px;"><span>${r.date}</span><strong>${r.weight}kg</strong></div>`+html; }); l.innerHTML=html||'<p>Sin registros.</p>'; if(window.evolutionChart)window.evolutionChart.destroy(); window.evolutionChart=new Chart(document.getElementById('weightChart'),{type:'line',data:{labels:lbl,datasets:[{label:'Peso',data:d,borderColor:'#D32F2F',tension:0.3,fill:true,backgroundColor:'rgba(211,47,47,0.1)'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#333'}}}}}); }
document.getElementById('checkinForm').addEventListener('submit',async(e)=>{e.preventDefault(); const w=parseFloat(document.getElementById('checkinWeight').value); const d=document.getElementById('checkinDate').value; await addDoc(collection(db,"checkins"),{uid:currentUser.uid,date:d,weight:w}); closeModal('checkinModal'); loadEvolutionData();});
async function sendAthleteNote(){const t=document.getElementById('athleteNoteInput').value; await addDoc(collection(db,"notas"),{uid:currentUser.uid,author:userData.alias,text:t,date:new Date().toLocaleString(),read:false}); document.getElementById('athleteNoteInput').value=""; alert("Enviada");};

window.resetDatabaseManual = resetDatabaseManual;
window.filterDiets = filterDiets;
window.sendAthleteNote = sendAthleteNote;
