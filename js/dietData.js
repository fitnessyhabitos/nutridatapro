// js/dietData.js

// 1. PLANTILLAS MAESTRAS (Archetypes)
// Definimos los menús base. La "magia" es que las cantidades se adaptan mentalmente al rango calórico.
const templates = {
    // A. CLÁSICA BALANCEADA (Volumen o Mantenimiento limpio)
    classic: {
        nameBase: "NDP Classic Bodybuilding",
        description: "Enfoque 'Vieja Escuela'. Comida limpia, alta frecuencia, digestión fácil. Pollo, arroz y ternera.",
        mealsPerDay: 4,
        macros: { p: 35, c: 45, f: 20 },
        plan: {
            breakfast: [
                { title: "Opción A", desc: "Claras de huevo, 1 huevo entero, Avena cocida con agua/leche vegetal y canela." },
                { title: "Opción B", desc: "Tortitas fitness (Avena + Huevo + Whey Protein) con un poco de crema de cacahuete." },
                { title: "Opción C", desc: "Tostadas de pan de masa madre con tortilla francesa y pavo." }
            ],
            lunch: [
                { title: "Opción A", desc: "Pechuga de pollo a la plancha, Arroz blanco basmati y Brócoli al vapor." },
                { title: "Opción B", desc: "Ternera magra picada con Pasta blanca y salsa de tomate casera." },
                { title: "Opción C", desc: "Pescado blanco (Merluza/Bacalao) con Patata asada y judías verdes." }
            ],
            snack: [
                { title: "Opción A", desc: "Batido de Whey Protein + Harina de arroz pre-digerida." },
                { title: "Opción B", desc: "Bocadillo de lomo embuchado o pavo natural." },
                { title: "Opción C", desc: "Yogur Griego / Queso batido con nueces." }
            ],
            dinner: [
                { title: "Opción A", desc: "Salmón o Pescado azul con Verduras asadas (pimientos, cebolla)." },
                { title: "Opción B", desc: "Revuelto de gambas y ajetes con ensalada verde." },
                { title: "Opción C", desc: "Pechuga de pavo a la plancha con espárragos trigueros." }
            ]
        }
    },

    // B. DEFINICIÓN AGRESIVA (Low Carb / High Protein)
    deficit: {
        nameBase: "NDP Definition Cut",
        description: "Déficit calórico para pérdida de grasa. Alta proteína para retención muscular. Carbohidratos controlados.",
        mealsPerDay: 3,
        macros: { p: 45, c: 25, f: 30 },
        plan: {
            breakfast: [
                { title: "Opción A", desc: "Tortilla de claras (generosa) con espinacas y 1 rebanada pan integral." },
                { title: "Opción B", desc: "Yogur alto en proteínas con puñado pequeño de frutos rojos." },
                { title: "Opción C", desc: "Café con leche y tostada con tomate y jamón serrano (sin grasa)." }
            ],
            lunch: [
                { title: "Opción A", desc: "Ensalada gigante con Atún al natural, huevo duro y aceite de oliva medido." },
                { title: "Opción B", desc: "Pollo asado (sin piel) con verduras a la parrilla." },
                { title: "Opción C", desc: "Filete de ternera blanca con champiñones salteados." }
            ],
            dinner: [
                { title: "Opción A", desc: "Pescado blanco (Merluza/Lenguado) al vapor con calabacín." },
                { title: "Opción B", desc: "Sepia o Calamar a la plancha con ensalada de pepino." },
                { title: "Opción C", desc: "Crema de verduras (sin patata/nata) y lata de sardinas." }
            ]
        }
    },

    // C. PALEO / ANCESTRAL (Salud & Growth Lab Style)
    paleo: {
        nameBase: "NDP Protocolo Ancestral (Paleo)",
        description: "Sin granos, sin lácteos, sin procesados. Carb Backloading (carbos solo de noche). Ideal salud y desinflamación.",
        mealsPerDay: 3,
        macros: { p: 30, c: 20, f: 50 },
        plan: {
            breakfast: [
                { title: "Salado A", desc: "Huevos revueltos con bacon (artesanal) y medio aguacate." },
                { title: "Salado B", desc: "Restos de carne de la cena anterior con aceitunas." },
                { title: "Opción C", desc: "Solo Café negro + Aceite de coco (Bulletproof)." }
            ],
            lunch: [
                { title: "Opción A", desc: "Ensalada de hojas verdes, Nueces Macadamia, Salmón ahumado y Aceite de Oliva." },
                { title: "Opción B", desc: "Hamburguesa de ternera ecológica (sin pan) con guarnición de aguacate." },
                { title: "Opción C", desc: "Costillas de cerdo asadas con repollo o chucrut." }
            ],
            dinner: [
                { title: "Recarga A", desc: "Pescado blanco + Boniato asado + Fruta (Piña/Papaya)." },
                { title: "Recarga B", desc: "Estofado de carne con zanahorias y Yuca cocida." },
                { title: "Recarga C", desc: "Plátano macho al horno con Pechuga de pollo." }
            ]
        }
    },

    // D. KETO STRICT
    keto: {
        nameBase: "NDP Keto Strict",
        description: "Dieta cetogénica. <30g carbohidratos. El cuerpo usa grasa como combustible.",
        mealsPerDay: 3,
        macros: { p: 25, c: 5, f: 70 },
        plan: {
            breakfast: [
                { title: "Opción A", desc: "3 Huevos fritos en mantequilla con bacon." },
                { title: "Opción B", desc: "Aguacate relleno de salmón y mayonesa casera." },
                { title: "Opción C", desc: "Café con nata espesa y aceite MCT." }
            ],
            lunch: [
                { title: "Opción A", desc: "Muslos de pollo con piel asados y brócoli con queso fundido." },
                { title: "Opción B", desc: "Ensalada César (sin picatostes) con extra de parmesano y pollo." },
                { title: "Opción C", desc: "Chuletas de cerdo con mantequilla de ajo y espinacas." }
            ],
            dinner: [
                { title: "Opción A", desc: "Salmón al horno con costra de almendra." },
                { title: "Opción B", desc: "Tabla de quesos curados y embutidos ibéricos." },
                { title: "Opción C", desc: "Revuelto de huevos con chorizo." }
            ]
        }
    },

    // E. AYUNO INTERMITENTE
    fasting: {
        nameBase: "NDP Ayuno 16/8",
        description: "Protocolo de ventana de alimentación 8h. 16h de ayuno. Eficiencia metabólica.",
        mealsPerDay: 2, // 2 comidas grandes + snack
        macros: { p: 40, c: 30, f: 30 },
        plan: {
            breakfast: [
                { title: "AYUNO", desc: "Durante la mañana solo Agua, Café solo, Té verde o Agua con gas." }
            ],
            lunch: [
                { title: "Romper Ayuno (14:00)", desc: "Plato grande: Pollo/Pavo, Arroz integral, Verduras variadas, Aguacate." },
                { title: "Opción B", desc: "Legumbres estofadas con proteína animal y ensalada." },
                { title: "Opción C", desc: "Revuelto completo de 3 huevos, patata y jamón." }
            ],
            dinner: [
                { title: "Cena (21:30)", desc: "Pescado azul (Salmón/Sardinas) con ensalada de tomate." },
                { title: "Opción B", desc: "Tortilla francesa de bonito y queso fresco batido de postre." },
                { title: "Opción C", desc: "Wok de ternera y verduras." }
            ]
        }
    },

    // F. VEGANA ATLETA
    vegan: {
        nameBase: "NDP Vegan Performance",
        description: "100% Vegetal. Proteína completa combinando legumbres y cereales.",
        mealsPerDay: 4,
        macros: { p: 25, c: 55, f: 20 },
        plan: {
            breakfast: [
                { title: "Opción A", desc: "Porridge de avena con leche de soja, semillas de chía y proteína de guisante." },
                { title: "Opción B", desc: "Tostadas de tofu revuelto (tipo huevo) con cúrcuma." },
                { title: "Opción C", desc: "Batido verde: Espinacas, Plátano, Proteína vegana, Crema almendras." }
            ],
            lunch: [
                { title: "Opción A", desc: "Lentejas estofadas con arroz (proteína completa) y verduras." },
                { title: "Opción B", desc: "Tempeh marinado a la plancha con quinoa y brócoli." },
                { title: "Opción C", desc: "Pasta de lentejas con boloñesa de soja texturizada." }
            ],
            snack: [
                { title: "Opción A", desc: "Yogur de soja con nueces." },
                { title: "Opción B", desc: "Hummus con palitos de zanahoria." },
                { title: "Opción C", desc: "Fruta fresca y puñado de almendras." }
            ],
            dinner: [
                { title: "Opción A", desc: "Hamburguesa vegetal (tipo Heura/Beyond) con ensalada." },
                { title: "Opción B", desc: "Seitán a la plancha con pimientos asados." },
                { title: "Opción C", desc: "Crema de calabacín con levadura nutricional y semillas de cáñamo." }
            ]
        }
    },

    // G. CLEAN BULK (Volumen Limpio)
    cleanbulk: {
        nameBase: "NDP Lean Bulk",
        description: "Superávit calórico controlado. Ganancia muscular minimizando grasa.",
        mealsPerDay: 5,
        macros: { p: 30, c: 50, f: 20 },
        plan: {
            breakfast: [
                { title: "Opción A", desc: "Tortitas de avena y claras." },
                { title: "Opción B", desc: "Gachas de avena con Whey." },
                { title: "Opción C", desc: "Pan Ezequiel con pavo y fruta." }
            ],
            lunch: [
                { title: "Opción A", desc: "Pollo, Boniato y Judías verdes." },
                { title: "Opción B", desc: "Ternera magra, Arroz integral, Ensalada." },
                { title: "Opción C", desc: "Pavo, Quinoa y Pimientos." }
            ],
            snack: [
                { title: "Pre-Entreno", desc: "Crema de arroz con Whey Protein." },
                { title: "Post-Entreno", desc: "Batido de recuperación + Plátano." },
                { title: "Opción C", desc: "Tortitas de arroz con pavo." }
            ],
            dinner: [
                { title: "Opción A", desc: "Pescado blanco y Patata cocida." },
                { title: "Opción B", desc: "Tortilla de patata al horno (baja grasa)." },
                { title: "Opción C", desc: "Sepia con ensalada." }
            ]
        }
    },

    // H. DIRTY BULK / HARDGAINER
    hardgainer: {
        nameBase: "NDP Hardgainer Push",
        description: "Altísima densidad calórica para personas que no suben de peso. Comidas líquidas y grasas añadidas.",
        mealsPerDay: 5,
        macros: { p: 25, c: 45, f: 30 },
        plan: {
            breakfast: [
                { title: "Bomba A", desc: "Batido: Leche entera, Helado vainilla, Avena, Whey, Crema cacahuete." },
                { title: "Opción B", desc: "4 Huevos fritos, Bacon, Judías con tomate, Tostadas." },
                { title: "Opción C", desc: "Granola alta en calorías con Yogur Griego entero." }
            ],
            lunch: [
                { title: "Opción A", desc: "Plato de Pasta muy grande con Carne picada mixta y Queso." },
                { title: "Opción B", desc: "Arroz frito con huevo, pollo y aceite de sésamo." },
                { title: "Opción C", desc: "Entrecot de ternera con patatas fritas (airfryer)." }
            ],
            snack: [
                { title: "Opción A", desc: "Bocadillo de lomo/queso grande." },
                { title: "Opción B", desc: "Frutos secos (100g) + Batido." },
                { title: "Opción C", desc: "Sándwich doble de crema de cacahuete y mermelada." }
            ],
            dinner: [
                { title: "Opción A", desc: "Salmón (graso) con puré de patata con mantequilla." },
                { title: "Opción B", desc: "Pizza casera con base de pollo/atún y mucho queso." },
                { title: "Opción C", desc: "Hamburguesa completa con huevo." }
            ]
        }
    }
};

