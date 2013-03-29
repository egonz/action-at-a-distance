
var express = require('express');
var app = express();

require('./actionatadistance').configure();

module.exports = app;
