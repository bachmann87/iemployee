# API Reference Documentation
Das Produkt

### Objekte
```javascript
class User = {
    name: String,
    prename: String,
    email: String,
    docs: Object{},
    paths: Array[],
    origins: Array[]    
}
```
### Methoden
Die Funktion ```` data_extract() ```` zerlegt ein unstrukturiertes Dokument des Formats *.docx oder *.pdf. Weiterführend erstellt die Funktion eine *.txt-Datei und strukturiert den Dokumentnamen.

##### Parameter
erw
| Eigenschaft | Wert | Optional | Beispiel | 
| ----------- | ----------- | ----------- | ----------- |
| User | Object | false | data_extract(user) |
| Output | String | true | data_extract(user, '.txt') |

##### Syntax
Folgend der Aufbau der Funktion.
```javascript
function data_extract(user) {
  for (let i = 0; i < user.paths.length; i++) {
    // Extract CV
    textract.fromFileWithPath(user.paths[i], function (error, text) {
      // Create Path + Filename
      let filename = user.name + '_' + user.prename + '_' + [i] + '.txt';
      let filepath = path.join(__dirname, '/../uploads/' + user.origins + '/parsed/', filename);
      // Create file; Move to uploads/parsed/ dir 
      fs.writeFile(filepath, text, function (err) {
        if (err) throw err;
      });
    });
  }
}
```
