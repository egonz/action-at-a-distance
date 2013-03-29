'use strict';

actionatadistanceApp.controller('SpookyGoogleCtrl', function($scope, $rootScope) {

    var startUrl = 'http://www.google.com';
    var spookyActions = [];
    $scope.disableSpookyButton = false;

    spookyActions.push('$(\'input[name="q"]\').val("CASPERJS");' +
        '$(\'button[name="btnK"]\').submit();');
    spookyActions.push('$("h3.r a").livequery(function() { ' +
        'var links=document.querySelectorAll("h3.r a");' +
        'links=Array.prototype.map.call(links,function(e){return e.getAttribute("href")});' +
        'var spookyResult = {data: links};' +
        'sendCallback(uuid, spookyResult);' +
        '});');

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
        loadSpookyAction(documentLocationHref);
    });

    googleActionAtADistance.onEvaluateResponse(function(data) {
        $scope.$apply(function () {
            $scope.spooky = data.result;
        });

        setTimeout(enableSpookyButton, 1000);
    });

    if (googleActionAtADistance.connected()) {
        console.log('Page already loaded.');
        $scope.spookyAction = spookyActions[1];
        $scope.uuid = googleActionAtADistance.uuid();
    }

    function loadSpookyAction(documentLocationHref) {
        if (documentLocationHref === 'http://www.google.com') {
            $scope.$apply(function () {
                $scope.spookyAction = spookyActions[0];
            });
        } else if (documentLocationHref !== 'http://www.google.com') {
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
        googleActionAtADistance.evaluate({action: $scope.spookyAction});
    };

});