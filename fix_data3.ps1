$path = "C:\Users\contr\Documents\GitHub\recetario-quispe\data.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

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

# 5. Remove the second Secreto Iberico duplicate block
# We can find the block using regex and remove the second one.
# It starts with: {\s*"id": "secreto-iberico-en-salsa-anticuchera",
$regexDuplicate = '(?s)({\s*"id": "secreto-iberico-en-salsa-anticuchera".*?}.*?)({\s*"id": "secreto-iberico-en-salsa-anticuchera".*?},?\s*)'
$content = [regex]::Replace($content, $regexDuplicate, '$1')

# 6. Append subRecipeData from older commit if missing
if (-not $content.Contains("mouse-de-aguacate")) {
    $oldContent = [System.IO.File]::ReadAllText("C:\Users\contr\Documents\GitHub\recetario-quispe\old_data.js", [System.Text.Encoding]::UTF8)
    $subStartIndex = $oldContent.IndexOf("const subRecipeData = [")
    if ($subStartIndex -ge 0) {
        $subDataBlock = $oldContent.Substring($subStartIndex)
        $content = $content -replace "(?s)const subRecipeData = \[\];?", ""
        $content = $content + "`n`n" + $subDataBlock
    }
}

# Write back
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Replaced properly!"
