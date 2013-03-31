;(function (root, factory) {
    var requireBase = '.';

    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.

        // PhantomJS support
        requireBase = typeof phantom !== 'undefined' && phantom.requireBase ?
            phantom.requireBase + '/tiny-jsonrpc/lib/tiny-jsonrpc' :
            requireBase;

        module.exports = factory(require(requireBase + '/client'),
            require(requireBase + '/util'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./client', './util'], factory);
    } else {
        // Browser globals
        root.tinyJsonRpc = root.tinyJsonRpc || {};
        root.tinyJsonRpc.StreamClient =
            factory(tinyJsonRpc.Client, tinyJsonRpc.util);
    }
}(this, function (Client, util) {
    function StreamClient(options) {
        options.server = {
            stream: options.server,
            buffer: [],
            full: false
        };
        Client.apply(this, arguments);

        this._callbacks = {};

        this._server.stream.on('data', this._onData.bind(this));
        this._server.stream.on('drain', this._onDrain.bind(this));
    }

    StreamClient.prototype = new Client({
        server: true
    });
    StreamClient.prototype.constructor = StreamClient;

    StreamClient.prototype._send = function (request) {
        var success;

        if (this._server.full) {
            this._server.buffer.push(request);
        } else {
            try {
                request = JSON.stringify(request);
            } catch (e) {
                throw 'Could not serialize request to JSON';
            }

            this._server.full = !this._server.stream.write(request);
        }
    };

    StreamClient.prototype.request = function () {
        var request = this._makeRequest.apply(this, arguments);
        var callback;
        var response;

        request.id = this._nextId++;

        if (request.callback) {
            callback = request.callback
            delete request.callback;
        } else if (util.isArray(request.params) &&
            util.isFunction(request.params[request.params.length - 1])
        ) {
            callback = request.params.pop();
        }

        this._send(request);

        if (callback && util.isNumber(request.id)) {
            this._callbacks[request.id] = callback;
        }
    };

    StreamClient.prototype._onData = function (response) {
        response = JSON.parse(response);

        if (!util.isUndefined(response.id) && this._callbacks[response.id]) {
            this._callbacks[response.id](response.error || null,
                response.result || null);
            delete this._callbacks[response.id];
        }
    };

    StreamClient.prototype._onDrain = function (request) {
        var buffer = this._server.buffer.slice().reverse();

        this._server.full = false;
        while (buffer.length > 0) {
            this._send(buffer.pop());
        }
    };

    return StreamClient;
}));
