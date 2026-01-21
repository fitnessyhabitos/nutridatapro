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
         return `${newMl}ml`;
    });
};

// ===============================================
// 2. GUÍAS EDUCATIVAS (BENEFICIOS Y REGLAS)
// ===============================================
export const dietGuides = {
    "Déficit": {
        tips: [
            "Bebe 500ml de agua antes de las comidas para aumentar la saciedad.",
            "La proteína es tu prioridad: evita la pérdida muscular.",
            "Si tienes ansiedad nocturna, opta por infusiones o gelatinas 0%."
        ],
        allowed: ["Verduras de hoja verde", "Frutos rojos", "Carnes magras", "Pescado blanco", "Especias"],
        forbidden: ["Azúcares líquidos", "Alcohol", "Fritos", "Bollería"],
        replacements: [
            { original: "Pasta/Arroz", substitute: "Konjac, Calabacín espiralizado o Coliflor rallada" },
            { original: "Aceite", substitute: "Cocinar al horno/vapor y añadir grasa saludable (Aguacate) al final" }
        ]
    },
    "Volumen": {
        tips: [
            "La consistencia es clave: no te saltes comidas.",
            "Usa la nutrición líquida (batidos) si te cuesta llegar a las calorías.",
            "El descanso nocturno es cuando tu músculo crece realmente."
        ],
        allowed: ["Arroz, Pasta, Patata", "Carnes rojas", "Frutos secos", "Aceite de Oliva", "Avena"],
        forbidden: ["Comida basura (ensucia el volumen innecesariamente)", "Alcohol (frena la síntesis proteica)"],
        replacements: [
            { original: "Pollo", substitute: "Ternera magra (más densidad calórica)" },
            { original: "Agua", substitute: "Zumo de fruta natural (intra o post entreno)" }
        ]
    },
    "Salud": { // Anti-inflamatoria / Salud
        tips: [
            "Escucha a tu digestión: si algo te hincha, elimínalo.",
            "Mastica lento y en un ambiente tranquilo.",
            "Prioriza la calidad del alimento (Eco/Bio) sobre la cantidad."
        ],
        allowed: ["Carnes de pasto", "Pescado salvaje", "Ghee, Coco, Oliva", "Tubérculos", "Frutas"],
        forbidden: ["GLUTEN", "LÁCTEOS de vaca", "LEGUMBRES (si hay inflamación)", "SOLANÁCEAS (Tomate, Pimiento)"],
        replacements: [
            { original: "Pan de Trigo", substitute: "Tostadas de Boniato o Pan de Trigo Sarraceno" },
            { original: "Leche", substitute: "Leche de Coco o Almendras (sin azúcar)" }
        ]
    }
};

