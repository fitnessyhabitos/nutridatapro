import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ==========================================
// 1. CONFIGURACIÓN FIREBASE
// ==========================================
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

// ==========================================
// 2. DATA SEEDING (15 PLANTILLAS NUTRI DATA PRO)
// ==========================================
const initialDiets = [
    // --- GRUPO: DÉFICIT ---
    {
        name: "NDP Cut Aggressive",
        type: "Déficit",
        kcal: 1500,
        description: "Déficit agresivo. Prioridad proteica alta para evitar catabolismo.",
        meals: [
            { time: "Desayuno", items: "Tortilla de 200g claras + 1 huevo entero, Espinacas baby", presentation: "Tortilla francesa fina y jugosa." },
            { time: "Almuerzo", items: "Pechuga de pollo (120g), Ensalada verde grande, 1 cdta aceite oliva", presentation: "Ensalada base, pollo laminado encima." },
            { time: "Cena", items: "Pescado blanco (150g), Espárragos al vapor, Sin carbohidratos", presentation: "Emplatado limpio y minimalista." }
        ]
    },
    {
        name: "NDP Cut Standard",
        type: "Déficit",
        kcal: 1800,
        description: "Déficit moderado sostenible. Balance 40% Carb / 40% Prot / 20% Grasa.",
        meals: [
            { time: "Desayuno", items: "Avena (40g) cocida con agua + Scoop Whey Protein", presentation: "Bowl con canela espolvoreada." },
            { time: "Almuerzo", items: "Ternera magra (150g), Arroz blanco (100g cocido), Brócoli", presentation: "Ternera fileteada al punto." },
            { time: "Cena", items: "Salmón (120g), Ensalada de tomate y pepino", presentation: "Colores vivos en el plato." }
        ]
    },
    {
        name: "NDP Cut Active Athlete",
        type: "Déficit",
        kcal: 2100,
        description: "Para atletas que necesitan perder grasa sin sacrificar rendimiento.",
        meals: [
            { time: "Pre-Entreno", items: "Plátano mediano + Batido Whey", presentation: "Batido frío." },
            { time: "Post-Entreno", items: "Arroz (200g cocido), Pollo (150g)", presentation: "Bowl clásico fitness." },
            { time: "Cena", items: "Tortilla de patata fit (2 huevos + 150g patata al horno/airfryer)", presentation: "Estilo tapa española saludable." }
        ]
    },
    {
        name: "NDP Keto Definition",
        type: "Déficit",
        kcal: 1600,
        description: "Enfoque cetogénico. <30g carbohidratos netos diarios.",
        meals: [
            { time: "Desayuno", items: "Huevos revueltos (3) con tiras de bacon y medio aguacate", presentation: "Plato combinado." },
            { time: "Almuerzo", items: "Muslos de pollo con piel asados, Ensalada césar (sin picatostes)", presentation: "Estilo rústico." },
            { time: "Cena", items: "Salmón al horno con mantequilla de hierbas", presentation: "Toque gourmet con la mantequilla fundida." }
        ]
    },

    // --- GRUPO: MANTENIMIENTO ---
    {
        name: "NDP Maintenance Woman",
        type: "Mantenimiento",
        kcal: 2000,
        description: "Mantenimiento estándar para mujer activa. Nutrición densa.",
        meals: [
            { time: "Desayuno", items: "Tostadas pan integral con aguacate y huevo poché", presentation: "Estilo Brunch de cafetería." },
            { time: "Almuerzo", items: "Lentejas estofadas con verduras y arroz integral", presentation: "Plato hondo de cuchara." },
            { time: "Cena", items: "Merluza a la romana (harina garbanzo), Ensalada mixta", presentation: "Clásico y fresco." }
        ]
    },
    {
        name: "NDP Maintenance Man",
        type: "Mantenimiento",
        kcal: 2500,
        description: "Mantenimiento estándar hombre activo.",
        meals: [
            { time: "Desayuno", items: "3 Huevos revueltos, 2 Tostadas, Pieza de fruta", presentation: "Desayuno completo energético." },
            { time: "Almuerzo", items: "Pasta con boloñesa casera (ternera magra 150g)", presentation: "Espolvorear orégano fresco." },
            { time: "Cena", items: "Lubina al horno con cama de patatas panadera", presentation: "Servir en bandeja pequeña." }
        ]
    },
    {
        name: "NDP Real Food Flex",
        type: "Mantenimiento",
        kcal: 2200,
        description: "Enfoque flexible 80/20. Prioridad comida real, sin obsesión macro.",
        meals: [
            { time: "Desayuno", items: "Yogur Griego, Frutos rojos variados, Nueces", presentation: "Bowl de cristal transparente." },
            { time: "Almuerzo", items: "Legumbres o Grano entero + Proteína a elección (Pollo/Pescado)", presentation: "Variable según día." },
            { time: "Cena", items: "Revuelto de verduras de temporada con gambas", presentation: "Estilo Wok asiático." }
        ]
    },
    {
        name: "NDP Protocolo Anti-Inflamatorio",
        type: "Salud",
        kcal: 2100,
        description: "Sin gluten/lácteos/lectinas. Carb backloading nocturno. (Estilo Paleo Estricto).",
        meals: [
            { time: "Mañana", items: "Agua + Sal Rosa + Limón. Ayuno hasta mediodía.", presentation: "Vaso alto de cristal." },
            { time: "Comida 1 (Mediodía)", items: "Carne roja o huevos + Aguacate + Aceitunas. CERO CARBS.", presentation: "Plato proteico, separar grasas visualmente." },
            { time: "Comida 2 (Noche)", items: "Pescado blanco + Boniato asado + Fruta tropical.", presentation: "Confort food saludable. Boniato como base." }
        ]
    },

    // --- GRUPO: VOLUMEN / RENDIMIENTO ---
    {
        name: "NDP Lean Bulk (Limpio)",
        type: "Volumen",
        kcal: 2800,
        description: "Superávit ligero para ganar músculo minimizando ganancia de grasa.",
        meals: [
            { time: "Desayuno", items: "Tortitas de avena y claras (100g avena), Crema cacahuete", presentation: "Torre de tortitas." },
            { time: "Almuerzo", items: "Arroz blanco (300g cocido), Pollo (150g), Aceite oliva virgen", presentation: "Volumen estándar." },
            { time: "Cena", items: "Patata hervida grande, Ternera, Medio aguacate", presentation: "Plato lleno y saciante." }
        ]
    },
    {
        name: "NDP Hypertrophy Push",
        type: "Volumen",
        kcal: 3200,
        description: "Volumen clásico para culturismo. Alta frecuencia de comidas.",
        meals: [
            { time: "Comida 1", items: "4 Huevos enteros, 100g Avena", presentation: "Huevos y avena separados." },
            { time: "Comida 2", items: "Pasta (150g peso en seco), Lata de atún, Tomate frito", presentation: "Tupper friendly." },
            { time: "Comida 3", items: "Arroz, Ternera magra, Aceite de oliva", presentation: "Tupper friendly." },
            { time: "Comida 4 (Pre-cama)", items: "Caseína o Queso batido con nueces", presentation: "Pequeño bowl nocturno." }
        ]
    },
    {
        name: "NDP High Performance (CrossFit)",
        type: "Volumen",
        kcal: 3500,
        description: "Para deportes de alta demanda glucolítica.",
        meals: [
            { time: "Intra-Entreno", items: "Ciclodextrina/Isotónico + Aminoácidos Esenciales", presentation: "Shaker grande." },
            { time: "Post-Entreno", items: "Cereales azucarados (Corn Flakes) + Whey (Recarga rápida)", presentation: "Bowl de cereales." },
            { time: "Comidas Resto", items: "Arroz y Pasta en grandes cantidades + Proteína magra", presentation: "Fuente grande." }
        ]
    },
    {
        name: "NDP Heavyweight Gainer",
        type: "Volumen",
        kcal: 4000,
        description: "Superávit agresivo para 'hardgainers'.",
        meals: [
            { time: "Tip Estrategia", items: "Incluir batidos líquidos para meter calorías fáciles.", presentation: "Batidora de vaso." },
            { time: "Estructura", items: "5 comidas de 800kcal (Carne roja grasa, Arroz, Mucho Aceite)", presentation: "Platos grandes rebosantes." }
        ]
    },
    
    // --- GRUPO: ESPECÍFICOS ---
    {
        name: "NDP Vegan Athlete",
        type: "Volumen",
        kcal: 2600,
        description: "Volumen 100% vegetal. Alta en legumbres completas y soja.",
        meals: [
            { time: "Desayuno", items: "Porridge avena con leche soja y proteína guisante chocolate", presentation: "Bowl decorado con semillas." },
            { time: "Almuerzo", items: "Tofu marinado, Quinoa, Aguacate, Edamame", presentation: "Poke bowl vegano colorido." },
            { time: "Cena", items: "Lentejas rojas al curry con arroz basmati", presentation: "Estilo indio aromático." }
        ]
    },
    {
        name: "NDP Vegetarian Maintenance",
        type: "Mantenimiento",
        kcal: 2000,
        description: "Ovo-lacto vegetariana.",
        meals: [
            { time: "Desayuno", items: "Tortilla francesa con queso, Fruta fresca", presentation: "Clásico desayuno." },
            { time: "Almuerzo", items: "Hamburguesa vegetal (tipo Beyond/Heura), Patatas gajo al horno", presentation: "Casual food saludable." },
            { time: "Cena", items: "Ensalada de queso de cabra y nueces", presentation: "Fresco y ligero." }
        ]
    },
    {
        name: "NDP Intermittent Fasting 16/8",
        type: "Déficit",
        kcal: 1700,
        description: "Protocolo de Ayuno Intermitente. Ventana de alimentación 8 horas.",
        meals: [
            { time: "Mañana (Ayuno)", items: "Café solo, Té verde, Agua con gas", presentation: "Taza térmica." },
            { time: "14:00 (Romper Ayuno)", items: "Pollo asado, Arroz, Verduras", presentation: "Plato completo." },
            { time: "21:30 (Cena)", items: "Pescado azul, Ensalada, Yogur proteico", presentation: "Ligero antes de dormir." }
        ]
    }
];

