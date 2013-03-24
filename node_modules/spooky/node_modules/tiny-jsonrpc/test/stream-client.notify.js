var StreamClient = require('../lib/tiny-jsonrpc').StreamClient;
var Client = require('../lib/tiny-jsonrpc').Client;
var Server = require('../lib/tiny-jsonrpc').Server;
var EventEmitter = require('events').EventEmitter;
var expect = require('expect.js');
var sinon = require('sinon');

describe('StreamClient.notify', function () {
    var server = new Server();

    server.provide(function echo (what) {
        return what;
    });

    function expectValidNotification(request) {
        expect(request.jsonrpc).to.be('2.0');
        expect(request.id).to.be(void undefined);
    }

    describe('upon a valid notification', function () {
        it('sends a valid notification to the server', function () {
            var stream = new EventEmitter();
            stream.write = sinon.stub().returns(true);

            var client = new StreamClient({
                server: stream
            });

            client.notify('echo', 'marco');

            sinon.assert.calledOnce(stream.write);
            expect(stream.write.firstCall.args.length).to.be(1);
            var request = JSON.parse(stream.write.firstCall.args[0]);

            expectValidNotification(request);
            expect(request.method).to.be('echo');
            expect(request.params).to.eql(['marco']);

            stream.write.reset();
            client.notify({
                method: 'echo',
                params: ['marco']
            });

            sinon.assert.calledOnce(stream.write);
            expect(stream.write.firstCall.args.length).to.be(1);
            var request = JSON.parse(stream.write.firstCall.args[0]);

            expectValidNotification(request);
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

            client.notify('echo', 'marco');

            sinon.assert.calledOnce(stream.write);
            sinon.assert.calledWith(stream.write, JSON.stringify({
                jsonrpc: '2.0',
                method: 'echo',
                params: ['marco']
            }));

            stream.write.reset();

            client.notify('echo', 'marco');
            client.notify('echo', 'marco');

            sinon.assert.notCalled(stream.write);

            stream.write.returns(true);
            stream.emit('drain');

            sinon.assert.calledTwice(stream.write);

            expect(stream.write.firstCall.calledWith(JSON.stringify({
                jsonrpc: '2.0',
                method: 'echo',
                params: ['marco']
            }))).to.be(true);

            expect(stream.write.secondCall.calledWith(JSON.stringify({
                jsonrpc: '2.0',
                method: 'echo',
                params: ['marco']
            }))).to.be(true);
        });
    });
});
