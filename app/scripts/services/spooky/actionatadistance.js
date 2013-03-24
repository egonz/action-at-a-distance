'use strict';

/* ActionAtADistance Services */

var actionatadistanceServices = angular.module('actionatadistance.services', []);

actionatadistanceServices.factory('ActionAtADistance', function ($rootScope) {
    var socket = io.connect('http://localhost:1313');
    return {
        guid: null,
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});