// js/dietData.js

// 1. FUNCIÓN MATEMÁTICA (ESCALADO DE GRAMOS)
const scaleString = (text, ratio) => {
    return text.replace(/(\d+)g/g, (match, grams) => {
        const newGrams = Math.round(parseInt(grams) * ratio);
        return `${newGrams}g`;
    }).replace(/(\d+) ud/g, (match, ud) => {
        const newUd = Math.max(1, Math.round(parseInt(ud) * ratio)); 
        return `${newUd} ud`;
    }).replace(/(\d+)ml/g, (match, ml) => {
         const newMl = Math.max(5, Math.round(parseInt(ml) * ratio));
         return `${newMl}g`; // Unificamos a gramos para cocina
    });
};

// ===============================================
// 2. GUÍAS EDUCATIVAS
// ===============================================
export const dietGuides = {
    "Déficit": {
        benefit: "BENEFICIO: Maximiza la oxidación de grasa visceral. Control estricto de la insulina para acceder a las reservas.",
        tips: [
            "🚫 NO picar entre horas (detiene la quema de grasa).",
            "🚫 Café con leche prohibido (usa solo o con bebida vegetal sin azúcar).",
            "Bebe 500ml de agua 10min antes de cada comida."
        ],
        allowed: ["Verduras verdes", "Frutos rojos", "Carnes magras (Pollo/Pavo/Conejo)", "Pescado blanco", "Claras", "Cerdo magro"],
        forbidden: ["Azúcar", "Alcohol", "Fritos", "Leche de vaca entera", "Harinas refinadas"],
        replacements: [
            { original: "Pasta/Arroz", substitute: "Konjac, Calabacín espiralizado o Coliflor rallada" },
            { original: "Patata", substitute: "Nabo o Rábano asado" }
        ]
    },
    "Volumen": {
        benefit: "BENEFICIO: Superávit energético para la construcción de tejido muscular nuevo (hipertrofia).",
        tips: [
            "La consistencia es clave: no te saltes comidas.",
            "Usa la nutrición líquida (batidos) si te cuesta llegar a las calorías.",
            "Añade el aceite siempre en crudo al final."
        ],
        allowed: ["Arroz, Pasta, Patata", "Carnes rojas (Ternera/Buey)", "Cerdo (Lomo)", "Frutos secos", "Aceite Oliva", "Avena"],
        forbidden: ["Comida basura (ensucia el volumen)", "Alcohol (frena la síntesis proteica)"],
        replacements: [
            { original: "Pollo", substitute: "Ternera (mayor densidad calórica)" },
            { original: "Agua", substitute: "Zumo de fruta natural" }
        ]
    },
    "Salud": { // Anti-inflamatoria
        benefit: "BENEFICIO: Reduce la inflamación sistémica y mejora la salud digestiva. Prioridad en densidad nutricional.",
        tips: [
            "Cena al menos 2 horas antes de dormir.",
            "Mastica lento para mejorar la digestión.",
            "Prioriza carnes de pasto y pescados salvajes."
        ],
        allowed: ["Pescado azul", "Cerdo Ibérico", "Ternera", "Aceite Oliva/Coco", "Frutas", "Hortalizas"],
        forbidden: ["Grasas trans", "Azúcares añadidos", "Aceites de semillas (Girasol/Soja)", "Gluten (según tolerancia)"],
        replacements: [
            { original: "Pan Trigo", substitute: "Pan Sarraceno o Masa Madre" },
            { original: "Leche", substitute: "Bebida de Coco/Almendras s/a" }
        ]
    },
    "Senior": {
        benefit: "BENEFICIO: Mantenimiento muscular con digestiones ligeras.",
        tips: [
            "Bebe agua aunque no tengas sed.",
            "Evita comidas muy copiosas.",
            "Prioriza texturas suaves."
        ],
        allowed: ["Cremas", "Pescado limpio", "Huevos", "Yogur", "Carne picada"],
        forbidden: ["Carnes fibrosas", "Verduras flatulentas", "Exceso sal"],
        replacements: [
            { original: "Filete duro", substitute: "Albóndigas caseras" },
            { original: "Fruta entera", substitute: "Compota" }
        ]
    }
};

