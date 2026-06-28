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
  
  for (var i = 0; i < hojas.length; i++) {
    var hoja = hojas[i];
    var nombreHoja = hoja.getName().trim();
    if (nombreHoja.toLowerCase().includes("catalogo") || nombreHoja.toLowerCase().includes("resumen")) continue;
    
    var sub_id = slugify(nombreHoja);
    var categoria = catMap[sub_id] || "Bases y Salsas";
    
    var datos = hoja.getDataRange().getValues();
    var filaIngredientes = -1, colIngredientes = -1;
    var colUmg = -1, colReal = -1;
    var filaPasoAPaso = -1, colPasoAPaso = -1;
    var filaRendimiento = -1, colRendimiento = -1;
    
    for (var r = 0; r < datos.length; r++) {
      for (var c = 0; c < datos[r].length; c++) {
        var val = datos[r][c] ? datos[r][c].toString().trim().toLowerCase() : "";
        if (!val) continue;
        
        if ((val.includes("ingrediente") || val.includes("edientes")) && filaIngredientes === -1) {
          filaIngredientes = r;
          colIngredientes = c;
          
          for (var c2 = 0; c2 < datos[r].length; c2++) {
             var val2 = datos[r][c2] ? datos[r][c2].toString().trim().toLowerCase() : "";
             if (val2 === "umg" || val2.includes("umg")) colUmg = c2;
             if (val2 === "real" || val2.includes("real") || val2 === "cantidad" || val2.includes("cantidad")) colReal = c2;
          }
        }
        if (val.includes("paso a paso") && filaPasoAPaso === -1) {
          filaPasoAPaso = r;
          colPasoAPaso = c;
        }
        if (val.includes("rendimiento") && filaRendimiento === -1) {
          filaRendimiento = r;
          colRendimiento = c;
        }
      }
    }
    
    if (filaIngredientes === -1) continue;
    if (colUmg === -1) colUmg = colIngredientes + 2; 
    if (colReal === -1) colReal = colIngredientes + 3;
    
    var rendimientoVal = 0;
    if (filaRendimiento !== -1 && colRendimiento + 1 < datos[filaRendimiento].length) {
      rendimientoVal = parseFloat(datos[filaRendimiento][colRendimiento + 1]) || 0;
    }
    
    var ingredients = [];
    var finIngredientes = filaRendimiento !== -1 ? filaRendimiento : (filaPasoAPaso !== -1 ? filaPasoAPaso : datos.length);
    
    for (var r = filaIngredientes + 1; r < finIngredientes; r++) {
      if (r >= datos.length) break; 
      var ingName = datos[r][colIngredientes] ? datos[r][colIngredientes].toString().trim() : "";
      
      if (!ingName || ingName === "" || ingName.toLowerCase().includes("procedimiento") || ingName.toLowerCase().includes("paso a paso")) continue;
      
      var umg = "";
      if (colUmg < datos[r].length) {
         umg = datos[r][colUmg] ? datos[r][colUmg].toString().trim() : "";
      }
      var qty = 0;
      if (colReal < datos[r].length) {
         qty = parseFloat(datos[r][colReal]) || 0;
      }
      
      ingredients.push({ name: ingName, umg: umg, qty: qty });
    }
    
    var procedure = [];
    if (filaPasoAPaso !== -1) {
      for (var r = filaPasoAPaso + 1; r < datos.length; r++) {
        var paso = datos[r][colPasoAPaso] ? datos[r][colPasoAPaso].toString().trim() : "";
        if (paso !== "") procedure.push(paso);
      }
    }
    
    subrecetas.push({
      id: sub_id, name: nombreHoja, category: categoria, yield: rendimientoVal,
      ingredients: ingredients, procedure: procedure
    });
  }
  
  var jsonString = "const subRecipeData = " + JSON.stringify(subrecetas, null, 4) + ";";
  var htmlOutput = HtmlService.createHtmlOutput('<p>Pega esto <b>al final</b> de tu archivo data.js, reemplazando el const subRecipeData anterior:</p><textarea style="width:100%;height:90%;font-family:monospace;padding:10px;">' + jsonString + '</textarea>').setWidth(800).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Subrecetas exportadas: ' + subrecetas.length);
}

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/[-\s]+/g, "-").replace(/^[-_]+|[-_]+$/g, "");
}
```

4. Pégalo, guarda y dale a Ejecutar.
5. Copia todo el código que te genere y pégalo **al final del archivo `data.js`**, reemplazando la sección antigua de `const subRecipeData = [...]`.
