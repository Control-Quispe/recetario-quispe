$content = Get-Content -Raw -Path "data.js"

# 1. Remove "Nombre " prefix
$content = $content -replace '"name": "Nombre ', '"name": "'

# 2. Remove "nombre-" prefix
$content = $content -replace '"id": "nombre-', '"id": "'

# 3. Fix Entrantes
$entrantes = @("ostras-amelie", "vieiras-achupetadas", "zamburinas-acebichadas-a-la-brasa", "jalea-mixta-de-corvina-&-chipirones", "pulpo-al-carbon-con-majado-de-yuca", "pastel-de-choclo", "empanadas-de-lomo-saltado", "secreto-iberico-en-salsa-anticuchera")
foreach ($ent in $entrantes) {
    # Match id block, then capture down to category and replace Principales with Entrantes
    $regex = '("id": "' + [regex]::Escape($ent) + '".*?"category": ")Principales(")'
    $content = [regex]::Replace($content, $regex, '${1}Entrantes$2', [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

# 4. Fix Ensaladas
$ensaladas = @("acebichada", "quinoa-y-endivias")
foreach ($ens in $ensaladas) {
    $regex = '("id": "' + [regex]::Escape($ens) + '".*?"category": ")Principales(")'
    $content = [regex]::Replace($content, $regex, '${1}Ensaladas$2', [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

[System.IO.File]::WriteAllText("C:\Users\contr\Documents\GitHub\recetario-quispe\data.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Replaced!"
