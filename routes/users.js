var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
/* GET users listing. */
router.get('/', function(req, res,next) {

	
	res.render('index',{
  	userInfo1: req.userInfo1
  });
  
});

module.exports = router;
