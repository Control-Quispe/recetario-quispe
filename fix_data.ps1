$content = Get-Content -Raw -Path "data.js"
$json = $content -replace "(?s)^.*?const recipeData = ", "" -replace "(?s);\s*const subRecipeData = .*$", ""

$recipes = ConvertFrom-Json $json

$ensaladas = @("acebichada", "quinoa-y-endivias")
$entrantes = @("ostras-amelie", "vieiras-achupetadas", "zamburinas-acebichadas-a-la-brasa", "jalea-mixta-de-corvina-&-chipirones", "pulpo-al-carbon-con-majado-de-yuca", "pastel-de-choclo", "empanadas-de-lomo-saltado", "secreto-iberico-en-salsa-anticuchera")

foreach ($r in $recipes) {
    if ($r.id.StartsWith("nombre-")) {
        $r.id = $r.id.Substring(7)
    }
    if ($r.name.StartsWith("Nombre ")) {
        $r.name = $r.name.Substring(7)
    }
    
    if ($ensaladas -contains $r.id) {
        $r.category = "Ensaladas"
    } elseif ($entrantes -contains $r.id) {
        $r.category = "Entrantes"
    }
}

# Now save it back
$newJson = $recipes | ConvertTo-Json -Depth 10

# We need to manually reconstruct the file
$oldSubRecipeIndex = $content.IndexOf("const subRecipeData =")
$subRecipeBlock = $content.Substring($oldSubRecipeIndex)

$finalFile = "const recipeData = " + $newJson + ";`n`n" + $subRecipeBlock
Set-Content -Path data.js -Value $finalFile

Write-Host "Done parsing and fixing!"
