var Client = require('../lib/tiny-jsonrpc').Client;
var expect = require('expect.js');

describe('Client instances', function () {
    it('provide a request method', function () {
        var client = new Client({
            server: true
        });
        expect(client.request instanceof Function).to.be(true);
    });

    it('provide a notify method', function () {
        var client = new Client({
            server: true
        });
        expect(client.notify instanceof Function).to.be(true);
    });
});

