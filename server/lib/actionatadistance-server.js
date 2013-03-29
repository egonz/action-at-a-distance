var socket, cookie, uuid;

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
    start = new Date().getTime(),
    condition = false,
    interval = setInterval(function() {
		if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
				if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    return;
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
					typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
}

function sendCallback(uuid, spookyResult) {
    try {
        var spookyCallbackResp = {'action': 'evaluate', 'uuid': uuid};
        if (typeof spookyResult !== 'undefined') spookyCallbackResp.result = spookyResult;

        socket.emit('callback', spookyCallbackResp);
    } catch (err) {
        console.log('sendCallback error: ' + err);
    }
}

function saveCookie(data) {
    console.log('SAVING uuid ' + uuid + ' plus optional data ' + data);
    var cookieData = {uuid: uuid};
    
    if (typeof data !== 'undefined')
        cookieData.data = data;
    
    $.cookie('actionAtADistance', JSON.stringify(cookieData));
}

function readCookie() {
    var cookie = $.cookie('actionAtADistance');
    console.log('read cookie ' + cookie);
    if (typeof cookie !== 'undefined') {
        return JSON.parse(cookie);
    }
}

function createSpookyActionListener() {
    socket.on('spookyAction', function(action) {
        console.log('inside spookyAction');
        try {
            eval(action);
            
            if (typeof uuid !== 'undefined' && typeof spookyResult !== 'undefined') {
                sendCallback(uuid, spookyResult);
            }
        } catch (err) {
            console.log('Sppoky Action Error ' + err);
        }
    });
}

function onDocumentLoaded() {
    try {
        createSpookyActionListener();

        cookie = readCookie();
        if (typeof cookie !== 'undefined') {
            cookie && console.log('uuid from actionAtADistance COOKIE ' + cookie.uuid);
            uuid = cookie.uuid;

            socket.emit('callback', {action: 'documentLoaded', uuid: cookie.uuid, documentLocationHref: document.location.href});
            console.log('SENT documentLoaded MESSAGE.');
        }
    } catch (err) {
        console.log('DOCUMENT.READY ERROR' + err);
    }
}

$(document).ready(function() {
    socket = io.connect('http://localhost:1313');

    console.log('DOCUMENT LOADED');
    onDocumentLoaded();
});

$(window).on('hashchange', function() {
  console.log('HASH CHANGE ' + cookie);
  onDocumentLoaded();
});

//TODO implement SpookyAction shutdown by inserting div.spookyStop into the DOM.