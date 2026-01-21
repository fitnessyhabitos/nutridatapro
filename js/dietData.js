// js/dietData.js

// 1. FUNCIÓN MATEMÁTICA
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
        tips: ["Bebe 2 vasos de agua antes de comer.", "Mastica despacio para saciarte.", "Usa platos pequeños."],
        allowed: ["Verduras verdes", "Carnes magras", "Pescado blanco", "Frutos rojos"],
        forbidden: ["Fritos", "Alcohol", "Refrescos azucarados", "Bollería"],
        replacements: [{original:"Arroz", substitute:"Coliflor rallada"}, {original:"Pasta", substitute:"Calabacín espiralizado"}]
    },
    "Volumen": {
        tips: ["Cumple todas las comidas.", "Usa batidos si no tienes hambre.", "Añade aceite crudo al final."],
        allowed: ["Ternera", "Arroz/Pasta", "Frutos secos", "Aguacate", "Patata"],
        forbidden: ["Llenarse de ensalada antes de la carne", "Comida basura"],
        replacements: [{original:"Pollo", substitute:"Ternera (más kcal)"}, {original:"Agua", substitute:"Zumo o Leche"}]
    },
    "Salud": {
        tips: ["Prioriza alimentos frescos.", "Cena 2 horas antes de dormir.", "Luz solar por la mañana."],
        allowed: ["Pescado azul", "Aceite Oliva Virgen", "Nueces", "Legumbres"],
        forbidden: ["Procesados", "Azúcares añadidos", "Grasas trans"],
        replacements: [{original:"Pan blanco", substitute:"Pan Masa Madre"}, {original:"Azúcar", substitute:"Stevia"}]
    },
    "Senior": {
        tips: ["Comidas de fácil digestión.", "Bebe agua aunque no tengas sed.", "Cenas ligeras."],
        allowed: ["Purés", "Pescado limpio", "Huevos", "Yogur"],
        forbidden: ["Carnes duras", "Verduras flatulentas", "Exceso sal"],
        replacements: [{original:"Filete duro", substitute:"Albóndigas/Hamburguesa"}, {original:"Fruta entera", substitute:"Compota"}]
    }
};

// ===============================================
// 3. PLANTILLAS BASE (2500 kcal)
// ===============================================
const baseTemplates = {
    classic: {
        nameBase: "NDP Hipertrofia Clásica", cat: "Volumen",
        desc: "BENEFICIO: Ganancia muscular limpia. Menú tradicional español de gimnasio.",
        baseKcal: 2500, macros: { p:30, c:50, f:20 }, meals: 4, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Avena", desc:"80g Avena, 300ml Claras, 1 Huevo L, 10g Chocolate 85%"}, {title:"B. Tostadas", desc:"120g Pan Barra, Aceite, Tomate, 60g Jamón Serrano"}],
            lunch: [{title:"A. Pollo/Arroz", desc:"180g Pollo, 120g Arroz, 10ml Aceite, Ensalada"}, {title:"B. Lentejas", desc:"100g Lentejas (crudo) estofadas con verduras y 100g Pollo, 5ml Aceite"}],
            snack: [{title:"A. Bocadillo", desc:"100g Pan Barra, 80g Lomo/Cecina"}, {title:"B. Batido", desc:"30g Whey, 1 Plátano, 20g Nueces"}],
            dinner: [{title:"A. Merluza", desc:"220g Merluza, 350g Patata cocida, 10ml Aceite, Judías"}, {title:"B. Revuelto", desc:"3 Huevos, Gambas, Ajetes, 60g Pan"}]
        }
    },
    deficit: {
        nameBase: "NDP Definición Total", cat: "Déficit",
        desc: "BENEFICIO: Pérdida de grasa máxima manteniendo músculo. Alta saciedad.",
        baseKcal: 2000, macros: { p:40, c:30, f:30 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Tostada Pavo", desc:"60g Pan Integral, 80g Pavo alto %, Tomate"}, {title:"B. Tortilla", desc:"1 Huevo + 3 Claras, Espinacas, 1 Kiwi"}],
            lunch: [{title:"A. Pollo Plancha", desc:"180g Pollo, 60g Arroz integral, 10ml Aceite, Ensalada"}, {title:"B. Ternera", desc:"150g Ternera limpia, Brócoli vapor, 5ml Aceite"}],
            dinner: [{title:"A. Sepia/Emperador", desc:"200g Sepia, Ensalada tomate/pepino, 10ml Aceite"}, {title:"B. Conservas", desc:"2 Latas Atún natural, Pimientos piquillo, 30g Pan"}]
        }
    },
    hardgainer: {
        nameBase: "NDP Superávit Alto", cat: "Volumen",
        desc: "BENEFICIO: Para metabolismos muy rápidos. Comidas densas fáciles de comer.",
        baseKcal: 3500, macros: { p:20, c:50, f:30 }, meals: 5, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Huevos Fritos", desc:"3 Huevos fritos, 2 lonchas Panceta, 150g Pan, Zumo"}],
            lunch: [{title:"A. Pasta", desc:"160g Macarrones, 180g Carne picada, Tomate, Queso"}, {title:"B. Arroz Cubana", desc:"160g Arroz, 3 Huevos, Tomate, Plátano"}],
            snack: [{title:"A. Bocata", desc:"160g Pan Barra, Lomo/Queso, Aceite"}, {title:"B. Batido", desc:"400ml Leche entera, 120g Avena, Cacao, Miel"}],
            dinner: [{title:"A. Salmón", desc:"220g Salmón, 400g Patata frita airfryer, Mayonesa"}, {title:"B. Hamburguesa", desc:"2 Hamburguesas completas (Pan, Carne, Queso)"}]
        }
    },
    senior: {
        nameBase: "NDP Bienestar Senior/Fácil", cat: "Senior",
        desc: "BENEFICIO: Nutrición completa sin pesar. Medidas caseras visuales.",
        baseKcal: 2000, macros: { p:25, c:45, f:30 }, meals: 3, isAdLibitum: true,
        plan: {
            breakfast: [{title:"A. Tradicional", desc:"Café con leche + 2 Tostadas con aceite y jamón york"}, {title:"B. Ligero", desc:"Bol de yogur natural, puñado de nueces, 1 fruta blanda"}],
            lunch: [{title:"A. Cuchara", desc:"Plato hondo lentejas/garbanzos con verdura. Segundo: Filete pollo"}, {title:"B. Pescado", desc:"Pescado blanco al horno con patatas panadera. Cantidad: Plato llano"}],
            dinner: [{title:"A. Tortilla", desc:"Tortilla francesa 2 huevos. Tomate picado con aceite"}, {title:"B. Sopa", desc:"Sopa de fideos con huevo duro y jamón. Postre: Yogur"}]
        }
    }
};

