// Server Modules
var express = require('express');
var upload = require('express-fileupload');
var bodyParser = require('body-parser');
const session = require('express-session');
var mongoose = require('mongoose');
var chalk = require('chalk');
var logSymbols = require('log-symbols');
const {
  check,
  validationResult
} = require('express-validator/check');
const textract = require('textract');

// Core Modules
var fs = require('fs');
var path = require('path');
var util = require('util');

// Set Router
var router = express.Router();

// Set application/x-www-form-urlencoded Parser
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

//--------------
// MongoDB
//--------------
let User = require('../models/users');


//--------------
// Routers
//--------------

/**
 * Type: POST
 * View: Application-Form
 * Scope: Applicant
 */
router.post('/submit', urlencodedParser, function (request, response, next) {

  // Form validation
  request.check('name', 'Bitte geben Sie einen Namen an').not().isEmpty();
  request.check('prename', 'Bitte geben Sie einen Vornamen an').not().isEmpty();
  request.check('email', 'Bitte geben Sie gültige E-Mailaddresse an').isEmail();

  // Assign Valdidation Errors
  var errors = request.validationErrors();

  if (errors) {

    // Set Session Errors
    request.session.errors = errors;
    // Set Session Success
    request.session.success = false;
    // Redirect
    response.redirect('/jobs/apply/' + request.body.objid);

  } else {

    // Check if File is uploaded
    if (request.files) {

      // Store data
      let name = request.body.name;
      let prename = request.body.prename;
      let email = request.body.email;

      let cv = request.files.cv;
      let ml = request.files.ml;
      let rf = request.files.rf;

      let mlFilename = request.files.ml.name;
      let cvFilename = request.files.cv.name;
      let rfFilename = request.files.rf.name;

      let refs = [];
      refs.push(rfFilename);

      // Store Objids as Array
      let objids = [];
      let target = [];
      let index = objids.push(request.body.objid);
      let vcy = target.push(request.body.vacancy);

      // CV-Filepath; ML-Filepath
      let cvPath = path.join(__dirname, '/../uploads/' + target[vcy - 1] + '/original', cvFilename);
      let mlPath = path.join(__dirname, '/../uploads/' + target[vcy - 1] + '/original', mlFilename);
      let rfPath = path.join(__dirname, '/../uploads/' + target[vcy - 1] + '/original', rfFilename);

      // Check Target Directory
      let dir = path.join(__dirname, '/../uploads/', target[vcy - 1]);
      createDirectories(dir);

      // Move CV to uploads/original/
      cv.mv(cvPath, function (err) {
        if (err) {
          throw err;
        }
      });

      // Move ML to uploads/original/
      ml.mv(mlPath, function (err) {
        if (err) {
          throw err;
        }
      });

      // Move RF to uploads/original/
      rf.mv(rfPath, function (err) {
        if (err) {
          throw err;
        }
      });

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
        origins: objids,
        nlp: {
          input: {}
        },
        output: {
          tfidf: { 
            "media": 1.612,
            "data": 1.321
          },
          summary: [],
          trie: {
            result: [],
            score: 0
          },
          status: 'times',
          score: 0
        }         
      }

      // Extract Data from .docx, .pdf Files and generate new file
      data_extract(user, target[vcy-1]);

      // Wait until 
      setTimeout(function() {
        // Save new Applicant
        let newUser = new User(user);
        newUser.save(function(err) {
          if(err) {
            console.log(err);
              return;
          } else {
              // Set Session Success
              request.session.success = true;
              // Render
              response.render('success', {
                layout: 'forms.hbs',
                title: 'iEmployee - Application Process',
                success: request.session.success,
                errors: request.session.errors,
                data: user
              });
              // Empty Session Errors
              request.session.errors = null;
          }
        });  
      }, 4000);

    }
    // Save Text to User-Object
    // user.text = fs.readFileSync(path.join(__dirname, '/../uploads', user.name+'_'+user.prename+'.txt'), 'UTF-8');
  }

});

/**
 * Type: DELETE 
 * Data: Vacancy
 * View: Dashboard
 * Scope: Employer
 */ 
router.delete('/delete/:id', function(request, response) {
  // Create Query Object
  let query = {_id: request.params.id}
    // Remove from MongoDB
    User.remove(query, function(err) {
      if(err) {
        console.log(err);
      } else {
        response.render('dashboard', {
          layout: false,
          title: 'iEmployee - Dashboard'
        });
      }
    });
 });

//--------------
// Functions
//--------------

function data_extract(user, vacancy, format) {
  // FileExtension
  let fileExtension = format || '.txt';
  let appendix = Object.keys(user.docs);
  // Iterate through all files
  for(let i = 0; i < user.paths.length; i++) {
    // Extract Data
    textract.fromFileWithPath(user.paths[i], (error, text) => {
      // Create Path + Filename
      let filename = user.name+ '_' +user.prename+ '_' +appendix[i]+ fileExtension;
      let filepath = path.join(__dirname, '/../uploads/' + vacancy + '/parsed/', filename);
      // Store to User Object
      user.nlp.input[appendix[i]] = text;
      // Create files
      fs.writeFile(filepath, text, (err) => {
        if(err) throw err; 
      });
    });
  }
  return user;
}

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

module.exports = router;