// js/dietData.js

// 1. FUNCIÓN MATEMÁTICA (ESCALADO)
const scaleString = (text, ratio) => {
    return text.replace(/(\d+)g/g, (match, grams) => `${Math.round(parseInt(grams) * ratio)}g`)
               .replace(/(\d+) ud/g, (match, ud) => `${Math.max(1, Math.round(parseInt(ud) * ratio))} ud`)
               .replace(/(\d+)ml/g, (match, ml) => `${Math.max(5, Math.round(parseInt(ml) * ratio))}g`); // ACEITE EN GRAMOS
};

// 2. GUÍAS EDUCATIVAS
export const dietGuides = {
    "Déficit": {
        benefit: "BENEFICIO: Maximiza la oxidación de grasa visceral. Control estricto de la insulina.",
        tips: ["🚫 NO picar entre horas.", "🚫 Café con leche prohibido (usa solo o con bebida vegetal s/a).", "Bebe 500ml de agua antes de comer."],
        allowed: ["Verduras verdes", "Frutos rojos", "Carnes magras", "Pescado blanco", "Claras", "Cerdo magro"],
        forbidden: ["Azúcar", "Alcohol", "Fritos", "Leche de vaca entera", "Harinas refinadas"],
        replacements: [{ original: "Arroz", substitute: "Coliflor rallada" }, { original: "Pasta", substitute: "Calabacín espiralizado" }]
    },
    "Volumen": {
        benefit: "BENEFICIO: Superávit energético para construcción muscular (Hipertrofia).",
        tips: ["La consistencia es clave.", "Usa batidos si te cuesta comer.", "Aceite siempre en crudo al final."],
        allowed: ["Arroz, Pasta, Patata", "Carnes rojas", "Cerdo", "Frutos secos", "Aceite Oliva", "Avena"],
        forbidden: ["Comida basura", "Alcohol"],
        replacements: [{ original: "Pollo", substitute: "Ternera" }, { original: "Agua", substitute: "Zumo natural" }]
    },
    "Salud": {
        benefit: "BENEFICIO: Reduce inflamación y mejora digestión. Densidad nutricional.",
        tips: ["Cena 2 horas antes de dormir.", "Mastica lento.", "Prioriza calidad."],
        allowed: ["Pescado azul", "Cerdo Ibérico", "Ternera", "Aceite Oliva", "Frutas", "Hortalizas"],
        forbidden: ["Grasas trans", "Azúcares añadidos", "Aceites semillas"],
        replacements: [{ original: "Pan", substitute: "Masa Madre" }, { original: "Leche", substitute: "Bebida Coco/Almendras" }]
    },
    "Senior": {
        benefit: "BENEFICIO: Mantenimiento muscular con digestión ligera.",
        tips: ["Bebe agua aunque no tengas sed.", "Evita comidas copiosas.", "Texturas suaves."],
        allowed: ["Cremas", "Pescado limpio", "Huevos", "Yogur", "Carne picada"],
        forbidden: ["Carnes fibrosas", "Verduras flatulentas", "Exceso sal"],
        replacements: [{ original: "Filete", substitute: "Albóndigas" }, { original: "Fruta", substitute: "Compota" }]
    }
};