// Variable caché local
let allDietsCache = [];

// ==========================================
// 3. FUNCIONES LÓGICAS
// ==========================================

// --- RESET DATABASE (IMPORTANTE) ---
window.resetDatabaseManual = async () => {
    if(!confirm("⚠️ ¿ATENCIÓN? \n\nEsto borrará TODAS las dietas actuales y cargará las 15 plantillas oficiales de Nutri Data Pro.\n\n¿Estás seguro?")) return;

    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Reseteando base de datos...</div>';

    try {
        // 1. Borrar actuales
        const q = await getDocs(collection(db, "diet_templates"));
        const deletePromises = [];
        q.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, "diet_templates", docSnap.id)));
        });
        await Promise.all(deletePromises);

        // 2. Insertar nuevas
        const addPromises = initialDiets.map(diet => addDoc(collection(db, "diet_templates"), diet));
        await Promise.all(addPromises);
        
        alert("✅ ¡Base de datos actualizada a Nutri Data Pro!");
        loadDiets(); 

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
};

// --- CARGAR DIETAS ---
async function loadDiets() {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '<div class="loading-spinner">Cargando biblioteca NDP...</div>';
    
    const querySnapshot = await getDocs(collection(db, "diet_templates"));
    allDietsCache = []; 

    if (querySnapshot.empty) {
        grid.innerHTML = '<div style="text-align:center; padding:20px;">Base de datos vacía.<br><br>Pulsa el botón rojo <b>"Reset DB"</b> arriba a la derecha.</div>';
        return;
    }

    querySnapshot.forEach((docSnap) => {
        allDietsCache.push({ id: docSnap.id, ...docSnap.data() });
    });

    renderDietsList(allDietsCache);
}

