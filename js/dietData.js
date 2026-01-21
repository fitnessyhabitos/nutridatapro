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
// 2. GUÍAS EDUCATIVAS
// ===============================================
export const dietGuides = {
    "Déficit": {
        tips: ["Bebe 2 vasos de agua antes de comer.", "Mastica despacio.", "Usa platos de postre para que parezca más cantidad."],
        allowed: ["Verduras", "Carnes magras", "Pescado blanco", "Frutos rojos"],
        forbidden: ["Fritos", "Rebozados", "Alcohol", "Refrescos", "Bollería"],
        replacements: [{original:"Arroz", substitute:"Coliflor rallada"}, {original:"Pasta", substitute:"Calabacín en tiras"}]
    },
    "Volumen": {
        tips: ["No te saltes comidas.", "Si te llenas rápido, usa batidos.", "Añade aceite de oliva en crudo al final."],
        allowed: ["Ternera", "Arroz/Pasta", "Frutos secos", "Aguacate", "Patata"],
        forbidden: ["Saciarte con ensalada antes de la carne", "Comida basura"],
        replacements: [{original:"Pollo", substitute:"Ternera (más kcal)"}, {original:"Agua", substitute:"Zumo o Leche"}]
    },
    "Salud": {
        tips: ["Prioriza alimentos frescos.", "Cena 2 horas antes de dormir.", "Toma el sol por la mañana."],
        allowed: ["Pescado azul", "Aceite Oliva Virgen", "Nueces", "Legumbres"],
        forbidden: ["Procesados", "Azúcares añadidos", "Grasas trans"],
        replacements: [{original:"Pan blanco", substitute:"Pan Integral/Masa madre"}, {original:"Azúcar", substitute:"Stevia/Eritritol"}]
    },
    "Senior": { // NUEVA CATEGORÍA
        tips: ["Comidas de fácil digestión.", "La hidratación es vital (bebe aunque no tengas sed).", "Cenas ligeras."],
        allowed: ["Purés", "Pescado sin espinas", "Huevos", "Lácteos fermentados"],
        forbidden: ["Carnes muy duras", "Verduras flatulentas (col)", "Exceso de sal"],
        replacements: [{original:"Carne dura", substitute:"Carne picada o albóndigas"}, {original:"Fruta entera", substitute:"Compota o asada"}]
    }
};

// ===============================================
// 3. PLANTILLAS MAESTRAS (Base 2500 kcal)
// ===============================================
const baseTemplates = {
    
    // --- VOLUMEN LIMPIO (ESPAÑA) ---
    classic: {
        nameBase: "NDP Hipertrofia Clásica",
        cat: "Volumen",
        desc: "BENEFICIO: Ganancia muscular limpia. Alimentos tradicionales de gimnasio adaptados a la cocina española.",
        baseKcal: 2500, macros: { p:30, c:50, f:20 }, meals: 4, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Avena", desc:"80g Avena con leche/agua, 1 Huevo L, 4 Claras (tortilla)."}, {title:"B. Tostadas", desc:"120g Pan de Barra, Aceite Oliva, Tomate triturado, 60g Jamón Serrano."}],
            lunch: [{title:"A. Pollo/Arroz", desc:"180g Pechuga Pollo, 120g Arroz, 10ml Aceite Oliva, Ensalada mixta."}, {title:"B. Lentejas", desc:"100g Lentejas (crudo) estofadas con verduras y 100g Pollo troceado, 5ml Aceite."}],
            snack: [{title:"A. Bocadillo", desc:"100g Pan Barra, 80g Lomo Embuchado o Cecina."}, {title:"B. Batido", desc:"30g Whey Protein, 1 Plátano, 20g Nueces."}],
            dinner: [{title:"A. Merluza", desc:"220g Merluza/Bacalao, 350g Patata cocida, 10ml Aceite, Judías verdes."}, {title:"B. Revuelto", desc:"3 Huevos, Gambas, Ajetes/Espárragos, 60g Pan."}]
        }
    },

    // --- DÉFICIT / DEFINICIÓN ---
    deficit: {
        nameBase: "NDP Definición Total",
        cat: "Déficit",
        desc: "BENEFICIO: Pérdida de grasa manteniendo músculo. Alta saciedad.",
        baseKcal: 2000, macros: { p:40, c:30, f:30 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Tostada Pavo", desc:"60g Pan Integral, 80g Pechuga Pavo (fiambre bueno), Tomate."}, {title:"B. Tortilla", desc:"1 Huevo + 3 Claras, Espinacas, 1 Kiwi."}],
            lunch: [{title:"A. Pollo Plancha", desc:"180g Pollo, 60g Arroz integral, 10ml Aceite, Ensalada grande."}, {title:"B. Ternera", desc:"150g Filete Ternera limpia, Brócoli al vapor, 5ml Aceite."}],
            dinner: [{title:"A. Sepia/Emperador", desc:"200g Sepia o Emperador, Ensalada de tomate y pepino, 10ml Aceite."}, {title:"B. Conservas", desc:"2 Latas Atún natural, Pimientos del piquillo, 30g Pan."}]
        }
    },

    // --- HARDGAINER (Volumen Alto) ---
    hardgainer: {
        nameBase: "NDP Superávit Alto",
        cat: "Volumen",
        desc: "BENEFICIO: Para metabolismos muy rápidos. Comidas densas y fáciles de tragar.",
        baseKcal: 3500, macros: { p:20, c:50, f:30 }, meals: 5, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Huevos Fritos", desc:"3 Huevos fritos, 2 lonchas Beicon/Panceta, 150g Pan, Zumo Naranja."}],
            lunch: [{title:"A. Pasta", desc:"160g Macarrones, 180g Carne picada mixta, Tomate frito, Queso rallado."}, {title:"B. Arroz Cubana", desc:"160g Arroz, 3 Huevos, Tomate, Plátano frito."}],
            snack: [{title:"A. Bocata Lomo", desc:"160g Pan Barra, Lomo/Queso, Aceite."}, {title:"B. Batido Casero", desc:"400ml Leche entera, 120g Avena, Cacao, Miel."}],
            dinner: [{title:"A. Salmón", desc:"220g Salmón, 400g Patata asada/frita airfryer, Mayonesa."}, {title:"B. Hamburguesa", desc:"2 Hamburguesas completas (Pan, Carne, Queso)."}]
        }
    },

    // --- SENIOR / FÁCIL (NUEVA: SIN PESAR) ---
    senior: {
        nameBase: "NDP Bienestar Senior/Fácil",
        cat: "Senior", // Color Azul
        desc: "BENEFICIO: Nutrición completa sin complicaciones. Medidas caseras visuales (sin báscula).",
        baseKcal: 2000, macros: { p:25, c:45, f:30 }, meals: 3, isAdLibitum: true, // Truco para no mostrar kcal exactas
        plan: {
            breakfast: [
                { title: "Opción Tradicional", desc: "Café con leche (o descafeinado) + 2 Tostadas con aceite de oliva y un poco de jamón york o pavo." },
                { title: "Opción Ligera", desc: "Un bol de yogur natural con un puñado de nueces picadas y una pieza de fruta blanda (pera/plátano)." }
            ],
            lunch: [
                { title: "Plato de Cuchara", desc: "Un plato hondo de lentejas o garbanzos estofados con verduras (patata, zanahoria). De segundo: Un filete de pollo pequeño." },
                { title: "Pescado", desc: "Pescado blanco (Merluza/Gallo) sin espinas al horno con patatas panadera. Cantidad: Lo que quepa en un plato llano." },
                { title: "Puré y Carne", desc: "Crema de calabacín o verduras. De segundo: Dos albóndigas caseras o filete ruso tierno." }
            ],
            dinner: [
                { title: "Tortilla", desc: "Tortilla francesa de 1 o 2 huevos. Acompañar de un tomate picado con aceite." },
                { title: "Sopa", desc: "Sopa de fideos con huevo duro picado y jamón. De postre: Un yogur." }
            ]
        }
    }
};

