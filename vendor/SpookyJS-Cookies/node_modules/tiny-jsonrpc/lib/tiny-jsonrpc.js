;(function (factory) {
    var requireBase = '.';
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.

        // PhantomJS support
        requireBase = typeof phantom !== 'undefined' && phantom.requireBase ?
            phantom.requireBase + '/tiny-jsonrpc/lib' :
            requireBase;

        module.exports = factory(
            require(requireBase + '/tiny-jsonrpc/client'),
            require(requireBase + '/tiny-jsonrpc/stream-client'),
            require(requireBase + '/tiny-jsonrpc/server'),
            require(requireBase + '/tiny-jsonrpc/stream-server'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            './tiny-jsonrpc/client', './tiny-jsonrpc/stream-client',
            './tiny-jsonrpc/server', './tiny-jsonrpc/stream-server'
        ], factory);
    }
}(function (Client, StreamClient, Server, StreamServer) {
    return {
        Client: Client,
        StreamClient: StreamClient,
        Server: Server,
        StreamServer: StreamServer
    };
}));