// ===============================================
// 3. PLANTILLAS MAESTRAS (BASE CALIBRADA)
// ===============================================
const baseTemplates = {
    
    // --- VOLUMEN (2500 kcal) ---
    classic: {
        nameBase: "NDP Hipertrofia Clásica",
        cat: "Volumen",
        desc: "Alta carga de hidratos y proteínas para ganancia muscular.",
        baseKcal: 2500, macros: { p: 30, c: 50, f: 20 }, meals: 4, isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Avena & Huevos", desc: "100g Avena, 250g Claras, 1 Huevo L, 15g Chocolate 85%, 150ml Leche." },
                { title: "B. Tostadas Carga", desc: "140g Pan Barra, 15g Aceite, 150g Tomate, 80g Jamón Serrano." },
                { title: "C. Tortitas", desc: "120g Harina Avena, 1 Huevo, 30g Whey, 10g Crema Cacahuete." }
            ],
            lunch: [
                { title: "A. Pollo & Arroz", desc: "180g Pechuga Pollo, 140g Arroz (crudo), 10g Aceite, 200g Verduras." },
                { title: "B. Ternera & Boniato", desc: "180g Ternera, 600g Boniato, 10g Aceite, Ensalada." },
                { title: "C. Pasta Boloñesa", desc: "140g Pasta (crudo), 180g Carne Picada, 150g Tomate frito." },
                { title: "D. Lentejas", desc: "120g Lentejas (crudo), 120g Pollo, 15g Aceite, Verduras." },
                { title: "E. Cerdo & Patata", desc: "180g Lomo de Cerdo, 500g Patata asada, 10g Aceite." }
            ],
            snack: [
                { title: "A. Bocadillo", desc: "120g Pan, 100g Lomo Embuchado, 5g Aceite." },
                { title: "B. Batido", desc: "40g Whey, 1 Plátano, 30g Nueces, 200ml Leche." },
                { title: "C. Yogur Bowl", desc: "300g Queso Batido, 60g Cereales, 20g Miel, 15g Nueces." }
            ],
            dinner: [
                { title: "A. Pescado & Patata", desc: "250g Merluza, 400g Patata, 15g Aceite, Judías." },
                { title: "B. Revuelto", desc: "3 Huevos, 150g Gambas, 80g Pan." },
                { title: "C. Ensalada Rica", desc: "Ensalada, 2 Latas Atún, 2 Huevos, 15g Aceite, 60g Pan." },
                { title: "D. Sepia", desc: "300g Sepia, Ensalada, 15g Aceite, 80g Pan." }
            ]
        }
    },

    // --- DÉFICIT (2000 kcal) ---
    deficit: {
        nameBase: "NDP Definición Total",
        cat: "Déficit",
        desc: "Pérdida de grasa agresiva manteniendo saciedad.",
        baseKcal: 2000, macros: { p: 40, c: 30, f: 30 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Tostada Proteica", desc: "80g Pan Integral, 100g Pavo, Tomate, 10g Aceite." },
                { title: "B. Tortilla", desc: "2 Huevos + 200g Claras, 150g Espinacas, 1 Kiwi." },
                { title: "C. Porridge", desc: "50g Avena, 250ml Leche desnatada, 30g Whey." }
            ],
            lunch: [
                { title: "A. Pollo Clásico", desc: "200g Pollo, 80g Arroz integral (crudo), 10g Aceite, 300g Ensalada." },
                { title: "B. Ternera", desc: "180g Ternera limpia, 300g Brócoli, 10g Aceite, 200g Patata." },
                { title: "C. Pasta Fría", desc: "70g Pasta (crudo), 2 Latas Atún, Tomate, Pepino, 10g Aceite." },
                { title: "D. Solomillo Cerdo", desc: "200g Solomillo Cerdo (sin grasa), 200g Boniato, 10g Aceite, Calabacín." },
                { title: "E. Legumbre", desc: "80g Garbanzos (crudo), Espinacas, 1 Huevo duro." }
            ],
            dinner: [
                { title: "A. Pescado Blanco", desc: "250g Merluza, 300g Verdura, 15g Aceite." },
                { title: "B. Tortilla Verde", desc: "2 Huevos, 200g Calabacín, 1 Yogur, 40g Pan." },
                { title: "C. Burger al Plato", desc: "200g Burger Pollo, Ensalada Tomate, 10g Aceite." },
                { title: "D. Conservas", desc: "2 Latas Sardinas, Pimientos, 50g Pan Integral." },
                { title: "E. Pulpo", desc: "200g Pulpo, Ensalada verde, 10g Aceite." }
            ]
        }
    },

    // --- SALUD / ANTI-INFLAMATORIA (2200 kcal) ---
    salud: {
        nameBase: "NDP Salud Integral",
        cat: "Salud",
        desc: "Enfoque en densidad nutricional y salud hormonal.",
        baseKcal: 2200, macros: { p: 25, c: 40, f: 35 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Revuelto Graso", desc: "2 Huevos, 1/2 Aguacate, 1 Fruta, Té verde." },
                { title: "B. Yogur & Frutos", desc: "2 Yogures Griegos, 30g Nueces, 1 Plátano." },
                { title: "C. Tostada MM", desc: "80g Pan Masa Madre, 10g Aceite, 80g Jamón Ibérico." }
            ],
            lunch: [
                { title: "A. Salmón & Quinoa", desc: "200g Salmón, 80g Quinoa (crudo), 200g Espárragos, 10g Aceite." },
                { title: "B. Pollo Corral", desc: "200g Pollo asado, 300g Boniato, Rúcula." },
                { title: "C. Cerdo Ibérico", desc: "180g Presa/Secreto (sin exceso grasa), Pimientos asados, 200g Patata." },
                { title: "D. Guiso", desc: "100g Alubias (crudo) con verduras, 15g Aceite." }
            ],
            dinner: [
                { title: "A. Crema & Pescado", desc: "300ml Crema Calabaza, 180g Pescado, 10g Semillas." },
                { title: "B. Ensalada", desc: "Espinacas, 1 Aguacate, 1 Lata Caballa, Tomate, 15g Aceite." },
                { title: "C. Tortilla", desc: "3 Huevos, Champiñones, 40g Pan sarraceno." }
            ]
        }
    },

    // --- SENIOR (2000 kcal) ---
    senior: {
        nameBase: "NDP Bienestar Senior",
        cat: "Senior",
        desc: "Fácil masticación y digestión.",
        baseKcal: 2000, macros: { p: 25, c: 45, f: 30 }, meals: 3, isAdLibitum: true,
        plan: {
            breakfast: [{ title: "A. Tradicional", desc: "Café leche + 2 Tostadas aceite/york." }, { title: "B. Ligero", desc: "Yogur, nueces picadas, fruta asada." }],
            lunch: [{ title: "A. Cuchara", desc: "Lentejas estofadas. Filete pollo tierno." }, { title: "B. Pescado", desc: "Pescado horno con patata panadera." }],
            dinner: [{ title: "A. Tortilla", desc: "Tortilla francesa 2 huevos. Tomate." }, { title: "B. Sopa", desc: "Sopa fideos con huevo y jamón. Yogur." }]
        }
    }
};

