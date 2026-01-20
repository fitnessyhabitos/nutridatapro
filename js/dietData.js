// js/dietData.js

// FUNCIÓN MATEMÁTICA PARA ESCALAR GRAMOS
const scaleString = (text, ratio) => {
    return text.replace(/(\d+)g/g, (match, grams) => {
        const newGrams = Math.round(parseInt(grams) * ratio);
        return `${newGrams}g`;
    }).replace(/(\d+) ud/g, (match, ud) => {
        const newUd = Math.max(1, Math.round(parseInt(ud) * ratio)); 
        return `${newUd} ud`;
    }).replace(/(\d+)ml/g, (match, ml) => { // Escalar líquidos/aceites
         const newMl = Math.max(5, Math.round(parseInt(ml) * ratio));
         return `${newMl}ml`;
    });
};

// ===============================================
// PLANTILLAS BASE (REFERENCIA: 2500 KCAL EXACTAS)
// ===============================================
const baseTemplates = {
    
    // 1. CLÁSICA (Balanceada - Volumen Limpio)
    classic: {
        nameBase: "NDP Classic Bodybuilding",
        cat: "Volumen",
        desc: "Comida limpia pesada en crudo. Opciones variadas. Recuerda: El aceite cuenta como kcal.",
        baseKcal: 2500, 
        macros: { p: 30, c: 50, f: 20 },
        meals: 4,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Clásico", desc: "80g Avena cocida con agua, 300ml Claras, 1 Huevo entero (L), 10g Chocolate 85%." },
                { title: "B. Tortitas", desc: "100g Harina Avena, 30g Whey, 1 Huevo entero, 15g Crema Cacahuete." },
                { title: "C. Tostadas", desc: "120g Pan Hogaza, 2 Huevos plancha, 60g Jamón Serrano (sin grasa), 1 Kiwi." },
                { title: "D. Yogur Bowl", desc: "400g Yogur Proteico/Griego Light, 80g Cereales sin azúcar, 20g Nueces, 1 Plátano." }
            ],
            lunch: [
                { title: "A. Pollo/Arroz", desc: "180g Pechuga Pollo (crudo), 120g Arroz Basmati (crudo), 10ml Aceite Oliva (Aviso: Medir bien), Verduras libres." },
                { title: "B. Ternera/Patata", desc: "180g Ternera Magra, 500g Patata (cruda pelada) en airfryer, Ensalada verde, 5ml Aceite Oliva." },
                { title: "C. Pasta Boloñesa", desc: "120g Pasta (cruda), 150g Carne Picada Vacuno/Pollo, 150g Tomate Triturado, 10ml Aceite Oliva." },
                { title: "D. Legumbre", desc: "100g Lentejas/Garbanzos (peso crudo), 120g Pollo desmenuzado, Verduras estofadas, 5ml Aceite." }
            ],
            snack: [
                { title: "A. Pre-Entreno", desc: "60g Crema de Arroz, 30g Whey Protein, 10g Crema de Cacahuete." },
                { title: "B. Salado", desc: "120g Pan Barra, 80g Lomo Embuchado o Cecina, 1 Manzana." },
                { title: "C. Batido Rápido", desc: "40g Whey Protein, 1 Plátano, 30g Nueces." },
                { title: "D. Tortitas Arroz", desc: "4 Tortitas de Arroz grandes, 80g Pavo, 15g Almendras." }
            ],
            dinner: [
                { title: "A. Pescado Blanco", desc: "220g Merluza/Bacalao, 350g Patata cocida, 10ml Aceite Oliva, Judías verdes." },
                { title: "B. Salmón", desc: "150g Salmón fresco, 70g Quinoa (cruda), Espárragos trigueros." },
                { title: "C. Huevos/Verdura", desc: "3 Huevos enteros (tortilla), 400g Menestra de verduras, 5ml Aceite." },
                { title: "D. Sepia/Calamar", desc: "250g Sepia plancha, Ensalada completa, 10ml Aceite Oliva, 60g Pan integral." }
            ]
        }
    },

    // 2. DÉFICIT (Pérdida de Grasa)
    deficit: {
        nameBase: "NDP Definition Cut",
        cat: "Déficit",
        desc: "Déficit calórico. Prioridad proteína y saciedad. Pesos en crudo.",
        baseKcal: 2000, 
        macros: { p: 40, c: 30, f: 30 },
        meals: 3,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Revuelto", desc: "3 Huevos enteros (L), 60g Pan Integral, 1 Naranja." },
                { title: "B. Porridge", desc: "50g Avena, 250ml Leche desnatada/vegetal, 30g Whey Protein, Canela." },
                { title: "C. Queso Batido", desc: "300g Queso Fresco Batido 0%, 40g Granola baja en azúcar, 10g Almendras." },
                { title: "D. Tostada Salada", desc: "60g Pan, 50g Aguacate, 80g Fiambre de Pavo alto % carne." }
            ],
            lunch: [
                { title: "A. Básico", desc: "180g Pollo plancha, 70g Arroz integral (crudo), 10ml Aceite Oliva, Ensalada." },
                { title: "B. Pavo/Boniato", desc: "180g Pechuga Pavo, 250g Boniato asado, Brócoli al vapor, 10ml Aceite." },
                { title: "C. Ensalada Pasta", desc: "70g Pasta (cruda), 1 Lata Atún natural, 1 Huevo duro, Tomate, 5ml Aceite." },
                { title: "D. Guiso Ligero", desc: "200g Patata, 150g Magro de cerdo limpio, Verduras, 5ml Aceite." }
            ],
            dinner: [
                { title: "A. Pescado/Verdura", desc: "200g Pescado Blanco, 200g Brócoli/Coliflor, 10ml Aceite Oliva (o mayonesa light)." },
                { title: "B. Tortilla", desc: "2 Huevos enteros + 100ml Claras, Espárragos, 1 Yogur desnatado postre." },
                { title: "C. Burguer Fit", desc: "180g Hamburguesa Pollo/Espinacas (carnicería), Ensalada de tomate, 5ml Aceite." },
                { title: "D. Conservas", desc: "2 Latas Sardinas/Caballa (escurridas), Pimientos asados, 40g Pan." }
            ]
        }
    },

    // 3. HARDGAINER (Volumen Alto)
    hardgainer: {
        nameBase: "NDP Heavy Duty Bulk",
        cat: "Volumen",
        desc: "Alta densidad calórica. Si cuesta comer, usar batidos. Aceite y grasas son clave.",
        baseKcal: 3500,
        macros: { p: 20, c: 50, f: 30 },
        meals: 5,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Batido Gainer", desc: "400ml Leche entera, 120g Avena, 1 Plátano, 30g Whey, 25g Crema cacahuete." },
                { title: "B. Huevos/Bacon", desc: "4 Huevos fritos, 30g Bacon, 150g Pan barra, Zumo naranja." },
                { title: "C. Bol Cereales", desc: "120g Corn Flakes, 400ml Leche, 30g Whey, 30g Nueces." },
                { title: "D. Sándwiches", desc: "4 Rebanadas Pan Molde, 60g Mantequilla, 60g Mermelada, 1 Batido Whey aparte." }
            ],
            lunch: [
                { title: "A. Pasta Boloñesa", desc: "160g Pasta (cruda), 200g Carne Picada Mixta, 150g Tomate frito, 30g Queso rallado." },
                { title: "B. Arroz Cubana", desc: "160g Arroz blanco (crudo), 3 Huevos fritos, 1 Plátano frito, Tomate." },
                { title: "C. Legumbre", desc: "150g Garbanzos (crudos) con chorizo y carne (plato de cuchara contundente)." },
                { title: "D. Entrecot", desc: "250g Entrecot/Chuletón, 400g Patatas fritas (caseras o airfryer), Salsa al gusto." }
            ],
            snack: [
                { title: "A. Bocadillo", desc: "160g Pan Barra, 1 lata Atún Aceite, 2 Huevos duros, Mayonesa." },
                { title: "B. Batido + Frutos", desc: "Batido Whey (leche), 50g Almendras, 1 Plátano." },
                { title: "C. Gofres/Tortitas", desc: "150g Harina, 2 Huevos, Leche (Masa casera), Miel por encima." },
                { title: "D. Yogur Full", desc: "2 Yogures Griegos, 50g Granola, 30g Miel, 20g Chocolate." }
            ],
            dinner: [
                { title: "A. Salmón", desc: "220g Salmón, 400g Patata asada, 15ml Aceite Oliva." },
                { title: "B. Pizza Casera", desc: "Base pizza (200g), Tomate, Mozzarella abundante, Atún/Pollo." },
                { title: "C. Burritos", desc: "3 Tortillas Trigo, 200g Carne picada, Frijoles, Arroz, Queso, Aguacate." },
                { title: "D. Hamburguesas", desc: "2 Hamburguesas completas (Pan, Carne 150g x2, Queso, Bacon)." }
            ]
        }
    },

    // 4. VEGETARIANA (Ovo-Lacto)
    veggie: {
        nameBase: "NDP Vegetarian Power",
        cat: "Salud",
        desc: "Dieta Ovo-Lacto Vegetariana equilibrada. Proteína completa.",
        baseKcal: 2200,
        macros: { p: 25, c: 45, f: 30 },
        meals: 3,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "A. Tostada Huevo", desc: "2 Tostadas Pan Integral, 2 Huevos plancha, 50g Aguacate." },
                { title: "B. Porridge Soja", desc: "60g Avena, 250ml Leche Soja, 15g Semillas Chía, Fruta." },
                { title: "C. Yogur Griego", desc: "300g Yogur Griego, 50g Muesli, 20g Nueces." },
                { title: "D. Tortitas", desc: "80g Harina Avena, 2 Huevos, 100g Queso batido, Canela." }
            ],
            lunch: [
                { title: "A. Lentejas", desc: "100g Lentejas (crudo), Arroz (40g) para completar proteína, Verduras, 10ml Aceite." },
                { title: "B. Tofu Marinado", desc: "200g Tofu firme, 80g Quinoa (cruda), Brócoli, Salsa Soja, 10ml Aceite." },
                { title: "C. Pasta", desc: "100g Pasta integral, 100g Soja Texturizada (hidratada) con tomate, Queso Parmesano." },
                { title: "D. Huevos Rotos", desc: "300g Patata asada, 2 Huevos fritos, Pimientos padrón, 10ml Aceite." }
            ],
            dinner: [
                { title: "A. Burger Veggie", desc: "2 Hamburguesas vegetales (Heura/Beyond), Ensalada completa, 10ml Aceite." },
                { title: "B. Tortilla", desc: "Tortilla de 2 Huevos con Calabacín, 60g Pan, Tomate aliñado." },
                { title: "C. Ensalada Queso", desc: "Ensalada grande, 100g Queso Feta/Cabra, Nueces, Manzana, 10ml Aceite." },
                { title: "D. Pizza Veg", desc: "Base integral, Tomate, Mozzarella, Champiñones, Huevo en medio." }
            ]
        }
    }
};