// 3. PLANTILLAS BASE (CALIBRADAS)
const baseTemplates = {
    classic: {
        nameBase: "NDP Hipertrofia Clásica", cat: "Volumen", desc: "Alta carga de hidratos y proteínas.", baseKcal: 2500, macros: { p:30, c:50, f:20 }, meals: 4, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Avena", desc:"100g Avena, 250g Claras, 1 Huevo, 15g Chocolate 85%."}, {title:"B. Tostadas", desc:"140g Pan, 15g Aceite, 150g Tomate, 80g Jamón."}],
            lunch: [{title:"A. Pollo/Arroz", desc:"180g Pollo, 140g Arroz (crudo), 10g Aceite, Verduras."}, {title:"B. Ternera", desc:"180g Ternera, 600g Boniato, 10g Aceite, Ensalada."}, {title:"C. Cerdo", desc:"180g Lomo, 500g Patata asada, 10g Aceite."}],
            snack: [{title:"A. Bocadillo", desc:"120g Pan, 100g Lomo, 5g Aceite."}, {title:"B. Batido", desc:"40g Whey, 1 Plátano, 30g Nueces."}],
            dinner: [{title:"A. Pescado", desc:"250g Pescado, 400g Patata, 15g Aceite, Verdura."}, {title:"B. Revuelto", desc:"3 Huevos, 150g Gambas, 80g Pan."}]
        }
    },
    deficit: {
        nameBase: "NDP Definición Total", cat: "Déficit", desc: "Pérdida de grasa agresiva.", baseKcal: 2000, macros: { p:40, c:30, f:30 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Tostada", desc:"80g Pan Integral, 100g Pavo, 10g Aceite."}, {title:"B. Tortilla", desc:"2 Huevos + 200g Claras, Espinacas, 1 Kiwi."}],
            lunch: [{title:"A. Pollo", desc:"200g Pollo, 80g Arroz integral, 10g Aceite, Ensalada."}, {title:"B. Ternera", desc:"180g Ternera, 300g Brócoli, 10g Aceite, 200g Patata."}, {title:"C. Cerdo", desc:"200g Solomillo, 200g Boniato, 10g Aceite."}],
            dinner: [{title:"A. Pescado", desc:"250g Pescado blanco, 300g Verdura, 15g Aceite."}, {title:"B. Burger", desc:"200g Burger Pollo, Ensalada, 10g Aceite (sin pan)."}]
        }
    },
    salud: {
        nameBase: "NDP Salud Integral", cat: "Salud", desc: "Densidad nutricional y salud hormonal.", baseKcal: 2200, macros: { p:25, c:40, f:35 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Revuelto", desc:"2 Huevos, 1/2 Aguacate, 1 Fruta."}, {title:"B. Yogur", desc:"2 Griegos, 30g Nueces, 1 Plátano."}],
            lunch: [{title:"A. Salmón", desc:"200g Salmón, 80g Quinoa, Espárragos, 10g Aceite."}, {title:"B. Cerdo Ibérico", desc:"180g Presa, Pimientos, 200g Patata."}],
            dinner: [{title:"A. Crema", desc:"300ml Crema verduras, 180g Pescado, 10g Semillas."}, {title:"B. Tortilla", desc:"3 Huevos, Champiñones, 40g Pan sarraceno."}]
        }
    },
    senior: {
        nameBase: "NDP Bienestar Senior", cat: "Senior", desc: "Fácil masticación.", baseKcal: 2000, macros: { p:25, c:45, f:30 }, meals: 3, isAdLibitum: true,
        plan: {
            breakfast: [{title:"A. Clásico", desc:"Café leche, Tostadas aceite/york."}, {title:"B. Ligero", desc:"Yogur, nueces, fruta asada."}],
            lunch: [{title:"A. Cuchara", desc:"Lentejas estofadas, Filete pollo."}, {title:"B. Pescado", desc:"Pescado horno con patata."}],
            dinner: [{title:"A. Tortilla", desc:"Tortilla francesa 2 huevos, Tomate."}, {title:"B. Sopa", desc:"Sopa fideos con huevo. Yogur."}]
        }
    }
};

// 4. GENERADOR
export const generateDiets = () => {
    const diets = [];
    const configs = [
        { type: 'deficit', start: 1200, end: 2600, step: 50 },
        { type: 'classic', start: 2000, end: 4500, step: 50 },
        { type: 'salud', start: 1500, end: 3000, step: 50 },
        { type: 'senior', start: 1500, end: 2500, step: 50 }
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
                isAdLibitum: false, description: base.desc, plan: scaledPlan
            });
        }
    });

    // MANUALES ESPECIFICAS
    diets.push({
        id: 'anti-inflam-ndp', name: 'Protocolo NDP Anti-Inflamatorio (Variado)', category: 'Salud', calories: 'Saciedad', mealsPerDay: 3, macros: { p:30, c:20, f:50 }, isAdLibitum: true,
        description: "Sin lectinas. Carb Backloading.",
        plan: {
            breakfast: [{title:"A", desc:"Huevos + Aguacate."}, {title:"B", desc:"Ayuno."}, {title:"C", desc:"Lomo embuchado + Nueces."}],
            lunch: [{title:"A", desc:"Cerdo Ibérico plancha + Brócoli vapor + Aceite."}, {title:"B", desc:"Ternera Pasto + Ensalada verde."}, {title:"C", desc:"Pollo asado + Coliflor."}],
            dinner: [{title:"Recarga", desc:"Pescado/Carne + Boniato/Patata asada."}]
        }
    });
    
    diets.push({
        id: 'keto-strict', name: 'Protocolo NDP Keto', category: 'Déficit', calories: 'Saciedad', mealsPerDay: 3, macros: { p:25, c:5, f:70 }, isAdLibitum: true, description: "Cetosis.",
        plan: { breakfast: [{title:"A", desc:"Huevos y Beicon."}], lunch: [{title:"A", desc:"Muslos pollo + Queso + Verdura."}], dinner: [{title:"A", desc:"Salmón horno + Espárragos."}] }
    });

    return diets;
};
export const dietsDatabase = generateDiets();