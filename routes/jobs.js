// Dependencies
var express = require('express');
var upload = require('express-fileupload');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var chalk = require('chalk');
var logSymbols = require('log-symbols');

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
 * View: Application Form
 * Scope: Applicant
 */
router.get('/apply/:id', function(request, response, next) {

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
      // throw err;
    } else {
      // Render Page
      res.render('dashboard', {
        layout: false,
        title: 'iEmployee - Dashboard',
        vacancies: vacancies
      });
    }
  });

});

router.post('/add', urlencodedParser, function(request, response, next) {

  // Convert Tags String to Array
  let str = request.body.tags;
  let tags = str.match(/\w+(?:\w+.\w+)|\w+/g);

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
      return
    } else {
      response.redirect('/jobs/dashboard');
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