// --- RENDERIZAR LISTA ---
function renderDietsList(dietsArray) {
    const grid = document.getElementById('diets-grid');
    grid.innerHTML = '';

    if(dietsArray.length === 0) {
        grid.innerHTML = '<p style="color:gray;">No se encontraron dietas con esos filtros.</p>';
        return;
    }

    // Ordenar por Kcal
    dietsArray.sort((a, b) => (typeof a.kcal === 'number' ? a.kcal : 0) - (typeof b.kcal === 'number' ? b.kcal : 0));

    dietsArray.forEach((diet) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let badgeColor = 'rgba(255, 255, 255, 0.1)';
        let badgeText = '#fff';
        if(diet.type.includes('Déficit')) { badgeColor = 'rgba(255, 100, 100, 0.15)'; badgeText = '#ff8888'; }
        if(diet.type.includes('Volumen')) { badgeColor = 'rgba(100, 255, 100, 0.15)'; badgeText = '#88ff88'; }
        if(diet.type.includes('Mantenimiento')) { badgeColor = 'rgba(100, 100, 255, 0.15)'; badgeText = '#8888ff'; }

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <span class="status-badge" style="background:${badgeColor}; color:${badgeText}">${diet.type}</span>
                <span style="font-weight:bold; font-size:0.9rem; color:white;">${diet.kcal} kcal</span>
            </div>
            <h3 style="color:white;">${diet.name}</h3>
            <p>${diet.description}</p>
            <button class="btn-assign" onclick='previewDiet(${JSON.stringify(diet)})'>
                <i class="bi bi-eye"></i> Ver Plan
            </button>
        `;
        grid.appendChild(card);
    });
}

// --- FILTRO ---
window.filterDiets = () => {
    const searchKcal = document.getElementById('searchKcal').value;
    const searchType = document.getElementById('searchType').value;

    const filtered = allDietsCache.filter(diet => {
        const typeMatch = (searchType === 'all') || (diet.type.includes(searchType));
        let kcalMatch = true;
        if(searchKcal) {
            const target = parseInt(searchKcal);
            const dietKcal = typeof diet.kcal === 'number' ? diet.kcal : 0;
            if(dietKcal > 0) {
                kcalMatch = (dietKcal >= target - 250) && (dietKcal <= target + 250);
            } else {
                kcalMatch = false; 
            }
        }
        return typeMatch && kcalMatch;
    });
    renderDietsList(filtered);
};

// --- CLIENTES ---
async function renderClients() {
    const grid = document.getElementById('clients-grid');
    grid.innerHTML = '<div class="loading-spinner">Cargando...</div>';
    const querySnapshot = await getDocs(collection(db, "clientes"));
    grid.innerHTML = '';
    
    querySnapshot.forEach((docSnap) => {
        const client = docSnap.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="margin-bottom:10px;"><span class="status-badge" style="background:#222; color:#ccc">${client.goal || 'General'}</span></div>
            <h3>${client.name}</h3>
            <p>${client.email}</p>
            <div style="margin-top:15px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1)">
                <small style="color:#666">Dieta Actual:</small><br>
                <span style="color: var(--neon-green)">${client.currentDietName || 'Sin asignar'}</span>
            </div>
            <button class="btn-assign" onclick="openDietAssignModal('${docSnap.id}', '${client.name}')">
                <i class="bi bi-pencil-square"></i> Asignar Dieta
            </button>
        `;
        grid.appendChild(card);
    });
}