// ===============================================
// 4. GENERADOR MASIVO (+100 DIETAS)
// ===============================================
export const generateDiets = () => {
    const diets = [];
    
    // RANGOS AJUSTADOS (Pasos más pequeños = Más dietas)
    // Step 50 o 75 genera muchas variantes
    const configs = [
        { type: 'deficit', start: 1200, end: 2400, step: 75 }, // ~16 dietas
        { type: 'classic', start: 2000, end: 4000, step: 75 }, // ~26 dietas
        { type: 'hardgainer', start: 3000, end: 5000, step: 100 } // ~20 dietas
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
                description: base.desc,
                plan: scaledPlan
            });
        }
    });

    // 2. DIETAS MANUALES (Ad Libitum y Senior)
    
    // SENIOR (Generamos 3 variantes ligeras manuales para dar volumen)
    diets.push({
        id: 'senior-std', name: 'NDP Senior Mantenimiento', category: 'Senior',
        calories: 'Visual', mealsPerDay: 3, macros: { p:25, c:45, f:30 }, isAdLibitum: true,
        description: baseTemplates.senior.desc, plan: baseTemplates.senior.plan
    });
    diets.push({
        id: 'senior-light', name: 'NDP Senior Ligera (Cenas suaves)', category: 'Senior',
        calories: 'Visual', mealsPerDay: 3, macros: { p:30, c:40, f:30 }, isAdLibitum: true,
        description: "Versión más ligera para digestiones pesadas. Cenas basadas en cremas y pescados.",
        plan: baseTemplates.senior.plan // Usamos la misma base por simplicidad visual
    });

    // ANTI-INFLAMATORIA (NDP)
    diets.push({
        id: 'anti-inflam-ndp', name: 'Protocolo NDP Anti-Inflamatorio', category: 'Salud',
        calories: 'Saciedad', mealsPerDay: 3, macros: { p:30, c:20, f:50 }, isAdLibitum: true,
        description: "BENEFICIO: Reduce hinchazón abdominal y mejora energía. Sin gluten/lácteos. Carb Backloading.",
        plan: {
            breakfast: [{ title: "Opción A", desc: "Huevos, Carne o Pescado + Aguacate. CERO carbos." }, { title: "Opción B (Ayuno)", desc: "Solo Café/Té/Agua." }],
            lunch: [{ title: "Plato Único", desc: "Proteína limpia + Verduras (Espinacas, Calabacín, Judías). Aceite Oliva." }],
            dinner: [{ title: "Recarga", desc: "Pescado/Carne + Boniato, Patata asada o Arroz blanco (enfriado)." }]
        }
    });

    // KETO
    diets.push({
        id: 'keto-strict', name: 'Protocolo NDP Keto', category: 'Déficit',
        calories: 'Saciedad', mealsPerDay: 3, macros: { p:25, c:5, f:70 }, isAdLibitum: true,
        description: "BENEFICIO: Quema de grasa eficiente usando cuerpos cetónicos. Energía mental.",
        plan: {
            breakfast: [{title: "Keto A", desc: "3 Huevos fritos con Beicon."},{title: "Keto B", desc: "Café Bulletproof (Mantequilla + MCT)."}],
            lunch: [{title: "Grasa Alta", desc: "Muslos de pollo con piel + Queso curado + Verdura verde."}],
            dinner: [{title: "Pescado", desc: "Salmón con mayonesa casera y espárragos."}]
        }
    });

    return diets;
};

export const dietsDatabase = generateDiets();