var Server = require('../lib/tiny-jsonrpc').Server;
var expect = require('expect.js');

describe('Server.provides', function () {
    it('returns true if the server provides the passed method', function () {
        var server = new Server();

        server.provide(function foo() {});

        expect(server.provides('foo')).to.be(true);
    });

    it('returns false if the server does not provide the passed method',
        function () {
            var server = new Server();

            expect(server.provides('fiz')).to.be(false);

            server.provide(function foo() {});

            expect(server.provides('frob')).to.be(false);
        });

    it('returns all methods the server provides if called without arguments',
        function () {
            var server = new Server();

            server.provide(function foo() {},
                function fiz() {},
                function frob() {});

            expect(server.provides()).to.eql(['foo', 'fiz', 'frob']);
        });
});
