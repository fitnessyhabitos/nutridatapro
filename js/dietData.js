// js/dietData.js

const scaleString = (text, ratio) => {
    return text.replace(/(\d+)g/g, (match, grams) => `${Math.round(parseInt(grams) * ratio)}g`)
               .replace(/(\d+) ud/g, (match, ud) => `${Math.max(1, Math.round(parseInt(ud) * ratio))} ud`)
               .replace(/(\d+)ml/g, (match, ml) => `${Math.max(5, Math.round(parseInt(ml) * ratio))}ml`);
};

export const dietGuides = {
    "Déficit": {
        benefit: "Quema de grasa máxima. Alta saciedad para evitar hambre.",
        tips: ["🚫 PROHIBIDO picar entre horas (rompe la quema de grasa).", "🚫 Café con leche prohibido (usa leche vegetal s/a o café solo) para evitar picos de insulina.", "Bebe 500ml de agua antes de comer."],
        allowed: ["Verduras verdes", "Pollo/Pavo", "Pescado blanco", "Claras"],
        forbidden: ["Azúcar", "Alcohol", "Fritos", "Leche de vaca (en exceso)"],
        replacements: [{original:"Arroz", substitute:"Coliflor rallada"}, {original:"Pasta", substitute:"Calabacín"}]
    },
    "Volumen": {
        benefit: "Construcción muscular. Superávit limpio.",
        tips: ["Cumple todas las comidas.", "No tomes café con leche entre horas.", "Usa batidos si te llenas."],
        allowed: ["Ternera", "Arroz", "Patata", "Avena", "Aceite Oliva"],
        forbidden: ["Comida basura", "Saltarse comidas"],
        replacements: [{original:"Pollo", substitute:"Ternera"}, {original:"Agua", substitute:"Zumo"}]
    },
    "Salud": {
        benefit: "Desinflamación y salud digestiva.",
        tips: ["Cena 2h antes de dormir.", "Evita picos de glucosa (nada de dulces aislados)."],
        allowed: ["Pescado azul", "Verduras", "Frutas", "Legumbres"],
        forbidden: ["Procesados", "Grasas trans"],
        replacements: [{original:"Pan", substitute:"Masa madre"}, {original:"Azúcar", substitute:"Eritritol"}]
    },
    "Senior": {
        benefit: "Mantenimiento fácil. Medidas caseras.",
        tips: ["Cenas ligeras.", "Hidrátate bien.", "Evita alimentos duros."],
        allowed: ["Pescados", "Cremas", "Huevos", "Yogur"],
        forbidden: ["Exceso sal", "Picantes"],
        replacements: [{original:"Carne", substitute:"Albóndigas"}, {original:"Fruta", substitute:"Compota"}]
    }
};

