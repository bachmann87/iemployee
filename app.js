// -------------------
// Node Modules
// -------------------

// Server Dependencies
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const hbs = require('express-handlebars');
const upload = require('express-fileupload');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const flash = require('express-flash');
const session = require('express-session');
const {
  check,
  validationResult
} = require('express-validator/check');
const PythonShell = require('python-shell');

// NLP-Dependencies
const textract = require('textract');

// Dev-Dependencies
const chalk = require('chalk');
const mongoose = require('mongoose');
const logSymbols = require('log-symbols');

// Core Node Modules
const fs = require('fs');
const path = require('path');
const util = require('util');

// -------------------
// Database
// -------------------

// mongoose.connect('mongodb://localhost/iemployee');
// mongoose.connect('mongodb+srv://admin:'+process.env.MONGO_ATLAS_PW+'@htwchur-cvkuc.mongodb.net/test?retryWrites=true')
mongoose.connect('mongodb+srv://admin:htwchur1@htwchur-cvkuc.mongodb.net/test?retryWrites=false')
let db = mongoose.connection;

// Check connection
db.once('open', function() {
  util.log(chalk.cyan.bold(`[MongoDB started] - Status: [ok]`));
});

// Check for DB-Errors
db.on('error', function(err) {
  util.log(chalk.red.bold(err));
});

// -------------------
// Python Shell
// -------------------

var pyshell = new PythonShell('test/test.py');
pyshell.on('message', function(message) {
  util.log(chalk.green.bold(message));
});

// -------------------
// Routers
// -------------------

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var jobsRouter = require('./routes/jobs');
var nlpRouter = require('./routes/nlp');

// -------------------
// Express
// -------------------

// Init Express
var app = express();
var sessionStore = new session.MemoryStore;

// Engine Setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/'
}));

app.enable('view cache');

// Set Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view cache', false);

// Set Middlewares
app.use(upload());
app.use(logger('dev'));

// Body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser('secret'));

// Static Server
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  cookie: {
    maxAge: 60000
  },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}));

// Flash Messages
app.use(flash());
app.use(function (req, res, next) {
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

// Validation
app.use(validator());

// Set Routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/jobs', jobsRouter);
app.use('/nlp', nlpRouter);

// Catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Error Handler
app.use(function (err, req, res, next) {

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error', {
    layout: 'error.hbs'
  });

});

module.exports = app;