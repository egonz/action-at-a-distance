
var express = require('express');
var app = express();

var ActionAtADistance = require('./action-at-a-distance');
var actionAtADistance = new ActionAtADistance(app, undefined, undefined, undefined, undefined, undefined);

actionAtADistance.start();

actionAtADistance.on('save', function(data) {
	console.log('\nActionAtADistance Save Callback. Processing: ' + JSON.stringify(data) + '\n');
});

actionAtADistance.on('initResp', function (data) {
	console.log('Connected with LocalClient. Assigned UUID ' + data.uuid);
	actionAtADistance.nodeClientStart('http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost');
});

actionAtADistance.on('callback', function (data) {
	if (data.action === 'start') {
		console.log('Start Callback. Sending Evaluate...');
		actionAtADistance.nodeClientEvaluate('ActionAtADistance.setSpookyResult({'+
			'data: $("div#mw-content-text").html()});console.log("Hello, from " + document.title);');
    }else if (data.action === 'documentLoaded') {
        console.log('Document loaded: ' + data.documentLocationHref);
    } else if (data.action === 'evaluate') {
        console.log('Evaluate result: ' + JSON.stringify(data.result));
    }
});

actionAtADistance.addNodeClient();

module.exports = app;
