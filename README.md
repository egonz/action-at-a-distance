# ActionAtADistance

A socket based Javascript screen scraping NodeJS module; based on SpookyJS. Static and dynamic Ajax pages can be scraped on the client (in a Browser), or on the server using Node.js.

### How does it work?

Communication occurs through Socket.io, which is automagically injected into every remote nonlocal page; loaded in a headless PhantomJS browser on the server.

Remote nonlocal pages are sent Javascript (through Socket.io), and the local client receives results through the same socket; whether in the browser or on the server. Results can be sent asynchronously as they appear on the nonlocal page; see the Twitter demo.


## Install

    npm install action-at-a-distance

### Prerequisites (the same as SpookyJS)

* Node.js
* PhantomJS
* CasperJS

## NodeJS

	var ActionAtADistance = require('action-at-a-distance');
    var actionAtADistance = new ActionAtADistance();

    actionAtADistance.start();

    // A callback that can be initiated from the nonlocal page using the ActionAtADistance.saveHtmlText(html), 
    // or ActionAtADistance.saveNodes(nodes) methods;
    actionAtADistance.on('save', function(data) {
        console.log('PROCESS SAVE ' + data);
    });
    ...
    actionAtADistance.stop();


## Clientside Javascript

JQuery, [LiveQuery](https://github.com/brandonaaron/livequery), and [html2canvas](http://html2canvas.hertzen.com/) (TODO) are injected into each page that are loaded. LiveQuery allows for processing of DOM elements loaded asynchronously adfter the page loads. html2canvas adds support for taking screen shots after page loads.

[JsonML](https://github.com/mckamey/jsonml/) has been added for serializing the DOM to a datastore (e.g. Mongodb).

### Includes:

    <script src="http://localhost:1313/socket.io/socket.io.js"></script>

    <script src="app/scripts/action-at-a-distance.js"></script>

### Example (from the [Google demo](https://github.com/egonz/action-at-a-distance/blob/master/app/scripts/controllers/spooky/spookyGoogle.js), san AngularJS code):

    spookyActions.push('$(\'input[name="q"]\').val("CASPERJS");' +
        '$(\'button[name="btnK"]\').submit();');
    spookyActions.push('$("h3.r a").livequery(function() { ' +
        'var links=document.querySelectorAll("h3.r a");' +
        'links=Array.prototype.map.call(links,function(e){return e.getAttribute("href")});' +
        'var spookyResult = {data: links};' +
        'ActionAtADistance.saveHtmlText(links);' +
        'ActionAtADistance.sendCallback(spookyResult);' +
        '});');

    googleActionAtADistance.onConnect(function() {
        googleActionAtADistance.start('http://www.google.com');
    });

    googleActionAtADistance.onDocumentLoaded(function(documentLocationHref) {
        loadSpookyAction(documentLocationHref);
    });

    googleActionAtADistance.onEvaluateResponse(function(data) {
        spooky = data.result;
    });

    function loadSpookyAction(documentLocationHref) {
        if (documentLocationHref === 'http://www.google.com') {
            spookyAction = spookyActions[0];
        } else if (documentLocationHref !== 'http://www.google.com') {
            spookyAction = spookyActions[1];
        }
    }


## Node Client

ActionAtADistance can also be used on the server, without a web client.

### Example (from [server/index.html](https://github.com/egonz/action-at-a-distance/blob/master/server/index.js))

    var ActionAtADistance = require('action-at-a-distance');
    ...
    actionAtADistance.addNodeClient();

    actionAtADistance.on('initResp', function (data) {
        console.log('Connected with NodeClient. Assigned UUID ' + data.uuid);
        actionAtADistance.nodeClientStart('http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost');
    });

    actionAtADistance.on('callback', function (data) {
        if (data.action === 'start') {
            console.log('Start Callback. Sending Evaluate...');
            actionAtADistance.nodeClientEvaluate('ActionAtADistance.setSpookyResult({'+
                'data: $("div#mw-content-text").html()});console.log("Hello, from " + document.title);');
        }else if (data.action === 'documentLoaded') {
            console.log('Document loaded: ' + data.documentLocationHref);
        } else if (data.action === 'evaluate') {
            console.log('Evaluate result: ' + data.result);
        }
    });


## Demos

Included demos are built with [Yeoman Express-Stack](https://github.com/yeoman/yeoman/tree/express-stack) and AngularJS. To
run the demos follow these steps:

1. Install Yeoman Express-Stack
2. git clone https://github.com/egonz/action-at-a-distance.git; cd $_
2. npm install
3. yeomen server

----

## TODO

### Client API

Add html2canvas. Save canvas to PNG. Return URL.

### Server API

### Client Demo

Create a page with a URL field for testing random pages.