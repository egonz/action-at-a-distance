'use strict';

var actionatadistanceApp = angular.module('actionatadistanceApp', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/spooky/wiki', {
        templateUrl: 'views/spooky/spookyWiki.html',
        controller: 'SpookyWikiCtrl'
      })
      .when('/spooky/google', {
        templateUrl: 'views/spooky/spookyGoogle.html',
        controller: 'SpookyGoogleCtrl'
      })
      .when('/spooky/bing/social', {
        templateUrl: 'views/spooky/spookyBingSocial.html',
        controller: 'SpookyBingSocialCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
