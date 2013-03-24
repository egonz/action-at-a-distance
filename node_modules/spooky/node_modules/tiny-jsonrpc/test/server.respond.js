var Server = require('../lib/tiny-jsonrpc').Server;
var expect = require('expect.js');
var sinon = require('sinon');

describe('Server.respond', function () {
    var errors = {
        PARSE_ERROR: -32700,
        INVALID_REQUEST: -32600,
        METHOD_NOT_FOUND: -32601,
        INVALID_PARAMS: -32602,
        INTERNAL_ERROR: -32603
    };

    function expectValidResponse(response, id) {
        expect(response.jsonrpc).to.be('2.0');
        expect(response.id).to.be(id);
    }

    function expectValidResult(response, id) {
        expectValidResponse(response, id);
        expect(response.error).to.be(void undefined);
    }

    function expectValidError(response, id) {
        expectValidResponse(response, id);
        expect(response.result).to.be(void undefined);
        expect(response.error).to.be.an('object');
        expect(response.error.code).to.be.a('number');
        expect(response.error.message).to.be.a('string');
    }

    describe('returns an error when', function () {
        it('request is not valid JSON', function () {
            var server = new Server();
            var requests = [
                void undefined,
                {
                    id: 1,
                    method: 'foo'
                },
                [],
                '[',
                '{ foo:',
                '{ foo }',
                '{ foo: "bar" }'
            ];
            var response;

            server.provide(function foo() { });
            for (var i = 0; i < requests.length; i++) {
                response = JSON.parse(server.respond(requests[i]));

                expectValidError(response, null);
                expect(response.error.code).to.be(errors.PARSE_ERROR);
            }
        });

        it('request.jsonrpc !== "2.0"', function () {
            var server = new Server();
            var request = {
                id: 1,
                method: 'foo'
            };
            var versions = ['2.1', '2', 2.0, {}, [], null, false, true];

            server.provide(function foo() { });
            var response = JSON.parse(server.respond(JSON.stringify(request)));

            expectValidError(response, request.id);
            expect(response.error.code).to.be(errors.INVALID_REQUEST);

            for (var i = 0; i < versions.length; i++) {
                request.jsonrpc = versions[i];
                response = JSON.parse(server.respond(JSON.stringify(request)));

                expectValidError(response, request.id);
                expect(response.error.code).to.be(errors.INVALID_REQUEST);
            }

            delete request.id;
            response = JSON.parse(server.respond(JSON.stringify(request)));
            expectValidError(response, null);
            expect(response.error.code).to.be(errors.INVALID_REQUEST);
        });

        it('request.method is missing', function () {
            var server = new Server();
            var request = {
                jsonrpc: '2.0',
                id: 1
            };

            server.provide(function foo() { });
            var response = JSON.parse(server.respond(JSON.stringify(request)));

            expectValidError(response, request.id);
            expect(response.error.code).to.be(errors.INVALID_REQUEST);

            delete request.id;
            response = JSON.parse(server.respond(JSON.stringify(request)));
            expectValidError(response, null);
            expect(response.error.code).to.be(errors.INVALID_REQUEST);
        });

        it('request.method is not a string', function () {
            var server = new Server();
            var request = {
                jsonrpc: '2.0',
                id: 1,
            };
            var methods = [null, {}, [], 23, false];
            var response;

            server.provide(function foo() { });
            for (var i = 0; i < methods.length; i++) {
                request.method = methods[i];
                response = JSON.parse(server.respond(JSON.stringify(request)));

                expectValidError(response, request.id);
                expect(response.error.code).to.be(errors.INVALID_REQUEST);
            }

            delete request.id;
            response = JSON.parse(server.respond(JSON.stringify(request)));
            expectValidError(response, null);
            expect(response.error.code).to.be(errors.INVALID_REQUEST);
        });

        it('request.method is not provided by the server', function () {
            var server = new Server();
            var request = {
                jsonrpc: '2.0',
                id: 1,
                method: 'fiz'
            };
            var response;

            server.provide(function foo() { });
            var response = JSON.parse(server.respond(JSON.stringify(request)));

            expectValidError(response, request.id);
            expect(response.error.code).to.be(errors.METHOD_NOT_FOUND);

            delete request.id;
            response = server.respond(JSON.stringify(request));
            expect(response).to.be.an(Error);
            expect(response.code).to.be(errors.METHOD_NOT_FOUND);
        });

        it('request.id is present, but not a string, number, or null',
            function () {
                var server = new Server();
                var request = {
                    jsonrpc: '2.0',
                    id: 1,
                };
                var ids = [{}, [], false];
                var response;

                server.provide(function foo() { });
                for (var i = 0; i < ids.length; i++) {
                    request.id = ids[i];
                    response =
                        JSON.parse(server.respond(JSON.stringify(request)));

                    expectValidError(response, null);
                    expect(response.error.code).to.be(errors.INVALID_REQUEST);
                }
            });

        it('request.params is present, but not an object or array',
            function () {
                var server = new Server();
                var request = {
                    jsonrpc: '2.0',
                    id: 1,
                };
                var params = ['', false, true, null, 0, 42];
                var response;

                server.provide(function foo() { });
                for (var i = 0; i < params.length; i++) {
                    request.params = params[i];
                    response =
                        JSON.parse(server.respond(JSON.stringify(request)));

                    expectValidError(response, request.id);
                    expect(response.error.code).to.be(errors.INVALID_REQUEST);
                }

                delete request.id;
                response = JSON.parse(server.respond(JSON.stringify(request)));
                expectValidError(response, null);
                expect(response.error.code).to.be(errors.INVALID_REQUEST);
            });
    });

    describe('upon a valid request', function () {
        it('calls the named method', function () {
            var server = new Server();
            var request = {
                jsonrpc: '2.0',
                id: 1,
                method: 'foo'
            };
            var spy = sinon.spy();

            server.provide(function foo () { spy(); });
            server.respond(JSON.stringify(request));
            sinon.assert.calledOnce(spy);
        });

        it('passes positional arguments in order', function () {
            var server = new Server();
            var request = {
                jsonrpc: '2.0',
                id: 1,
                method: 'foo'
            };
            var args = [
                [], [1], [1, 2], [1, 2, 3]
            ];
            var spy = sinon.spy();

            server.provide(function foo (first, second) {
                spy.apply(null, Array.prototype.slice.call(arguments));
            });

            for (var i = 0; i < args.length; i++) {
                request.params = args[i];
                server.respond(JSON.stringify(request));
                sinon.assert.calledOnce(spy);
                expect(spy.lastCall.args).to.eql(args[i]);
                spy.reset();
            }
        });

        it('passes named arguments in appropriately', function () {
            var server = new Server();
            var request = {
                jsonrpc: '2.0',
                id: 1,
                method: 'foo'
            };
            var args = [
                {}, { first: 23 }, { second: 42 }, { first: 23, second: 42 },
                { second: 42, first: 23 },
                { first: 23, second: 42, third: 23251 }
            ];
            var spy = sinon.spy();

            server.provide(function foo (first, second) {
                spy.apply(null, Array.prototype.slice.call(arguments));
            });

            for (var i = 0; i < args.length; i++) {
                request.params = args[i];
                server.respond(JSON.stringify(request));
                sinon.assert.calledOnce(spy);
                expect(spy.lastCall.args[0]).to.be(args[i].first);
                expect(spy.lastCall.args[1]).to.be(args[i].second);
                spy.reset();
            }
        });

        it('returns a valid response with the method result', function () {
            var server = new Server();
            var request = {
                jsonrpc: '2.0',
                id: 1,
                method: 'foo'
            };
            var results = [
                undefined, null, false, true, 0, 42, [1, 2, 3], { foo: 'bar' }
            ];
            var response, result;

            server.provide(function foo () {
                return result;
            });

            for (var i = 0; i < results.length; i++) {
                result = results[i];
                response = JSON.parse(server.respond(JSON.stringify(request)));

                expectValidResult(response, request.id);
                expect(response.result).to.eql(result);
            }
        });

        it('returns null when passed a notification', function () {
            var server = new Server();
            var request = {
                jsonrpc: '2.0',
                method: 'foo'
            };
            var results = [
                undefined, null, false, true, 0, 42, [1, 2, 3], { foo: 'bar' }
            ];
            var response, result;

            server.provide(function foo () {
                return result;
            });

            for (var i = 0; i < results.length; i++) {
                result = results[i];
                response = JSON.parse(server.respond(JSON.stringify(request)));

                expect(response).to.be(null);
            }
        });

        it('returns an instance of Error if a method throws on a notification',
            function () {
                var server = new Server();
                var request = {
                    jsonrpc: '2.0',
                    method: 'foo'
                };
                var message = 'OHNOES';

                server.provide(function foo () {
                    throw message;
                });

                var response = server.respond(JSON.stringify(request));
            });

        it('returns an INTERNAL_ERROR if the method throws a string',
            function () {
                var server = new Server();
                var request = {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'foo'
                };
                var message = 'OHNOES';

                server.provide(function foo () {
                    throw message;
                });

                var response =
                    JSON.parse(server.respond(JSON.stringify(request)));

                expectValidError(response, request.id);
                expect(response.error.code).to.be(errors.INTERNAL_ERROR);
                expect(response.error.message).to.be(message);

                delete request.id;
                response = server.respond(JSON.stringify(request));
                expect(response).to.be.an(Error);
                expect(response.code).to.be(errors.INTERNAL_ERROR);
                expect(response.message).to.be(message);
           });

        it('returns an INTERNAL_ERROR if the method throws an Error with no code',
            function () {
                var server = new Server();
                var request = {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'foo'
                };
                var message = 'OHNOES';

                server.provide(function foo () {
                    throw new Error(message);
                });

                var response =
                    JSON.parse(server.respond(JSON.stringify(request)));

                expectValidError(response, request.id);
                expect(response.error.code).to.be(errors.INTERNAL_ERROR);
                expect(response.error.message).to.be(message);

                delete request.id;
                response = server.respond(JSON.stringify(request));
                expect(response).to.be.an(Error);
                expect(response.code).to.be(errors.INTERNAL_ERROR);
                expect(response.message).to.be(message);
           });

        it('returns an error with correct code if the method throws an Error with a code',
            function () {
                var server = new Server();
                var request = {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'foo'
                };
                var message = 'OHNOES';
                var code = -32001;

                server.provide(function foo () {
                    var e = new Error(message);
                    e.code = code;
                    throw e;
                });

                var response =
                    JSON.parse(server.respond(JSON.stringify(request)));

                expectValidError(response, request.id);
                expect(response.error.code).to.be(code);
                expect(response.error.message).to.be(message);

                delete request.id;
                response = server.respond(JSON.stringify(request));
                expect(response).to.be.an(Error);
                expect(response.code).to.be(code);
                expect(response.message).to.be(message);
           });

        it('returns an error with correct data if the method throws an Error with data',
            function () {
                var server = new Server();
                var request = {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'foo'
                };
                var message = 'OHNOES';
                var data = { foo: 'bar' };

                server.provide(function foo () {
                    var e = new Error(message);
                    e.data = data;
                    throw e;
                });

                var response =
                    JSON.parse(server.respond(JSON.stringify(request)));

                expectValidError(response, request.id);
                expect(response.error.data).to.eql(data);
                expect(response.error.message).to.be(message);

                delete request.id;
                response = server.respond(JSON.stringify(request));
                expect(response).to.be.an(Error);
                expect(response.data).to.eql(data);
                expect(response.message).to.be(message);
           });
    });

    describe('upon a batch request', function () {
        it('returns INVALID_REQUEST if the batch is empty', function () {
            var server = new Server();
            var request = [];

            server.provide(function foo() { });
            var response = JSON.parse(server.respond(JSON.stringify(request)));

            expectValidError(response, null);
            expect(response.error.code).to.be(errors.INVALID_REQUEST);
        });

        it('returns an array of responses', function () {
            var server = new Server();
            var request = [
                1,
                { 'foo': 'bar' },
                { jsonrpc: 2, method: 'foo', id: 1 },
                { jsonrpc: '2.0', id: 2 },
                { jsonrpc: '2.0', method: 2, id: 3 },
                { jsonrpc: '2.0', method: 'fiz', id: 4 },
                { jsonrpc: '2.0', method: 'foo', id: [] },
                { jsonrpc: '2.0', method: 'foo', id: 5, params: 23 },
                { jsonrpc: '2.0', method: 'foo', id: 6 },
                { jsonrpc: '2.0', method: 'foo', id: 7, params: [1, 2] },
                {
                    jsonrpc: '2.0', method: 'foo', id: 8,
                    params: { one: 1, two: 2 }
                },
                { jsonrpc: '2.0', method: 'foo', id: 9, params: [-1] },
                {
                    jsonrpc: '2.0', method: 'foo', id: 10,
                    params: [-1, true, 123]
                },
                {
                    jsonrpc: '2.0', method: 'foo', id: 11,
                    params: [-1, true, void undefined, { foo: 'bar' }]
                }
            ];

            server.provide(function foo(one, two, three, four) {
                var e;
                if (one < 0) {
                    if (two) {
                        e = new Error('OHNOES');
                        e.code = three;
                        e.data = four;
                    } else {
                        e = 'OHNOES';
                    }
                    throw e;
                }

                if (one && two) {
                    return one + two;
                } else if (one) {
                    return one;
                } else {
                    return null;
                }
            });
            var response = JSON.parse(server.respond(JSON.stringify(request)));

            // invalid requests
            expectValidError(response[0], null);
            expect(response[0].error.code).to.be(errors.INVALID_REQUEST);
            expectValidError(response[1], null);
            expect(response[0].error.code).to.be(errors.INVALID_REQUEST);

            // bad version
            expectValidError(response[2], 1);
            expect(response[2].error.code).to.be(errors.INVALID_REQUEST);

            // missing method
            expectValidError(response[3], 2);
            expect(response[3].error.code).to.be(errors.INVALID_REQUEST);

            // invalid method
            expectValidError(response[4], 3);
            expect(response[4].error.code).to.be(errors.INVALID_REQUEST);

            // unprovided method
            expectValidError(response[5], 4);
            expect(response[5].error.code).to.be(errors.METHOD_NOT_FOUND);

            // invalid id
            expectValidError(response[6], null);
            expect(response[6].error.code).to.be(errors.INVALID_REQUEST);

            // invalid params
            expectValidError(response[7], 5);
            expect(response[7].error.code).to.be(errors.INVALID_REQUEST);

            // no params
            expectValidResult(response[8], 6);
            expect(response[8].result).to.be(null);

            // positional params
            expectValidResult(response[9], 7);
            expect(response[9].result).to.be(3);

            // named params
            expectValidResult(response[10], 8);
            expect(response[10].result).to.be(3);

            // throws a string
            expectValidError(response[11], 9);
            expect(response[11].error.code).to.be(errors.INTERNAL_ERROR);
            expect(response[11].error.message).to.be('OHNOES');

            // throws an Error with code
            expectValidError(response[12], 10);
            expect(response[12].error.code).to.be(123);
            expect(response[12].error.message).to.be('OHNOES');

            // throws an Error with data
            expectValidError(response[13], 11);
            expect(response[13].error.code).to.be(errors.INTERNAL_ERROR);
            expect(response[13].error.message).to.be('OHNOES');
            expect(response[13].error.data).to.eql({ foo: 'bar' });
        });
    });
});
