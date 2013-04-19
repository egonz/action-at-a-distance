var ActionAtADistance = function() {
    var _socket, _port = 1313, _cookie, _uuid, _spookyResult;

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
            _cookie = _readCookie();
            if (typeof _cookie !== 'undefined') {
                _cookie && console.log('uuid from actionAtADistance COOKIE ' + _cookie.uuid);
                _uuid = _cookie.uuid;
                _port = _cookie.port;

                console.log('Loading Socket.io using port ' + _port);
                _socket = io.connect('http://localhost:' + _port);

                _createSpookyActionListener();

                _socket.emit('callback', {action: 'documentLoaded', uuid: _cookie.uuid, documentLocationHref: document.location.href});
                console.log('SENT documentLoaded MESSAGE.');
            }
        } catch (err) {
            console.log('DOCUMENT.READY ERROR' + err);
        }
    }

    function _fireClick(elem) {
        if(typeof elem == "string") elem = document.getElementById(objID);
        if(!elem) return;

        if(document.dispatchEvent) {   // W3C
            var oEvent = document.createEvent( "MouseEvents" );
            oEvent.initMouseEvent("click", true, true,window, 1, 1, 1, 1, 1, false, false, false, false, 0, elem);
            elem.dispatchEvent( oEvent );
        }
        else if(document.fireEvent) {   // IE
            elem.click();
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

            console.log('SAVING uuid ' + _uuid + ', port: ' + _port + ', plus optional data ' + data);
            
            cookieData.port = _port;

            if (typeof data !== 'undefined')
                cookieData.data = data;
            
            $.cookie('actionAtADistance', JSON.stringify(cookieData));
        },

        init: function() {
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

        setPort: function(port) {
            _port = port || _port;
        },

        setSpookyResult: function(spookyResult) {
            _spookyResult = spookyResult;
        },

        socket: function() {
            return _socket;
        },
        
        fireClick: function(elem) {
            _fireClick(elem);
        }
    };
}();


$(document).ready(function() {
    console.log('DOCUMENT LOADED');
    ActionAtADistance.init();
});

$(window).on('hashchange', function() {
    console.log('HASH CHANGE ');
    ActionAtADistance.init();
});