var StreamClient = require('../lib/tiny-jsonrpc').StreamClient;
var Client = require('../lib/tiny-jsonrpc').Client;
var expect = require('expect.js');

describe('StreamClient instances', function () {
    var mockStream = { on: function () {} };

    it('are instances of Client', function () {
        var client = new StreamClient({
            server: mockStream
        });
        expect(client).to.be.a(Client);
    });

    it('provide a request method', function () {
        var client = new StreamClient({
            server: mockStream
        });
        expect(client.request instanceof Function).to.be(true);
    });

    it('inherit a notify method', function () {
        var client = new StreamClient({
            server: mockStream
        });
        expect(client.notify).to.be(Client.prototype.notify);
    });
});

