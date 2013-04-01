var fs = require('fs'),
	Spooky = require('spooky');


var ghostProtocol = function(baseDir) {

	var _cookieFile;
	var _clientScripts = [baseDir + '/vendor/jquery-1.9.1.min.js',
	                      baseDir + '/vendor/socket.io.js',
                          baseDir + '/vendor/jquery.livequery-1.1.1/jquery.livequery.js',
                          baseDir + '/vendor/jquery-cookie/jquery.cookie.js',
                          baseDir + '/vendor/jsonml-dom.js',
                          baseDir + '/lib/action-at-a-distance-server.js'];
    var _waitTimeout = 3600000;

    function readyForSpookyAction(socket) {
		socket.emit('initResp', {uuid: socket.uuid});
	}

	function cookieFileName(uuid) {
	 	return _cookieFile + uuid + '.txt';
	}

    return {
    	init: function(clientScripts, cookieFile, waitTimeout) {
    		if (typeof clientScripts !== 'undefined') {
        		_clientScripts.concat(clientScripts);
    		}

    		if (typeof waitTimeout !== 'undefined') {
    			_waitTimeout = waitTimeout;
    		}

    		_cookieFile = cookieFile || '/tmp/actionatadistanceCookie-';
    	},
	    ghost: function(socket) {
	        var cookie = cookieFileName(socket.uuid);
	        if (fs.existsSync(cookie))
	            fs.unlinkSync(cookie);
	        
	        var spooky = new Spooky({
	            casper: {
	                verbose: true,
	                logLevel: 'debug',
	                waitTimeout: 3600000,
	                clientScripts: _clientScripts,
	                pageSettings: {
	                     loadImages:  false,         // The WebPage instance used by Casper will
	                     loadPlugins: false,         // use these settings
	                     userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
	                },
	                uuid: socket.uuid
	            }
	        }, function (err) {
	            if (err) {
	                e = new Error('Failed to initialize SpookyJS');
	                e.details = err;
	                throw e;
	            }

	            spooky.on('onStepComplete', function (e) {
	                console.log('step ' + e);
	            });

	            spooky.on('error', function (e) {
	                console.error(e);
	            });

	            // Uncomment this block to see all of the things Casper has to say.
	            // There are a lot.
	            // He has opinions.
	            spooky.on('console', function (line) {
	                console.log(line);
	            });

	            spooky.on('log', function (log) {
	                if (log.space === 'remote') {
	                    console.log(log.message.replace(/ \- .*/, ''));
	                }
	            });

	            readyForSpookyAction(socket);
	        }, cookie);

	        return spooky;
	    },
		start: function(spooky, data) {
	        spooky.start(data.url, function(res) {
	            console.log("INITIAL PAGE LOADED");

	            this.thenEvaluate(function (js) {
	            	try {
	            		eval(js);
		                ActionAtADistance.setUuid(uuid);
		               	ActionAtADistance.saveCookie();
	                	ActionAtADistance.socket().emit('callback', {'action': 'start', 'uuid': uuid});
	                } catch (err) {
		            	console.log('Start Error ' + err);
		            }
	            }, 'uuid=\'' + this.options.uuid + '\';');
	        });

	        //This keeps the Sppoky.js code from timing out
	        spooky.waitForSelector('div.spookyStop', function() {
	            console.log('spookyStop selector found');
	        });

	        spooky.run();
	    }
	}

}

module.exports = ghostProtocol;