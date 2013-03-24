var Server = require('../lib/tiny-jsonrpc').Server;
var expect = require('expect.js');

describe('Server.provide', function () {
    it('registers functions as JSON-RPC methods if named', function () {
        var server = new Server();
        var called = {};

        server.provide(function foo() { called.foo = true; });
        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'foo'
        }));

        expect(called.foo).to.be(true);

        server.provide(
            function fiz() { called.fiz = true; },
            function frob() { called.frob = true; });

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'fiz'
        }));

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'frob'
        }));

        expect(called.fiz).to.be(true);
        expect(called.frob).to.be(true);
    });

    it('throws if passed an anonymous function', function () {
        var server = new Server();

        expect(function () { server.provide(function () { }) }).to.throwError();
        expect(function () { server.provide(function foo() {}, function () { }) }).to.throwError();
    });

    it('registers methods of objects as JSON-RPC methods', function () {
        var server = new Server();
        var called = {};

        server.provide({ foo: function () { called.foo = true; } });
        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'foo'
        }));

        expect(called.foo).to.be(true);

        server.provide({
            fiz: function () { called.fiz = true; },
            wiz: function () { called.wiz = true; }
        }, {
            frob: function () { called.frob = true; }
        });

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'fiz'
        }));

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'wiz'
        }));

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 4,
            method: 'frob'
        }));

        expect(called.fiz).to.be(true);
        expect(called.wiz).to.be(true);
        expect(called.frob).to.be(true);
    });

    it('allows functions and objects in the same call', function () {
        var server = new Server();
        var called = {};

        server.provide({
            foo: function () { called.foo = true; }
        }, function fiz() { called.fiz = true; });

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'foo'
        }));

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'fiz'
        }));

        expect(called.foo).to.be(true);
        expect(called.fiz).to.be(true);
    });

    it('throws when passed a duplicate name', function () {
        var server = new Server();
        function fn1() {};
        function fn2() {};

        expect(function () {
            server.provide(function foo() { }, function foo() { });
        }).to.throwError();

        expect(function () {
            server.provide({ foo: fn1 }, { foo: fn2 });
        }).to.throwError();

        expect(function () {
            server.provide({ foo: fn1 }, function foo() {});
        }).to.throwError();

        server.provide(function foo() {});
        expect(function () {
            server.provide(function foo() { });
        }).to.throwError();
        expect(function () {
            server.provide({ foo: fn1 });
        }).to.throwError();
    });

    it('registers no methods if any cause it to throw', function () {
        var server = new Server();
        var called = {};

        try {
            server.provide(function foo() { called.foo = true; },
                function () {});
        } catch (e) {}

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'foo'
        }));

        expect(called.foo).not.to.be(true);
    });

    it('marshals named arguments', function () {
        var server = new Server();
        var called = false;

        server.provide(function foo(bar, baz) {
            expect(bar).to.be(void undefined);
            expect(baz).to.be(23);
            called = true;
        });

        server.respond(JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'foo',
            params: {
                baz: 23,
                biz: 42
            }
        }));

        expect(called).to.be(true);
    });
});
