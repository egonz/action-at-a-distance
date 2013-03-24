
'use strict';

actionatadistanceApp.controller('PostCreateCtrl', function($scope, $routeParams, $http) {
  $http.get('/api/post/create').success(function(data) {
    $scope.post = data;
  });
});
