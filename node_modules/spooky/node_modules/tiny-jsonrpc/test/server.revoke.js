var Server = require('../lib/tiny-jsonrpc').Server;
var expect = require('expect.js');

describe('Server.revoke', function () {
    it('unregisters named JSON RPC methods', function () {
        var server = new Server();
        var called = {};

        server.provide(function foo() { called.foo = true; });
        server.provide(function fiz() { called.fiz = true; });
        server.revoke('foo');

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'foo'
        }));

        expect(called.foo).to.be(void undefined);
        expect(server.provides('foo')).to.be(false);
        expect(server.provides('fiz')).to.be(true);
    });

    it('ignores non-existent methods', function () {
        var server = new Server();

        expect(function () {
            server.revoke('foo');
        }).to.not.throwError();

        server.provide(function fiz() { called.fiz = true; });

        expect(function () {
            server.revoke('foo', 'foo');
        }).to.not.throwError();
    });
});

