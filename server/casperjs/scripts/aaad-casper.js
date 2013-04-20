var casper = require('casper').create({
  verbose: true,
  logLevel: "debug",
  waitTimeout: 10000,
  pageSettings: {
    loadImages:  false,         // The WebPage instance used by Casper will
    loadPlugins: false,         // use these settings
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
  }
});

var startUrl = casper.cli.get('startUrl'); 
var uuid = casper.cli.get('uuid');
var aaadPort = casper.cli.get('aaadPort');
var scriptsDir = casper.cli.get('scriptsDir');
var extraClientScripts = casper.cli.get('clientScripts');
var customCasper = casper.cli.get('customCasper');
var loginFormName = casper.cli.get('loginFormName');
var usernameInputName = casper.cli.get('usernameInputName');
var passwordInputName = casper.cli.get('passwordInputName');
var username = casper.cli.get('username');
var password = casper.cli.get('password');

var _clientScripts = [	scriptsDir + 'vendor/jquery-1.9.1.min.js',
scriptsDir + 'vendor/socket.io.js',
scriptsDir + 'vendor/jquery.livequery-1.1.1/jquery.livequery.js',
scriptsDir + 'vendor/jquery-cookie/jquery.cookie.js',
scriptsDir + 'vendor/jsonml-dom.js',
scriptsDir + 'vendor/bililiteRange.js',
scriptsDir + 'vendor/jquery.sendkeys.js',
scriptsDir + 'lib/action-at-a-distance-server.js'];

if (typeof extraClientScripts !== 'undefined' && typeof extraClientScripts !== 'undefined') {
  _clientScripts = _clientScripts.concat(extraClientScripts.split(","));
}

casper.options.clientScripts = _clientScripts;

console.log("CASPER STARTING... ClientScripts: " + _clientScripts);

if (typeof usernameInputName !== 'undefined' && typeof passwordInputName !== 'undefined' && 
    typeof username !== 'undefined' && typeof password !== 'undefined') {

  casper.start(startUrl, function() {
    console.log("INITIAL PAGE LOADED");

    var formData = {};
    formData[usernameInputName] = username;
    formData[passwordInputName] = password;

    this.fill("form[action='" + loginFormName + "']", formData, true);
  });

} else {

  casper.start(startUrl, function() {
    console.log("INITIAL PAGE LOADED");
  });

}

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