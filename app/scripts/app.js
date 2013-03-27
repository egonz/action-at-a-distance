'use strict';

var actionatadistanceApp = angular.module('actionatadistanceApp', ['actionatadistance.services'])
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
      .when('/spooky/facebook', {
        templateUrl: 'views/spooky/spookyFacebook.html',
        controller: 'SpookyFacebookCtrl'
      })
      .when('/api/post/index', {
        templateUrl: 'views/post/postIndex.html',
        controller: 'PostIndexCtrl'
      })
      .when('/api/post/create', {
        templateUrl: 'views/post/postCreate.html',
        controller: 'PostCreateCtrl'
      })
      .when('/api/post/update/:id', {
        templateUrl: 'views/post/postUpdate.html',
        controller: 'PostUpdateCtrl'
      })
      .when('/api/post/view/:id', {
        templateUrl: 'views/post/postView.html',
        controller: 'PostViewCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
