var socket, cookie, guid;

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

function sendCallback(guid, spookyResult) {
    try {
        console.log("SENDCALLBACK");

        var spookyCallbackResp = {'action': 'evaluate', 'guid': guid};
        if (typeof spookyResult !== 'undefined') spookyCallbackResp.result = spookyResult;

        socket.emit('callback', spookyCallbackResp);
    } catch (err) {
        console.log('sendCallback error: ' + err);
    }
}

function saveCookie(data) {
    console.log('SAVING GUID ' + guid + ' plus optional data ' + data);
    var cookieData = {guid: guid};
    
    if (typeof data !== 'undefined')
        cookieData.data = data;
    
    $.cookie('actionAtADistance', JSON.stringify(cookieData));
}

function readCookie() {
    var cookie = $.cookie('actionAtADistance');
    if (typeof cookie !== 'undefined') {
        return JSON.parse(cookie);
    }
}

function createSpookyActionListener() {
    socket.on('spookyAction', function(action) {
        try {
            console.log('Within spookyAction.');
            eval(action);
            sendCallback(guid, spookyResult);
        } catch (err) {
            console.log('Sppoky Action Error ' + err);
        }
    });
}

$(document).ready(function() {
    socket = io.connect('http://localhost:1313');

    console.log('DOCUMENT LOADED');
    try {
        cookie = readCookie();
        if (typeof cookie !== 'undefined') {
            cookie && console.log('GUID from actionAtADistance COOKIE ' + cookie.guid);
            guid = cookie.guid;

            createSpookyActionListener();

            socket.emit('callback', {action: 'documentLoaded', guid: cookie.guid, documentLocationHref: document.location.href});
            console.log('SENT documentLoaded MESSAGE.');
        }
    } catch (err) {
        console.log('DOCUMENT.READY ERROR' + err);
    }
});

//TODO implement SpookyAction shutdown by inserting div.spookyStop into the DOM.