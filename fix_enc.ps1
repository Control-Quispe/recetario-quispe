$path = "C:\Users\contr\Documents\GitHub\recetario-quispe\data.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Windows-1252 mojibake fixes
$content = $content.Replace("Ã¡", "á")
$content = $content.Replace("Ã©", "é")
$content = $content.Replace("Ã­", "í")
$content = $content.Replace("Ã³", "ó")
$content = $content.Replace("Ãº", "ú")
$content = $content.Replace("Ã±", "ñ")
$content = $content.Replace("Ã‘", "Ñ")
$content = $content.Replace("Ã ", "Á")
$content = $content.Replace("Ã‰", "É")
$content = $content.Replace("Ã ", "Í")
$content = $content.Replace("Ã“", "Ó")
$content = $content.Replace("Ãš", "Ú")

# CP437 mojibake fixes
$content = $content.Replace("├¡", "í")
$content = $content.Replace("├®", "é")
$content = $content.Replace("├│", "ó")
$content = $content.Replace("├▒", "ñ")
$content = $content.Replace("├║", "ú")

# Direct fixes for known broken words just in case
$content = $content.Replace("Zamburias", "Zamburiñas")
$content = $content.Replace("Zamburias", "Zamburiñas")

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Replaced!"