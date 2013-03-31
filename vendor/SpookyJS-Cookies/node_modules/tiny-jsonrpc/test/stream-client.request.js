var StreamClient = require('../lib/tiny-jsonrpc').StreamClient;
var Client = require('../lib/tiny-jsonrpc').Client;
var Server = require('../lib/tiny-jsonrpc').Server;
var EventEmitter = require('events').EventEmitter;
var expect = require('expect.js');
var sinon = require('sinon');

describe('StreamClient.request', function () {
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
            var stream = new EventEmitter();
            var client = new StreamClient({
                server: stream
            });

            expect(function () {
                client.request();
            }).to.throwError(/Method must be a string/);

            expect(function () {
                client.request({});
            }).to.throwError(/Method must be a string/);
        });

        it('method is not a string', function () {
            var stream = new EventEmitter();
            var client = new StreamClient({
                server: stream
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
            var stream = new EventEmitter();
            var client = new StreamClient({
                server: stream
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
                var stream = new EventEmitter();
                var client = new StreamClient({
                    server: stream
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
        it('sends a valid request to the server', function () {
            var stream = new EventEmitter();
            stream.write = sinon.stub().returns(true);

            var client = new StreamClient({
                server: stream
            });

            client.request('echo', 'marco');

            sinon.assert.calledOnce(stream.write);
            expect(stream.write.firstCall.args.length).to.be(1);
            var request = JSON.parse(stream.write.firstCall.args[0]);

            expectValidRequest(request);
            expect(request.method).to.be('echo');
            expect(request.params).to.eql(['marco']);

            stream.write.reset();
            client.request({
                method: 'echo',
                params: ['marco']
            });

            sinon.assert.calledOnce(stream.write);
            expect(stream.write.firstCall.args.length).to.be(1);
            var request = JSON.parse(stream.write.firstCall.args[0]);

            expectValidRequest(request);
            expect(request.method).to.be('echo');
            expect(request.params).to.eql(['marco']);
        });

        it('respects backoff signals when writing', function () {
            var stream = new EventEmitter();
            stream.write = sinon.stub().returns(true);

            var client = new StreamClient({
                server: stream
            });

            stream.write = sinon.stub();
            stream.write.returns(false);

            client.request('echo', 'marco');

            sinon.assert.calledOnce(stream.write);
            sinon.assert.calledWith(stream.write, JSON.stringify({
                jsonrpc: '2.0',
                method: 'echo',
                params: ['marco'],
                id: 0
            }));

            stream.write.reset();

            client.request('echo', 'marco');
            client.request('echo', 'marco');

            sinon.assert.notCalled(stream.write);

            stream.write.returns(true);
            stream.emit('drain');

            sinon.assert.calledTwice(stream.write);

            expect(stream.write.firstCall.calledWith(JSON.stringify({
                jsonrpc: '2.0',
                method: 'echo',
                params: ['marco'],
                id: 1
            }))).to.be(true);

            expect(stream.write.secondCall.calledWith(JSON.stringify({
                jsonrpc: '2.0',
                method: 'echo',
                params: ['marco'],
                id: 2
            }))).to.be(true);
        });
    });

    describe('upon a data event', function () {
        it('calls the user callback with a result', function () {
            var stream = new EventEmitter();
            var client = new StreamClient({
                server: stream
            });
            var callback = sinon.spy();

            stream.write = sinon.spy();
            
            client.request('echo', 'marco', callback);

            var id = JSON.parse(stream.write.firstCall.args[0]).id;
            stream.emit('data', JSON.stringify({
                jsonrpc: '2.0',
                id: id,
                result: 'polo'
            }));

            sinon.assert.calledOnce(callback);
            sinon.assert.calledWithExactly(callback, null, 'polo');
        });

        it('calls the user callback with an error', function () {
            var stream = new EventEmitter();
            var client = new StreamClient({
                server: stream
            });
            var callback = sinon.spy();

            stream.write = sinon.spy();
            
            client.request('echo', 'marco', callback);

            var id = JSON.parse(stream.write.firstCall.args[0]).id;
            stream.emit('data', JSON.stringify({
                jsonrpc: '2.0',
                id: id,
                error: 'DOH!'
            }));

            sinon.assert.calledOnce(callback);
            sinon.assert.calledWithExactly(callback, 'DOH!', null);
        });
    });

});
