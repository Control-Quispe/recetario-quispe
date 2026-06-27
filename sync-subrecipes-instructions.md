# Guía de Sincronización: Subrecetas a JSON

Para poder actualizar la app directamente desde tu archivo en Drive, debes usar este script específico diseñado para tu nuevo archivo de "Producciones pase Quispe".

## Pasos para generar tus Subrecetas

1. Abre tu archivo de Google Sheets (`Producciones pase Quispe con paso a paso`).
2. Ve a **Extensiones** > **Apps Script**.
3. Borra el código que haya y pega exactamente este:

```javascript
function exportarSubRecetasAJSON() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hojas = libro.getSheets();
  var subrecetas = [];
  
  // 1. Obtener categorias del Catálogo
  var catMap = {};
  var hojaCatalogo = libro.getSheetByName("CATALOGO MAESTRO subrecetasPASE");
  if (hojaCatalogo) {
    var datosCat = hojaCatalogo.getRange("A1:C100").getValues();
    for (var i = 0; i < datosCat.length; i++) {
      var nombre = datosCat[i][0] ? datosCat[i][0].toString().trim() : "";
      var zona = datosCat[i][2] ? datosCat[i][2].toString().trim() : "";
      if (nombre && zona && nombre !== "SUB-RECETA") {
        var slug = slugify(nombre);
        catMap[slug] = zona;
      }
    }
  }
  
  // 2. Extraer hojas
  for (var i = 0; i < hojas.length; i++) {
    var hoja = hojas[i];
    var nombreHoja = hoja.getName().trim();
    
    if (nombreHoja.toLowerCase().includes("catalogo") || nombreHoja.toLowerCase().includes("resumen")) continue;
    
    var sub_id = slugify(nombreHoja);
    var categoria = catMap[sub_id] || "Bases y Salsas";
    
    var datos = hoja.getDataRange().getValues();
    var filaIngredientes = -1;
    var filaPasoAPaso = -1;
    var filaRendimiento = -1;
    var colRendimiento = -1;
    
    // Buscar delimitadores
    for (var r = 0; r < datos.length; r++) {
      var celda0 = datos[r][0] ? datos[r][0].toString().trim().toLowerCase() : "";
      if (celda0 === "ingredientes") filaIngredientes = r;
      if (celda0 === "paso a paso") filaPasoAPaso = r;
      
      for (var c = 0; c < datos[r].length; c++) {
        var celdaC = datos[r][c] ? datos[r][c].toString().trim().toLowerCase() : "";
        if (celdaC.includes("rendimiento")) {
          filaRendimiento = r;
          colRendimiento = c;
          break;
        }
      }
    }
    
    if (filaIngredientes === -1) continue;
    
    // Extraer Rendimiento
    var rendimientoVal = 0;
    if (filaRendimiento !== -1 && colRendimiento + 1 < datos[filaRendimiento].length) {
      rendimientoVal = parseFloat(datos[filaRendimiento][colRendimiento + 1]) || 0;
    }
    
    // Extraer Ingredientes
    var ingredients = [];
    var finIngredientes = filaRendimiento !== -1 ? filaRendimiento : (filaPasoAPaso !== -1 ? filaPasoAPaso : datos.length);
    
    for (var r = filaIngredientes + 1; r < finIngredientes; r++) {
      var ingName = datos[r][0] ? datos[r][0].toString().trim() : "";
      if (!ingName || ingName === "") continue;
      
      var umg = datos[r].length > 6 ? datos[r][6] : "";
      var qty = datos[r].length > 7 ? parseFloat(datos[r][7]) || 0 : 0;
      
      ingredients.push({
        name: ingName,
        umg: umg ? umg.toString().trim() : "",
        qty: qty
      });
    }
    
    // Extraer Procedimiento
    var procedure = [];
    if (filaPasoAPaso !== -1) {
      for (var r = filaPasoAPaso + 1; r < datos.length; r++) {
        var paso = datos[r][0] ? datos[r][0].toString().trim() : "";
        if (paso !== "") procedure.push(paso);
      }
    }
    
    subrecetas.push({
      id: sub_id,
      name: nombreHoja,
      category: categoria,
      yield: rendimientoVal,
      ingredients: ingredients,
      procedure: procedure
    });
  }
  
  var jsonString = "const subRecipeData = " + JSON.stringify(subrecetas, null, 4) + ";";
  
  var htmlOutput = HtmlService.createHtmlOutput('<p>Pega esto <b>al final</b> de tu archivo data.js, reemplazando el const subRecipeData anterior:</p><textarea style="width:100%;height:90%;font-family:monospace;padding:10px;">' + jsonString + '</textarea>')
      .setWidth(800)
      .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Subrecetas exportadas');
}

function slugify(text) {
  return text.toLowerCase()
             .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
             .replace(/[^\w\s-]/g, '')
             .replace(/[-\s]+/g, '-')
             .replace(/^[-_]+|[-_]+$/g, '');
}
```

4. Pégalo, guarda y dale a Ejecutar. Te pedirá permisos la primera vez.
5. Copia todo el código que te genere y pégalo **al final del archivo `data.js`**, reemplazando la sección antigua de `const subRecipeData = [...]`.