// ===============================================
// 4. GENERADOR MASIVO (+135 DIETAS)
// ===============================================
export const generateDiets = () => {
    const diets = [];
    
    // AHORA TODAS GENERAN MUCHAS VARIANTES (Step 50)
    const configs = [
        { type: 'deficit', start: 1200, end: 2600, step: 50 },  // ~29 dietas
        { type: 'classic', start: 2000, end: 4500, step: 50 },  // ~51 dietas
        { type: 'salud', start: 1500, end: 3000, step: 50 },    // ~31 dietas
        { type: 'senior', start: 1500, end: 2500, step: 50 }    // ~21 dietas
    ];  // Total aprox: 132 dietas generadas automáticamente

    configs.forEach(cfg => {
        const base = baseTemplates[cfg.type];
        
        for (let targetKcal = cfg.start; targetKcal <= cfg.end; targetKcal += cfg.step) {
            const ratio = targetKcal / base.baseKcal;
            const scaledPlan = { ...base.plan };

            for (const mealKey in scaledPlan) {
                if(scaledPlan[mealKey]) {
                    scaledPlan[mealKey] = scaledPlan[mealKey].map(opt => ({
                        title: opt.title,
                        desc: scaleString(opt.desc, ratio)
                    }));
                }
            }

            diets.push({
                id: `diet-${cfg.type}-${targetKcal}`,
                name: `${base.nameBase} (${targetKcal} kcal)`,
                category: base.cat,
                calories: targetKcal,
                mealsPerDay: base.meals,
                macros: base.macros,
                isAdLibitum: false,
                description: base.desc,
                plan: scaledPlan
            });
        }
    });

    // DIETAS MANUALES ESPECÍFICAS
    
    // Anti-inflamatoria AMPLITUD DE CARNES (Como pediste)
    diets.push({
        id: 'anti-inflam-ndp',
        name: 'Protocolo NDP Anti-Inflamatorio (Variado)',
        category: 'Salud',
        calories: 'Saciedad', // Ad Libitum pero controlado
        mealsPerDay: 3,
        macros: { p: 30, c: 20, f: 50 },
        isAdLibitum: true,
        description: "Protocolo para reducir inflamación incluyendo variedad de proteínas de calidad. Sin lectinas (tomate/pimiento).",
        plan: {
            breakfast: [
                { title: "Opción A", desc: "3 Huevos revueltos + 1/2 Aguacate. CERO carbos." },
                { title: "Opción B", desc: "Ayuno intermitente (Solo agua, té o café solo)." },
                { title: "Opción C", desc: "Lomo embuchado (sin aditivos) + Nueces." }
            ],
            lunch: [
                { title: "A. Cerdo Ibérico", desc: "200g Lomo/Presa de Cerdo Ibérico a la plancha + Brócoli al vapor + Aceite Oliva." },
                { title: "B. Ternera Pasto", desc: "200g Entrecot/Filete de Ternera + Ensalada de hojas verdes (sin tomate) + Aceitunas." },
                { title: "C. Pollo Corral", desc: "1/4 Pollo asado (con piel) + Coliflor salteada con ajos." },
                { title: "D. Pescado Azul", desc: "200g Salmón/Sardinas + Espárragos verdes plancha." }
            ],
            dinner: [
                { title: "Recarga Almidón", desc: "Cualquier proteína anterior (Pescado blanco ideal) + 300g Boniato/Patata asada/Yuca (Enfriada previamente)." }
            ]
        }
    });

    // Keto Strict
    diets.push({
        id: 'keto-strict',
        name: 'Protocolo NDP Keto Strict',
        category: 'Déficit',
        calories: 'Saciedad',
        mealsPerDay: 3,
        macros: { p: 25, c: 5, f: 70 },
        isAdLibitum: true,
        description: "Cetosis nutricional (<30g carbos). Energía estable.",
        plan: {
            breakfast: [{title: "A", desc: "3 Huevos fritos con 40g Panceta."},{title: "B", desc: "Café Bulletproof (20g Mantequilla + 10g MCT)."}],
            lunch: [{title: "Única", desc: "Muslos de pollo (con piel) + 40g Queso curado + Verdura verde."}],
            dinner: [{title: "Única", desc: "Salmón al horno con 20g mantequilla y espárragos."}]
        }
    });

    return diets;
};

export const dietsDatabase = generateDiets();