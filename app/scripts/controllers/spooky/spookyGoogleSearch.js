'use strict';

actionatadistanceApp.controller('SpookyGoogleSearchCtrl', function($scope, $rootScope) {

    var startUrl = 'http://www.google.com';
    $scope.disableSpookyButton = false;

    var spookySearchResults = '$("h3.r a").livequery(function() {\n' +
        '\tvar links=document.querySelectorAll("h3.r a");\n' +
        '\tlinks=Array.prototype.map.call(links,function(e){\n' +
        '\t\treturn e.getAttribute("href")\n' +
        '\t});\n' +
        '\tvar spookyResult = {data: links};\n' +
        '\tActionAtADistance.saveHtmlText(links);\n' +
        '\tActionAtADistance.sendCallback(spookyResult);\n' +
        '});';

    if (typeof $rootScope.googleSearchActionAtADistance === 'undefined') {
        $rootScope.googleSearchActionAtADistance = ActionAtADistance();
    }

    var googleSearchActionAtADistance = $rootScope.googleSearchActionAtADistance;

    googleSearchActionAtADistance.onConnect(function() {
        googleSearchActionAtADistance.start(startUrl);
        $scope.uuid = googleSearchActionAtADistance.uuid();
    });

    googleSearchActionAtADistance.onDocumentLoaded(function(documentLocationHref) {
        loadSpookyAction(documentLocationHref);
    });

    googleSearchActionAtADistance.onEvaluateResponse(function(data) {
        $scope.$apply(function () {
            $scope.spooky = data.result;
        });

        enableSpookyButton();
    });

    if (googleSearchActionAtADistance.connected()) {

    }

    function loadSpookyAction(documentLocationHref) {
        if (documentLocationHref !== 'http://www.google.com') {
            googleSearchActionAtADistance.evaluate({action: spookySearchResults});
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

        var q = '$(\'input[name="q"]\').val("' + $scope.spookyQuery + '");\n' +
            '$(\'button[name="btnK"]\').submit();\n';

        googleSearchActionAtADistance.evaluate({action: q});
    };

});