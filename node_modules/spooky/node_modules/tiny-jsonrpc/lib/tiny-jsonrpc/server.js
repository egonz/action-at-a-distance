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
        root.tinyJsonRpc.Server = factory(tinyJsonRpc.util);
    }
}(this, function (util) {
    var defaultConfig = {};

    function Server(options) {
        this.options = options =
            util.clone(util.defaults(options || {}, defaultConfig));

        this._methods = {};
    }

    Server.prototype.errors = {
        PARSE_ERROR: -32700,
        INVALID_REQUEST: -32600,
        METHOD_NOT_FOUND: -32601,
        INVALID_PARAMS: -32602,
        INTERNAL_ERROR: -32603
    };

    // TODO: real error messages here
    Server.prototype.errorMessages = (function () {
        var msgs = {};
        var errs = Server.prototype.errors;
        for (var k in errs) {
            msgs[errs[k]] = k;
        }
        return msgs;
    }());

    function parseArgs(args) {
        args = args.split(/,\s*/);
        var result = {};

        for (var i = 0; i < args.length; i++) {
            result[args[i]] = i;
        }

        return result;
    }

    function functionSnippet(fn) {
        return fn.toString().slice(0, 20) + '...';
    }

    function parseFunction(fn) {
        var parsed = fn.toString().match(/function\s+(\w+)?\((.*)\)/);

        if (!parsed) {
            throw 'Cannot parse function: ' + functionSnippet(fn);
        }

        return {
            fn: fn,
            name: parsed[1],
            args: parseArgs(parsed[2])
        };
    }

    Server.prototype._provide = function (toProvide, fn, name) {
        var fnRecord = parseFunction(fn);

        fnRecord.name = name || fnRecord.name;

        if (!fnRecord.name) {
            throw 'Cannot provide anonymous function: ' + functionSnippet(fn);
        }

        if (this._methods[fnRecord.name] || toProvide[fnRecord.name]) {
            throw 'Cannot provide duplicate function ' + fnRecord.name;
        }

        toProvide[fnRecord.name] = fnRecord;
    };

    Server.prototype.provide = function () {
        var args = util.toArray(arguments);
        var toProvide = {};
        var method;

        args.forEach(function (x) {
            if (util.isFunction(x)) {
                method = this._provide(toProvide, x);
            } else if (util.isObject(x)) {
                for (var k in x) {
                    if (util.isFunction(x[k])) {
                        this._provide(toProvide, x[k], k);
                    }
                }
            } else {
                throw 'Cannot provide illegal argument: ' + x;
            }
        }, this);

        util.merge(this._methods, toProvide);
    };

    Server.prototype.revoke = function () {
        var args = util.toArray(arguments);

        for (var i = 0; i < args.length; i++) {
            delete this._methods[args[i]];
        }
    };

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

    Server.prototype.provides = function (method) {
        if (util.isUndefined(method)) {
            return keys(this._methods);
        }

        return this._methods.hasOwnProperty(method);
    };

    Server.prototype.makeError = function(id, message, code, data) {
        var error;
        var response;

        if (util.isNumber(message)) {
            data = code;
            code = message;
            message = this.errorMessages[code];
        }

        if (!util.isNumber(code)) {
            code = this.errors.INTERNAL_ERROR;
        }

        error = { id: id, code: code, message: message };

        if (!util.isUndefined(data)) {
            error.data = data;
        }

        if (util.isNumber(id) || util.isString(id) || id === null) {
            response = {
                jsonrpc: '2.0',
                id: id
            };
            response.error = error;
            return response;
        } else {
            response = new Error(message);
            response.code = code;

            if (!util.isUndefined(data)) {
                response.data = data;
            }

            return response;
        }
    };

    Server.prototype.makeResponse = function (id, result) {
        var response = {
            jsonrpc: '2.0',
            id: id,
            result: result
        };

        return util.isString(id) || util.isNumber(id) || id === null ?
            response : null;
    };

    /**
     * Transform named arguments to an args array
     *
     * Missing args are undefined.
     */
    function marshal(params, method) {
        var result = [];

        if (util.isArray(params)) {
            result = params;
        } else if (params) {
            for (var k in params) {
                if (util.isNumber(method.args[k])) {
                    result[method.args[k]] = params[k];
                }
            }
        }

        return result;
    }

    Server.prototype.respond = function (request) {
        var code, response, results;

        // parse the payload
        try {
            request = JSON.parse(request, this.options.reviver);
        } catch (e) {
            return JSON.stringify(
                this.makeError(null, this.errors.PARSE_ERROR, e));
        }

        // is it a batch request?
        if (util.isArray(request)) {
            if (request.length < 1) {
                // empty batch requests are invalid
                return JSON.stringify(
                    this.makeError(null, this.errors.INVALID_REQUEST));
            }

            results = [];
            for (var i = 0; i < request.length; i++) {
                response = this._respond(request[i]);

                if (response !== null && !(response instanceof Error)) {
                    // if it's an actual response, send it
                    results.push(response);
                }
            }

            if (results.length < 1) {
                // don't respond if everything was notifications
                results = null;
            }
        } else {
            results = this._respond(request);
        }

        return results !== null && !(results instanceof Error) ?
            JSON.stringify(results) : results;
    };

    Server.prototype._respond = function (request) {
        var code;

        if (!util.isUndefined(request.id) &&
            !util.isNull(request.id) &&
            !util.isString(request.id) &&
            !util.isNumber(request.id)
        ) {
            return this.makeError(null, this.errors.INVALID_REQUEST);
        }

        // is it a valid request?
        if (request.jsonrpc !== '2.0' ||
            !util.isString(request.method) ||
            (
                !util.isUndefined(request.params) &&
                !util.isArray(request.params) &&
                !util.isObject(request.params)
            )
        ) {
            return this.makeError(util.isUndefined(request.id) ?
                null : request.id,
                this.errors.INVALID_REQUEST);
        }

        // coolbro. handle it.
        var method = this._methods[request.method];
        if (!method) {
            return this.makeError(request.id, this.errors.METHOD_NOT_FOUND);
        }

        try {
            return this.makeResponse(request.id,
                method.fn.apply(null, marshal(request.params, method))
            );
        } catch (e) {
            code = util.isNumber(e.code) ? e.code : this.errors.INTERNAL_ERROR;

            return this.makeError(request.id, e.message || e, e.code, e.data);
        }
    };

    return Server;
}));