document.getElementById('addClientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('clientName').value;
    const email = document.getElementById('clientEmail').value;
    const goal = document.getElementById('clientGoal').value;
    try {
        await addDoc(collection(db, "clientes"), {
            name, email, goal, currentDietName: null
        });
        closeModal('clientModal');
        renderClients();
    } catch (e) { alert("Error al crear cliente"); }
});

// --- ASIGNAR Y VER DETALLES ---
window.openDietAssignModal = async (clientId, clientName) => {
    const dietName = prompt(`ASIGNAR DIETA A: ${clientName}\n\nEscribe el nombre de la dieta (Cópialo de la biblioteca):\nEj: NDP Cut Standard`);
    if(dietName) {
        const dietRef = doc(db, "clientes", clientId);
        await updateDoc(dietRef, { currentDietName: dietName });
        alert("Dieta actualizada.");
        renderClients();
    }
};

window.previewDiet = (diet) => {
    const container = document.getElementById('diet-detail-content');
    let mealsHtml = diet.meals.map((meal, index) => `
        <div class="meal-row">
            <h4>${meal.time}</h4>
            <p style="color:#ddd; font-size: 1.05rem;">${meal.items}</p>
            <small class="presentation-toggle" onclick="togglePlate('plate-${index}')">
                <i class="bi bi-camera"></i> Ver sugerencia de emplatado
            </small>
            <div id="plate-${index}" class="plate-image">
                <p>📸 ${meal.presentation || 'Sin datos visuales'}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h2 style="color:white; margin-bottom:5px;">${diet.name}</h2>
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <span class="status-badge" style="background:var(--neon-blue); color:black">${diet.type}</span>
            <span class="status-badge" style="border:1px solid #fff">${diet.kcal} kcal</span>
        </div>
        <p style="color:var(--text-muted); margin-bottom:30px; font-style:italic;">"${diet.description}"</p>
        <div>${mealsHtml}</div>
    `;
    openModal('dietViewModal');
}

// --- UTILS UI ---
window.togglePlate = (id) => {
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'none' ? 'flex' : 'none';
}

window.showSection = (id) => {
    document.getElementById('clients-section').style.display = 'none';
    document.getElementById('diets-section').style.display = 'none';
    document.getElementById(id + '-section').style.display = 'block';
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if(id === 'diets') loadDiets();
    if(id === 'clients') renderClients();
}

window.openModal = (id) => document.getElementById(id).style.display = 'block';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

// INICIO
renderClients();
// No cargamos dietas al inicio para no gastar lecturas, solo al ir a la sección.