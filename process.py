import json
import re
import os
import shutil
import unicodedata

def slugify(value):
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')

# 1. Mapeo de descripciones y categorías manual (del PDF)
menu_data = {
    # Cebiches
    "cebiche clasico": {"cat": "Cebiches", "desc": "Corvina salvaje marinada con nuestra leche de tigre clásica."},
    "cebiche quispe": {"cat": "Cebiches", "desc": "Corvina salvaje, pulpo troceado y chicharrón de calamar marinados con leche de tigre de ají amarillo."},
    "cebiche mixto ahumado": {"cat": "Cebiches", "desc": "Cebiche mixto, leche de tigre de ahumados de ajíes, corvina, almejas, gambas y chifles."},
    "cebiche verde de corvina": {"cat": "Cebiches", "desc": "Corvina salvaje marinada con nuestra leche de tigre a base de cilantro y texturas."},
    "cebiche de atun": {"cat": "Cebiches", "desc": "Atún rojo, leche de tigre de tomate de árbol y trompeta de la muerte."},
    "trio de cebiches": {"cat": "Cebiches", "desc": "Clásico / de corvina y pulpo / de atún."},
    
    # Tiraditos
    "tiradito de atun de almadraba": {"cat": "Tiraditos", "desc": "Atún rojo de almadraba, salsa ponzu y ají amarillo."},
    "tiradito de salmon maracuya": {"cat": "Tiraditos", "desc": "Salmón, leche de tigre de ají amarillo y maracuyá con aceite de sésamo, y huevas de trucha ahumada."},
    "tiradito de corvina aguacate": {"cat": "Tiraditos", "desc": "Corvina salvaje, emulsión de limón y aceite de cilantro, huevas de salmón y ají limo."},
    "tiradito de pulpo al olivo": {"cat": "Tiraditos", "desc": "Láminas de pulpo, salsa de aceitunas de botija, alcaparrones, pimientos de temporada y tomates orgánicos."},
    "tiradito bachhiche de hamachi": {"cat": "Tiraditos", "desc": "Láminas de hamachi, emulsión de queso parmesano, alga hijiki y ponzu."},
    "tiradito de vieiras": {"cat": "Tiraditos", "desc": ""},

    # Causas
    "causa de langostinos": {"cat": "Causas", "desc": "Patata marinada con lima y ají amarillo, acompañado de farsa de langostinos y salsa de rocoto."},
    "causa acebichada de atun": {"cat": "Causas", "desc": "Tartar de atún rojo de almadraba, causa de patata y ají amarillo, alcaparrones, salsa acebichada."},
    "causa acebichada de corvina": {"cat": "Causas", "desc": ""},
    "causa de ventresca de bonito": {"cat": "Causas", "desc": ""},
    "causa de atun": {"cat": "Causas", "desc": ""},

    # Nikkei
    "maki tempura tartar 5uds": {"cat": "Nikkei", "desc": "Ebifurai, aguacate, queso crema, tartar de atún rojo de almadraba y taré."},
    "maki acebichado 5uds": {"cat": "Nikkei", "desc": "Ebifurai, aguacate, atún rojo de almadraba, salsa acebichada y togarashi."},
    "maki vinicunka 5unidads": {"cat": "Nikkei", "desc": "Ebifurai, aguacate, salmón y sriracha."},
    "maki anticuchero 5unds": {"cat": "Nikkei", "desc": "Ebifurai, aguacate, lubina y salsa anticuchera."},
    "nigiri de salmon 2unds": {"cat": "Nikkei", "desc": "Salsa de ají amarillo y crujientes de cebolla."},
    "nigiri de atun de almadraba 2unds": {"cat": "Nikkei", "desc": "Salsa acebichada y nori con salsa ponzu."},
    "nigiri de lubina 2unds": {"cat": "Nikkei", "desc": "Salsa ponzu, trufa y sal Maldon."},

    # Entrantes
    "ostras amelie": {"cat": "Entrantes", "desc": "Ostra francesa, emulsión de cilantro, huevas de trucha y leche de tigre de rocoto."},
    "vieiras achupetadas": {"cat": "Entrantes", "desc": "Vieiras U10 a la robata, salsa de chupe, espuma de parmesano y huacatay."},
    "zamburinas acebichadas a la brasa": {"cat": "Entrantes", "desc": "Leche de tigre de rocoto y ají amarillo con boniato brulée."},
    "jalea mixta de corvina chipirones": {"cat": "Entrantes", "desc": "Corvina y chipirones crujientes con leche de tigre de ají amarillo."},
    "pulpo al carbon con majado de yuca": {"cat": "Entrantes", "desc": "Braseado al carbón, salsa anticuchera, majado de yuca, ají amarillo, aceituna de botija, choclo y edamame."},
    "pastel de choclo": {"cat": "Entrantes", "desc": "Cremoso de maíz y ají amarillo, osobuco, boletus, jugos de estofado y espuma de parmesano."},
    "empanadas de lomo saltado": {"cat": "Entrantes", "desc": "Masa artesanal de yuca, rellena de lomo saltado, crema de rocoto y Grana Padano."},
    "secreto iberico en salsa anticuchera": {"cat": "Entrantes", "desc": "Secreto ibérico brasa, texturas de patata, ají carretillero, choclito brasa y crema de huacatay."},

    # Ensaladas
    "acebichada": {"cat": "Ensaladas", "desc": "Espinacas, remolacha, tomate cherry, choclo, queso de cabra y salsa de mango acebichada."},
    "quinoa y endivias": {"cat": "Ensaladas", "desc": "Quinoa negra y blanca, tomates, lascas de queso semi duro, endivias y aliño de mostaza con ají amarillo."},

    # Principales
    "tortellini loche": {"cat": "Principales", "desc": "Rellenos de zapallo loche y crema ligera de huancaína."},
    "quinoto de hongos trufado": {"cat": "Principales", "desc": "Rissotto de quinoa de ají amarillo, mix de setas salvajes, shimenji al wok y queso pecorino."},
    "arroz chaufa de mariscos": {"cat": "Principales", "desc": "Salteado al wok con pulpo, langostinos y chipirones, salsa tamarindo y alga nori."},
    "arroz achupetado de gambon almejas": {"cat": "Principales", "desc": "Achupetado de gambón y almejas, salsa criolla, chupe y salsa de rocoto."},
    "arroz con pato": {"cat": "Principales", "desc": "Meloso de cilantro y zapallo loche con magret de pato ahumado, crema de rocoto y huevo de codorníz."},
    "aji de gallina": {"cat": "Principales", "desc": "Pollo de corral, salsa de ají amarillo, huevo de codorníz, patata amarilla, grana padano y arroz con choclo."},
    "lomo saltado": {"cat": "Principales", "desc": "Solomillo salteado al wok, cebolla morada, tomate cherry, patatas criollas y arroz con choclo."},
    "seco de asado de tira angus": {"cat": "Principales", "desc": "Cocido a baja temperatura con sabores de seco norteño, texturas de pallares y arroz arvejado."},
    "salmon a la brasa": {"cat": "Principales", "desc": "Salmón a la brasa, beurre blanc de ají amarillo y ponzu, bimi rostizada, trompetas de la muerte y shimeji."},
    "lubina a la chorrillana": {"cat": "Principales", "desc": "Lubina de anzuelo a la brasa, salsa chorrillana y verduras al wok."},
    "noquis y presa iberica": {"cat": "Principales", "desc": ""},
    "osobuco": {"cat": "Principales", "desc": ""},
}

