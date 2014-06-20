var tum = require('./tum-tum');
var six = require('six');

var proc = new tum.Preprocessor("tests/main.js");
var code = proc.preprocess("tests/main.js");
eval( code );