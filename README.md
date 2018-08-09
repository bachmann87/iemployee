# Lehrprojekt Dokumentation
Das Lehrprojekt ist eine Node.js Applikation, wobei diverse NLP-Verfahren implementiert wurden. Das Ziel des Lehrprojekts war eine «eRecruiting»-Lösung (Prototyp) zu programmieren. Folgende Frameworks und Technologien wurden für das Lehrprojekt verwendet:

- **Express** (Bibliothek für Node.js Core Modul HTTP)
- **Express-Fileupload** (Express Extension für die Datenübertragung)
- **Express-Session** (Express Extension für das Session Objekt)
- **Express-Validator** (Express Extension für die Validierung von Formularen)
- **Express-Handlebars** (Express Extension für das Verwenden von Handlebars)
- **Body-Parser** (Express Extension für das Auslesen von Formularübermittlungen) 
- **MongoDB Atlas** (NoSQL-Datenbank)
- **Mongoose** (Datenbank Framework für die Arbeit mit MongoDB)
- **HBS** (Handblebars Template Engine Machine)
- **Bootstrap 4.0.0** (CSS-Framework)
- **Natural** (Node.js NLP Bibliothek)
- **StanfordNLP** (Entity Recognition via Algorithmia)
- **Textract** (DOCX- und PDF-Parser)
- **Debug** (Debugging Utility)
- **Nodemon** (Dateiüberwachung für die Entwicklung der Applikatio)n
- **Chalk** (CSS Utility für die Konsole)
- **Python-Shell** (Python 3.6)

Weiterführend wurden diverse Kernmodule von Node.js verwendet. Diese werden nicht via ``npm install` installiert. Diese sind folgende:

- **fs** (Modul für das Arbeiten mit dem Filesystem des Benutzers resp. Server)
- **util** (Konsolen Utility)
- **path** (Modul für das Arbeiten mit Dateien und Pfaden)


# Installation
Eine kurze Anleitung wie man am besten die Applikation lokal installiert und testet:

1. Github Repository ``iemployee`` klonen
2. Alle Abhängigkeiten installieren mit: ``npm install``
3. Applikation starten mit: ``npm start`` oder mit ``node .\bin\server``
4. Optional kann man einen Port-Flag angeben: ``node .\bin\server --port 8080`` Der Port ist frei wählbar - Standardport = 3000
5. In der Konsole erscheint ``NodeApp started``, ``MongoDB started`` und ``Python started``
6. Applikation via ``localhost:port/`` aufrufen


> Siehe Kapitel «Deployment», falls die Applikation lokal nicht funktionieren sollte.

# NLP Funktionen
> Nachfolgend alle benutzerdefinierten NLP-Funktionen, welche ich im Rahmen des Lehrprojekts programmiert habe. Nachfolgend alle NLP-Funktionen:

Die Funktion **data_extract()** zerlegt ein unstrukturiertes Dokument des Formats *.docx oder *.pdf. Weiterführend erstellt die Funktion eine *.txt-Datei und strukturiert den Dokumentnamen.

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

Die Funktion **get_corpus()** extrahiert den Textkörper aus einem Anschreiben.
```javascript
function get_corpus(string) {
    
    const regex = /(Dear.*)\sYours.*sincerely.*$/gm;
    var str = string;
    var m;
    var res = [];

    while ((m = regex.exec(str)) !== null) {
        // Avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach((match, groupIndex) => {
            res.push(`${match}`);
        });
      return res;
    }
}
```

Die Funktion **_get_tfidf_score()** berechnet den Score des TF-IDF Vektors
```javascript
/**
 * 
 * @param {object} tfidf
 * @return {float} 
 */
function _get_tfidf_score(tfidf) {
    let values = Object.values(tfidf);
    let length = values.length;
    var max = values.reduce((a, b) => { return Math.max(a, b) });
    return max/length*100;
}
```

Die Funktion **_get_digital_trie** ist eine effiziente Präfix-basierende Suchfunktion.
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

Die Funktion **_summary()** fasst das Anschreiben zusammen, basierend auf Pattern Recognition.
```javascript
/**
 * 
 * @param {string} tag 
 * @param {array} corpus 
 * @return array[objs] => Object accessible via input property 
 */
function _summary(tag, corpus) {
    // Create RegEx Pattern
    let patt = new RegExp(".*"+tag+".*$", "gi");
    // Iterate through corpus array
    for(let i=0;i<corpus.length;i++) {
        // Execute Search
        var res = patt.exec(corpus[i]);
        // if not null
        if(res !== null) {
            summaryResult.push(res);
        }
    }
    return summaryResult;
}
```

Die Funktion **tokenize()** segmentiert den Textkorpus nach pro Satzzeichen oder Wort.
```javascript
let corpus = get_corpus(users.nlp.input.ml);
let cleanText = sentence.tokenize(corpus[1]);
let tokens = words.tokenize(corpus[1]);
```


Die Funktion **recursiveIter()** iteriert rekursiv durch das Resultat der StanfordNLP Entity Recognition Pipeline.
```javascript
/**
 * 
 * @param {object} obj 
 * @param {string} entity
 * @return {array}  
 */
