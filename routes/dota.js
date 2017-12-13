var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/dota', function(req, res, next) {
  res.render('game', { Game: 'Dota' });
});

module.exports = router;
