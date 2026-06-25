# Guía de Sincronización: Google Sheets a JSON

He analizado la estructura de tu Excel. ¡Es perfecta y muy limpia! 
Con esa estructura, este es el código definitivo que debes usar para que extraiga todo de forma automática.

## Pasos para generar tu `data.js`

1. Abre tu archivo de Google Sheets.
2. Ve a **Extensiones** > **Apps Script**.
3. Borra el código que haya y pega exactamente este:

```javascript
function exportarRecetasAJSON() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hojas = libro.getSheets();
  var recetas = [];
  
  for (var i = 0; i < hojas.length; i++) {
    var hoja = hojas[i];
    var nombreHoja = hoja.getName();
    
    if (nombreHoja.toLowerCase().includes("plantilla") || nombreHoja.toLowerCase().includes("resumen")) continue;
    
    var textoNombre = hoja.getRange("A1").getValue().toString(); 
    var textoArea = hoja.getRange("A2").getValue().toString();   
    var textoEstado = hoja.getRange("A3").getValue().toString(); 
    var textoTiempo = hoja.getRange("A4").getValue().toString(); 
    
    if(!textoNombre) continue;
    
    var nombrePlato = textoNombre.replace("Nombre:", "").trim();
    if(!nombrePlato) nombrePlato = nombreHoja;

    var estado = textoEstado.toLowerCase().includes("activo") ? "active" : "archived";
    
    var categoria = "Principales";
    if (nombrePlato.toLowerCase().includes("cebiche")) categoria = "Cebiches";
    else if (nombrePlato.toLowerCase().includes("tiradito") || nombrePlato.toLowerCase().includes("nikkei")) categoria = "Tiraditos";
    else if (nombrePlato.toLowerCase().includes("causa")) categoria = "Causas";
    else if (nombrePlato.toLowerCase().includes("maki") || nombrePlato.toLowerCase().includes("nigiri")) categoria = "Nikkei";
    else if (nombreHoja.toLowerCase().includes("postre")) categoria = "Postres";
    
    // Limpiamos los textos para que quede solo el valor
    var area = textoArea.replace(/Area de cocina:|Area:/i, "").trim() || "No asignada";
    var tiempo = textoTiempo.replace(/Tiempo de preparacion:|Tiempo:/i, "").trim() || "00:00";

    var receta = {
      id: nombrePlato.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      name: nombrePlato,
      category: categoria,
      status: estado,
      area: area,
      time: tiempo,
      description: "", // La descripcion se inyecta desde descriptions.js
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200",  
      ingredients: [],
      procedure: []
    };
    
    var datosColA = hoja.getRange("A1:A50").getValues();
    var filaIngredientes = -1;
    var filaProcedimiento = -1;
    
    for (var f = 0; f < datosColA.length; f++) {
      if (datosColA[f][0].toString().trim() === "Ingredientes") filaIngredientes = f + 1; 
      if (datosColA[f][0].toString().trim() === "Procedimiento") filaProcedimiento = f + 1;
    }
    
    if (filaIngredientes !== -1) {
      var datosIng = hoja.getRange(filaIngredientes + 1, 1, 30, 4).getValues(); 
      for (var j = 0; j < datosIng.length; j++) {
        var ingName = datosIng[j][0]; 
        var umg = datosIng[j][1]; // Columna B (Índice 1)
        var qty = datosIng[j][2]; // Columna C (Índice 2)
        
        if (ingName === "" || ingName === "Procedimiento") break; 
        
        var qtyParsed = parseFloat(qty.toString().replace(',', '.')) || 0;
        
        receta.ingredients.push({
          name: ingName.toString().trim(),
          umg: umg ? umg.toString().trim() : "g",
          qty: qtyParsed
        });
      }
    }
    
    if (filaProcedimiento !== -1) {
      var datosProc = hoja.getRange(filaProcedimiento + 1, 1, 20, 1).getValues();
      for (var k = 0; k < datosProc.length; k++) {
        var paso = datosProc[k][0];
        if (paso !== "") {
          receta.procedure.push(paso.toString().trim());
        }
      }
    }
    
    recetas.push(receta);
  }
  
  var jsonString = "// data.js\nconst recipeData = " + JSON.stringify(recetas, null, 4) + ";\n\n// Subrecetas (Ejemplo)\nconst subRecipeData = [];";
  
  var htmlOutput = HtmlService.createHtmlOutput('<textarea style="width:100%;height:95%;font-family:monospace;padding:10px;">' + jsonString + '</textarea>')
      .setWidth(800)
      .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Copia tu código JSON aquí (Presiona Ctrl+A y luego Ctrl+C)');
}
```

4. Pégalo, guarda y dale a Ejecutar.
5. Pega el resultado final en `data.js`.
