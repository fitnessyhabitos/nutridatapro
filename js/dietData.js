// js/dietData.js

// FUNCIÓN MATEMÁTICA PARA ESCALAR GRAMOS
// Busca patrones como "200g", "150g" y los multiplica por el ratio
const scaleString = (text, ratio) => {
    return text.replace(/(\d+)g/g, (match, grams) => {
        const newGrams = Math.round(parseInt(grams) * ratio);
        return `${newGrams}g`; // Devuelve ej: "350g"
    }).replace(/(\d+) ud/g, (match, ud) => {
        // Los huevos/unidades no se suelen escalar decimalmente, redondeamos
        const newUd = Math.max(1, Math.round(parseInt(ud) * ratio)); 
        return `${newUd} ud`;
    });
};

// DEFINICIÓN DE DIETAS BASE (REFERENCIA: 2500 KCAL)
// Estas cantidades deben sumar 2500 kcal REALES.
// Bases: 
// - Arroz/Pasta: ~360 kcal/100g
// - Pollo/Carne: ~110-140 kcal/100g
// - Aceite: 900 kcal/100ml
const baseTemplates = {
    
    classic: {
        nameBase: "NDP Classic Bodybuilding",
        cat: "Volumen",
        desc: "Dieta clásica de culturismo. Alta en carbohidratos complejos, baja en grasa. Alimentos limpios pesados en crudo.",
        baseKcal: 2500, 
        macros: { p: 30, c: 50, f: 20 },
        meals: 4,
        isAdLibitum: false,
        // Cantidades para 2500 kcal exactas (aprox)
        plan: {
            breakfast: [
                { title: "Opción Avena", desc: "80g Avena suave, 250ml Claras de huevo, 1 Huevo entero (L), 1 Plátano mediano." },
                { title: "Opción Tortitas", desc: "90g Harina de Avena, 30g Whey Protein, 10g Cacao puro, 15g Nueces." }
            ],
            lunch: [
                { title: "Pollo y Arroz", desc: "180g Pechuga Pollo (crudo), 120g Arroz Basmati (peso crudo), 10g Aceite Oliva (1 cda), Verduras libres." },
                { title: "Ternera y Patata", desc: "180g Ternera Magra, 450g Patata (pesada cruda pelada), Ensalada verde." }
            ],
            snack: [
                { title: "Pre-Entreno", desc: "50g Crema de Arroz, 30g Whey Protein, 10g Crema de Cacahuete." },
                { title: "Bocadillo", desc: "100g Pan Barra, 80g Lomo Embuchado o Pavo, 1 pieza Fruta." }
            ],
            dinner: [
                { title: "Pescado Blanco", desc: "200g Merluza o Bacalao, 300g Patata asada/cocida, 10g Aceite Oliva, Verduras." },
                { title: "Salmón", desc: "150g Salmón fresco, 60g Quinoa (peso crudo), Espárragos." }
            ]
        }
    },

    deficit: {
        nameBase: "NDP Definition Cut",
        cat: "Déficit",
        desc: "Déficit calórico agresivo pero proteico. Reducción de hidratos. Prioridad saciedad.",
        baseKcal: 2000, // Referencia base 2000 para escalar
        macros: { p: 40, c: 30, f: 30 },
        meals: 3,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "Huevos", desc: "3 Huevos enteros (L), 50g Pan Integral tostado, 1 Kiwi." },
                { title: "Lácteo", desc: "300g Queso Fresco Batido 0%, 50g Avena, 15g Almendras." }
            ],
            lunch: [
                { title: "Pollo", desc: "180g Pollo plancha, 60g Arroz integral (crudo), 10g Aceite Oliva, Ensalada gigante." },
                { title: "Legumbre", desc: "80g Lentejas (peso crudo) estofadas con verduras, 100g Pollo desmenuzado." }
            ],
            dinner: [
                { title: "Pescado", desc: "200g Pescado Blanco, 200g Patata cocida/asada, 5g Aceite Oliva." },
                { title: "Sepia/Calamar", desc: "200g Sepia plancha, Ensalada de tomate y pepino, 10g Aceite Oliva." }
            ]
        }
    },

    hardgainer: {
        nameBase: "NDP Heavy Duty Bulk",
        cat: "Volumen",
        desc: "Volumen alto en calorías. Densidad energética aumentada con grasas y carbos rápidos.",
        baseKcal: 3500,
        macros: { p: 20, c: 50, f: 30 },
        meals: 5,
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "Batido Gainer", desc: "400ml Leche entera, 120g Avena, 1 Plátano, 30g Whey, 20g Crema cacahuete." }
            ],
            lunch: [
                { title: "Pasta", desc: "150g Pasta (peso crudo), 180g Carne picada mixta, 100g Tomate frito, Queso rallado." }
            ],
            snack: [
                { title: "Bocadillo", desc: "150g Pan Barra, 1 lata Atún aceite, 2 Huevos duros." },
                { title: "Dulce", desc: "100g Cereales Corn Flakes, 30g Whey, 300ml Leche entera." }
            ],
            dinner: [
                { title: "Carne Roja", desc: "200g Entrecot o Chuleta, 350g Patata frita (airfryer) o asada, Salsa." }
            ]
        }
    }
};

