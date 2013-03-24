'use strict';

describe('Controller: PostUpdateCtrl', function() {

  // load the controller's module
  beforeEach(module('actionatadistanceApp'));

  var PostUpdateCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    PostUpdateCtrl = $controller('PostUpdateCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
