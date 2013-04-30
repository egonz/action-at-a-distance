'use strict';

actionatadistanceApp.controller('SpookySandboxCtrl', function($scope, $rootScope) {
 
    $scope.startUrl = '';
    $scope.nonLocalDocumentLocation;
    $scope.disableStartButton = true;
    $scope.disableSpookyButton = true;
    $scope.spookyAction = 'ActionAtADistance.setSpookyResult(\n' +
    	'\t{data: $("body").html()}\n' +
        ');\n';

    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        matchBrackets: true,
        continueComments: "Enter",
        theme: "elegant"
    });

    editor.setValue($scope.spookyAction);

    if (typeof $rootScope.spookyWebsActionAtADistance === 'undefined') {
        $rootScope.spookyWebsActionAtADistance = ActionAtADistance();
    }

    var spookyWebsActionAtADistance = $rootScope.spookyWebsActionAtADistance;

    spookyWebsActionAtADistance.connect(function() {
        spookyWebsActionAtADistance.on('initResp', function() {
            $scope.$apply(function () {
                $scope.uuid = spookyWebsActionAtADistance.uuid();
                $scope.disableStartButton = false;
            });
        });

        spookyWebsActionAtADistance.on('callback', function (data) {
            if (data.action === 'documentLoaded' || data.action === 'start') {
                $scope.$apply(function () {
                    $scope.nonLocalDocumentLocation = data.documentLocationHref;
                    $scope.disableSpookyButton = false;
                });
            } else if (data.action === 'evaluate') {
                $scope.$apply(function () {
                    $scope.spooky = data.result;

                    $('#spooky-html').text(style_html($scope.spooky.data, {
                        'indent_size': 2,
                        'indent_char': ' '
                    }));
                    
                    prettyPrint();
                });
            }
        });

        spookyWebsActionAtADistance.init();
    });

    if (spookyWebsActionAtADistance.connected()) {
        $scope.uuid = spookyWebsActionAtADistance.uuid();
    }

    $scope.start = function() {
    	console.log('Start URL ' + $scope.startUrl);
        if (typeof $scope.nonLocalDocumentLocation === 'undefined') {
            spookyWebsActionAtADistance.start($scope.startUrl);
        } else {
            //This is not working yet
            spookyWebsActionAtADistance.evaluate('document.location.href="' + $scope.startUrl + '"');    
        }
    };

    $scope.actionAtADistance = function() {
        spookyWebsActionAtADistance.evaluate(editor.getValue());
    };

    prettyPrint();

});