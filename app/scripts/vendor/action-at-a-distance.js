var actionAtADistance = function() {
    var socket = io.connect('http://localhost:1313', {'force new connection': true}), lastRequestedUrl, currentlyLoadedUrl, 
        _uuid, lastEvalResp, _connected = false, onDocumentLoadedCallback, onEvaluateResponseCallback;
    
    socket.on('connect', function () {
        socket.emit('init');
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

    return {
        onConnect: function(callback) {
            socket.on('initResp', function (data) {
                _uuid = data.uuid;
                _connected = true;
                callback();
            });
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
        }
    };
}


