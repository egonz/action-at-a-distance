var Client = require('../lib/tiny-jsonrpc').Client;
var Server = require('../lib/tiny-jsonrpc').Server;
var expect = require('expect.js');
var sinon = require('sinon');

describe('Client.notify', function () {
    var server = new Server();

    server.provide(function echo (what) {
        return what;
    });

    function expectValidNotification(request) {
        expect(request.jsonrpc).to.be('2.0');
        expect(request.id).to.be(void undefined);
    }

    describe('throws an error when', function () {
        it('no method is specified', function () {
            var client = new Client({
                server: server
            });

            expect(function () {
                client.notify();
            }).to.throwError(/Method must be a string/);

            expect(function () {
                client.notify({});
            }).to.throwError(/Method must be a string/);
        });

        it('method is not a string', function () {
            var client = new Client({
                server: server
            });
            var methods = [null, {}, [], 23, false];

            for (var i = 0; i < methods.length; i++) {
                expect(function () {
                    client.notify(methods[i]);
                }).to.throwError(/Method must be a string/);

                expect(function () {
                    client.notify({
                        method: methods[i]
                    });
                }).to.throwError(/Method must be a string/);
            }
        });

        it('request parameters cannot be serialized to JSON', function () {
            var client = new Client({
                server: server
            });
            var circular = {};
            circular.link = circular;

            expect(function () {
                client.notify('echo', circular);
            }).to.throwError(/Could not serialize request to JSON/);

            expect(function () {
                client.notify({
                    method: 'echo',
                    params: [ circular ]
                });
            }).to.throwError(/Could not serialize request to JSON/);
        });

        it('request.params is present, but not an object or array',
            function () {
                var client = new Client({
                    server: server
                });
                var params = ['', false, true, null, 0, 42];

                for (var i = 0; i < params.length; i++) {
                    expect(function () {
                        client.notify({
                            method: 'echo',
                            params: params[i]
                        });
                    }).to.throwError(/Params must be an object or array/);
                }
            });
    });

    describe('upon a valid notification', function () {
        beforeEach(function () {
            sinon.spy(server, 'respond');
        });

        afterEach(function () {
            server.respond.restore();
        });


        it('sends a valid notification to the server', function () {
            var client = new Client({
                server: server
            });

            client.notify('echo', 'marco');

            sinon.assert.calledOnce(server.respond);
            expect(server.respond.firstCall.args.length).to.be(1);
            var request = JSON.parse(server.respond.firstCall.args[0]);

            expectValidNotification(request);
            expect(request.method).to.be('echo');
            expect(request.params).to.eql(['marco']);

            server.respond.reset();
            client.notify({
                method: 'echo',
                params: ['marco']
            });

            sinon.assert.calledOnce(server.respond);
            expect(server.respond.firstCall.args.length).to.be(1);
            var request = JSON.parse(server.respond.firstCall.args[0]);

            expectValidNotification(request);
            expect(request.method).to.be('echo');
            expect(request.params).to.eql(['marco']);
        });

        it('does not accept a callback', function () {
            var client = new Client({
                server: server
            });

            var callback = sinon.spy();
            client.notify('echo', 'marco', callback);

            expect(callback.called).to.be(false);

            expect(server.respond.firstCall.args.length).to.be(1);
            var request = JSON.parse(server.respond.firstCall.args[0]);

            expect(request.method).to.be('echo');
            expect(request.params).to.eql(['marco', null]);

            callback.reset()
            server.respond.reset();
            client.notify({
                method: 'echo',
                params: ['marco'],
                callback: callback
            });

            expect(callback.called).to.be(false);

            expect(server.respond.firstCall.args.length).to.be(1);
            var request = JSON.parse(server.respond.firstCall.args[0]);

            expect(request.method).to.be('echo');
            expect(request.params).to.eql(['marco']);
        });
    });
});
