'use strict';

describe('Controller: PostCreateCtrl', function() {

  // load the controller's module
  beforeEach(module('actionatadistanceApp'));

  var PostCreateCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    PostCreateCtrl = $controller('PostCreateCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