// GENERADOR AUTOMÁTICO
export const generateDiets = () => {
    const diets = [];
    let idCounter = 1;

    // 1. GENERAR VARIANTES MATEMÁTICAS
    // Definimos qué rangos queremos cubrir
    const configs = [
        { type: 'deficit', start: 1200, end: 2400, step: 100 }, // De 1200 a 2400 de 100 en 100
        { type: 'classic', start: 2000, end: 4000, step: 200 }, // Volumen clásico
        { type: 'hardgainer', start: 3000, end: 5000, step: 250 } // Volumen alto
    ];

    configs.forEach(cfg => {
        const base = baseTemplates[cfg.type];
        
        for (let targetKcal = cfg.start; targetKcal <= cfg.end; targetKcal += cfg.step) {
            // Factor de escala: Si quiero 3000 y la base es 2500 -> Ratio = 1.2
            const ratio = targetKcal / base.baseKcal;

            // Clonar y escalar el plan
            const scaledPlan = { ...base.plan };
            // Recorrer comidas (breakfast, lunch...)
            for (const mealKey in scaledPlan) {
                scaledPlan[mealKey] = scaledPlan[mealKey].map(opt => ({
                    title: opt.title,
                    desc: scaleString(opt.desc, ratio) // AQUÍ OCURRE LA MAGIA
                }));
            }

            diets.push({
                id: `diet-${cfg.type}-${targetKcal}`,
                name: `${base.nameBase} (${targetKcal} kcal)`,
                category: base.cat,
                calories: targetKcal,
                mealsPerDay: base.meals,
                macros: base.macros,
                isAdLibitum: false,
                description: base.desc + ` Cantidades ajustadas matemáticamente para ${targetKcal} kcal.`,
                plan: scaledPlan
            });
        }
    });

    // 2. AÑADIR DIETAS MANUALES (Ad Libitum, Anti-inflamatoria)
    // Estas NO se escalan, son cualitativas
    diets.push({
        id: 'anti-inflam-1',
        name: 'NDP Anti-Inflamatoria (Saciedad)',
        category: 'Salud',
        calories: 'Variable',
        mealsPerDay: 3,
        macros: { p: 30, c: 20, f: 50 },
        isAdLibitum: true,
        description: "Protocolo para salud digestiva y autoinmune. Sin contar calorías, comer hasta saciedad real.",
        plan: {
            breakfast: [{title: "Ayuno o Grasa", desc: "Idealmente Ayuno. Si hay hambre: Huevos revueltos con Ghee y Aguacate (Sin pan)."}],
            lunch: [{title: "Proteína + Verde", desc: "200-250g Carne roja (pasto) o Pescado azul. Verduras crucíferas. Aceite de Oliva abundante."}],
            dinner: [{title: "Carb Backloading", desc: "Pescado blanco o Mariscos. Acompañar de Boniato, Yuca o Plátano Macho (cocinado y enfriado)."}]
        }
    });

    diets.push({
        id: 'keto-strict-1',
        name: 'NDP Keto Strict (Saciedad)',
        category: 'Déficit',
        calories: 'Variable',
        mealsPerDay: 3,
        macros: { p: 25, c: 5, f: 70 },
        isAdLibitum: true,
        description: "Cetosis nutricional (<30g carbs). El cuerpo usa grasa como energía.",
        plan: {
            breakfast: [{title: "Keto Clásico", desc: "Huevos fritos con Bacon y medio Aguacate."}],
            lunch: [{title: "Grasa Alta", desc: "Muslos de pollo (con piel) asados + Brócoli con queso cheddar fundido."}],
            dinner: [{title: "Pescado Graso", desc: "Salmón al horno con mantequilla de hierbas y espinacas."}]
        }
    });

    return diets;
};

export const dietsDatabase = generateDiets();