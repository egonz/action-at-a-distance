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

    spookyWebsActionAtADistance.init(function() {
        onConnect();
    });

    if (spookyWebsActionAtADistance.connected()) {
        $scope.uuid = spookyWebsActionAtADistance.uuid();
    }

    spookyWebsActionAtADistance.onDocumentLoaded(function(documentLocationHref) {
    	console.log('On Document Loaded ' + documentLocationHref);

        $scope.$apply(function () {
        	$scope.nonLocalDocumentLocation = documentLocationHref;
        	$scope.disableSpookyButton = false;
        });
    });

    spookyWebsActionAtADistance.onEvaluateResponse(function(data) {
        $scope.$apply(function () {
            $scope.spooky = data.result;

            $('#spooky-html').text(style_html($scope.spooky.data, {
      			'indent_size': 2,
      			'indent_char': ' '
    		}));
        	prettyPrint();
        });
    });

    function onConnect() {
        spookyWebsActionAtADistance.onConnect(function() {
            $scope.$apply(function () {
                $scope.uuid = spookyWebsActionAtADistance.uuid();
                $scope.disableStartButton = false;
            });
        });
    }

    $scope.start = function() {
    	console.log('Start URL ' + $scope.startUrl);
        if (typeof $scope.nonLocalDocumentLocation === 'undefined') {
            spookyWebsActionAtADistance.start($scope.startUrl);
        } else {
            //This is not working yet
            spookyWebsActionAtADistance.evaluate({action: 'document.location.href="' + $scope.startUrl + '"'});    
        }
    };

    $scope.actionAtADistance = function() {
        spookyWebsActionAtADistance.evaluate({action: editor.getValue()});
    };

    prettyPrint();

});