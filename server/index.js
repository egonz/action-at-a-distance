
var express = require('express');
var app = express();

var ActionAtADistance = require('./action-at-a-distance');

var actionAtADistance = new ActionAtADistance();
actionAtADistance.start();

actionAtADistance.on('save', function(data) {
	console.log('\nActionAtADistance Save Callback. Processing: ' + JSON.stringify(data) + '\n');
});

module.exports = app;
