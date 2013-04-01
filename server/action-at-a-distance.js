
var express = require('express'),
    server = require('http').createServer(express()),
    nodeUuid = require('node-uuid'),
    quantumEntanglement = require('./lib/quantum-entanglement.js'),
    ghostProtocol = require('./lib/ghost-protocol.js')(__dirname);

(function() {

    ////////////////////// Private //////////////////////

    var _io;
    var _defaultPort = 1313;
    var _nonLocalCorrelations = quantumEntanglement.NonLocalCorrelations;
    var _that;

    function handleInit(socket) {
        console.log('New ActionAtADistance Socket.io connection.');
        socket.uuid = nodeUuid.v4();
        _nonLocalCorrelations.addNonLocalCorrelation(socket, ghostProtocol.ghost(socket));
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
            ghostProtocol.start(socket.ghost, data);
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
        nonLocalCorrelation.ghost.destroy();
        delete nonLocalCorrelation.ghost;
    }

    ////////////////////// Public //////////////////////

    /**
     * [ActionAtADistance description]
     * @param {[type]} port          [description]
     * @param {[type]} clientScripts [description]
     * @param {[type]} cookieFile    [description]
     */
    ActionAtADistance = function(port, clientScripts, cookieFile) {
        this.port = port || _defaultPort;
        this.clientScripts = clientScripts; 
        this.cookieFile = cookieFile;
    }

    ActionAtADistance.prototype = Object.create(require('events').EventEmitter.prototype);
    ActionAtADistance.prototype.constructor = ActionAtADistance;

    ActionAtADistance.prototype.start = function() {
        _that = this;
        ghostProtocol.init(this.clientScripts, this.cookieFile);

        _io = require('socket.io').listen(server);

        _io.configure( function() {
            _io.set('close timeout', 60*60*24); // 24h time out
        });

        server.listen(this.port, function(){
            console.log("Express server listening on port %d", this.address().port);
            setupSpookySocks();
        });
    };

    ActionAtADistance.prototype.stop = function() {
        server.close();
    };

    ActionAtADistance.prototype.addNodeClient = function() {
        handleInit(this);
    };

    ActionAtADistance.prototype.nodeClientStart = function(url) {
        handleStart(this, {url: url});
    };

    ActionAtADistance.prototype.nodeClientEvaluate = function(data) {
        handleEvaluate(this, {action: data});
    };

})();

module.exports = ActionAtADistance;