const baseTemplates = {
    classic: {
        nameBase: "NDP Hipertrofia Clásica", cat: "Volumen",
        desc: "Dieta clásica de gimnasio. Alta proteína y carbos complejos.",
        baseKcal: 2500, macros: { p:30, c:50, f:20 }, meals: 4, isAdLibitum: false,
        plan: {
            breakfast: [
                {title:"A. Avena Fit", desc:"80g Avena, 300ml Claras, 1 Huevo, 10g Chocolate 85%."},
                {title:"B. Tostadas", desc:"120g Pan Barra, Aceite, Tomate, 60g Jamón Serrano."},
                {title:"C. Tortitas", desc:"100g Harina Avena, 1 Huevo, 30g Whey, Canela."}
            ],
            lunch: [
                {title:"A. Pollo/Arroz", desc:"180g Pollo, 120g Arroz, 10ml Aceite, Ensalada."},
                {title:"B. Ternera/Patata", desc:"180g Ternera, 500g Patata cocida, 5ml Aceite."},
                {title:"C. Lentejas", desc:"100g Lentejas (crudo) con verduras y 100g Pollo."},
                {title:"D. Pasta", desc:"120g Pasta, 150g Carne Picada, Tomate frito, Orégano."},
                {title:"E. Pescado/Boniato", desc:"200g Pescado, 400g Boniato, 10ml Aceite."}
            ],
            snack: [
                {title:"A. Bocadillo", desc:"100g Pan, 80g Lomo/Cecina."},
                {title:"B. Batido", desc:"30g Whey, 1 Plátano, 20g Nueces."},
                {title:"C. Yogur Bowl", desc:"300g Queso batido, 50g Cereales, 1 Fruta."}
            ],
            dinner: [
                {title:"A. Merluza", desc:"220g Merluza, 350g Patata, 10ml Aceite, Verdura."},
                {title:"B. Revuelto", desc:"3 Huevos, Gambas, Ajetes, 60g Pan."},
                {title:"C. Ensalada Completa", desc:"Ensalada grande, 2 Latas Atún, Huevo duro, Aguacate."},
                {title:"D. Sepia", desc:"250g Sepia plancha, Ensalada tomate, 50g Pan."},
                {title:"E. Wrap Casero", desc:"2 Tortitas trigo, 150g Pollo tiras, Lechuga, Salsa yogur."}
            ]
        }
    },
    deficit: {
        nameBase: "NDP Definición Total", cat: "Déficit",
        desc: "Pérdida de grasa. Alta saciedad.",
        baseKcal: 2000, macros: { p:40, c:30, f:30 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [
                {title:"A. Tostada Pavo", desc:"60g Pan Integral, 80g Pavo, Tomate, Aceite."},
                {title:"B. Tortilla", desc:"1 Huevo + 3 Claras, Espinacas, 1 Kiwi."},
                {title:"C. Porridge", desc:"40g Avena, 200ml Leche desnatada, 25g Whey."}
            ],
            lunch: [
                {title:"A. Pollo/Arroz", desc:"180g Pollo, 60g Arroz integral, 10ml Aceite, Ensalada."},
                {title:"B. Ternera", desc:"150g Ternera magra, Brócoli, 5ml Aceite, 150g Patata."},
                {title:"C. Legumbre Light", desc:"80g Garbanzos (crudo), Espinacas, Huevo duro."},
                {title:"D. Ensalada Pasta", desc:"60g Pasta, 1 Lata Atún, Tomate, Pepino, 5ml Aceite."},
                {title:"E. Pavo/Quinoa", desc:"180g Pavo, 50g Quinoa, Calabacín, 10ml Aceite."}
            ],
            dinner: [
                {title:"A. Pescado Blanco", desc:"200g Pescado, 200g Verdura, 10ml Aceite."},
                {title:"B. Tortilla Verde", desc:"2 Huevos, Espárragos/Calabacín, 1 Yogur."},
                {title:"C. Burger Pollo", desc:"180g Burger Pollo, Tomate aliñado (sin pan)."},
                {title:"D. Conservas", desc:"2 Latas Sardinas, Pimientos asados, 30g Pan."},
                {title:"E. Pulpo/Sepia", desc:"200g Pulpo o Sepia, Ensalada verde, 5ml Aceite."}
            ]
        }
    },
    senior: {
        nameBase: "NDP Senior Fácil", cat: "Senior",
        desc: "Medidas caseras visuales. Fácil masticación.",
        baseKcal: 2000, macros: { p:25, c:45, f:30 }, meals: 3, isAdLibitum: true,
        plan: {
            breakfast: [
                {title:"A. Clásico", desc:"Café leche + 2 Tostadas aceite y york."},
                {title:"B. Ligero", desc:"Yogur natural con nueces picadas y fruta blanda."}
            ],
            lunch: [
                {title:"A. Cuchara", desc:"Plato hondo lentejas/crema. Segundo: Filete pollo tierno."},
                {title:"B. Pescado", desc:"Pescado limpio al horno con patata panadera."},
                {title:"C. Guiso", desc:"Estofado de patatas con carne muy tierna."},
                {title:"D. Arroz", desc:"Arroz a la cubana (Arroz, Tomate, Huevo, Plátano)."}
            ],
            dinner: [
                {title:"A. Tortilla", desc:"Tortilla francesa 2 huevos. Tomate picado."},
                {title:"B. Sopa", desc:"Sopa fideos con huevo y jamón. Yogur."},
                {title:"C. Pescado", desc:"Gallo o Lenguado a la plancha. Puré de patata."}
            ]
        }
    }
};

export const generateDiets = () => {
    const diets = [];
    const configs = [
        { type: 'deficit', start: 1200, end: 2600, step: 50 },
        { type: 'classic', start: 2000, end: 4500, step: 50 }
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
    
    // Manuales
    diets.push({ id:'senior-base', name:'NDP Senior Mantenimiento', category:'Senior', calories:'Visual', mealsPerDay:3, macros:{p:25,c:45,f:30}, isAdLibitum:true, description:baseTemplates.senior.desc, plan:baseTemplates.senior.plan });
    
    return diets;
};

export const dietsDatabase = generateDiets();