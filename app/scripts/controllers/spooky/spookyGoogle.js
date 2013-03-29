'use strict';

actionatadistanceApp.controller('SpookyGoogleCtrl', function($scope, $rootScope) {

    var startUrl = 'http://www.google.com/search?q=casperjs';
    var spookyActions = []; 

    spookyActions.push('var links=document.querySelectorAll("h3.r a");' +
        'links=Array.prototype.map.call(links,function(e){return e.getAttribute("href")});' +
        'var spookyResult = {data: links};');

    if (typeof $rootScope.googleActionAtADistance === 'undefined') {
        $rootScope.googleActionAtADistance = actionAtADistance();
    }

    var googleActionAtADistance = $rootScope.googleActionAtADistance;

    googleActionAtADistance.onConnect(function() {
        console.log('onConnect Google');
        googleActionAtADistance.start(startUrl);
        $scope.uuid = googleActionAtADistance.uuid();
    });

    googleActionAtADistance.onDocumentLoaded(function(documentLocationHref) {
        $scope.$apply(function () {
            $scope.spookyAction = spookyActions[0];
        });
    });

    googleActionAtADistance.onEvaluateResponse(function(data) {
        $scope.$apply(function () {
            $scope.spooky = data.result;
        });
    });

    if (googleActionAtADistance.connected()) {
        console.log('Page already loaded.');
        $scope.spookyAction = spookyActions[0];
        $scope.uuid = googleActionAtADistance.uuid();
    }

    $scope.actionAtADistance = function() {
        googleActionAtADistance.evaluate({action: $scope.spookyAction});
    };

// 'var uuid="' + uuid + '";' +
// '$(\'input[name="q"]\').simulate("key-sequence", {sequence: "casperjs"});' +
// 'waitFor(function() { ' +
// 'function() { ' +
// 'return $("h3.r a").is(":visible"); ' +
// '};' +
// '}, function() {' +
// 'console.log("The sign-in dialog should be visible now.");' +
// 'var links=document.querySelectorAll("h3.r a");' +
// 'links=Array.prototype.map.call(links,function(e){return e.getAttribute("href")});' +
// '}); ' +
// 'var spookyResult = {data: links};'
    // }


});