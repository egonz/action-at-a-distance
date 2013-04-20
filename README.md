# ActionAtADistance

A socket based Javascript screen scraping NodeJS module. Static and dynamic Ajax pages can be scraped on the client (in a Browser), or on the server using Node.js.

### How does it work?

Communication occurs through Socket.io, which is automagically injected into every remote nonlocal page; loaded in a headless PhantomJS browser on the server.

Remote nonlocal pages are sent Javascript (through Socket.io), and the local client receives results through the same socket; whether in the browser or on the server. Results can be sent asynchronously as they appear on the nonlocal page; see the Twitter demo.


## Install

    npm install action-at-a-distance

### Prerequisites

* Node.js
* PhantomJS
* CasperJS
* JQuery (if using the client API)

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

    <script src="/action-at-a-distance.js"></script>

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


    googleActionAtADistance.init(function() {
        onConnect();
    });

    googleActionAtADistance.onDocumentLoaded(function(documentLocationHref) {
        loadSpookyAction(documentLocationHref);
    });

    googleActionAtADistance.onEvaluateResponse(function(data) {
        spooky = data.result;
    });

    function onConnect() {
        googleActionAtADistance.onConnect(function() {
            googleActionAtADistance.start(startUrl);
        });
    }

    function loadSpookyAction(documentLocationHref) {
        if (documentLocationHref === 'http://www.google.com') {
            googleActionAtADistance.evaluate({action: spookyActions[0]});
        } else if (documentLocationHref !== 'http://www.google.com') {
            googleActionAtADistance.evaluate({action: spookyActions[1]});
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
            console.log('Evaluate result: ' + JSON.stringify(data.result));
        }
    });

### ActionAtADistnace Optional Parameters

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
    ActionAtADistance(app, port, clientScripts, cookieFile, customCasperScript, server)

Custom CasperJS scripts can be injected into the GhostProtocol script (my module that replaces SpookyJS). Scripts
can have any plain Javascript code, can use console.log, execute Casper commands, and even load other Javascript
files using require('/full/path/to/js/file').

## Using an existing Express listener:

Rather than listening on port 1313, you can initialize Action-At-A-Distance utilize
an existing Express server.

    var actionAtADistance = new ActionAtADistance(app, undefined, undefined, undefined, undefined, server);

## Demos

Included demos are built with [Yeoman Express-Stack](https://github.com/yeoman/yeoman/tree/express-stack) and AngularJS. To
run the demos follow these steps:

1. Install Yeoman Express-Stack
2. git clone https://github.com/egonz/action-at-a-distance.git; cd $_
2. npm install
3. yeomen server

----

## Updates

4-6-13

Action-At-A-Distance no longer uses SpookyJS, but has been re-written to use CasperJS directly.
This allows me to better control CasperJS based on the unique requirements of Action-At-A-Distance. 
For instance I can keep the script from exiting until the Socket connection is closed. I can also 
inject custom CasperJS code using the AAAD module now.

4-18-13

Added a new method:

    startAndLogin: function(url, formName, userInputName, passInputName, user, pass)

As an alternative to:

    start: function(url)

I have also added this Node method:

    nodeClientStartAndLogin = function(url, formName, userInputName, passInputName, user, pass);

I've added a new method to the server nonlocal API:

    ActionAtADistance.fireClick(element);

4-19-13

* Added [JQuery Sendkeys](http://bililite.com/blog/2011/01/23/improved-sendkeys/)
* New nonlocal API method:
    
    ActionAtADistnace.simulateMouseClick(element);

* Added nonlocal method:

    ActionAtADistnace.jsonFromNodes(nodes);

----

## TODO

### Client API

Add html2canvas. Save canvas to PNG. Return URL.

### Server API

* Change "start" action to "open". The first "open" action should result in start. Any additional "open" actions should exit the current GhostProtocol thread and create a new one.

### Client Demo

## License

Action-At-A-Distance is licensed under the MIT license ([MIT_LICENSE.txt](https://github.com/egonz/action-at-a-distance/blob/master/MIT_LICENSE.txt)).

Copyright (c) 2013 Eddie Gonzales