// js/dietData.js

// 1. FUNCIÓN MATEMÁTICA (ESCALADO)
const scaleString = (text, ratio) => {
    return text.replace(/(\d+)g/g, (match, grams) => `${Math.round(parseInt(grams) * ratio)}g`)
               .replace(/(\d+) ud/g, (match, ud) => `${Math.max(1, Math.round(parseInt(ud) * ratio))} ud`)
               .replace(/(\d+)ml/g, (match, ml) => `${Math.max(5, Math.round(parseInt(ml) * ratio))}g`); // CAMBIADO ML A G (ACEITE)
};

// 2. GUÍAS EDUCATIVAS
export const dietGuides = {
    "Déficit": {
        benefit: "BENEFICIO: Maximiza la quema de grasa manteniendo la masa muscular. Control de insulina.",
        tips: ["🚫 PROHIBIDO picar entre horas.", "🚫 Café con leche prohibido (usa solo o con bebida vegetal).", "Agua antes de comer."],
        allowed: ["Verduras verdes (calabacín, espinaca)", "Pollo/Pavo/Conejo", "Pescado blanco", "Claras"],
        forbidden: ["Azúcar", "Alcohol", "Fritos", "Leche de vaca entera"],
        replacements: [{original:"Arroz", substitute:"Coliflor rallada"}, {original:"Pasta", substitute:"Calabacín espiralizado"}]
    },
    "Volumen": {
        benefit: "BENEFICIO: Superávit para crear tejido muscular nuevo.",
        tips: ["Cumple todas las comidas.", "Usa batidos si te llenas.", "Aceite siempre en crudo."],
        allowed: ["Ternera", "Arroz/Pasta", "Patata/Boniato", "Avena", "Aceite Oliva"],
        forbidden: ["Comida basura (Dirty Bulk)", "Saltarse comidas"],
        replacements: [{original:"Pollo", substitute:"Ternera (más kcal)"}, {original:"Agua", substitute:"Zumo"}]
    },
    "Salud": {
        benefit: "BENEFICIO: Desinflamación sistémica, mejora digestiva y hormonal.",
        tips: ["Cena 2h antes de dormir.", "Evita picos de glucosa.", "Mastica mucho."],
        allowed: ["Pescado azul", "Verduras color", "Frutas", "Legumbres", "Aceite Oliva"],
        forbidden: ["Procesados", "Grasas trans", "Azúcares libres"],
        replacements: [{original:"Pan blanco", substitute:"Pan Masa madre"}, {original:"Azúcar", substitute:"Eritritol"}]
    },
    "Senior": {
        benefit: "BENEFICIO: Mantenimiento fácil y digestivo.",
        tips: ["Cenas ligeras.", "Hidrátate aunque no tengas sed.", "Evita alimentos duros."],
        allowed: ["Pescados", "Cremas/Purés", "Huevos", "Yogur"],
        forbidden: ["Exceso sal", "Picantes", "Carnes duras"],
        replacements: [{original:"Carne", substitute:"Albóndigas"}, {original:"Fruta", substitute:"Compota"}]
    }
};

