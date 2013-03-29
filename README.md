# ActionAtADistance

A socket based Javascript screen scraping NodeJS module.

Use [Socket.io](http://socket.io) to drive [CasperJS](http://casperjs.org/). 
Execute Javascript in a non-local page, and return nodes and parse them locally.


## Install


## Demos

Includes demos built with [Yeoman Express-Stack](https://github.com/yeoman/yeoman/tree/express-stack) and AngularJS. To
run the demos: 

1. Install Yeoman Express-Stack
2. git clone https://github.com/egonz/action-at-a-distance.git; cd $_
2. npm install
3. yeomen server

## NodeJS

	var actionatadistance = require('actionatadistance').configure();
	...
	actionatadistance.start();
	...
	actionatadistance.stop();

## Clientside Javascript

	spookyActions.push('var links=document.querySelectorAll("h3.r a");' +
        'links=Array.prototype.map.call(links,function(e){return e.getAttribute("href")});' +
        'var spookyResult = {data: links};');

    actionAtADistance.onConnect(function() {
        actionAtADistance.start('http://www.google.com/search?q=casperjs');
    });

    actionAtADistance.onDocumentLoaded(function(documentLocationHref) {
        spookyAction = spookyActions[0];
    });

    actionAtADistance.onEvaluateResponse(function(data) {
        spooky = data.result;
    });


## TODO

* Switch to using SpookyCookies.
* Integrate SockMonkey.js

### Client API

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