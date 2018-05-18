// Dependencies
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var upload = require('express-fileupload');
var bodyParser = require('body-parser');
var chalk = require('chalk');
var mongoose = require('mongoose');

// Core Node Modules
var fs = require('fs');
var path = require('path');
var util = require('util');

// Get App Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var jobsRouter = require('./routes/jobs');

// Init Express
var app = express();

// Engine Setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/'
}));

// Set Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Set Middleware
app.use(upload());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set Routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/jobs', jobsRouter);

// Catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Error Handler
app.use(function(err, req, res, next) {

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