function recursiveIter(obj, entity) {
    for (i in obj) {
        if (typeof obj[i] == "object") {
            recursiveIter(obj[i], entity)
        } else if(obj[i] == entity) {
            entityResult.push(obj[0].toString());
        }
    } 
    return entityResult;
}
```

# Funktionen Dateisystem
> Nebst den Hauptfunktionen für die NLP-Aufgaben, gibt es auch weitere Funktionen, die für das Lehrprojekt wichtig waren. Nachfolgend alle Funktionen mit dem Dateisystem:

Die Funktion **getDate()** generiert ein String mit dem Datum für die Namenskonvention nach der Datenübertragung/Datenextrahierung.
```javascript
function getDate() {
  // Get Partials
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear() + '';
  // Append Zero if needed
  if (dd < 10) {
    dd = '0' + dd
  }
  // Append Zero if needed
  if (mm < 10) {
    mm = '0' + mm
  }
  // Build Date String
  today = mm + dd + yyyy.substr(2, 2);
  return today;
}
```

Die Funktion **createDirectories()** erstellt ein entsprechendes Verzeichnis auf dem Server, sobald eine Bewerbung übermittelt wird.
```javascript
function createDirectories(dir) {
  if (fs.existsSync(dir)) {
    return;
  } else {
    // Parent + Subdirectories
    fs.mkdirSync(dir);
    fs.mkdirSync(path.join(dir, 'original'));
    fs.mkdirSync(path.join(dir, 'parsed'));
  }
};
```

Die Funktion **grab()** ermöglicht ein Argument Flag für den gewünschten Port.
```javascript
/**
 * Argument Variable grab
 */
function grab(flag) {
  let index = process.argv.indexOf(flag);
  return (index === -1) ? null : process.argv[index + 1];
}
```
# Python-Shell
Die Applikation verfügt über eine Python Shell. Nachfolgend die Funktion in Node, welche das Python Skript anspricht.

```javascript
function _python_nltk(req, res, user) {

    // Get Raw Text Data from User Object
    var ml = user.nlp.input.ml;
    var cv = user.nlp.input.cv;
    var rf = user.nlp.input.rf;

    // Create Options Object for Python
    var options = {
      args: [
          ml,
          cv,
          rf
      ]
    }
    
    // Execute Python Script
    PythonShell.run('python/natural.py', options, function(err,data) {
      if(err) res.send(err);
        res.send(data[0].toString('utf8'));
    });

}
```
Das Python-Skript nutzt NLTK als Natural Language Processing Bibliothek und ermöglicht eine Segementierung. Nachfolgend das Python Skript: 

```python
#!/usr/bin/env python
import sys
import re
from nltk import word_tokenize

# Get raw text data
ml = sys.argv[1]
cv = sys.argv[2]
rf = sys.argv[3]

# Output
print(word_tokenize(ml))
```
> Falls die Applikation lokal getestet wird, dann muss Python 3.6 auf dem System installiert sein. Zusätzlich muss die Umgebungsvariable angepasst werden.


# Routing
Aufgrund der Applikationsgrösse wurde ein URL-Routing-Verfahren angewendet. Der Vorteil eines Routers ist die Separation der verschiedenen Serverdateien. Dies hat zufolge, dass der gesamte Source Code der Applikation übersichtlicher gestaltet werden kann. Der Dateipfad für die Scripts ist ``/routes``. Nachfolgend alle verwendeten Server-Router: 

- **routes/index.js** Frontend Routing für die Landingpage
- **routes/jobs.js** Frontend Routing für die Ansicht der Arbeitnehmer
- **routes/nlp.js** Backend Routing für die Ansicht der Arbeitgeber
- **routes/users.js** Middleware für die Formularübermittlung

> Für weitere Informationen betreffend URL-Routing siehe [Dokumentation](https://expressjs.com/en/guide/routing.html) von Express.

# Deployment
Die Applikation wurde mit **Heroku Dyno** veröffentlicht. Heroku ist eine Plattform für Cloud-Applikationen. Die Veröffentlichung erfolgt dabei via GitHub oder Heroku CLI. Da es den Rahmen für diese Arbeit sprengen würde, wurde auf eine **Staging Pipeline** verzichtet, d.h. das Deployment erfolgt direkt mit dem Master Branch. Die Applikation ist mit SSL-Zertifizierung aufrufbar unter: [iEmployee](https://iemployee.herokuapps.com)

> Eine benutzerdefinierte Domäne [http://iemployee.ch](http://iemployee.ch) existiert ebenfalls, jedoch ohne SSL-Zertifikat.

# Debugging
Das Debugging der veröffentlichten Version auf Heroku funktioniert wie folgt:

1. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installieren.
2. Nach erfolgreicher Installation Befehlskonsole (cmd) öffnen und ``heroku login`` eingeben.
3. Benutzername: ``info@ajaybachmann.ch`` und Passwort: ``q2w3p0o9ZZ!`` eingeben.
4. Debug-Log aufrufen mit: ``heroku logs --tail -a iemployee``

# License
Copyright (c) 2018 Allan Bachmann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.