
var express = require('express');
var app = express();

require('./postRoutes')(app);
/* Required Route Files */

require('./actionatadistance').configure();

module.exports = app;
