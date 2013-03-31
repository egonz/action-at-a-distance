var StreamServer = require('../lib/tiny-jsonrpc').StreamServer;
var Server = require('../lib/tiny-jsonrpc').Server;
var expect = require('expect.js');

describe('StreamServer instances', function () {
    it('are instances of Server', function () {
        expect(new StreamServer()).to.be.a(Server);
    });

    it('inherit a respond method', function () {
        var server = new StreamServer();
        expect(server.respond).to.be(Server.prototype.respond);
    });

    it('inherit a provide method', function () {
        var server = new StreamServer();
        expect(server.provide).to.be(Server.prototype.provide);
    });

    it('inherit a revoke method', function () {
        var server = new StreamServer();
        expect(server.revoke).to.be(Server.prototype.revoke);
    });

    it('inherit a provides method', function () {
        var server = new StreamServer();
        expect(server.provides).to.be(Server.prototype.provides);
    });

    it('provide a listen method', function () {
        var server = new StreamServer();
        expect(server.listen).to.be.a('function');
    });
});
