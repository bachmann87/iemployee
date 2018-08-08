![alt text][logo]

[logo]: https://github.com/bachmann87/iemployee/public/img/icon-192x192.png "iEmployee Brand"

# API Referenz Dokumentation
Das Lehrprodukt ist eine Node.js Applikation, wobei NLP-Verfahren implementiert wurden. Das Ziel des Lehrprojekts war eine «eRecruiting»-Lösung (Prototyp) zu programmieren. Folgende Frameworks und Technologien wurden für das Lehrprojekt verwendet:

- **Express** (Bibliothek für Node.js Core Modul HTTP)
- **Express-Fileupload** (Express Extension für die Datenübertragung)
- **Express-Session** (Express Extension für das Session Objekt)
- **Express-Validator** (Express Extension für die Validierung von Formularen)
-	**Express-Handlebars** (Express Extension für das Verwenden von Handlebars)
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
5. In der Konsole erscheint ``NodeApp started`` und ``MongoDB started``
6. Applikation via ``localhost:port/`` aufrufen


> Info: Siehe Kapitel «Deployment», falls die Applikation lokal nicht funktionieren sollte.

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



# Routing
Aufgrund der Applikationsgrösse wurde ein URL-Routing-Verfahren angewendet. Der Vorteil eines Routers ist die Separation der verschiedenen Serverdateien. Dies hat zufolge, dass der gesamte Source Code der Applikation übersichtlicher gestaltet werden kann. Der Dateipfad für die Scripts ist ``/routes``. Nachfolgend alle verwendeten Server-Router: 

- **routes/index.js** Frontend Routing für die Landingpage
- **routes/jobs.js** Frontend Routing für die Ansicht der Arbeitnehmer
- **routes/nlp.js** Backend Routing für die Ansicht der Arbeitgeber
- **routes/users.js** Middleware für die Formularübermittlung

> Für weitere Informationen betreffend URL-Routing siehe [Dokumentation](https://expressjs.com/en/guide/routing.html) von Express.


# Deployment
Die Applikation wurde mit **Heroku Dyno** veröffentlicht. Heroku ist eine Plattform für Cloud-Applikationen. Die Veröffentlichung erfolgt dabei via GitHub oder Heroku CLI. Da es den Rahmen für diese Arbeit sprengen würde, wurde auf eine **Staging Pipeline** verzichtet, d.h. das Deployment erfolgt direkt mit dem Master Branch. Die Applikation aufrufbar unter: [iEmployee](https://iemployee.herokuapps.com)

> Eine benutzerdefinierte Domäne [https://iemployee.ch](https://iemployee.ch) konnte aus technologischen Gründen nicht verwendet werden. Die Anpassung der ANAME- resp. CNAME-Targets konnten beim DNS-Provider «Hostpoint» nicht wie gewünscht eingestellt werden. Siehe [Dokumentation](https://devcenter.heroku.com/articles/custom-domains) von Heroku.



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