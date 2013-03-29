# ActionAtADistance

A socket based Javascript screen scraping NodeJS module.

Use [Socket.io](http://socket.io) to drive [CasperJS](http://casperjs.org/). 
Execute Javascript in a non-local page, and return nodes and parse them locally.

## TODO

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