'use strict';

actionatadistanceApp.controller('SpookyGoogleCtrl', function($scope, $rootScope) {

    var startUrl = 'http://www.google.com';
    var spookyActions = [];
    $scope.disableSpookyButton = false;

    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        matchBrackets: true,
        continueComments: "Enter",
        theme: "elegant"
      });

    spookyActions.push('$(\'input[name="q"]\').val("CASPERJS");\n' +
        '$(\'button[name="btnK"]\').submit();\n');
    spookyActions.push('$("h3.r a").livequery(function() {\n' +
        '\tvar links=document.querySelectorAll("h3.r a");\n' +
        '\tlinks=Array.prototype.map.call(links,function(e){\n' +
        '\t\treturn e.getAttribute("href")\n' +
        '\t});\n' +
        '\tvar spookyResult = {data: links};\n' +
        '\tActionAtADistance.saveHtmlText(links);\n' +
        '\tActionAtADistance.sendCallback(spookyResult);\n' +
        '});');

    if (typeof $rootScope.googleActionAtADistance === 'undefined') {
        $rootScope.googleActionAtADistance = ActionAtADistance();
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

        editor.setValue($scope.spookyAction);

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

    prettyPrint();

});