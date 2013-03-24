'use strict';

describe('Controller: PostIndexCtrl', function() {

  // load the controller's module
  beforeEach(module('actionatadistanceApp'));

  var PostIndexCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    PostIndexCtrl = $controller('PostIndexCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
