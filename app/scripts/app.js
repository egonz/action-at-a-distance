'use strict';

var actionatadistanceApp = angular.module('actionatadistanceApp', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/spooky/sandbox', {
        templateUrl: 'views/spooky/spookySandbox.html',
        controller: 'SpookySandboxCtrl'
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
