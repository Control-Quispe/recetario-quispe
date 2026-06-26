// descriptions.js
// Extraído de la CARTA QUISPE.pdf
// Este archivo guarda las descripciones para no perderlas al actualizar data.js desde Excel.

const menuDescriptions = {
    // --- CEBICHES ---
    "cebiche-clasico": "Corvina salvaje marinada con nuestra leche de tigre clásica.",
    "cebiche-quispe": "Corvina salvaje, pulpo troceado y chicharrón de calamar marinados con leche de tigre de ají amarillo.",
    "cebiche-mixto-ahumado": "Cebiche mixto, leche de tigre de ahumados de ajíes, corvina, almejas, gambas y chifles.",
    "nombre-cebiche-mixto-ahumado": "Cebiche mixto, leche de tigre de ahumados de ajíes, corvina, almejas, gambas y chifles.",
    "cebiche-verde-de-corvina": "Corvina salvaje marinada con nuestra leche de tigre a base de cilantro y texturas.",
    "cebiche-de-atun": "Atún rojo, leche de tigre de tomate de árbol y trompeta de la muerte.",
    "trio-cebiches": "Clásico / de corvina y pulpo / de atún",
    "trio-de-cebiches": "Clásico / de corvina y pulpo / de atún",

    // --- TIRADITOS ---
    "tiradito-antiguo": "Receta del 2024. Salmón con leche de tigre de ají amarillo clásica.",
    "tiradito-de-atun-de-almadraba": "Atún rojo de almadraba, salsa ponzu y ají amarillo.",
    "tiradito-de-salmon-&-maracuya": "Salmón, leche de tigre de ají amarillo y maracuyá con aceite de sésamo, y huevas de trucha ahumada.",
    "tiradito-de-corvina-&-aguacate": "Corvina salvaje, emulsión de limón y aceite de cilantro, huevas de salmón y ají limo.",
    "tiradito-de-pulpo-al-olivo": "Láminas de pulpo, salsa de aceitunas de botija, alcaparrones, pimientos de temporada y tomates orgánicos.",
    "tiradito-bachhiche-de-hamachi": "Láminas de hamachi, emulsión de queso parmesano, alga hijiki y ponzu.",

    // --- CAUSAS ---
    "causa-de-langostinos": "Patata marinada con lima y ají amarillo, acompañado de farsa de langostinos y salsa de rocoto.",
    "causa-de-atun": "Patata marinada con lima y ají amarillo, tartar de atún rojo de almadraba, alcaparrones, salsa acebichada.",

    // --- NIKKEI ---
    "maki-tempura-tartar---5uds.": "Ebifurai, aguacate, queso crema, tartar de atún rojo de almadraba y taré.",
    "maki-acebichado---5uds.": "Ebifurai, aguacate, atún rojo de almadraba, salsa acebichada y togarashi.",
    "maki-vinicunka---5unidads.": "Ebifurai, aguacate, salmón y sriracha.",
    "nombre-maki-anticuchero---5unds.": "Ebifurai, aguacate, lubina y salsa anticuchera.",
    "nombre-nigiri-de-salmon---2unds.": "Salsa de ají amarillo y crujientes de cebolla.",
    "nombre-nigiri-de-atun-de-almadraba---2unds.": "Salsa acebichada y nori con salsa ponzu.",
    "nombre-nigiri-de-lubina---2unds.": "Salsa ponzu, trufa y sal Maldon.",

    // --- ENTRANTES ---
    "ostras-francesas": "Ostra francesa, emulsión de cilantro, huevas de trucha y leche de tigre de rocoto.",
    "vieiras-achupetadas": "Vieiras U10 a la robata, salsa de chupe, espuma de parmesano y huacatay.",
    "vieras-u10-achupetadas": "Vieiras U10 a la robata, salsa de chupe, espuma de parmesano y huacatay.",
    "zamburinas-acebichadas": "Leche de tigre de rocoto y ají amarillo con boniato brulée.",
    "jalea-mixta": "Corvina y chipirones crujientes con leche de tigre de ají amarillo.",
    "pulpo-carbon": "Braseado al carbón, salsa anticuchera, majado de yuca, ají amarillo, aceituna de botija.",
    "pastel-choclo": "Cremoso de maíz y ají amarillo, osobuco, boletus, jugos de estofado y espuma de parmesano.",
    "empanadas-lomo": "Masa artesanal de yuca, rellena de lomo saltado, crema de rocoto y Grana Padano.",
    "anticucho-secreto": "Secreto ibérico brasa, texturas de patata, ají carretillero, choclito brasa y crema de huacatay.",

    // --- ENSALADAS ---
    "ensalada-acebichada": "Espinacas, remolacha, tomate cherry, choclo, queso de cabra y salsa de mango acebichada.",
    "quinoa-endivias": "Quinoa negra y blanca, tomates, lascas de queso semi duro, endivias y aliño de mostaza con ají amarillo.",

    // --- PRINCIPALES ---
    "tortellini-loche": "Rellenos de zapallo loche y crema ligera de huancaína.",
    "quinoto-hongos": "Rissotto de quinoa de ají amarillo, mix de setas salvajes, shimenji al wok y queso pecorino.",
    "arroz-chaufa-mariscos": "Salteado al wok con pulpo, langostinos y chipirones, salsa tamarindo y alga nori.",
    "arroz-achupetado": "Achupetado de gambón y almejas, salsa criolla, chupe y salsa de rocoto.",
    "arroz-pato": "Meloso de cilantro y zapallo loche con magret de pato ahumado, crema de rocoto y huevo de codorniz.",
    "aji-gallina": "Pollo de corral, salsa de ají amarillo, huevo de codorníz, patata amarilla, grana padano y arroz con choclo.",
    "lomo-saltado": "Solomillo salteado al wok, cebolla morada, tomate cherry, patatas criollas y arroz con choclo.",
    "seco-asado-tira": "Cocido a baja temperatura con sabores de seco norteño, texturas de pallares y arroz arvejado.",
    "salmon-brasa": "Salmón a la brasa, beurre blanc de ají amarillo y ponzu, bimi rostizada, trompetas de la muerte y shimeji.",
    "lubina-chorrillana": "Lubina de anzuelo a la brasa, salsa chorrillana y verduras al wok.",

    // --- POSTRES ---
    "tarta-chirimoya": "Tarta cremosa de queso y chirimoya, estilo vasca, helado de chirimoya y cítricos.",
    "chocolucuma": "Cremoso y helado de lúcuma, y texturas de chocolate.",
    "tarta-limon": "Crema de limón, merengue, helado de vainilla y frutos rojos.",
    "suspiro-limena": "Manjar casero, merengue y frutos rojos.",
    "tres-leches": "Bizcocho húmedo de tres leches y pisco, aire de café, helado de vainilla y chocolate.",
    "chocolate-mas-chocolate": "Bizcocho y mousse de chocolate al 80% originario de Perú, helado de mascarpone y AOVE."
};
