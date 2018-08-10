// Server Modules
var express = require('express');
var bodyParser = require('body-parser');
const session = require('express-session');
var mongoose = require('mongoose');
const PythonShell = require('python-shell');

// Core Modules
var fs = require('fs');
var path = require('path');
var util = require('util');

// NLP Modules
const natural = require('natural');
const ml = require('ml-sentiment')();
var algorithmia = require("algorithmia");
var client = algorithmia("simYi/0ziOKGNge4PedKMON0lT81");
// var SummaryTool = require('node-summary');

// NLP Global Inits
var sentence = new natural.SentenceTokenizer();
var words = new natural.WordTokenizer();
var Trie = natural.Trie;
var trie = new Trie(false);
var summary = new Trie(false);
var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();

// Global Variables 
var tfidfResult = {};
var entityResult = [];
var entityResult_loc = [];
var summaryResult = [];
var bio = [];
var nlp = {};
var entResOrg;
var entResLoc;

//--------------
// Set Router
//--------------
var router = express.Router();

// Set application/x-www-form-urlencoded Parser
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

//--------------
// MongoDB
//--------------
let User = require('../models/users');
let Vacancie = require('../models/vacancies');


//--------------
// Routers
//--------------

router.get('/', (request, response) => {
    // Get raw data
    User.find({})
        .then((users) => {response.json({applicants: users})})
        .catch((err) => {response.json({error: "Something went wrong"})});
});


router.get('/analyze/:id', (request, response) => {

    // Store Parameter
    var _id = request.params.id;

    // Get Data from DB
    User.findOne({_id: _id})
        .populate('origins', 'tags title', 'Vacancie')
        .then((users) => {

            let tags = users.origins[0].tags;
            let title = users.origins[0].title;
            let corpus = get_corpus(users.nlp.input.ml);
            let cleanText = sentence.tokenize(corpus[1]);
            let tokens = words.tokenize(corpus[1]);

            // ----------------------------
            // GET - Digital Trie per Token
            // ----------------------------

            let result = _get_digital_trie(tags, tokens);
            let len = corpus[1].length;
            let ratio = cleanText.length / len * 100;
            // console.log(tokens.length/cleanText.length);

            // GET - Tf-idf
            // tfidf.addDocument(corpus[1]);
            // tfidf.listTerms(0).forEach(function(item) {
            //     tfidfResult[item.term] = item.tfidf;
            // });
            // let tfidfScore = _get_tfidf_score(tfidfResult);
            // console.log(tfidfScore);

            // ----------------------------
            // GET - TF-IDF
            // ----------------------------

            // Get Length of Document Collection
            let keys = Object.keys(users.nlp.input)
            // Add all Documents
            tfidf.addDocument(corpus[1]);
            tfidf.addDocument(users.nlp.input.cv);
            tfidf.addDocument(users.nlp.input.rf);
            // TF-IDF Vectorize for entire document collection
            for(let i=0;i<keys.length;i++) {
                tfidf.listTerms(i).forEach(function(item) {
                    tfidfResult[item.term] = item.tfidf;
                });
            }
            // _tfidf_vec(corpus[1], users);

            // GET - Sentiment
            let sentiment = {};
            for(let i=0;i<tokens.length;i++) {
                sentiment[tokens[i]] = ml.classify(tokens[i]);
            }
            
            // ---------------------------------
            // GET - Stanford Entity Recognition
            // ---------------------------------

            algorithmia.client("simYi/0ziOKGNge4PedKMON0lT81")
                .algo("StanfordNLP/Java2NER/0.1.1")
                .pipe(corpus[1])
                .then(function(data) {
                    var keys = Object.keys(data.result);
                    entResOrg = recursiveIter(data.result, 'ORGANIZATION');
                    entResLoc = recursiveIter(data.result, 'LOCATION');
                });

                // Wait until Stanford NLP is finished, unfortunately not chainable with then syntax
                setTimeout(function() {
            
                    // ---------------------------------
                    // GET - Summarizer
                    // ---------------------------------

                    for(let i=0;i<tags.length;i++) {
                        bio = _summary(tags[i], cleanText);
                    }

                    // -------------
                    // Update MongoDB
                    // -------------

                    // Init Object
                    let output = {};

                    // Set Values
                    output.tfidf = tfidfResult;
                    output.summary = bio;
                    output.trie = {
                        result: result[0],
                        score: result[1]
                    };
                    output.status = 'check';
                    output.score = 0;
                    output.entities = {
                        result: entResOrg
                    }

                    // Append to User-Object
                    users.output = output;

                    // Update Document in MongoDB
                    // Return
                    return users.save(function(err) {
                        if(err) {
                            console.log(err);
                        } else {
                            response.redirect('/jobs/dashboard/');
                        }
                    });
                // Wait 4 seconds    
                }, 4000);

        })
        .catch((err) => console.log(err));
     
});

router.get('/api/:id', function (request, response) {
    // Store Id
    let objId = request.params.id;    
    // Send User-Object to API
    User.findOne({_id: objId})
        .populate('origins', 'title', 'Vacancie')
        .then((users) => response.json(users))
        .catch((err) => console.log(err));
}); 

router.get('/view/:id', function (request, response) {
    // Store Id
    let objId = request.params.id;    
    // Send View to Render Engine
    User.findOne({_id: objId})
        .populate('origins', 'title', 'Vacancie')
        .then((users) => {
            // Render View
            response.render('nlp_single', {
                layout: false,
                user: users
            });
        })
        .catch((err) => console.log(err));
}); 

router.get('/python/:id', function(req, res) {


    // Store Id
    let objId = req.params.id;

    // Get Data from MongoDB
    User.findOne({_id: objId})
        .populate('origins', 'title', 'Vacancie')
        .then((user) => {
            // Execute Python
            _python_nltk(req, res, user);
        })
        .catch((err) => console.log(err))


});

//--------------
// Functions
//--------------

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

function _tfidf_vec(cleanText, users) {
    // Get Length of Document Collection
    let keys = Object.keys(users.nlp.input)
    // Add all Documents
    tfidf.addDocument(cleanText);
    tfidf.addDocument(users.nlp.input.cv);
    tfidf.addDocument(users.nlp.input.rf);
    // TF-IDF Vectorize for entire document collection
    for(let i=0;i<keys.length;i++) {
        tfidf.listTerms(i).forEach(function(item) {
            tfidfResult[item.term] = item.tfidf;
        });
    }
}

/**
 * 
 * @param {array} tags 
 * @param {array} tokens
 * @return {array} [0] => Object with results; [1] => Score
 *   
 */
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
    let score = sum.toPrecision(6) / divider.toPrecision(6) * 100;
    // Return
    return [result, score];
}

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
            if(entity === 'ORGANIZATION') {
                entityResult.push(obj[0].toString());
            } else if (entity === 'LOCATION') {
                entityResult_loc.push(obj[0].toString());
            }
        }
    } 
    return [entityResult, entityResult_loc];
}

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
        // res.send(data[0].toString('utf8'));
        res.send(data.toString('utf8'));
    });

}

module.exports = router;