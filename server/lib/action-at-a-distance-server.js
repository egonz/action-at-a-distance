var ActionAtADistance = function() {
    var _socket, _cookie, _uuid, _spookyResult;

    function _sendCallback() {
        try {
            var spookyCallbackResp = {'action': 'evaluate', 'uuid': _uuid};
            if (typeof _spookyResult !== 'undefined') spookyCallbackResp.result = _spookyResult;

            _socket.emit('callback', spookyCallbackResp);
        } catch (err) {
            console.log('sendCallback error: ' + err);
        }
    }

    function _readCookie() {
        var cookie = $.cookie('actionAtADistance');
        console.log('read cookie ' + cookie);
        if (typeof cookie !== 'undefined') {
            return JSON.parse(cookie);
        }
    }

    function _createSpookyActionListener() {
        _socket.on('spookyAction', function(action) {
            console.log('inside spookyAction');
            try {
                eval(action);
                
                if (typeof _uuid !== 'undefined' && typeof _spookyResult !== 'undefined') {
                    _sendCallback();
                }
            } catch (err) {
                console.log('Sppoky Action Error ' + err);
            }
        });
    }

    function _onDocumentLoaded() {
        console.log('processing documentLoaded');
        try {
            _createSpookyActionListener();

            _cookie = _readCookie();
            if (typeof _cookie !== 'undefined') {
                _cookie && console.log('uuid from actionAtADistance COOKIE ' + _cookie.uuid);
                _uuid = _cookie.uuid;

                _socket.emit('callback', {action: 'documentLoaded', uuid: _cookie.uuid, documentLocationHref: document.location.href});
                console.log('SENT documentLoaded MESSAGE.');
            }
        } catch (err) {
            console.log('DOCUMENT.READY ERROR' + err);
        }
    }

    return {
        sendCallback: function(spookyResult) {
            _spookyResult = spookyResult;
            _sendCallback();
        },

        saveNodes: function(nodes) {
            var html = nodes;
            if ('length' in nodes && nodes.length > 0) {
                html = nodes[0];
            }
            var jsonData = JsonML.fromHTML(html);
            _socket.emit('save', jsonData);
        },

        saveHtmlText: function(html) {
            var jsonData = JsonML.fromHTMLText(html);
            _socket.emit('save', jsonData);
        },

        saveCookie: function(data) {
            var cookieData = {uuid: _uuid};

            console.log('SAVING uuid ' + _uuid + ' plus optional data ' + data);
            
            if (typeof data !== 'undefined')
                cookieData.data = data;
            
            $.cookie('actionAtADistance', JSON.stringify(cookieData));
        },

        _init: function() {
            if (typeof _socket === 'undefined') {
                _socket = io.connect('http://localhost:1313');
            }

            _onDocumentLoaded();
        },

        cookie: function() {
            return _cookie;
        },

        getUuid: function() {
            return _uuid;
        },

        setUuid: function(uuid) {
            console.log('setUuid');
            _uuid = uuid;
        },

        setSpookyResult: function(spookyResult) {
            _spookyResult = spookyResult;
        },

        socket: function() {
            return _socket;
        }
    };
}();


$(document).ready(function() {
    console.log('DOCUMENT LOADED');
    ActionAtADistance._init();
});

$(window).on('hashchange', function() {
    console.log('HASH CHANGE ');
    ActionAtADistance._init();
});