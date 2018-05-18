var express = require('express');
var router = express.Router();

var arr = [
  {name: 'Allan Bachmann', data: {status: 'ok', msg: 'pass'}}, 
  {name: 'Peter Büchel', data: {status: 'ok', msg: 'failed'}}
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'iEmployee' 
  });
});

// router.get('/demo', function(req, res, next) {
//   res.render('demo', {
//     title: 'iEmployee - Recruitment Center',
//     user: 'Allan Bachmann' 
//   });
// });

router.get('/api', function(req, res, next) {

  // Get Collection MongoDB


  // Send Raw
  res.json(arr);

  // Render View
  // res.render('api', {
  //   layout: false,
  //   title: 'iEmployee NLP - API',
  //   data: arr
  // });

});



module.exports = router;
