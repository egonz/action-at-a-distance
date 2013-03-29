// TODO 
// * Shutdown Spooky and SpookSocket instances when the client Socket disconnects.  
// * Make this into a module
// * Create a client angular module.
// * Allow clients to pass in scripts via a url.
// * Add jsonml integration on the client https://github.com/mckamey/jsonml/

var io,
    port = 1313,
    express = require('express'),
    server = require('http').createServer(express()),
    Spooky = require('spooky'),
    nodeUuid = require('node-uuid'),
    fs = require('fs'),
    sockUserModel = require('./models/sockuser.js'),
    sockUserCollection = new sockUserModel.SockUserCollection(),
    cookieFile = '/tmp/actionatadistanceCookie-';

exports.configure = function() {
	io = require('socket.io').listen(server);

    io.configure( function() {
        io.set('close timeout', 60*60*24); // 24h time out
    });

	server.listen(port, function(){
		console.log("Express server listening on port %d", this.address().port);
		setup();
	});
};

function setup() {
    io.sockets.on('connection', function(socket) {
        socket.on('init', function (data) {
			console.log('New ActionAtADistance Socket.io connection.');
			socket.uuid = nodeUuid.v4();
			//Add the sockUser to the list of socket connections
			addSockUser(socket);
        });

        socket.on('disconnect', function(){
            if (typeof socket.uuid !== 'undefined') {
                console.log('removing socket user ' + socket.uuid);
                bustGhost(socket.uuid);
                removeSockUser(socket.uuid);
            }
        });

        socket.on('start', function (data) {
            console.log('start called for url ' + data.url + ' for uuid ' + socket.uuid);
            spookyStart(socket.spooky, data);
        });

        socket.on('evaluate', function (data) {
            try {
                console.log('evaluate called with spooky action ' + data.action + ' for uuid ' + socket.uuid);
                var sockUser = getSockUser(socket.uuid);

                // spookyAction(sockUser.socket.spooky, data.action);
                sockUser.spookySocket.emit('spookyAction', data.action);
                console.log('Sent evaluate request to spookyAction.');
            } catch (err) {
                console.error('Evaluate error ' + err);
            }
        });

        socket.on('callback', function (data) {
            try {
                console.log('callback called for ' + data.uuid);
                
                var sockUser = getSockUser(data.uuid);

                if (typeof sockUser === 'undefined') {
                    console.log("sockUser === 'undefined'");
                    return;
                }

                sockUser.spookySocket = socket;

                sockUser.socket.emit('callback', data);
            } catch (err) {
                console.error('callback error ' + err);
            }
        });
    });
}

function addSockUser(socket) {
    console.log('New SockUser for uuid ' + socket.uuid);
    socket.spooky = evoke(socket);

    var sockUser = new sockUserModel.SockUser({uuid: socket.uuid, socket: socket, spooky: socket.spooky});
    sockUserCollection.add(sockUser);
}

function getSockUserCount(uuid) {
    return sockUserCollection.where({"uuid": uuid}).length;
}

function getSockUser(uuid) {
    var sockUser = sockUserCollection.where({"uuid": uuid});
    return sockUser ? sockUser[0] : null;
}

function removeSockUser(uuid) {
    var sockUserResult = sockUserCollection.where({"uuid": uuid});

    console.log('Removing ActionAtADistance sockUser uuid ' + uuid + '. SockUser Count ' + sockUserResult.length);

    if (sockUserResult.length > 0) {
        sockUserCollection.remove(sockUserResult);
    }
}

function evoke(socket) {
    var cookie = cookieFileName(socket.uuid);
    if (fs.existsSync(cookie))
        fs.unlinkSync(cookie);
	
    var spooky = new Spooky({
        casper: {
            verbose: true,
            logLevel: 'debug',
            waitTimeout: 3600000,
            clientScripts: [__dirname + '/vendor/jquery-1.9.1.min.js',
                            __dirname + '/vendor/socket.io.js',
                            __dirname + '/vendor/jquery.livequery-1.1.1/jquery.livequery.js',
                            __dirname + '/vendor/jquery-cookie/jquery.cookie.js',
                            __dirname + '/lib/actionatadistance-server.js'],
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
}

function cookieFileName(uuid) {
    return cookieFile + uuid + '.txt';
}

function readyForSpookyAction(socket) {
    socket.emit('initResp', {uuid: socket.uuid});
}

function spookyStart(spooky, data) {
    spooky.start(data.url, function(res) {
        console.log("INITIAL PAGE LOADED");
        delete uuid;

        this.thenEvaluate(function (js) {
            eval(js);
            saveCookie();
            socket.emit('callback', {'action': 'start', 'uuid': uuid});
        }, 'uuid=\'' + this.options.uuid + '\';');
    });

    //This keeps the Sppoky.js code from timing out
    spooky.waitForSelector('div.spookyStop', function() {
        console.log('spookyStop selector found');
    });

    spooky.run();
}

function bustGhost(uuid) {
    var sockUser = getSockUser(uuid);
    sockUser.spooky.destroy();
    delete sockUser.spooky;
}