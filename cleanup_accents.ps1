$path = "C:\Users\contr\Documents\GitHub\recetario-quispe\data.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Windows-1252 mojibake (from the user's Excel paste)
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

# CP437 mojibake (from Git or PowerShell misread on subrecipes)
$content = $content.Replace("├¡", "í")
$content = $content.Replace("├®", "é")
$content = $content.Replace("├│", "ó")
$content = $content.Replace("├▒", "ñ")
$content = $content.Replace("├║", "ú")
$content = $content.Replace("├ít", "át") # Just in case for plátano
$content = $content.Replace("├í", "á")
$content = $content.Replace("├í", "í") # Some might overlap, but a/i/o are the common ones.
$content = $content.Replace("cl+ísica", "clásica")
$content = $content.Replace("aj+¡", "ají")
$content = $content.Replace("Pur+®", "Puré")
$content = $content.Replace("peque+¦os", "pequeños")
$content = $content.Replace("Fr+¡o", "Frío")
$content = $content.Replace("at+¦n", "atún")
$content = $content.Replace("salm+¦n", "salmón")
$content = $content.Replace("Az+¦car", "Azúcar")
$content = $content.Replace("s+®samo", "sésamo")
$content = $content.Replace("piment+¦n", "pimentón")
$content = $content.Replace("osti+¦n", "ostión")
$content = $content.Replace("Or+®gano", "Orégano")

$content = $content.Replace("pequ+¦os", "pequeños")
$content = $content.Replace("peque├▒os", "pequeños")

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Accents fixed!"
