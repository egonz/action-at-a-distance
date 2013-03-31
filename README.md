# ActionAtADistance

A socket based Javascript screen scraping NodeJS module.

Use [Socket.io](http://socket.io) to drive [CasperJS](http://casperjs.org/). 
Execute Javascript in a nonlocal page, and return nodes and parse them locally.


## Install


## Demos

Includes demos built with [Yeoman Express-Stack](https://github.com/yeoman/yeoman/tree/express-stack) and AngularJS. To
run the demos: 

1. Install Yeoman Express-Stack
2. git clone https://github.com/egonz/action-at-a-distance.git; cd $_
2. npm install
3. yeomen server

## NodeJS

	var ActionAtADistance = require('action-at-a-distance');
    var actionAtADistance = new ActionAtADistance();

    actionAtADistance.start();

    //A callback that can be initiated on the client using the nonlocal call save(data);
    actionAtADistance.on('save', function(data) {
        console.log('PROCESS SAVE ' + data);
    });

    ...

    actionAtADistance.stop();

## Clientside Javascript

JQuery, [LiveQuery](https://github.com/brandonaaron/livequery), and [html2canvas](http://html2canvas.hertzen.com/) (TODO) are injected into each page that are loaded. LiveQuery allows for processing of DOM elements loaded asynchronously adfter the page loads. html2canvas adds support for taking screen shots after page loads.

[JsonML](https://github.com/mckamey/jsonml/) has been added for serializing the DOM to a datastore (e.g. Mongodb).

Example:

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


## TODO

* Switch to using SpookyCookies.
* Integrate SockMonkey.js

### Client API

Add html2canvas. Save canvas to PNG. Return URL.

### Server API

### Client Demo

### Completed Client API

* Save URL and on load of the Controller check if the URL is different, and if so send disconnect,
  and start messages.

* Develop client API to encapsulate the Socket.io protocol.

### Completed Server API

* Create a cookie and store the UUID.
	* Use https://github.com/carhartl/jquery-cookie
* Create an onload page listener.
	* Emit a Socket.io event indicating the URL has changed. Use the UUID stored in the actionatadistanceCookie.