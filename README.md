# ActionAtADistance



## TODO

### Client

### Server

* Create a Mongo Socket.io API.

### Client Demo

* Save URL and on load of the Controller check if the URL is different, and if so send disconnect,
  and start messages.

### Completed

* Create a cookie and store the UUID.
	*Use https://github.com/carhartl/jquery-cookie

* Create an onload page listener.
	* Emit a Socket.io event indicating the URL has changed. Use the UUID stored in the actionatadistanceCookie.