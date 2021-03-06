var fs = require("fs");
var spawn = require('child_process').spawn; 

(function() {

	var _that;
	var _casperjs;
	var _aaadCasperJSScript = __dirname + '/../casperjs/scripts/aaad-casper.js';
	var _scriptsDir = __dirname + '/../';

	function createCasperListeners(that) {
		_casperjs.stdout.on('data', function (data) {
			if (data === 'GHOST_PROTOCOL: LOADED') {
				that.emit('loaded');
			} else {
				that.emit('ghost-protocol', data);
			}
		});

		_casperjs.stderr.on('data', function (data) {
			that.emit('error', {error: msg});
		});

		_casperjs.on('close', function (code) {
			that.emit('close', {code: code});
		});
	}

	function getCasperJSParams(startUrl, loginForm) {
		var casperJsParams = [];
		casperJsParams.push('--cookies-file=' + _that.cookieFile);
		casperJsParams.push(_aaadCasperJSScript); 
		casperJsParams.push('--startUrl=' + startUrl);
		casperJsParams.push('--uuid='+ _that.uuid);
		casperJsParams.push('--aaadPort='+ _that.port);
		casperJsParams.push('--scriptsDir=' + _scriptsDir);
		casperJsParams.push('--customCasper=' + _that.customCasperScript);

		if (typeof _that.clientScripts != 'undefined') {
			casperJsParams.push('--clientScripts=' + _that.clientScripts.join(","));
		}

		if (typeof loginForm !== 'undefined') {
			casperJsParams.push('--loginFormName=' + loginForm.name);
			casperJsParams.push('--usernameInputName=' + loginForm.usernameInputName);
			casperJsParams.push('--passwordInputName=' + loginForm.passwordInputName);
			casperJsParams.push('--username=' + loginForm.username);
			casperJsParams.push('--password=' + loginForm.password);
		}

		return casperJsParams;
	}

	var LoginForm = function (name, usernameInputName, passwordInputName, username, password) {
		this.name = name;
		this.usernameInputName = usernameInputName;
		this.passwordInputName = passwordInputName;
		this.username = username; 
		this.password = password;
	}

	GhostProtocol = function(uuid, port, clientScripts, cookieFile, customCasperScript) {
        this.uuid = uuid; 
        this.port = port;
        this.clientScripts = clientScripts; 
        this.cookieFile = cookieFile || '/tmp/actionatadistanceCookie-' + uuid;
        this.customCasperScript = customCasperScript;

        _that = this;

        console.log('New GhostPotocol for uuid ' + this.uuid);
    }

    GhostProtocol.prototype = Object.create(require('events').EventEmitter.prototype);
    GhostProtocol.prototype.constructor = GhostProtocol;

    GhostProtocol.prototype.start = function(startUrl) {
		_casperjs = spawn('casperjs', getCasperJSParams(startUrl));

		createCasperListeners(this);

		return _casperjs;
	};

	GhostProtocol.prototype.startAndLogin = function(startUrl, formName, 
		                                             userInputName, passInputName, user, pass) {
		_casperjs = spawn('casperjs', getCasperJSParams(startUrl, 
			new LoginForm(formName, userInputName, passInputName, user, pass)));

		createCasperListeners(this);

		return _casperjs;
	};

	GhostProtocol.prototype.stop = function() {
		//Ensure the process is still alive
		if (_casperjs.killed === false) {
			_casperjs.kill();
		}
	};

})();

module.exports = GhostProtocol;