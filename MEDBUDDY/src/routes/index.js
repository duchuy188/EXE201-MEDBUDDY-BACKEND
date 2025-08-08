var express = require('express');
var router = express.Router();

const usersRouter = require('./users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Welcome to MEDBUDDY API!');
});

// User routes
router.use('/users', usersRouter);

module.exports = router;
