'use strict';

actionatadistanceApp.controller('SpookyWikiCtrl', function($scope, $rootScope) {
 
    var startUrl = 'http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost';
    var spookyActions = []; 

    spookyActions.push('ActionAtADistance.setSpookyResult(\n' +
        '\t{data: $("div#mw-content-text").html()}\n' +
        ');\n' +
        'console.log("Hello, from " + document.title);');


    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        matchBrackets: true,
        continueComments: "Enter",
        theme: "elegant"
      });

    if (typeof $rootScope.wikiActionAtADistance === 'undefined') {
        $rootScope.wikiActionAtADistance = ActionAtADistance();
    }

    var wikiActionAtADistance = $rootScope.wikiActionAtADistance;

    wikiActionAtADistance.connect(function() {
        wikiActionAtADistance.on('initResp', function onInit() {
            wikiActionAtADistance.start(startUrl);
            $scope.uuid = wikiActionAtADistance.uuid();
        });

        wikiActionAtADistance.on('callback', function (data) {
            if (data.action === 'documentLoaded') {
                $scope.$apply(function () {
                    $scope.spookyAction = spookyActions[0];
                });

                editor.setValue($scope.spookyAction);
            } else if (data.action === 'evaluate') {
                $scope.$apply(function () {
                    $scope.spooky = data.result;
                });
            }
        });

        wikiActionAtADistance.init();
    });

    if (wikiActionAtADistance.connected()) {
        $scope.uuid = wikiActionAtADistance.uuid();
    }

    $scope.actionAtADistance = function() {
        wikiActionAtADistance.evaluate($scope.spookyAction);
    };

    prettyPrint();

});