// 2. GENERADOR DE LAS 80 DIETAS
// Función que cruza las plantillas con rangos de calorías
export const generateDiets = () => {
    const diets = [];
    let idCounter = 1;

    // Configuración de rangos para cada tipo
    const ranges = [
        { type: 'deficit', calories: [1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200], cat: "Déficit" },
        { type: 'classic', calories: [2500, 2600, 2800, 3000, 3200, 3400, 3600, 3800], cat: "Volumen" },
        { type: 'cleanbulk', calories: [2600, 2800, 3000, 3200, 3400], cat: "Volumen" },
        { type: 'hardgainer', calories: [3500, 3800, 4000, 4200, 4500, 5000], cat: "Volumen" },
        { type: 'paleo', calories: [1800, 2000, 2200, 2400, 2600], cat: "Salud" },
        { type: 'keto', calories: [1600, 1800, 2000, 2200, 2400], cat: "Déficit" },
        { type: 'fasting', calories: [1500, 1700, 1900, 2100, 2300], cat: "Déficit" },
        { type: 'vegan', calories: [1800, 2000, 2200, 2400, 2600, 2800], cat: "Salud" }
    ];

    ranges.forEach(range => {
        const template = templates[range.type];
        range.calories.forEach(kcal => {
            diets.push({
                id: `diet-${idCounter++}`,
                name: `${template.nameBase} (${kcal} kcal)`,
                category: range.cat,
                calories: kcal,
                mealsPerDay: template.mealsPerDay,
                macros: template.macros,
                description: template.description + ` Ajustada para ${kcal} calorías diarias.`,
                plan: template.plan // Usa el plan base
            });
        });
    });

    return diets;
};

export const dietsDatabase = generateDiets();