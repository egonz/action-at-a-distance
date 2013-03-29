'use strict';

actionatadistanceApp.controller('SpookyBingSocialCtrl', function($scope, $rootScope) {

    var startUrl = 'http://www.bing.com/social';
    var spookyActions = [];

    $scope.spooky = [];

    spookyActions.push('$("input#sb_form_q").val("youtube");' +
        '$("input#sb_form_go").click();');
    spookyActions.push('var spookyResult;' +
        '$("ul.sn_updates li:first-child").livequery(function() { ' +
        'spookyResult={data: $("ul.sn_updates li:first-child").html()};sendCallback(uuid, spookyResult);});');

    if (typeof $rootScope.bingSocialActionAtADistance === 'undefined') {
        $rootScope.bingSocialActionAtADistance = actionAtADistance();
    }

    var bingSocialActionAtADistance = $rootScope.bingSocialActionAtADistance;

    bingSocialActionAtADistance.onConnect(function() {
        console.log('onConnect Bing Social');
        bingSocialActionAtADistance.start(startUrl);
        $scope.uuid = bingSocialActionAtADistance.uuid();
    });

    bingSocialActionAtADistance.onDocumentLoaded(function(documentLocationHref) {
        loadSpookyAction(documentLocationHref);
    });

    bingSocialActionAtADistance.onEvaluateResponse(function(data) {
        $scope.$apply(function () {
            $scope.spooky.unshift(data.result.data);
        });
    });

    if (bingSocialActionAtADistance.connected()) {
        console.log('Page already loaded.');
        loadSpookyAction(documentLocationHref);
        $scope.uuid = bingSocialActionAtADistance.uuid();
    }

    function loadSpookyAction(documentLocationHref) {
        if (documentLocationHref === 'http://www.bing.com/social') {
            $scope.$apply(function () {
                $scope.spookyAction = spookyActions[0];
            });
        } else if (documentLocationHref !== 'http://www.bing.com/social') {
            $scope.$apply(function () {
                $scope.spookyAction = spookyActions[1];
            });
        }
    }

    $scope.actionAtADistance = function() {
        bingSocialActionAtADistance.evaluate({action: $scope.spookyAction});
    };

});