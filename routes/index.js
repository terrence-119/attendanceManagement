var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/** GET submit page. */
router.get('/submit', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/submit.html'));
});


module.exports = router;