// 3. PLANTILLAS (PESOS EN GRAMOS)
const baseTemplates = {
    classic: {
        nameBase: "NDP Hipertrofia Clásica", cat: "Volumen",
        desc: "Dieta clásica de gimnasio. Alta proteína.",
        baseKcal: 2500, macros: { p:30, c:50, f:20 }, meals: 4, isAdLibitum: false,
        plan: {
            breakfast: [
                {title:"A. Avena", desc:"80g Avena, 300g Claras, 1 Huevo L, 10g Chocolate 85%."},
                {title:"B. Tostadas", desc:"120g Pan Barra, 10g Aceite, 150g Tomate, 60g Jamón."},
                {title:"C. Tortitas", desc:"100g Harina Avena, 1 Huevo, 30g Whey, Canela."}
            ],
            lunch: [
                {title:"A. Pollo/Arroz", desc:"180g Pollo, 120g Arroz (crudo), 10g Aceite, 200g Verdura."},
                {title:"B. Ternera", desc:"180g Ternera, 500g Patata cocida, 5g Aceite, Ensalada."},
                {title:"C. Lentejas", desc:"100g Lentejas (crudo), 100g Pollo, 200g Verdura."},
                {title:"D. Pasta", desc:"120g Pasta, 150g Carne Picada, 100g Tomate frito."},
                {title:"E. Pescado", desc:"200g Pescado, 400g Boniato, 10g Aceite."}
            ],
            snack: [
                {title:"A. Bocadillo", desc:"100g Pan, 80g Lomo/Cecina."},
                {title:"B. Batido", desc:"30g Whey, 1 Plátano, 20g Nueces."},
                {title:"C. Yogur", desc:"300g Queso batido, 50g Cereales, 1 Fruta."}
            ],
            dinner: [
                {title:"A. Merluza", desc:"220g Merluza, 350g Patata, 10g Aceite, Verdura."},
                {title:"B. Revuelto", desc:"3 Huevos, 100g Gambas, 60g Pan."},
                {title:"C. Ensalada", desc:"Ensalada, 2 Latas Atún, 1 Huevo, 50g Aguacate."},
                {title:"D. Sepia", desc:"250g Sepia, Ensalada tomate, 50g Pan."},
                {title:"E. Wrap", desc:"2 Tortitas trigo, 150g Pollo, Lechuga, Salsa yogur."}
            ]
        }
    },
    deficit: {
        nameBase: "NDP Definición Total", cat: "Déficit",
        desc: "Pérdida de grasa. Alta saciedad.",
        baseKcal: 2000, macros: { p:40, c:30, f:30 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [
                {title:"A. Tostada", desc:"60g Pan Integral, 80g Pavo, Tomate, 5g Aceite."},
                {title:"B. Tortilla", desc:"1 Huevo + 300g Claras, 100g Espinacas."},
                {title:"C. Porridge", desc:"40g Avena, 200g Leche desnatada, 25g Whey."}
            ],
            lunch: [
                {title:"A. Pollo", desc:"180g Pollo, 60g Arroz integral (crudo), 10g Aceite, 250g Ensalada."},
                {title:"B. Ternera", desc:"150g Ternera magra, 200g Brócoli, 5g Aceite, 150g Patata."},
                {title:"C. Legumbre", desc:"80g Garbanzos (crudo), Espinacas, 1 Huevo duro."},
                {title:"D. Pasta Fría", desc:"60g Pasta, 1 Lata Atún, Tomate, Pepino, 5g Aceite."},
                {title:"E. Pavo", desc:"180g Pavo, 50g Quinoa, Calabacín, 10g Aceite."}
            ],
            dinner: [
                {title:"A. Pescado", desc:"200g Pescado blanco, 200g Verdura, 10g Aceite."},
                {title:"B. Tortilla", desc:"2 Huevos, Espárragos, 1 Yogur."},
                {title:"C. Burger", desc:"180g Burger Pollo, Tomate aliñado (sin pan)."},
                {title:"D. Conservas", desc:"2 Latas Sardinas, Pimientos asados, 30g Pan."},
                {title:"E. Pulpo", desc:"200g Pulpo/Sepia, Ensalada verde, 5g Aceite."}
            ]
        }
    },
    senior: {
        nameBase: "NDP Senior Fácil", cat: "Senior",
        desc: "Medidas caseras visuales.",
        baseKcal: 2000, macros: { p:25, c:45, f:30 }, meals: 3, isAdLibitum: true,
        plan: {
            breakfast: [{title:"A", desc:"Café leche + 2 Tostadas aceite/york."}, {title:"B", desc:"Yogur natural, nueces, fruta."}],
            lunch: [{title:"A", desc:"Lentejas estofadas. Filete pollo."}, {title:"B", desc:"Pescado horno con patata."}],
            dinner: [{title:"A", desc:"Tortilla francesa 2 huevos. Tomate."}, {title:"B", desc:"Sopa fideos con huevo. Yogur."}]
        }
    },
    salud: {
        nameBase: "NDP Salud Integral", cat: "Salud",
        desc: "Equilibrio hormonal y digestivo.",
        baseKcal: 2200, macros: { p:25, c:40, f:35 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A", desc:"2 Huevos revueltos, 100g Fruta, Té."}, {title:"B", desc:"Yogur Griego, 30g Nueces, Arándanos."}],
            lunch: [{title:"A", desc:"200g Salmón, 150g Quinoa, Espárragos."}, {title:"B", desc:"180g Pollo, 200g Boniato, Ensalada."}],
            dinner: [{title:"A", desc:"Crema Verduras, 150g Pescado blanco."}, {title:"B", desc:"Ensalada completa con aguacate y atún."}]
        }
    }
};

export const generateDiets = () => {
    const diets = [];
    // ESCALADO PARA TODOS LOS TIPOS
    const configs = [
        { type: 'deficit', start: 1200, end: 2600, step: 50 },
        { type: 'classic', start: 2000, end: 4500, step: 50 },
        { type: 'salud', start: 1500, end: 3000, step: 100 },
        { type: 'senior', start: 1500, end: 2500, step: 100 }
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
                id: `diet-${cfg.type}-${targetKcal}`, name: `${base.nameBase} (${targetKcal} kcal)`,
                category: base.cat, calories: targetKcal, mealsPerDay: base.meals, macros: base.macros,
                isAdLibitum: cfg.type==='senior', description: base.desc, plan: scaledPlan
            });
        }
    });
    
    // Anti-inflamatoria (Manual)
    diets.push({
        id: 'anti-inflam-ndp', name: 'Protocolo NDP Anti-Inflamatorio', category: 'Salud',
        calories: 'Saciedad', mealsPerDay: 3, macros: { p:30, c:20, f:50 }, isAdLibitum: true,
        description: "Sin lectinas. Carb Backloading.",
        plan: {
            breakfast: [{title:"A", desc:"Huevos + Aguacate. CERO carbos"}, {title:"B", desc:"Ayuno"}],
            lunch: [{title:"Única", desc:"Carne/Pescado + Verduras SIN semillas. Aceite."}],
            dinner: [{title:"Recarga", desc:"Pescado + Boniato/Patata."}]
        }
    });

    return diets;
};
export const dietsDatabase = generateDiets();