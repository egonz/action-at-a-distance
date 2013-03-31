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

        module.exports = factory(require(requireBase + '/server'),
            require(requireBase + '/util'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./server', './util'], factory);
    } else {
        // Browser globals
        root.tinyJsonRpc = root.tinyJsonRpc || {};
        root.tinyJsonRpc.StreamServer =
            factory(tinyJsonRpc.Server, tinyJsonRpc.util);
    }
}(this, function (Server, util) {
    function StreamServer(options) {
        Server.apply(this, arguments);
        this._streams = [];
    }

    StreamServer.prototype = new Server();
    StreamServer.prototype.constructor = StreamServer;

    StreamServer.prototype._write = function (stream, what) {
        var success;

        if (stream.full) {
            stream.buffer.push(what);
        } else {
            stream.full = !stream.stream.write(what);
        }
    };

    StreamServer.prototype.listen = function () {
        var args = util.toArray(arguments);

        args.forEach(function (stream) {
            var streamRecord = {
                stream: stream,
                buffer: []
            };

            streamRecord.onData = this._onData.bind(this, streamRecord);
            stream.on('data', streamRecord.onData);

            streamRecord.onDrain = this._onDrain.bind(this, streamRecord);
            stream.on('drain', streamRecord.onDrain);

            this._streams.push(streamRecord);
        }, this);
    };

    StreamServer.prototype._onData = function (stream, request) {
        var result = this.respond(request);

        if (typeof result === 'string') {
            this._write(stream, result);
        }
    };

    StreamServer.prototype._onDrain = function (stream, request) {
        var buffer = stream.buffer.slice().reverse();

        stream.full = false;
        while (buffer.length > 0) {
            this._write(stream, buffer.pop());
        }
    };

    return StreamServer;
}));