// GENERADOR MASIVO
export const generateDiets = () => {
    const diets = [];
    let idCounter = 1;

    // RANGOS DE GENERACIÓN (Pasos pequeños = Más dietas)
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
                // Si la dieta tiene menos comidas (ej: deficit tiene 3, pero hardgainer 5), filtramos
                if(scaledPlan[mealKey]) {
                    scaledPlan[mealKey] = scaledPlan[mealKey].map(opt => ({
                        title: opt.title,
                        desc: scaleString(opt.desc, ratio) // ESCALADO MATEMÁTICO
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
                description: base.desc + ` Gramos ajustados para ${targetKcal} kcal.`,
                plan: scaledPlan
            });
        }
    });

    // 2. DIETAS MANUALES (Ad Libitum)
    diets.push({
        id: 'anti-inflam-growth',
        name: 'NDP Protocolo Growth (Anti-Inflamatoria)',
        category: 'Salud',
        calories: 'Saciedad',
        mealsPerDay: 3,
        macros: { p: 30, c: 20, f: 50 },
        isAdLibitum: true,
        description: "Protocolo 'Growth Lab'. Sin lectinas (NO tomate, pimiento, berenjena). Carb Backloading.",
        plan: {
            breakfast: [
                { title: "Opción A", desc: "Huevos, Carne o Pescado + Aguacate o Aceitunas. CERO carbos." },
                { title: "Opción B (Ayuno)", desc: "Solo Café negro, Té o Agua con sal y limón." }
            ],
            lunch: [
                { title: "Única", desc: "Carne/Pescado + Verduras SIN semillas (Espinacas, Brócoli). Aceite de Oliva/Coco." }
            ],
            dinner: [
                { title: "Backloading", desc: "Proteína + Boniato, Yuca o Plátano Macho (Almidones permitidos)." }
            ]
        }
    });

    diets.push({
        id: 'keto-strict',
        name: 'NDP Keto Strict (Saciedad)',
        category: 'Déficit',
        calories: 'Saciedad',
        mealsPerDay: 3,
        macros: { p: 25, c: 5, f: 70 },
        isAdLibitum: true,
        description: "Cetosis nutricional (<30g carbs).",
        plan: {
            breakfast: [{title: "Keto A", desc: "3 Huevos fritos con Bacon."},{title: "Keto B", desc: "Café Bulletproof (Mantequilla + MCT)."}],
            lunch: [{title: "Grasa Alta", desc: "Muslos de pollo (con piel) + Queso + Verdura verde."}],
            dinner: [{title: "Pescado", desc: "Salmón con mantequilla y espárragos."}]
        }
    });

    return diets;
};

export const dietsDatabase = generateDiets();