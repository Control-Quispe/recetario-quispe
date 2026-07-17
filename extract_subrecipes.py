import json
import re
import pandas as pd
import unicodedata
import os

def slugify(value):
    value = unicodedata.normalize('NFKD', str(value)).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')

excel_file = '/Users/dfcarhuayoz./Downloads/Producciones pase Quispe con paso a paso.xlsx'
xl = pd.ExcelFile(excel_file)
sheet_names = xl.sheet_names

# Get Categories from CATALOGO MAESTRO
master_df = pd.read_excel(excel_file, sheet_name='CATALOGO MAESTRO subrecetasPASE', header=None)
cat_map = {}
for i, row in master_df.iterrows():
    name = str(row.iloc[0]).strip()
    zona = str(row.iloc[2]).strip()
    if pd.notna(name) and pd.notna(zona) and name != "nan" and zona != "nan" and name != "SUB-RECETA":
        cat_map[slugify(name)] = zona

subrecipes = []

for sheet in sheet_names:
    if "CATALOGO" in sheet.upper():
        continue
    
    df = pd.read_excel(excel_file, sheet_name=sheet)
    # Buscamos la fila de Ingredientes
    ing_idx = -1
    rendimiento_idx = -1
    paso_idx = -1
    rendimiento_col = -1
    
    for i, row in df.iterrows():
        val = str(row.iloc[0]).strip().lower() if pd.notna(row.iloc[0]) else ""
        if val == "ingredientes":
            ing_idx = i
        if val == "paso a paso":
            paso_idx = i
        
        # Rendimiento a veces esta en la col 0 o en las otras
        for col_idx in range(len(row)):
            cell_val = str(row.iloc[col_idx]).strip().lower() if pd.notna(row.iloc[col_idx]) else ""
            if "rendimiento" in cell_val:
                rendimiento_idx = i
                rendimiento_col = col_idx
                break
                
    if ing_idx == -1:
        continue
        
    name = sheet.strip()
    sub_id = slugify(name)
    
    # Extraer rendimiento
    rendimiento_val = 0
    if rendimiento_idx != -1 and rendimiento_col + 1 < len(df.columns):
        rend = df.iloc[rendimiento_idx, rendimiento_col + 1]
        if pd.notna(rend):
            try:
                rendimiento_val = float(rend)
            except:
                pass
            
    # Extraer ingredientes
    ingredients = []
    end_ing = rendimiento_idx if rendimiento_idx != -1 else (paso_idx if paso_idx != -1 else len(df))
    for i in range(ing_idx + 1, end_ing):
        ing_name = df.iloc[i, 0]
        if pd.isna(ing_name) or str(ing_name).strip() == "":
            continue
        # UMG is usually col 6, REAL is col 7
        umg = str(df.iloc[i, 6]).strip() if len(df.columns) > 6 and pd.notna(df.iloc[i, 6]) else ""
        qty = df.iloc[i, 7] if len(df.columns) > 7 and pd.notna(df.iloc[i, 7]) else 0
        
        if umg == "nan": umg = ""
        
        try:
            qty = float(qty)
        except:
            qty = 0
            
        ingredients.append({
            "name": str(ing_name).strip(),
            "umg": umg,
            "qty": qty
        })
        
    # Extraer paso a paso
    procedure = []
    if paso_idx != -1:
        for i in range(paso_idx + 1, len(df)):
            paso = df.iloc[i, 0]
            if pd.notna(paso) and str(paso).strip() != "":
                procedure.append(str(paso).strip())
                
    cat = cat_map.get(sub_id, "Bases y Salsas")
    if cat == "nan" or cat == "": cat = "Bases y Salsas"
    
    subrecipes.append({
        "id": sub_id,
        "name": name,
        "category": cat,
        "yield": rendimiento_val,
        "ingredients": ingredients,
        "procedure": procedure
    })

# Guardar en data.js
with open("data.js", "r") as f:
    data_content = f.read()

# Replace or append subRecipeData
if "const subRecipeData =" in data_content:
    prefix = data_content.split("const subRecipeData =")[0]
    new_data = prefix + "const subRecipeData = " + json.dumps(subrecipes, indent=4, ensure_ascii=False) + ";"
else:
    new_data = data_content + "\n\nconst subRecipeData = " + json.dumps(subrecipes, indent=4, ensure_ascii=False) + ";"
    
with open("data.js", "w") as f:
    f.write(new_data)

print(f"Extracted {len(subrecipes)} subrecipes.")
