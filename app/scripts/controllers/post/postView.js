
'use strict';

actionatadistanceApp.controller('PostViewCtrl', function($scope, $routeParams, $http) {
  $http.get('/api/post/view/:id').success(function(data) {
    $scope.post = data;
  });
});
