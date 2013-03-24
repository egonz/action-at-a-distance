'use strict';

actionatadistanceApp.controller('SpookyFacebookCtrl', function($scope, ActionAtADistance) {

	ActionAtADistance.on('connect', function () {
        ActionAtADistance.emit('init');
    });

    ActionAtADistance.on('initResp', function (data) {
        $scope.ActionAtADistanceGuid = data.guid;
       	ActionAtADistance.guid = $scope.ActionAtADistanceGuid;
        console.log('ActionAtADistanceGuid ' + $scope.ActionAtADistanceGuid);
        ActionAtADistance.emit('open', {guid: $scope.ActionAtADistanceGuid, url: 'http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost'});
    });

    ActionAtADistance.on('callback', function (data) {
        if (data.action === 'start') {
            $scope.spookyAction = 'var guid="' + $scope.ActionAtADistanceGuid +
                    '";var spookyResult = {data: $("div#mw-content-text").html()};' +
                    'console.log("Hello, from " + document.title);';

        } else if (data.action === 'evaluate') {
            $scope.spooky = data.result;
        }
    });

    ActionAtADistance.on('disconnect', function () {
        console.log('disconnect');
    });

    $scope.actionAtADistance = function() {
        console.log('action at a distance');
        ActionAtADistance.emit('evaluate', {guid: $scope.ActionAtADistanceGuid, action: $scope.spookyAction});
    };

    $scope.reloadLastView = function() {
    	$scope.ActionAtADistanceGuid  = ActionAtADistance.guid;
        $scope.spookyAction = 'var guid="' + $scope.ActionAtADistanceGuid +
                    '";var spookyResult = {data: $("div#mw-content-text").html()};' +
                    'console.log("Hello, from " + document.title);';
    };

    if (typeof ActionAtADistance.guid !== 'undefined' && ActionAtADistance.guid !== null)
		$scope.reloadLastView();

});