// Dependencies
var express = require('express');
var upload = require('express-fileupload');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var chalk = require('chalk');
var logSymbols = require('log-symbols');
const {check, validationResult} = require('express-validator/check');

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

// -------------------
// Database
// -------------------

mongoose.connect('mongodb://localhost/iemployee');
let db = mongoose.connection;

// Check connection
db.once('open', function() {
  util.log(chalk.cyan.bold(`[MongoDB started] - Status: [${logSymbols.success}]`));
});

// Check for DB-Errors
db.on('error', function(err) {
  util.log(chalk.red.bold(err));
});

// Data models
let Vacancie = require('../models/vacancies');


// -------------------
// Routers
// -------------------

/**
 * Type: GET
 * View: All Jobs Listing
 * Scope: Applicant
 */
router.get('/', function(req, res, next) {

  // Query Data
  Vacancie.find({}, function(err, vacancies) {
    // Errorhandler
    if (err) {
      util.log(chalk.red.bold(err));
      // throw err;
    } else {
      // Render Page
      res.render('vacancies_all', {
        title: 'iEmployee - Vacancies',
        vacancies: vacancies
      });
    }
  });

});


/**
 * Type: GET
 * View: Single Job Listing
 * Scope: Applicant
 */
router.get('/view/:id', function(request, response, next) {
  // Store Id
  let ObjId = request.params.id;
  // Query Data
  Vacancie.findOne({_id: ObjId}, function(err, vacancies) {
    // Check for Errors
    if (err) {
      util.log(chalk.green.bold(err));
      // throw err;
    } else {
        response.render('vacancies_single', {
          title: 'iEmployee - Single View',
          vacancies: vacancies
        });
      }
  });
});


/**
 * Type: GET
 * View: Single Job Listing
 * Scope: Employer
 */
router.get('/edit/:id', function(request, response) {
  // Store Id
  let ObjId = request.params.id;
  // Query Data
  Vacancie.findOne({_id: ObjId}, function(err, vacancies) {
    // Check for Errors
    if (err) {
      util.log(chalk.green.bold(err));
      // throw err;
    } else {
        response.render('vacancies_edit', {
          title: 'iEmployee - Edit View',
          vacancies: vacancies
        });
      }
  });
});


/**
 * Type: POST
 * View: Single Job Edit
 * Scope: Employer
 */
router.post('/edit/:id', function(request, response) {
  
  // Store Id
  let ObjId = request.params.id;

  // Convert Tags String to Array
  let str = request.body.tags;
  str.trim();
  let tags = str.split(',');

  // Create Doc for MongoDB
  let vacancie = {};
  
  // Add Data to Doc
  vacancie.title = request.body.title;
  vacancie.fte = request.body.fte;
  vacancie.body = request.body.description;
  vacancie.location = request.body.location;
  vacancie.tags = tags;

  // Query
  let query = {_id: ObjId};

  // Update Document in MongoDB
  Vacancie.update(query, vacancie, function(err) {
    // Check if error
    if(err) {
      // Errorhandler
      console.log(err);
      response.sendStatus(403);
    } else {
        // Redirect to Edit form
        response.redirect('/jobs/dashboard/');
      }
  });

});

/**
 * Type: GET
 * View: Application Form
 * Scope: Applicant
 */
router.get('/apply/:id', function(request, response) {

  // Store Id
  let jobId = request.params.id;

  // Render View
  response.render('apply', {
    title: 'iEmployee - Recruitment Center - Apply for a job',
    job: jobId
  });

});


/**
 * Type: GET
 * View: Dashboard
 * Scope: Employee
 */
router.get('/dashboard', function(req, res, next) {

  // Get Data from MongoDB
  Vacancie.find({}, function(err, vacancies) {
    // Errorhandler
    if (err) {
      util.log(chalk.blue.bold(err));
    } else {
      // Cast Obj
      let keys = Object.keys(vacancies);
      let datasetJobs = [];
      let dataset1 = [];
      let dataset2 = [];
      // Iterate to Doc
      for(let i=0;i<keys.length;i++) {
        dataset1.push(Math.ceil(Math.random()*100));
        dataset2.push(Math.ceil((Math.random()*20)*-1));
        datasetJobs.push(vacancies[i].title);
      }
      // Render Page
      res.render('dashboard', {
        layout: false,
        title: 'iEmployee - Dashboard',
        vacancies: vacancies,
        jobs: datasetJobs,
        index_1: dataset1,
        index_2: dataset2
      });
    }
  });

});

router.post('/add', urlencodedParser, [
  check('title', 'Bitte geben Sie der Vakanz einen Titel.').not().isEmpty().isString(),
  check('description', 'Bitte geben Sie eine Beschreibung an.').isString(),
  check('fte', 'Ungültiger Beschäftigungsgrad. Zahl zwischen 0.00 und 1.00').not().isEmpty().isString(),
  check('location', 'Bitte wählen Sie eine gültige Niederlassung.').not().isEmpty().isString(),
  check('tags', 'Bitte geben Sie mind. ein Stichwort an.').not().isEmpty().isString()
], (request, response, next) => {

  // Init Errorhandler
  var errors = validationResult(request);

  // Check for Errors
  if (!errors.isEmpty()) {

    // Render Dashboard with error messages
    response.render('dashboard', {
      layout: false,
      title: 'iEmployee - Dashboard',
      condition: true,   
      errors: errors.array()
    });

    // return response.status(422).json({ errors: errors.array()});
  } else {

      // Convert Tags String to Array
      let str = request.body.tags;
      let tags = str.split(',');

      // Prepare Data for MongoDB
      let vacancie = new Vacancie();
      vacancie.title = request.body.title;
      vacancie.fte = request.body.fte;
      vacancie.body = request.body.description;
      vacancie.location = request.body.location;
      vacancie.tags = tags;

      // Save Document to MongoDB
      vacancie.save(function(err) {
        if (err) {
          console.log(err);
          return;
        } else {
          response.redirect('/jobs/dashboard');
        }
      });
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
    Vacancie.remove(query, function(err) {
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

router.post('/submit', urlencodedParser, function(request, response, next) {

  // Check if File is uploaded
  if (request.files) {

    // Store data
    let name = request.body.name;
    let prename = request.body.prename;
    let email = request.body.email;
    let file = request.files.cv;
    let filename = request.files.cv.name;
    let uploadPath = path.join(__dirname, '/../uploads', filename);

    // Move the file to the upload directory
    file.mv(uploadPath, function(err) {
      if (err)
        return response.status(500).send(err);
    });

    // Data Extract
    // dataExtract(uploadPath, response);

    // Create User Object
    var user = {
      name: name,
      prename: prename,
      email: email,
      cv: filename,
      path: uploadPath
    }

    // Save Form Data to Database

    // Client Redirect
    response.render('success', {
      layout: 'forms.hbs',
      title: 'iEmployee - Recruitment Center',
      data: user
    });
  }
});



function dataExtract(uploadPath, response) {
  // Data Extract from file
  textract.fromFileWithPath(uploadPath, function(error, text) {
    fs.writeFile(path.join(__dirname, '/../uploads', 'pdfextract.txt'), text, function(err) {
      if (err) throw err;
      // Output message
      util.log('Saved!');
    });
  });
}



module.exports = router;