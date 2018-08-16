var express = require('express'),
    router = express.Router(),
    jsonResponse = require('../models/jsonResponse');

/* GET default index route. */
router.get('/', function(req, res, next) {
  var obj = new jsonResponse('ok', 200, {data: 'flight api default route'});
  res.json(obj).status(obj.status);
});

module.exports = router;
