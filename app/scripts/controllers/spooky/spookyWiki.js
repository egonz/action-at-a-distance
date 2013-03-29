'use strict';

actionatadistanceApp.controller('SpookyWikiCtrl', function($scope, $rootScope) {
 
    var startUrl = 'http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost';
    var spookyActions = []; 

    spookyActions.push('var spookyResult = {data: $("div#mw-content-text").html()};' +
                'console.log("Hello, from " + document.title);');

    if (typeof $rootScope.wikiActionAtADistance === 'undefined') {
        $rootScope.wikiActionAtADistance = actionAtADistance();
    }

    var wikiActionAtADistance = $rootScope.wikiActionAtADistance;

    wikiActionAtADistance.onConnect(function() {
        console.log('onConnect Wiki');
        wikiActionAtADistance.start(startUrl);
        $scope.uuid = wikiActionAtADistance.uuid();
    });

    wikiActionAtADistance.onDocumentLoaded(function(documentLocationHref) {
        $scope.$apply(function () {
            $scope.spookyAction = spookyActions[0];
        });
    });

    wikiActionAtADistance.onEvaluateResponse(function(data) {
        $scope.$apply(function () {
            $scope.spooky = data.result;
        });
    });

    if (wikiActionAtADistance.connected()) {
        console.log('Page already loaded.');
        $scope.spookyAction = spookyActions[0];
        $scope.uuid = wikiActionAtADistance.uuid();
    }

    $scope.actionAtADistance = function() {
        wikiActionAtADistance.evaluate({action: $scope.spookyAction});
    };

});