// ===============================================
// 3. PLANTILLAS MAESTRAS (Base 2500 kcal)
// ===============================================
const baseTemplates = {
    
    // --- VOLUMEN LIMPIO ---
    classic: {
        nameBase: "NDP Classic Hypertrophy",
        cat: "Volumen",
        // BENEFICIO CLARO EN LA DESCRIPCIÓN:
        desc: "BENEFICIO: Maximiza la ganancia de masa muscular limpia minimizando la acumulación de grasa. Ideal para estética corporal.",
        baseKcal: 2500, 
        macros: { p: 30, c: 50, f: 20 },
        meals: 4,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Clásico Fitness", desc: "80g Avena cocida, 300ml Claras, 1 Huevo L, 10g Chocolate 85%." },
                { title: "B. Tortitas Proteicas", desc: "100g Harina Avena, 30g Whey Protein, 1 Huevo, 15g Crema Cacahuete." },
                { title: "C. Tostadas Saladas", desc: "120g Pan Hogaza, 2 Huevos plancha, 60g Jamón Serrano (limpio), 1 Kiwi." },
                { title: "D. Bowl Energético", desc: "400g Yogur Proteico, 80g Cereales maíz s/a, 20g Nueces, 1 Plátano." }
            ],
            lunch: [
                { title: "A. Pollo & Arroz", desc: "180g Pechuga Pollo, 120g Arroz Basmati, 10ml Aceite Oliva, Calabacín." },
                { title: "B. Ternera & Boniato", desc: "180g Ternera Magra, 500g Boniato asado, Ensalada verde, 5ml Aceite." },
                { title: "C. Pasta Boloñesa Fit", desc: "120g Pasta, 150g Carne Picada Vacuno, 150g Tomate Triturado, 10ml Aceite." },
                { title: "D. Legumbre Completa", desc: "100g Lentejas (peso crudo), 120g Pollo, Verduras estofadas, 5ml Aceite." }
            ],
            snack: [
                { title: "A. Pre-Workout", desc: "60g Crema de Arroz, 30g Whey Protein, 10g Crema de Almendras." },
                { title: "B. Bocadillo", desc: "120g Pan Barra, 80g Lomo Embuchado, 1 Manzana." },
                { title: "C. Batido Rápido", desc: "40g Whey Protein, 1 Plátano, 30g Nueces." },
                { title: "D. Tortitas Arroz", desc: "4 Tortitas Arroz, 80g Pavo, 15g Almendras." }
            ],
            dinner: [
                { title: "A. Pescado & Patata", desc: "220g Merluza, 350g Patata cocida, 10ml Aceite Oliva, Judías verdes." },
                { title: "B. Salmón & Quinoa", desc: "150g Salmón, 70g Quinoa, Espárragos trigueros." },
                { title: "C. Revuelto Digestivo", desc: "3 Huevos, 400g Menestra verduras, 5ml Aceite." },
                { title: "D. Sepia Plancha", desc: "250g Sepia, Ensalada mixta, 10ml Aceite Oliva, 60g Pan." }
            ]
        }
    },

    // --- DÉFICIT / DEFINICIÓN ---
    deficit: {
        nameBase: "NDP Definition Cut",
        cat: "Déficit",
        desc: "BENEFICIO: Diseñada para la pérdida de grasa visceral manteniendo el tejido magro. Alta saciedad y control glucémico.",
        baseKcal: 2000, 
        macros: { p: 40, c: 30, f: 30 },
        meals: 3,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Revuelto Saciedad", desc: "3 Huevos enteros, 60g Pan Integral, 1 Naranja." },
                { title: "B. Porridge Fit", desc: "50g Avena, 250ml Leche desnatada, 30g Whey, Canela." },
                { title: "C. Queso Batido", desc: "300g Queso Fresco 0%, 40g Avena, 10g Almendras." },
                { title: "D. Tostada Pavo", desc: "60g Pan, 50g Aguacate, 80g Fiambre Pavo." }
            ],
            lunch: [
                { title: "A. Básico Limpio", desc: "180g Pollo, 70g Arroz integral, 10ml Aceite, Ensalada." },
                { title: "B. Pavo & Boniato", desc: "180g Pavo, 250g Boniato, Brócoli, 10ml Aceite." },
                { title: "C. Ensalada Pasta", desc: "70g Pasta, 1 Lata Atún natural, 1 Huevo duro, Tomate, 5ml Aceite." },
                { title: "D. Guiso Patata", desc: "200g Patata, 150g Magro cerdo, Verduras, 5ml Aceite." }
            ],
            dinner: [
                { title: "A. Pescado Blanco", desc: "200g Pescado, 200g Verdura, 10ml Aceite (o mayonesa light)." },
                { title: "B. Tortilla Verde", desc: "2 Huevos + 100ml Claras, Espárragos, 1 Yogur." },
                { title: "C. Burger Pollo", desc: "180g Burger Pollo (carnicería), Tomate aliñado, 5ml Aceite." },
                { title: "D. Conservas", desc: "2 Latas Sardinas (escurridas), Pimientos asados, 40g Pan." }
            ]
        }
    },

    // --- HARDGAINER (Volumen Alto) ---
    hardgainer: {
        nameBase: "NDP Heavy Duty Bulk",
        cat: "Volumen",
        desc: "BENEFICIO: Aporta la densidad energética necesaria para romper estancamientos de peso en metabolismos rápidos.",
        baseKcal: 3500,
        macros: { p: 20, c: 50, f: 30 },
        meals: 5,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Batido 1000kcal", desc: "400ml Leche entera, 120g Avena, 1 Plátano, 30g Whey, 25g Crema cacahuete." },
                { title: "B. Desayuno Americano", desc: "4 Huevos fritos, 30g Bacon, 150g Pan, Zumo." },
                { title: "C. Cereal Bowl", desc: "120g Corn Flakes, 400ml Leche, 30g Whey, 30g Nueces." },
                { title: "D. Sándwiches", desc: "4 Rebanadas Pan, 60g Mantequilla, 60g Mermelada, Batido Whey aparte." }
            ],
            lunch: [
                { title: "A. Pasta Carbonara", desc: "160g Pasta, 200g Carne Picada, 30g Bacon, 30g Queso, Nata ligera." },
                { title: "B. Arroz Cubana", desc: "160g Arroz, 3 Huevos fritos, 1 Plátano frito, Tomate." },
                { title: "C. Potaje", desc: "150g Garbanzos, Chorizo, Carne de guiso." },
                { title: "D. Entrecot", desc: "250g Entrecot, 400g Patatas fritas, Salsa." }
            ],
            snack: [
                { title: "A. Bocadillo Atún", desc: "160g Pan, 1 lata Atún Aceite, 2 Huevos duros, Mayonesa." },
                { title: "B. Batido Frutos", desc: "Batido Whey (leche), 50g Almendras, 1 Plátano." },
                { title: "C. Gofres Caseros", desc: "150g Harina, 2 Huevos, Miel, Sirope." },
                { title: "D. Yogur Full", desc: "2 Griegos, 50g Granola, 30g Miel, 20g Chocolate." }
            ],
            dinner: [
                { title: "A. Salmón Graso", desc: "220g Salmón, 400g Patata asada, 15ml Aceite." },
                { title: "B. Pizza Casera", desc: "Base 200g, Queso abundante, Atún/Pollo." },
                { title: "C. Burritos Tex-Mex", desc: "3 Tortillas, 200g Carne, Frijoles, Arroz, Queso, Aguacate." },
                { title: "D. Hamburguesas", desc: "2 Hamburguesas completas (Pan, Carne 150g x2, Queso, Bacon)." }
            ]
        }
    },

    // --- VEGETARIANA ---
    veggie: {
        nameBase: "NDP Vegetarian Power",
        cat: "Salud",
        desc: "BENEFICIO: Rendimiento deportivo óptimo con fuentes 100% vegetales y huevo/lácteos. Alta digestibilidad.",
        baseKcal: 2200,
        macros: { p: 25, c: 45, f: 30 },
        meals: 3,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Tostada Completa", desc: "2 Tostadas Integral, 2 Huevos, 50g Aguacate." },
                { title: "B. Porridge Soja", desc: "60g Avena, 250ml Leche Soja, 15g Chía, Fruta." },
                { title: "C. Yogur & Muesli", desc: "300g Yogur Griego, 50g Muesli, 20g Nueces." },
                { title: "D. Tortitas Avena", desc: "80g Harina Avena, 2 Huevos, 100g Queso batido, Canela." }
            ],
            lunch: [
                { title: "A. Lentejas", desc: "100g Lentejas, 40g Arroz, 10ml Aceite, Verduras." },
                { title: "B. Tofu Marinado", desc: "200g Tofu, 80g Quinoa, Brócoli, 10ml Aceite." },
                { title: "C. Pasta Proteica", desc: "100g Pasta, 100g Soja Texturizada (tomate), Queso." },
                { title: "D. Huevos Rotos", desc: "300g Patata asada, 2 Huevos fritos, Pimientos, 10ml Aceite." }
            ],
            dinner: [
                { title: "A. Burger Veggie", desc: "2 Burgers (Heura/Beyond), Ensalada, 10ml Aceite." },
                { title: "B. Tortilla Calabacín", desc: "Tortilla 2 Huevos, Calabacín, 60g Pan, Tomate." },
                { title: "C. Ensalada Queso", desc: "Ensalada grande, 100g Feta/Cabra, Nueces, Manzana, 10ml Aceite." },
                { title: "D. Pizza Veg", desc: "Base integral, Tomate, Mozzarella, Champiñones, Huevo." }
            ]
        }
    }
};

