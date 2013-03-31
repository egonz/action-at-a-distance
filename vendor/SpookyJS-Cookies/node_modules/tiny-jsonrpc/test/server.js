var Server = require('../lib/tiny-jsonrpc').Server;
var expect = require('expect.js');

describe('Server instances', function () {
    it('provide a respond method', function () {
        var server = new Server();
        expect(server.respond instanceof Function).to.be(true);
    });

    it('provide a provide method', function () {
        var server = new Server();
        expect(server.provide instanceof Function).to.be(true);
    });

    it('provide a revoke method', function () {
        var server = new Server();
        expect(server.revoke instanceof Function).to.be(true);
    });

    it('provide a provides method', function () {
        var server = new Server();
        expect(server.provides instanceof Function).to.be(true);
    });
});
