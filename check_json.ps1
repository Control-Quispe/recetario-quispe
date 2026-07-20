$content = Get-Content -Raw -Path "data.js"
$json = $content -replace "(?s)^.*?const recipeData = ", "" -replace "(?s);\s*const subRecipeData = \[\];\s*$", ""

try {
    $parsed = ConvertFrom-Json $json
    Write-Host "JSON is valid. Found $($parsed.Count) recipes."
} catch {
    Write-Host "JSON ERROR: $_"
}
