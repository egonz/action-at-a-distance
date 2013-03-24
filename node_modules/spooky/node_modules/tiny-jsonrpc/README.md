# Tiny JSON-RPC

JavaScript JSON-RPC 2.0 server with no runtime dependencies.

## Installation

Tiny JSON-RPC is available from npm.

``` shell
$ npm install tiny-jsonrpc
```

## Development

### Running the tests

Tiny JSON-RPC includes a suite of unit tests, driven by [Mocha](http://visionmedia.github.com/mocha). To run the tests in node:

``` shell
$ make test
```

To run the tests in the browser:

``` shell
$ make test-browser
```

Then load http://localhost:8080 in your browser.

The following make parameters are supported (defaults are in parentheses):

* `TEST_REPORTER` the [Mocha reporter](http://visionmedia.github.com/mocha/#reporters) to use (dot)
* `TEST_PORT` the port to run the browser test web server on (8080)
* `TEST_TIMEOUT` threshold in ms to timeout a test (4000)
* `TEST_SLOW` threshold in ms to say a test is slow (2000)
* `TEST_ARGS` Additional [arguments](http://visionmedia.github.com/mocha/#usage) to pass through to Mocha
* `TEST_DEBUG` Print debug logging to the console (false)

## License

Tiny JSON-RPC is made available under the [MIT License](http://opensource.org/licenses/mit-license.php).
