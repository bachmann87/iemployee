// Dependencies
var express = require('express');
var upload = require('express-fileupload');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var chalk = require('chalk');
var logSymbols = require('log-symbols');
const {check, validationResult} = require('express-validator/check');
const textract = require('textract');

// Core Modules
var fs = require('fs');
var path = require('path');
var util = require('util');

// Globals
var user = {};
var count;

// Set Router
var router = express.Router();

// Set application/x-www-form-urlencoded Parser
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});


const session = require('express-session');


// Data models
let Vacancie = require('../models/vacancies');
let User = require('../models/users');


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
  let tags = str.replace(/\s/g,'').replace(/(,)$/g,'').split(',');

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
  let objId = request.params.id;

  // Get Data from DB
  Vacancie.findOne({_id: objId}, function(err, vacancies) {
    if(err) {
      throw err;
    } else {
      // Render View
      response.render('apply', {
        title: 'iEmployee - Recruitment Center - Apply for a job',
        job: objId,
        success: request.session.success,
        errors: request.session.errors,
        vacancies: vacancies 
      });
    }
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

      // Get all users
      User.find({})
        .populate('origins', 'title', 'Vacancie')
        .then((users) => {
            // Count document collection
            User.find({}).count(function(err, count) {
              // Check if applicants are available
              if(count === 0) {
                // Render Page
                res.render('dashboard', {
                  layout: false,
                  title: 'iEmployee - Dashboard',
                  vacancies: vacancies,
                  users: users,
                  nousers: true
                });
              } else {
              // Render Page
              res.render('dashboard', {
                layout: false,
                title: 'iEmployee - Dashboard',
                vacancies: vacancies,
                users: users
                });
              }
            });
        })
        .catch((err) => console.log(err));
    }
  });

});

router.post('/add', urlencodedParser, [
  check('title', 'Bitte geben Sie der Vakanz einen Titel.').not().isEmpty().isString(),
  check('description', 'Bitte geben Sie eine Beschreibung an.').isString(),
  check('fte', 'Ungültiger Beschäftigungsgrad. Zahl zwischen 0.00 und 1.00').not().isEmpty().isNumeric(),
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
      let tags = str.replace(/\s|(,)$/g,'').split(',');

      // Prepare Data for MongoDB
      let vacancie = new Vacancie();
      vacancie._id = new mongoose.Types.ObjectId();
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

module.exports = router;