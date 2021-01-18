var express = require('express');
var router = express.Router();

function start (req, res){
    console.log("Index page");
    res.render('index',{ });
};

router.get('/', start);

module.exports = router;