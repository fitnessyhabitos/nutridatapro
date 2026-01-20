// js/dietData.js

const templates = {
    // 1. CLÁSICA (Con gramos exactos)
    classic: {
        nameBase: "NDP Classic Bodybuilding",
        description: "Comida limpia pesada en crudo. Alta frecuencia.",
        mealsPerDay: 4,
        macros: { p: 35, c: 45, f: 20 },
        isAdLibitum: false,
        // Usamos placeholders {k} para ajustar cantidad segun Kcal en el generador si quisiéramos lógica compleja,
        // pero aquí hardcodeamos opciones equilibradas para el rango.
        plan: {
            breakfast: [
                { title: "Opción A", desc: "150g Claras de huevo, 1 Huevo L, 60g Avena cocida con agua." },
                { title: "Opción B", desc: "Batido: 30g Whey Protein, 60g Crema de Arroz, 15g Crema cacahuete." }
            ],
            lunch: [
                { title: "Opción A", desc: "150g Pechuga de Pollo (crudo), 200g Arroz blanco cocido, 100g Brócoli." },
                { title: "Opción B", desc: "150g Ternera magra, 200g Patata asada (airfryer), Ensalada verde." }
            ],
            snack: [
                { title: "Opción A", desc: "100g Pavo natural, 3 Tortitas de arroz." },
                { title: "Opción B", desc: "30g Caseína o Whey, 20g Nueces." }
            ],
            dinner: [
                { title: "Opción A", desc: "150g Merluza/Bacalao, 150g Judías verdes, 10g Aceite Oliva." },
                { title: "Opción B", desc: "Tortilla francesa (2 huevos), Espárragos trigueros." }
            ]
        }
    },

    // 2. ANTI INFLAMATORIA (Saciante / Ad Libitum)
    antiinflamatorio: {
        nameBase: "NDP Protocolo Anti-Inflamatorio",
        description: "Sin gluten, lácteos ni procesados. Enfocada en reducir inflamación sistémica. Comer hasta saciedad (Escuchar al cuerpo).",
        mealsPerDay: 3,
        macros: { p: 30, c: 20, f: 50 },
        isAdLibitum: true, // IMPORTANTE: Oculta kcal
        plan: {
            breakfast: [
                { title: "Protocolo Mañana", desc: "Ayuno 12h mínimo. Solo café/té o Agua con limón." },
                { title: "Opción B (Si hay hambre)", desc: "Huevos revueltos con ghee y aguacate (Sin pan)." }
            ],
            lunch: [
                { title: "Plato Único", desc: "Proteína animal (Carne pasto/Pescado salvaje) + Verduras bajas en lectinas (Crucíferas, hojas verdes) + Aceite de Oliva virgen extra abundante." }
            ],
            dinner: [
                { title: "Carb Backloading", desc: "Pescado blanco o Mariscos. Acompañar de Boniato, Yuca o Plátano macho cocido y enfriado (Almidón resistente)." }
            ]
        }
    },

    // 3. DÉFICIT AGRESIVO (Gramos bajos)
    deficit: {
        nameBase: "NDP Definition Cut",
        description: "Déficit calculado para pérdida de grasa máxima.",
        mealsPerDay: 3,
        macros: { p: 50, c: 20, f: 30 },
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "Opción A", desc: "200g Claras de huevo, 50g Espinacas, 1 Tostada integral pequeña." },
                { title: "Opción B", desc: "1 Yogur +Proteínas (Mercadona/Lidl), 50g Frutos rojos." }
            ],
            lunch: [
                { title: "Opción A", desc: "120g Pollo plancha, Ensalada gigante (Lechuga, Pepino), 1 cdta Aceite." },
                { title: "Opción B", desc: "1 lata Atún natural, 1 Huevo duro, Tomate picado, 10 aceitunas." }
            ],
            dinner: [
                { title: "Opción A", desc: "150g Pescado blanco, Calabacín al vapor." },
                { title: "Opción B", desc: "Crema de verduras (sin patata/nata), 100g Sepia plancha." }
            ]
        }
    },
    
    // 4. VOLUMEN SUCIO CONTROLADO (Gramos altos)
    hardgainer: {
        nameBase: "NDP Hardgainer Push",
        description: "Alta densidad calórica para quienes no suben de peso.",
        mealsPerDay: 5,
        macros: { p: 25, c: 45, f: 30 },
        isAdLibitum: false,
        plan: {
            breakfast: [
                { title: "Bomba Calórica", desc: "4 Huevos enteros, 150g Pan, 1 Plátano." }
            ],
            lunch: [
                { title: "Opción A", desc: "200g Ternera grasa, 120g Pasta (peso en seco) con tomate, Queso rallado." }
            ],
            snack: [
                { title: "Merienda", desc: "Bocadillo grande de Lomo y Queso." },
                { title: "Post-Entreno", desc: "100g Cereales azucarados + Batido Whey." }
            ],
            dinner: [
                { title: "Opción A", desc: "200g Salmón, 300g Patata asada, Salsa mayonesa casera." }
            ]
        }
    }
};

export const generateDiets = () => {
    const diets = [];
    let idCounter = 1;

    // Generamos MUCHAS variantes (Saltos de 100kcal)
    const ranges = [
        { type: 'deficit', start: 1400, end: 2400, step: 100, cat: "Déficit" },
        { type: 'classic', start: 2200, end: 4000, step: 150, cat: "Volumen" },
        { type: 'hardgainer', start: 3000, end: 5000, step: 200, cat: "Volumen" },
    ];

    // 1. Generar dietas con KCAL fijas
    ranges.forEach(range => {
        const template = templates[range.type];
        for (let kcal = range.start; kcal <= range.end; kcal += range.step) {
            diets.push({
                id: `diet-${idCounter++}`,
                name: `${template.nameBase} (${kcal} kcal)`,
                category: range.cat,
                calories: kcal,
                mealsPerDay: template.mealsPerDay,
                macros: template.macros,
                isAdLibitum: false,
                description: template.description + ` Ajustada a ${kcal} calorías (aprox).`,
                plan: template.plan // En una app real, escalaríamos gramos aquí matemáticamente
            });
        }
    });

    // 2. Generar dietas AD LIBITUM (Sin kcal, variantes de estrategia)
    // Anti inflamatoria
    diets.push({
        id: `diet-${idCounter++}`,
        name: "NDP Anti-Inflamatoria (Estricta)",
        category: "Salud",
        calories: "Saciedad",
        mealsPerDay: 3,
        macros: templates.antiinflamatorio.macros,
        isAdLibitum: true,
        description: "Protocolo estricto autoinmune. Sin kcal fijas.",
        plan: templates.antiinflamatorio.plan
    });
    
    // Low Carb Ad Libitum
    diets.push({
        id: `diet-${idCounter++}`,
        name: "NDP Low Carb (Ad Libitum)",
        category: "Déficit",
        calories: "Saciedad",
        mealsPerDay: 3,
        macros: { p:40, c:10, f:50 },
        isAdLibitum: true,
        description: "Comer solo proteínas y grasas hasta saciarse. Verdura ilimitada.",
        plan: {
            breakfast: [{ title:"Opción", desc:"Huevos y Bacon"}],
            lunch: [{ title:"Opción", desc:"Carne grasa y verduras verdes"}],
            dinner: [{ title:"Opción", desc:"Pescado y ensalada con aguacate"}]
        }
    });

    return diets;
};

export const dietsDatabase = generateDiets();