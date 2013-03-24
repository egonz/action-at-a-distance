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
    uuid = require('node-uuid'),
    sockUserModel = require('./models/sockuser.js'),
    sockUserCollection = new sockUserModel.SockUserCollection();

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
			socket.guid = uuid.v4();
			//Add the sockUser to the list of socket connections
			addSockUser(socket);
        });

        socket.on('disconnect', function(){
            if (typeof socket.guid !== 'undefined') {
                console.log('removing socket user ' + socket.guid);
                bustGhost(socket.guid);
                removeSockUser(socket.guid);
            }
        });

        socket.on('open', function (data) {
            console.log('open called for url ' + data.url + ' for guid ' + data.guid);
            spookyStart(socket.spooky, data);
        });

        socket.on('evaluate', function (data) {
            console.log('evaluate called with spooky action ' + data.action);
            var sockUser = getSockUser(data.guid);
            console.log(typeof sockUser.spookySocket);
            // spookyAction(sockUser.socket.spooky, data.action);
            sockUser.spookySocket.emit('spookyAction', data.action);
        });

        socket.on('callback', function (data) {
            console.log('callback called for ' + data.guid);
            var sockUser = getSockUser(data.guid);

            if (typeof sockUser.spookySocket === 'undefined')
                sockUser.spookySocket = socket;

            sockUser && sockUser.socket.emit('callback', data);
        });
    });
}

function addSockUser(socket) {
    console.log('New SockUser for guid ' + socket.guid);
    socket.spooky = evoke(socket);

    var sockUser = new sockUserModel.SockUser({guid: socket.guid, socket: socket, spooky: socket.spooky});
    sockUserCollection.add(sockUser);
}

function getSockUserCount(guid) {
    return sockUserCollection.where({"guid": guid}).length;
}

function getSockUser(guid) {
    var sockUser = sockUserCollection.where({"guid": guid});
    return sockUser ? sockUser[0] : null;
}

function removeSockUser(guid) {
    var sockUserResult = sockUserCollection.where({"guid": guid});

    console.log('Removing ActionAtADistance sockUser guid ' + guid + '. SockUser Count ' + sockUserResult.length);

    if (sockUserResult.length > 0) {
        sockUserCollection.remove(sockUserResult);
    }
}

function evoke(socket) {
	var spooky = new Spooky({
        casper: {
            verbose: true,
            logLevel: 'debug',
            waitTimeout: 3600000,
            clientScripts: [__dirname + '/vendor/jquery-1.9.1.min.js',
                            __dirname + '/vendor/socket.io.js',
                            __dirname + '/vendor/bililiteRange.js',
                            __dirname + '/vendor/jquery.simulate.js',
                            __dirname + '/lib/actionatadistance-server.js'],
            pageSettings: {
                 loadImages:  false,         // The WebPage instance used by Casper will
                 loadPlugins: false,         // use these settings
                 userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
            },
            guid: socket.guid
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
    });

	return spooky;
}

function readyForSpookyAction(socket) {
    socket.emit('initResp', {guid: socket.guid});
}

function spookyStart(spooky, data) {
    spooky.start(data.url, function(res) {
        console.log("page loaded");
        //TODO create a callback object
        var guid = this.options.guid;

        this.thenEvaluate(function (js) {
            eval(js);
            //Global socket
            socket = io.connect('http://localhost:1313');
            socket.emit('callback', {'action': 'start', 'guid': guid});

            socket.on('spookyAction', function(action) {
                console.log(action);
                eval(action);
                var spookyCallbackResp = {'action': 'evaluate', 'guid': guid};
                if (typeof spookyResult !== 'undefined') spookyCallbackResp.result = spookyResult;

                socket.emit('callback', spookyCallbackResp);
            });
        }, 'var guid=\'' + this.options.guid + '\';');
    });

    //This keeps the Sppoky.js code from timing out
    spooky.waitForSelector('div.spookyStop', function() {
        console.log('spookyStop selector found');
    });

    spooky.run();
}

function bustGhost(guid) {
    var sockUser = getSockUser(guid);
    sockUser.spooky.destroy();
    delete sockUser.spooky;
}