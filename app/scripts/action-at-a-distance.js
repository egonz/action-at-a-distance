var ActionAtADistance = function() {
    var socket, lastRequestedUrl, currentlyLoadedUrl, 
        _uuid, lastEvalResp, _connected = false, onDocumentLoadedCallback, onEvaluateResponseCallback, onDisconnect;

    function _log(msg) {
        if (typeof console !== 'undefined' && 
            (typeof console.log === 'function' || typeof console.log === 'object')) {
            console.log(msg);
        }
    }

    function _logJson(msg) {
        if (typeof JSON !== 'undefined' && 
            (typeof JSON.stringify === 'function' || typeof JSON.stringify === 'object')) {
            _log(JSON.stringify(msg));
        }
    }

    function _loadSocketIO(callback) {
        $.getScript('/aaad-socket-uri.js', function(data, textStatus, jqxhr) {
            var socketIOUrl = 'http://' + document.location.hostname + aaadSocketURI;
            _log('SocketIO URL: ' + socketIOUrl);

            $.getScript(socketIOUrl + "socket.io/socket.io.js", function(data, textStatus, jqxhr) {

                socket = io.connect(socketIOUrl, {'force new connection': true});

                socket.on('connect', function () {
                    socket.emit('init');
                });

                socket.on('disconnect', function () {
                    onDisconnect();
                });

                socket.on('callback', function (data) {
                    if (data.action === 'start') {
                        currentlyLoadedUrl = lastRequestedUrl; //TODO pass the URL as part of the Socket.io response data
                        onDocumentLoadedCallback(currentlyLoadedUrl);
                    }else if (data.action === 'documentLoaded') {
                        onDocumentLoadedCallback(data.documentLocationHref);
                    } else if (data.action === 'evaluate') {
                        lastEvalResp = data;
                        onEvaluateResponseCallback(lastEvalResp);
                    }
                });

                callback();
            });
        });
    }

    return {
        init: function(port, callback) {
            _loadSocketIO(port, callback);
        },
        onConnect: function(callback) {
            socket.on('initResp', function (data) {
                _uuid = data.uuid;
                _connected = true;
                callback();
            });
        },
        onDisconnect: function (callback) {
            onDisconnect = callback;
        },
        onDocumentLoaded: function (callback) {
            onDocumentLoadedCallback = callback;
        },
        onEvaluateResponse: function (callback) {
            onEvaluateResponseCallback = callback;
        },
        start: function(url) {
            lastRequestedUrl = url;
            socket.emit('start', {url: lastRequestedUrl});
        },
        evaluate: function(data) {
            if (!'uuid' in data) {
                data.uuid = _uuid;
            }
            socket.emit('evaluate', data);
        },
        connected: function() {
            return _connected;
        },
        currentlyLoadedUrl: function() {
            return currentlyLoadedUrl;
        },
        lastEvalResponse: function() {
            return lastEvalResp;
        },
        uuid: function() {
            return _uuid;
        },
        log: function(msg) {
            _log(msg);
        },
        logJson: function(msg) {
            _logJson(msg);
        }
    };
}


