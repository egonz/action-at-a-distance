var ActionAtADistance = function() {
    var _socket, _lastRequestedUrl, _currentlyLoadedUrl, 
        _uuid, _lastEvalResp, _connected = false, _onCallback, _initCallback, _onDisconnect;

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

                _socket = io.connect(socketIOUrl, {'force new connection': true});

                _socket.on('connect', function () {
                    _socket.emit('init');
                });

                _socket.on('disconnect', function () {
                    if (typeof _onDisconnect !== 'undefined') {
                        _onDisconnect();
                    }
                });

                _socket.on('callback', function (data) {
                    if (data.action === 'start') {
                        _currentlyLoadedUrl = _lastRequestedUrl; //TODO pass the URL as part of the Socket.io response data
                    }else if (data.action === 'documentLoaded') {
                        _currentlyLoadedUrl = data.documentLocationHref;
                    } else if (data.action === 'evaluate') {
                        _lastEvalResp = data;
                    }

                    _onCallback(data);
                });

                callback();
            });
        });
    }

    return {
        connect: function(port, callback) {
            _loadSocketIO(port, callback);
        },
        init: function() {
            _socket.on('initResp', function (data) {
                _uuid = data.uuid;
                _connected = true;
                _initCallback();
            });
        },
        onDisconnect: function (callback) {
            _onDisconnect = callback;
        },
        start: function(url) {
            _lastRequestedUrl = url;
            _socket.emit('start', {url: _lastRequestedUrl});
        },
        startAndLogin: function(url, formName, userInputName, passInputName, user, pass) {
            _lastRequestedUrl = url;
            _socket.emit('startAndLogin', {url: _lastRequestedUrl, formName: formName, 
                userInputName: userInputName, passInputName: passInputName, user: user, pass: pass});
        },
        evaluate: function(data) {
            _socket.emit('evaluate', {action: data});
        },
        connected: function() {
            return _connected;
        },
        currentlyLoadedUrl: function() {
            return _currentlyLoadedUrl;
        },
        lastEvalResponse: function() {
            return _lastEvalResp;
        },
        uuid: function() {
            return _uuid;
        },
        log: function(msg) {
            _log(msg);
        },
        logJson: function(msg) {
            _logJson(msg);
        },
        on: function(event, callback) {
            if (event === 'callback') {
                _onCallback = callback;
            } else if (event === 'initResp') {
                _initCallback = callback;
            }
        }
    };
}

if (typeof exports == 'object' && exports) {
    exports = module.exports = ActionAtADistance;
}


