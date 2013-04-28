
var fs = require('fs'),
    nodeUuid = require('node-uuid'),
    quantumEntanglement = require('./lib/quantum-entanglement.js'),
    GhostProtocol = require('./lib/ghost-protocol.js');

(function() {

    ////////////////////// Private //////////////////////

    var _io;
    var _that;
    var _clientScript;
    var _internalServer;
    var _defaultPort = 1313;
    var _nonLocalCorrelations = quantumEntanglement.NonLocalCorrelations;

    function handleInit(socket) {
        console.log('New ActionAtADistance Socket.io connection.');
        socket.uuid = nodeUuid.v4();
        socket.ghost = new GhostProtocol(socket.uuid, _that.port, _that.clientScripts, _that.cookieFile, _that.customCasperScript);

        _nonLocalCorrelations.addNonLocalCorrelation(socket, socket.ghost);

        socket.ghost.on('loaded', function() {
            socket.emit('loaded', {uuid: socket.uuid});
        });

        socket.ghost.on('ghost-protocol', function(data) {
            console.log(data.toString());
        });

        socket.emit('initResp', {uuid: socket.uuid});
    }

    function handleDisconnect(uuid) {
        if (typeof uuid !== 'undefined') {
            console.log('removing socket user ' + uuid);
            bustGhost(uuid);
            _nonLocalCorrelations.removeNonLocalCorrelation(uuid);
        }
    }

    function handleStart(socket, data) {
        console.log('start called for url ' + data.url + ' for uuid ' + socket.uuid);
        if (typeof data.url !== 'undefined') {
            socket.ghost.start(data.url);
        }
    }

    function handleStartAndLogin(socket, data) {
        console.log('startAndLogin called for url ' + data.url + ' for uuid ' + socket.uuid);
        if (typeof data.url !== 'undefined') {
            socket.ghost.startAndLogin(data.url, data.formName, data.userInputName, 
                data.passInputName, data.user, data.pass);
        }
    }

    function handleEvaluate(socket, data) {
        try {
            console.log('evaluate called with spooky action ' + data.action + ' for uuid ' + socket.uuid);
            var nonLocalCorrelation = _nonLocalCorrelations.getNonLocalCorrelation(socket.uuid);
            
            if (typeof nonLocalCorrelation !== 'undefined') {
                nonLocalCorrelation.spookySock.emit('spookyAction', data.action);
                console.log('Sent evaluate request to spookyAction.');
            }
        } catch (err) {
            console.error('Evaluate error ' + err);
        }
    }

    function handleCallback(socket, data) {
        try {
            console.log('callback called for ' + data.uuid);
            var nonLocalCorrelation = _nonLocalCorrelations.getNonLocalCorrelation(data.uuid);

            if (typeof nonLocalCorrelation !== 'undefined') {
                nonLocalCorrelation.spookySock = socket;
                nonLocalCorrelation.socket.emit('callback', data);
            }
        } catch (err) {
            console.error('callback error ' + err);
        }
    }

    function handleSave(data) {
        _that.emit('save', data);
    }

    function setupSpookySocks() {
        _io.sockets.on('connection', function(socket) {
            socket.on('init', function () {
                handleInit(socket);
            });

            socket.on('disconnect', function(){
                handleDisconnect(socket.uuid);
            });

            socket.on('start', function (data) {
                handleStart(socket, data);
            });

            socket.on('startAndLogin', function (data) {
                handleStartAndLogin(socket, data);
            });

            socket.on('evaluate', function (data) {
                handleEvaluate(socket, data);
            });

            socket.on('callback', function (data) {
                handleCallback(socket, data);
            });

            socket.on('save', function(data) {
                handleSave(data);
            });
        });
    }

    function bustGhost(uuid) {
        var nonLocalCorrelation = _nonLocalCorrelations.getNonLocalCorrelation(uuid);
        nonLocalCorrelation.ghost.stop();
        delete nonLocalCorrelation.ghost;
    }

    ////////////////////// Public //////////////////////

    /**
     * [ActionAtADistance A socket based Javascript screen scraping NodeJS module. Static 
     *  and dynamic Ajax pages can be scraped on the client (in a Browser), or on the server 
     *  using Node.js.]
     * @param {[Express]} app                   [Express app instance.]
     * @param {[Number]} port                   [ActionAtADistance Socket Port.]
     * @param {[Array]} clientScripts           [Additional Javascript file paths to be injected into each nonlocal page.]
     * @param {[String]} cookieFile             [Alternative cookiefile path.]
     * @param {[String]} customCasperScript     [A custom Casper Script to be injected into each GhostProtocol instance.]
     * @param {[Http]} server                   [Optional http server instance to bind to for Socket.IO connections.]
     */
    ActionAtADistance = function(app, port, clientScripts, cookieFile, customCasperScript, server) {
        this.app = app;
        this.server = server;
        this.port = port || _defaultPort;
        this.clientScripts = clientScripts; 
        this.cookieFile = cookieFile ;
        this.customCasperScript = customCasperScript;
    }

    ActionAtADistance.prototype = Object.create(require('events').EventEmitter.prototype);
    ActionAtADistance.prototype.constructor = ActionAtADistance;

    ActionAtADistance.prototype.listen = function() {
        _that = this;

        if (typeof this.server === 'undefined') {
            var express = express = require('express');
            this.server = require('http').createServer(express());
            _internalServer = true;
        } else {
            _internalServer = false;
        }

        _io = require('socket.io').listen(this.server);

        _io.configure( function() {
            _io.set('close timeout', 60*60*24); // 24h time out
        });

        if (_internalServer) {
            this.server.listen(this.port, function(){
                console.log("Express server listening on port %d", this.address().port);
                setupSpookySocks();
            });
        } else {
            setupSpookySocks();
        }

        this.setupExpressRoute();
    };

    ActionAtADistance.prototype.stop = function() {
        //Only do this if the server is internal to AAAD
        if (_internalServer === true) {
            this.server.close();
        }
    };

    ActionAtADistance.prototype.connect = function(callback) {
        callback();
    };

    ActionAtADistance.prototype.start = function(url) {
        handleStart(this, {url: url});
    };

    ActionAtADistance.prototype.startAndLogin = function(url, formName, userInputName, 
                passInputName, user, pass) {
        handleStartAndLogin(this, {url: url, formName: formName, userInputName: userInputName, 
                passInputName: passInputName, user: user, pass: pass});
    };

    ActionAtADistance.prototype.evaluate = function(data) {
        handleEvaluate(this, {action: data});
    };

    ActionAtADistance.prototype.init = function() {
        handleInit(this);
    };

    ActionAtADistance.prototype.setupExpressRoute = function() {
        if (typeof this.app !== 'undefined') {
            this.app.get('/aaad-socket-uri.js', function(req, res) {
                var port = _that.port;
                var socketURI = port ? ':' + port + '/' : '/';
                res.set('Content-Type', 'text/javascript');
                res.send('var aaadSocketURI="' + socketURI + '";');
            });

            this.app.get('/action-at-a-distance.js', function(req, res) {
                res.set('Content-Type', 'text/javascript');

                if (typeof _clientScript === 'undefined') {
                    fs.readFile(__dirname + '/../app/scripts/action-at-a-distance.js', function (err, data) {
                        if (err) throw err;

                        _clientScript = data;
                        res.send(data);
                    });
                } else {
                    res.send(_clientScript);
                }
            });
        }  
    };

})();

module.exports = ActionAtADistance;