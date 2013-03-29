# ActionAtADistance

Use [Socket.io](http://socket.io) to drive [CasperJS](http://casperjs.org/).

## TODO

### Client API

### Server API

* Create a Mongo Socket.io API.

### Client Demo

* Save URL and on load of the Controller check if the URL is different, and if so send disconnect,
  and start messages.

### Completed Client API

* Develop client API to encapsulate the Socket.io protocol.

### Completed Server API

* Create a cookie and store the UUID.
	* Use https://github.com/carhartl/jquery-cookie
* Create an onload page listener.
	* Emit a Socket.io event indicating the URL has changed. Use the UUID stored in the actionatadistanceCookie.