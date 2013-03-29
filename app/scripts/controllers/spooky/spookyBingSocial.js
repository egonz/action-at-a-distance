'use strict';

actionatadistanceApp.controller('SpookyBingSocialCtrl', function($scope, $rootScope) {

    var startUrl = 'http://www.bing.com/social';
    var spookyActions = [];
    $scope.disableSpookyButton = false;

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

        setTimeout(enableSpookyButton, 1000);
    });

    if (bingSocialActionAtADistance.connected()) {
        console.log('Page already loaded.');
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

        setTimeout(enableSpookyButton, 1000);
    }

    function enableSpookyButton() {
        $scope.$apply(function () {
            $scope.disableSpookyButton = false;
        });
    }

    $scope.actionAtADistance = function() {
        $scope.disableSpookyButton = true;
        bingSocialActionAtADistance.evaluate({action: $scope.spookyAction});
    };

});