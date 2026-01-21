// js/dietData.js

// 1. FUNCIÓN MATEMÁTICA (ESCALADO)
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

// 2. GUÍAS EDUCATIVAS (SE INTEGRARÁN EN LA FICHA)
export const dietGuides = {
    "Déficit": {
        benefit: "Este protocolo maximiza la oxidación de grasas manteniendo la masa muscular mediante una alta ingesta proteica.",
        tips: ["Bebe 2 vasos de agua antes de cada comida.", "Mastica lento: la señal de saciedad tarda 20 min.", "Usa platos de postre para engañar al cerebro."],
        allowed: ["Verduras de hoja verde", "Frutos rojos", "Carnes magras", "Pescado blanco", "Claras"],
        forbidden: ["Fritos y Rebozados", "Alcohol (frena la quema de grasa)", "Refrescos azucarados", "Bollería"],
        replacements: [
            { original: "Arroz/Pasta", substitute: "Konjac, Calabacín espiralizado o Coliflor rallada" },
            { original: "Patata", substitute: "Nabo o Rábano asado" }
        ]
    },
    "Volumen": {
        benefit: "Diseñado para generar un entorno anabólico. El superávit calórico controlado permite construir tejido muscular nuevo.",
        tips: ["No te saltes comidas, la consistencia es clave.", "Si no tienes hambre, usa batidos líquidos.", "El descanso es cuando el músculo crece."],
        allowed: ["Ternera", "Arroz y Pasta", "Frutos secos", "Aguacate", "Patata/Boniato"],
        forbidden: ["Llenarse de ensalada antes de la carne", "Ayunos prolongados involuntarios"],
        replacements: [
            { original: "Pollo", substitute: "Ternera (mayor densidad calórica)" },
            { original: "Agua en comidas", substitute: "Zumo natural o Leche" }
        ]
    },
    "Salud": {
        benefit: "Enfoque anti-inflamatorio para mejorar digestiones, energía y salud hormonal. Prioriza la densidad nutricional.",
        tips: ["Cena 2 horas antes de dormir para mejorar el descanso.", "Exponte a la luz solar por la mañana.", "Evita el picoteo constante."],
        allowed: ["Pescado azul (Omega 3)", "Aceite Oliva Virgen Extra", "Nueces", "Hortalizas de color"],
        forbidden: ["Grasas trans/hidrogenadas", "Azúcares añadidos", "Harinas refinadas"],
        replacements: [
            { original: "Pan blanco", substitute: "Pan de Trigo Sarraceno o Masa Madre" },
            { original: "Azúcar", substitute: "Eritritol o Estevia" }
        ]
    },
    "Senior": {
        benefit: "Nutrición adaptada para fácil digestión y mantenimiento de la masa ósea y muscular.",
        tips: ["Bebe agua aunque no tengas sed (la señal de sed disminuye con la edad).", "Cenas ligeras y tempranas."],
        allowed: ["Purés y Cremas", "Pescado limpio", "Huevos", "Lácteos fermentados (Yogur/Kéfir)"],
        forbidden: ["Carnes muy fibrosas o duras", "Verduras muy flatulentas (Col, Brócoli crudo)"],
        replacements: [
            { original: "Filete duro", substitute: "Albóndigas o Carne picada" },
            { original: "Fruta entera", substitute: "Compota de manzana o Pera asada" }
        ]
    }
};

