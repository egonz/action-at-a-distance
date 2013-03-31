var Client = require('../lib/tiny-jsonrpc').Client;
var Server = require('../lib/tiny-jsonrpc').Server;
var expect = require('expect.js');
var sinon = require('sinon');

describe('Client.request', function () {
    var server = new Server();

    server.provide(function echo (what) {
        return what;
    });

    function expectValidRequest(request) {
        expect(request.jsonrpc).to.be('2.0');
        expect(request.id).to.be.a('number');
    }

    describe('throws an error when', function () {
        it('no method is specified', function () {
            var client = new Client({
                server: server
            });

            expect(function () {
                client.request();
            }).to.throwError(/Method must be a string/);

            expect(function () {
                client.request({});
            }).to.throwError(/Method must be a string/);
        });

        it('method is not a string', function () {
            var client = new Client({
                server: server
            });
            var methods = [null, {}, [], 23, false];

            for (var i = 0; i < methods.length; i++) {
                expect(function () {
                    client.request(methods[i]);
                }).to.throwError(/Method must be a string/);

                expect(function () {
                    client.request({
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
                client.request('echo', circular);
            }).to.throwError(/Could not serialize request to JSON/);

            expect(function () {
                client.request({
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
                        client.request({
                            method: 'echo',
                            params: params[i]
                        });
                    }).to.throwError(/Params must be an object or array/);
                }
            });
    });

    describe('upon a valid request', function () {
        beforeEach(function () {
            sinon.spy(server, 'respond');
        });

        afterEach(function () {
            server.respond.restore();
        });

        it('sends a valid request to the server', function () {
            var client = new Client({
                server: server
            });

            client.request('echo', 'marco');

            sinon.assert.calledOnce(server.respond);
            expect(server.respond.firstCall.args.length).to.be(1);
            var request = JSON.parse(server.respond.firstCall.args[0]);

            expectValidRequest(request);
            expect(request.method).to.be('echo');
            expect(request.params).to.eql(['marco']);

            server.respond.reset();
            client.request({
                method: 'echo',
                params: ['marco']
            });

            sinon.assert.calledOnce(server.respond);
            expect(server.respond.firstCall.args.length).to.be(1);
            var request = JSON.parse(server.respond.firstCall.args[0]);

            expectValidRequest(request);
            expect(request.method).to.be('echo');
            expect(request.params).to.eql(['marco']);
        });

        it('calls the provided callback with the error', function () {
            var client = new Client({
                server: server
            });

            server.provide(function fail () {
                throw 'DOH!';
            });
            var callback = sinon.spy();
            client.request('fail', 'marco', callback);

            sinon.assert.calledOnce(callback);
            expect(callback.firstCall.args.length).to.be(2);
            expect(callback.firstCall.args[0].message).to.be('DOH!');
            expect(callback.firstCall.args[1]).to.be(null);

            callback.reset();
            client.request({
                method: 'fail',
                params: ['marco'],
                callback: callback
            });

            sinon.assert.calledOnce(callback);
            expect(callback.firstCall.args.length).to.be(2);
            expect(callback.firstCall.args[0].message).to.be('DOH!');
            expect(callback.firstCall.args[1]).to.be(null);
        });

        it('calls the provided callback with the result', function () {
            var client = new Client({
                server: server
            });

            var callback = sinon.spy();
            client.request('echo', 'marco', callback);

            sinon.assert.calledOnce(callback);
            expect(callback.firstCall.args.length).to.be(2);
            expect(callback.firstCall.args[0]).to.be(null);
            expect(callback.firstCall.args[1]).to.be('marco');

            callback.reset();
            client.request({
                method: 'echo',
                params: ['marco'],
                callback: callback
            });

            sinon.assert.calledOnce(callback);
            expect(callback.firstCall.args.length).to.be(2);
            expect(callback.firstCall.args[0]).to.be(null);
            expect(callback.firstCall.args[1]).to.be('marco');
        });
    });
});
