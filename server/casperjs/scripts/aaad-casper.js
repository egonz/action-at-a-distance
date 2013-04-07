var casper = require('casper').create({
  verbose: true,
  logLevel: "debug"
});

var startUrl = casper.cli.get('startUrl'); 
var uuid = casper.cli.get('uuid');
var aaadPort = casper.cli.get('aaadPort');
var scriptsDir = casper.cli.get('scriptsDir');
var extraClientScripts = casper.cli.get('clientScripts');
var customCasper = casper.cli.get('customCasper');

var _clientScripts = [	scriptsDir + 'vendor/jquery-1.9.1.min.js',
scriptsDir + 'vendor/socket.io.js',
scriptsDir + 'vendor/jquery.livequery-1.1.1/jquery.livequery.js',
scriptsDir + 'vendor/jquery-cookie/jquery.cookie.js',
scriptsDir + 'vendor/jsonml-dom.js',
scriptsDir + 'lib/action-at-a-distance-server.js'];

if (typeof extraClientScripts !== 'undefined' && extraClientScripts !== 'undefined') {
	_clientScripts = _clientScripts.concat(extraClientScripts.split(","));
}

casper.options.clientScripts = _clientScripts;

console.log("CASPER STARTING... ClientScripts: " + _clientScripts);

casper.start(startUrl, function() {
  console.log("INITIAL PAGE LOADED");
});

casper.thenEvaluate(function(uuid, aaadPort) {
	try {
		ActionAtADistance.setPort(aaadPort);
		ActionAtADistance.setUuid(uuid);
    ActionAtADistance.saveCookie();
    ActionAtADistance.init();
    ActionAtADistance.socket().emit('callback', {'action': 'start', 'uuid': uuid});
  } catch (err) {
    console.log('Start Error ' + err);
  }
}, uuid, aaadPort);

if  (typeof customCasper !== 'undefined' && customCasper !== 'undefined') {
	require(customCasper);
}

casper.run(function() {
  this.echo('Action-At-A-Distance CasperJS script running.');
  this.echo('GHOST_PROTOCOL: LOADED');
});