with open("data.js", "r") as f:
    data_content = f.read()

match = re.search(r'(const recipeData = )(\[.*?\])(;.*)', data_content, re.DOTALL)
prefix = data_content[:match.start(2)]
suffix = data_content[match.end(2):]
recipes = json.loads(match.group(2))

# Preparar las fotos
fotos_dir = "fotos"
principales_dir = os.path.join(fotos_dir, "Principales")
all_photos = []
if os.path.exists(fotos_dir):
    all_photos += [(f, os.path.join(fotos_dir, f)) for f in os.listdir(fotos_dir) if f.endswith(('.jpg', '.png'))]
if os.path.exists(principales_dir):
    all_photos += [(f, os.path.join(principales_dir, f)) for f in os.listdir(principales_dir) if f.endswith(('.jpg', '.png'))]

processed_recipes = []
seen_ids = set()

for r in recipes:
    original_name = r.get("name", "")
    
    # 1. Limpiar nombre
    clean_name = original_name
    if clean_name.startswith("Nombre "):
        clean_name = clean_name[7:]
    
    # 2. Crear un slug ID estandarizado
    new_id = slugify(clean_name)
    
    if new_id in seen_ids:
        print(f"Skipping duplicate: {new_id}")
        continue
    seen_ids.add(new_id)

    # 3. Asignar categoría y descripción
    lookup_key = slugify(clean_name).replace('-', ' ')
    
    if lookup_key in menu_data:
        r["category"] = menu_data[lookup_key]["cat"]
        r["description"] = menu_data[lookup_key]["desc"]
    elif "maki" in lookup_key or "nigiri" in lookup_key:
        r["category"] = "Nikkei"
    
    r["name"] = clean_name
    
    # Buscar foto
    target_photo_name = new_id + ".jpg"
    matched_photo = None
    for p_name, p_path in all_photos:
        p_clean = slugify(os.path.splitext(p_name)[0])
        if p_clean == new_id or p_clean == slugify(original_name) or p_clean == slugify(r["id"]):
            matched_photo = (p_name, p_path)
            break
    
    if matched_photo:
        _, old_path = matched_photo
        new_path = os.path.join(fotos_dir, target_photo_name)
        if old_path != new_path:
            shutil.copy(old_path, new_path)
            print(f"Copied: {old_path} -> {new_path}")
    
    r["id"] = new_id
    processed_recipes.append(r)

new_data_content = prefix + json.dumps(processed_recipes, indent=4, ensure_ascii=False) + suffix
with open("data.js", "w") as f:
    f.write(new_data_content)

print("Done processing data.js and photos.")