// ===============================================
// 4. GENERADOR MASIVO (100+ DIETAS)
// ===============================================
export const generateDiets = () => {
    const diets = [];
    
    // RANGOS DE GENERACIÓN (Pasos de 100 kcal)
    const configs = [
        { type: 'deficit', start: 1200, end: 2500, step: 100 },
        { type: 'classic', start: 2000, end: 4200, step: 100 }, 
        { type: 'hardgainer', start: 3000, end: 5000, step: 200 },
        { type: 'veggie', start: 1500, end: 3000, step: 150 }
    ];

    // 1. GENERAR DIETAS CALCULADAS
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
                description: base.desc, // Usa la nueva descripción con beneficios
                plan: scaledPlan
            });
        }
    });

    // 2. DIETAS MANUALES (Ad Libitum - Sin kcal fijas)
    
    // ANTI-INFLAMATORIA (NDP) - CORREGIDA
    diets.push({
        id: 'anti-inflam-ndp',
        name: 'Protocolo NDP Anti-Inflamatorio',
        category: 'Salud',
        calories: 'Saciedad',
        mealsPerDay: 3,
        macros: { p: 30, c: 20, f: 50 },
        isAdLibitum: true,
        description: "BENEFICIO: Reduce la inflamación sistémica, mejora la digestión y optimiza el ritmo circadiano. Ideal para desinflamar.",
        plan: {
            breakfast: [
                { title: "Opción A", desc: "Proteína + Grasa (Huevos/Carne + Aguacate). CERO carbohidratos." },
                { title: "Opción B (Ayuno)", desc: "Solo líquidos (Agua, Té, Café). Nada sólido hasta mediodía." }
            ],
            lunch: [
                { title: "Plato Único", desc: "Proteína limpia + Verduras SIN semillas (Crucíferas, Hojas verdes). Aceite Oliva/Coco." }
            ],
            dinner: [
                { title: "Carb Backloading", desc: "Proteína + Almidones (Boniato, Yuca, Plátano Macho, Calabaza). Ayuda al descanso." }
            ]
        }
    });

    // KETO STRICT
    diets.push({
        id: 'keto-strict',
        name: 'Protocolo NDP Keto Strict',
        category: 'Déficit',
        calories: 'Saciedad',
        mealsPerDay: 3,
        macros: { p: 25, c: 5, f: 70 },
        isAdLibitum: true,
        description: "BENEFICIO: Fuerza al cuerpo a usar grasa como energía (Cetosis). Energía mental estable y saciedad prolongada.",
        plan: {
            breakfast: [{title: "Keto A", desc: "3 Huevos fritos con Bacon."},{title: "Keto B", desc: "Café Bulletproof (Mantequilla + MCT)."}],
            lunch: [{title: "Grasa Alta", desc: "Muslos de pollo (con piel) + Queso + Verdura verde."}],
            dinner: [{title: "Pescado", desc: "Salmón al horno con mantequilla de hierbas y espinacas."}]
        }
    });

    return diets;
};

export const dietsDatabase = generateDiets();