// ===============================================
// 4. GENERADOR MASIVO (>130 DIETAS)
// ===============================================
export const generateDiets = () => {
    const diets = [];
    
    // RANGOS: Pasos de 50 kcal = MUCHAS MÁS DIETAS
    const configs = [
        { type: 'deficit', start: 1200, end: 2600, step: 50 },    // ~28 variantes
        { type: 'classic', start: 2000, end: 4500, step: 50 },    // ~50 variantes
        { type: 'hardgainer', start: 3000, end: 5500, step: 100 } // ~25 variantes
    ];

    configs.forEach(cfg => {
        const base = baseTemplates[cfg.type];
        for (let targetKcal = cfg.start; targetKcal <= cfg.end; targetKcal += cfg.step) {
            const ratio = targetKcal / base.baseKcal;
            const scaledPlan = { ...base.plan };
            for (const mealKey in scaledPlan) {
                if(scaledPlan[mealKey]) {
                    scaledPlan[mealKey] = scaledPlan[mealKey].map(opt => ({
                        title: opt.title, desc: scaleString(opt.desc, ratio)
                    }));
                }
            }
            diets.push({
                id: `diet-${cfg.type}-${targetKcal}`,
                name: `${base.nameBase} (${targetKcal} kcal)`,
                category: base.cat, calories: targetKcal, mealsPerDay: base.meals, macros: base.macros,
                isAdLibitum: false, description: base.desc, plan: scaledPlan
            });
        }
    });

    // DIETAS MANUALES ADICIONALES
    // Senior (3 variantes)
    ['Mantenimiento', 'Ligera', 'Plus'].forEach((v, i) => {
        diets.push({
            id: `senior-${i}`, name: `NDP Senior ${v}`, category: 'Senior',
            calories: 'Visual', mealsPerDay: 3, macros: baseTemplates.senior.macros, isAdLibitum: true,
            description: baseTemplates.senior.desc, plan: baseTemplates.senior.plan
        });
    });

    // Anti-inflamatoria
    diets.push({
        id: 'anti-inflam-ndp', name: 'Protocolo NDP Anti-Inflamatorio', category: 'Salud',
        calories: 'Saciedad', mealsPerDay: 3, macros: { p:30, c:20, f:50 }, isAdLibitum: true,
        description: "BENEFICIO: Desinflamación y descanso. Sin gluten/lácteos/solanáceas.",
        plan: {
            breakfast: [{title:"Opción A", desc:"Huevos/Carne + Aguacate. CERO carbos"}, {title:"Opción B", desc:"Ayuno (Solo líquidos)"}],
            lunch: [{title:"Única", desc:"Proteína limpia + Verduras SIN semillas. Aceite Oliva"}],
            dinner: [{title:"Recarga", desc:"Pescado/Carne + Boniato/Patata/Yuca"}]
        }
    });

    // Keto
    diets.push({
        id: 'keto-strict', name: 'Protocolo NDP Keto', category: 'Déficit',
        calories: 'Saciedad', mealsPerDay: 3, macros: { p:25, c:5, f:70 }, isAdLibitum: true,
        description: "BENEFICIO: Quema de grasa eficiente (Cetosis).",
        plan: {
            breakfast: [{title:"A", desc:"Huevos con Beicon"},{title:"B", desc:"Café Bulletproof"}],
            lunch: [{title:"Única", desc:"Muslos pollo (piel) + Queso + Verdura verde"}],
            dinner: [{title:"Única", desc:"Salmón, mantequilla, espárragos"}]
        }
    });

    return diets;
};

export const dietsDatabase = generateDiets();