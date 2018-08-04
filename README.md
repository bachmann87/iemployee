# API Referenz Dokumentation
Das multimediale Lehrpojekt ist eine NLP-Applikation. Die Applikation wurde serverseitig mit Node.js programmiert. Die Prozidierung der NLP-Verfahren wurde mit Python programmiert. Python (Child-Prozess) interkommuniziert via Standardinput und Standardoutput mit Node (Hauptprozess). Für das Deployment der Applikation wurde Heroku Dyno verwendet.

# NLP-Libaries
- Natural
- Stanford NLP
- NLTK

# Objekte
Im folgenden Abschnitt werden alle Objekte, sowie deren Datenmodelle aufgelistet.


## Objekt: User  
Here's a sentence with a footnote.

| Objekteigenschaft | Wert              | Beispiel                   |
| ----------------- | ----------------- | -------------------------- |
| name              | String (required) | data_extract(user)         |
| prename           | String (required) | data_extract(user, '.txt') |
| email             | String (required) | data_extract(user, '.txt') |
| docs{}            | Objekt (required) | data_extract(user, '.txt') |
| paths[]           | Array (required)  | data_extract(user, '.txt') |
| origins[]         | Array (required)  | data_extract(user, '.txt') |

```javascript
// User Object
var user = {
  _id: new mongoose.Types.ObjectId(),
  name: name,
  prename: prename,
  email: email,
  docs: {
    cv: cvFilename,
    ml: mlFilename,
    rf: rfFilename
  },
  paths: [
    cvPath,
    mlPath,
    rfPath
  ],
  origins: Schema.Types.ObjectId,
  nlp: {
    input: {
      cv: 'Lebenslauf',
      ml: 'Motivationschreiben',
      rf: 'Arbeitszeugnis'
    },
    output: {
      tfidf: [{
        terms: []
      }],
      sentiment: [{
        cv: 0
      }],
      entities: [{
        organisation: []
      }],
      score: 0
    } 
  }
}
```

# Methoden
Im folgenden Abschnitt werden alle Methoden aufgelistet. Die Methoden sind für alle Router verfügbar.

## Methode: data_extract()
Die Funktion **data_extract()** zerlegt ein unstrukturiertes Dokument des Formats *.docx oder *.pdf. Weiterführend erstellt die Funktion eine *.txt-Datei und strukturiert den Dokumentnamen.

### Parameter
| Parameter     | Wert                               | Beispiel         |
| ------------- | ---------------------------------- | ---------------- |
| User          | Object (required)                  | class.User       |
| Output Format | String (optional, default: '.txt') | '.tsv'           |
| Vakanz        | String (required)                  | 'Mediendesigner' |

#### Syntax
Folgend der Aufbau der Funktion.

```javascript
function data_extract(user, output, vacancy) {
  // FileExtension
  let fileExtension = output || '.txt';
  let appendix = Object.keys(user.docs);
  // Iterate through all files
  for (let i = 0; i < user.paths.length; i++) {
    // Extract Data
    textract.fromFileWithPath(user.paths[i], function (error, text) {
      // Create Path + Filename
      let filename = user.name + '_' + user.prename + '_' + appendix[i] + fileExtension;
      let filepath = path.join(__dirname, '/../uploads/' + vacancy + '/parsed/', filename);
      // Create file; Move to uploads/parsed/ dir 
      fs.writeFile(filepath, text, function (err) {
        if (err) throw err;
      });
    });
  }
}
```
```javascript
function _get_digital_trie(tags, tokens) {
    // Init return obj
    let result = {};
    // Add Token to Trie
    trie.addStrings(tokens);
    // Make a basic digital trie
    for(let i = 0;i<tags.length;i++) {
        if(trie.contains(tags[i])) {
            result[tags[i]] = 1;
        } else {
            result[tags[i]] = 0;
        }
    }
    // Score calculation
    let values = Object.values(result);
    let sum = values.reduce(function(acc, val) { return acc + val; });
    let divider = tags.length;
    let score = sum.toPrecision(6) / divider.toPrecision(6);
    // Return
    return [result, score];
}
```