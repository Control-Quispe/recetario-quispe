$path = "C:\Users\contr\Documents\GitHub\recetario-quispe\data.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. URL Encoding fixes for Mojibake (both 1252 and CP437)
$map = @{
    # Windows-1252 Mojibake
    "%C3%83%C2%A1" = "%C3%A1"
    "%C3%83%C2%A9" = "%C3%A9"
    "%C3%83%C2%AD" = "%C3%AD"
    "%C3%83%C2%B3" = "%C3%B3"
    "%C3%83%C2%BA" = "%C3%BA"
    "%C3%83%C2%B1" = "%C3%B1"
    "%C3%83%E2%80%98" = "%C3%91"
    "%C3%83%C2%81" = "%C3%81"
    "%C3%83%E2%80%B0" = "%C3%89"
    "%C3%83%C2%8D" = "%C3%8D"
    "%C3%83%E2%80%9C" = "%C3%93"
    "%C3%83%C5%A1" = "%C3%9A"

    # CP437 Mojibake
    "%E2%94%9C%C2%A1" = "%C3%AD"
    "%E2%94%9C%C2%AE" = "%C3%A9"
    "%E2%94%9C%E2%94%82" = "%C3%B3"
    "%E2%94%9C%E2%96%92" = "%C3%B1"
    "%E2%94%9C%E2%95%91" = "%C3%BA"
}

foreach ($key in $map.Keys) {
    $oldStr = [System.Uri]::UnescapeDataString($key)
    $newStr = [System.Uri]::UnescapeDataString($map[$key])
    $content = $content.Replace($oldStr, $newStr)
}

$words = @{
    "cl+ísica" = "clásica"
    "aj+¡" = "ají"
    "Pur+®" = "Puré"
    "peque+¦os" = "pequeños"
    "Fr+¡o" = "Frío"
    "at+¦n" = "atún"
    "salm+¦n" = "salmón"
    "Az+¦car" = "Azúcar"
    "s+®samo" = "sésamo"
    "piment+¦n" = "pimentón"
    "osti+¦n" = "ostión"
    "Or+®gano" = "Orégano"
    "pequ+¦os" = "pequeños"
}

foreach ($key in $words.Keys) {
    $content = $content.Replace($key, $words[$key])
}

# 2. Fix prefix issues
$content = $content.Replace('"name": "Nombre ', '"name": "')
$content = $content.Replace('"id": "nombre-', '"id": "')

# 3. Reassign Entrantes and Ensaladas
$entrantes = @("ostras-amelie", "vieiras-achupetadas", "zamburinas-acebichadas-a-la-brasa", "jalea-mixta-de-corvina-&-chipirones", "pulpo-al-carbon-con-majado-de-yuca", "pastel-de-choclo", "empanadas-de-lomo-saltado", "secreto-iberico-en-salsa-anticuchera")
foreach ($ent in $entrantes) {
    $regex = '("id": "' + [regex]::Escape($ent) + '".*?"category": ")Principales(")'
    $content = [regex]::Replace($content, $regex, '${1}Entrantes$2', [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

$ensaladas = @("acebichada", "quinoa-y-endivias")
foreach ($ens in $ensaladas) {
    $regex = '("id": "' + [regex]::Escape($ens) + '".*?"category": ")Principales(")'
    $content = [regex]::Replace($content, $regex, '${1}Ensaladas$2', [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

# 4. Fix Tortellini Loche which is hiding under the second "secreto-iberico"
# We match the specific ingredients list to ensure we only rename the second one (Tortellini Loche)
$tortelliniRegex = '(?s)("id": "secreto-iberico-en-salsa-anticuchera",\s*"name": "Secreto ibérico en salsa anticuchera",\s*"category": "Entrantes",\s*"status": "active",\s*"area": "Calientes",\s*"time": "06:00",\s*"description": "",\s*"image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c\?q=80&w=1200",\s*"ingredients": \[\s*\{\s*"name": "Salsa Huancaína")'
$content = [regex]::Replace($content, $tortelliniRegex, '"id": "tortellini-loche",`n        "name": "Tortellini Loche",`n        "category": "Principales",`n        "status": "active",`n        "area": "Calientes",`n        "time": "06:00",`n        "description": "",`n        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200",`n        "ingredients": [`n            {`n                "name": "Salsa Huancaína"')

# 5. Append subRecipeData if missing
if (-not $content.Contains("mouse-de-aguacate")) {
    $oldContent = [System.IO.File]::ReadAllText("C:\Users\contr\Documents\GitHub\recetario-quispe\old_data.js", [System.Text.Encoding]::UTF8)
    $subStartIndex = $oldContent.IndexOf("const subRecipeData = [")
    if ($subStartIndex -ge 0) {
        $subDataBlock = $oldContent.Substring($subStartIndex)
        $content = $content -replace "(?s)const subRecipeData = \[\];?", ""
        $content = $content + "`n`n" + $subDataBlock
    }
}

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "All fixed!"
