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

        module.exports = factory(require(requireBase + '/util'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./util'], factory);
    } else {
        // Browser globals
        root.tinyJsonRpc = root.tinyJsonRpc || {};
        root.tinyJsonRpc.Client = factory(tinyJsonRpc.util);
    }
}(this, function (util) {
    var defaultConfig = {};

    function Client(options) {
        this.options = options =
            util.clone(util.defaults(options || {}, defaultConfig));

        if (!options.server) {
            throw 'The server config option is required';
        }

        this._server = options.server;
        this._nextId = 0;
    }

    Client.prototype._makeRequest = function () {
        var method, params, callback, id;
        var args = Array.prototype.slice.call(arguments);
        var lastArg = args.length - 1;
        var request = {
            jsonrpc: '2.0'
        };

        if (util.isObject(args[0]) &&
            !util.isUndefined(args[0]) && !util.isNull(args[0])
        ) {
            // called with a config object
            method = args[0].method;
            params = args[0].params;
            request.callback = args[0].callback;
        } else {
            // called with a method name and optional params and callback
            method = args[0];
            params = args.slice(1);
        }

        if (!util.isString(method)) {
            throw 'Method must be a string';
        }

        if (params === null ||
            (!util.isArray(params) && !util.isObject(params))
        ) {
            throw 'Params must be an object or array';
        }

        request.method = method;
        if (params) {
            request.params = params;
        }

        return request;
    };

    Client.prototype._send = function (request) {
        try {
            request = JSON.stringify(request);
        } catch (e) {
            throw 'Could not serialize request to JSON';
        }

        return JSON.parse(this._server.respond(request));
    };

    Client.prototype.request = function () {
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

        response = this._send(request);

        if (callback) {
            callback(response.error || null, response.result || null);
        }
    };

    Client.prototype.notify = function () {
        var request = this._makeRequest.apply(this, arguments);

        delete request.callback;

        this._send(request);
    };

    function parseArgs(args) {
        args = args.split(/,\s*/);
        var result = {};

        for (var i = 0; i < args.length; i++) {
            result[args[i]] = i;
        }

        return result;
    }

    function keys(o) {
        if (Object.prototype.keys) {
            return o.keys();
        }

        var result = [];
        for (var k in o) {
            if (o.hasOwnProperty(k)) {
                result.push(k);
            }
        }

        return result;
    }

    return Client;
}));
