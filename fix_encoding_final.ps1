$path = "C:\Users\contr\Documents\GitHub\recetario-quispe\data.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$map = @{
    # Windows-1252 Mojibake
    "%C3%83%C2%A1" = "%C3%A1" # a
    "%C3%83%C2%A9" = "%C3%A9" # e
    "%C3%83%C2%AD" = "%C3%AD" # i
    "%C3%83%C2%B3" = "%C3%B3" # o
    "%C3%83%C2%BA" = "%C3%BA" # u
    "%C3%83%C2%B1" = "%C3%B1" # enie
    "%C3%83%E2%80%98" = "%C3%91" # ENIE
    "%C3%83%C2%81" = "%C3%81" # A
    "%C3%83%E2%80%B0" = "%C3%89" # E
    "%C3%83%C2%8D" = "%C3%8D" # I
    "%C3%83%E2%80%9C" = "%C3%93" # O
    "%C3%83%C5%A1" = "%C3%9A" # U

    # CP437 Mojibake (from git checkout mismatch)
    "%E2%94%9C%C2%A1" = "%C3%AD" # í
    "%E2%94%9C%C2%AE" = "%C3%A9" # é
    "%E2%94%9C%E2%94%82" = "%C3%B3" # ó
    "%E2%94%9C%E2%96%92" = "%C3%B1" # ñ
    "%E2%94%9C%E2%95%91" = "%C3%BA" # ú
}

foreach ($key in $map.Keys) {
    $oldStr = [System.Uri]::UnescapeDataString($key)
    $newStr = [System.Uri]::UnescapeDataString($map[$key])
    $content = $content.Replace($oldStr, $newStr)
}

# Also manually replace the specific words that might have been corrupted differently
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

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Encoding finally fixed!"