// 3. PLANTILLAS BASE (REFERENCIA 2500 KCAL - Todo con gramos)
const baseTemplates = {
    classic: {
        nameBase: "NDP Hipertrofia Clásica", cat: "Volumen",
        desc: "Dieta clásica de culturismo con alimentos limpios.",
        baseKcal: 2500, macros: { p:30, c:50, f:20 }, meals: 4, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Avena", desc:"80g Avena, 300ml Claras, 1 Huevo L, 10g Chocolate 85%, 150ml Leche desnatada."}, {title:"B. Tostadas", desc:"120g Pan Barra, 10ml Aceite, 150g Tomate triturado, 60g Jamón Serrano."}],
            lunch: [{title:"A. Pollo/Arroz", desc:"180g Pechuga Pollo, 120g Arroz Basmati (crudo), 10ml Aceite Oliva, 200g Ensalada mixta."}, {title:"B. Lentejas", desc:"100g Lentejas (crudo) estofadas con 200g Verduras y 100g Pollo, 5ml Aceite."}],
            snack: [{title:"A. Bocadillo", desc:"100g Pan Barra, 80g Lomo Embuchado, 10g Aceite Oliva."}, {title:"B. Batido", desc:"30g Whey Protein, 1 Plátano (120g), 20g Nueces peladas."}],
            dinner: [{title:"A. Merluza", desc:"220g Merluza, 350g Patata cocida, 10ml Aceite, 150g Judías verdes."}, {title:"B. Revuelto", desc:"3 Huevos L, 100g Gambas, 100g Ajetes, 60g Pan integral."}]
        }
    },
    deficit: {
        nameBase: "NDP Definición Total", cat: "Déficit",
        desc: "Protocolo de pérdida de grasa con alta saciedad.",
        baseKcal: 2000, macros: { p:40, c:30, f:30 }, meals: 3, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Tostada Pavo", desc:"60g Pan Integral, 80g Pavo alto %, 100g Tomate rodajas, 5ml Aceite."}, {title:"B. Tortilla", desc:"1 Huevo + 300ml Claras, 100g Espinacas, 1 Kiwi (100g)."}],
            lunch: [{title:"A. Pollo Plancha", desc:"180g Pollo, 60g Arroz integral (crudo), 10ml Aceite, 250g Ensalada variada."}, {title:"B. Ternera", desc:"150g Ternera limpia, 200g Brócoli vapor, 5ml Aceite, 150g Patata asada."}],
            dinner: [{title:"A. Sepia", desc:"200g Sepia o Emperador, 200g Ensalada tomate/pepino, 10ml Aceite."}, {title:"B. Conservas", desc:"2 Latas Atún natural (160g), 150g Pimientos piquillo, 30g Pan integral."}]
        }
    },
    hardgainer: {
        nameBase: "NDP Superávit Alto", cat: "Volumen",
        desc: "Alta densidad calórica para metabolismos rápidos.",
        baseKcal: 3500, macros: { p:20, c:50, f:30 }, meals: 5, isAdLibitum: false,
        plan: {
            breakfast: [{title:"A. Huevos Fritos", desc:"3 Huevos fritos, 30g Panceta, 150g Pan, 200ml Zumo Naranja."}],
            lunch: [{title:"A. Pasta", desc:"160g Pasta (cruda), 180g Carne picada, 150g Tomate frito, 30g Queso rallado."}, {title:"B. Arroz Cubana", desc:"160g Arroz (crudo), 3 Huevos fritos, 100g Tomate frito, 1 Plátano frito."}],
            snack: [{title:"A. Bocata", desc:"160g Pan Barra, 80g Lomo/Queso, 10ml Aceite."}, {title:"B. Batido", desc:"400ml Leche entera, 120g Avena molida, 20g Cacao, 20g Miel."}],
            dinner: [{title:"A. Salmón", desc:"220g Salmón, 400g Patata frita airfryer, 20g Mayonesa."}, {title:"B. Hamburguesa", desc:"2 Hamburguesas completas (160g Pan, 250g Carne, 40g Queso)."}]
        }
    },
    senior: {
        nameBase: "NDP Bienestar Senior", cat: "Senior",
        desc: "Nutrición fácil digestión y medidas caseras.",
        baseKcal: 2000, macros: { p:25, c:45, f:30 }, meals: 3, isAdLibitum: true,
        plan: {
            breakfast: [{title:"A. Tradicional", desc:"200ml Café con leche + 2 Tostadas (60g) con aceite y jamón york."}, {title:"B. Ligero", desc:"1 Yogur natural, 20g Nueces, 1 Pera madura."}],
            lunch: [{title:"A. Cuchara", desc:"Plato hondo (300g) Lentejas con verdura. Segundo: 120g Filete pollo plancha."}, {title:"B. Pescado", desc:"150g Pescado blanco horno con 200g patatas panadera."}],
            dinner: [{title:"A. Tortilla", desc:"Tortilla 2 huevos. 1 Tomate picado con aceite. 30g Pan."}, {title:"B. Sopa", desc:"250ml Sopa fideos con huevo duro y jamón. Postre: 1 Yogur."}]
        }
    }
};

// 4. GENERADOR
export const generateDiets = () => {
    const diets = [];
    // Pasos de 50 kcal para tener muchas opciones
    const configs = [
        { type: 'deficit', start: 1200, end: 2600, step: 50 },
        { type: 'classic', start: 2000, end: 4500, step: 50 }, 
        { type: 'hardgainer', start: 3000, end: 5500, step: 100 }
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

    // Dietas Manuales (Anti-inflamatoria y Keto)
    diets.push({
        id: 'anti-inflam-ndp', name: 'Protocolo NDP Anti-Inflamatorio', category: 'Salud',
        calories: 'Saciedad', mealsPerDay: 3, macros: { p:30, c:20, f:50 }, isAdLibitum: true,
        description: "Sin lectinas (NO tomate, pimiento). Carb Backloading.",
        plan: {
            breakfast: [{title:"A", desc:"3 Huevos + 1/2 Aguacate. CERO carbos."}, {title:"B", desc:"Ayuno (Solo agua/té)."}],
            lunch: [{title:"Única", desc:"200g Carne/Pescado + 300g Verduras SIN semillas (Espinacas/Brócoli) + 15ml Aceite."}],
            dinner: [{title:"Recarga", desc:"200g Pescado + 250g Boniato/Patata asada."}]
        }
    });
    diets.push({
        id: 'keto-strict', name: 'Protocolo NDP Keto', category: 'Déficit',
        calories: 'Saciedad', mealsPerDay: 3, macros: { p:25, c:5, f:70 }, isAdLibitum: true,
        description: "Cetosis nutricional (<30g carbs). Energía estable.",
        plan: {
            breakfast: [{title:"A", desc:"3 Huevos fritos con 40g Beicon."}, {title:"B", desc:"Café Bulletproof (20g Mantequilla + 10ml MCT)."}],
            lunch: [{title:"Única", desc:"200g Muslos pollo (piel) + 30g Queso curado + 200g Verdura verde."}],
            dinner: [{title:"Única", desc:"200g Salmón horno, 20g Mantequilla, 150g Espárragos."}]
        }
    });
    
    // Variantes Senior
    diets.push({id:'senior-1', name:'NDP Senior Mantenimiento', category:'Senior', calories:'Visual', mealsPerDay:3, macros:{p:25,c:45,f:30}, isAdLibitum:true, description:baseTemplates.senior.desc, plan:baseTemplates.senior.plan});

    return diets;
};

export const dietsDatabase = generateDiets();