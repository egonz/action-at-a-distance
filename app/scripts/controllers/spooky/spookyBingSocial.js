'use strict';

actionatadistanceApp.controller('SpookyBingSocialCtrl', function($scope, ActionAtADistance) {

    $scope.spooky = [];

	ActionAtADistance.on('connect', function () {
        ActionAtADistance.emit('init');
    });

    ActionAtADistance.on('initResp', function (data) {
        $scope.ActionAtADistanceGuid = data.guid;
       	ActionAtADistance.guid = $scope.ActionAtADistanceGuid;
        console.log('ActionAtADistanceGuid ' + $scope.ActionAtADistanceGuid);
        ActionAtADistance.emit('open', {guid: $scope.ActionAtADistanceGuid, url: 'http://www.bing.com/social/search'});
    });

    ActionAtADistance.on('callback', function (data) {
        console.log(data);

        if (data.action === 'start') {
            $scope.spookyAction = getSpookyAction($scope.ActionAtADistanceGuid);

        } else if (data.action === 'documentLoaded' && data.documentLocationHref !== 'http://www.bing.com/social/search') {
            $scope.spookyAction = 'var spookyResult;' +
                '$("ul.sn_updates li:first-child").livequery(function() { ' +
                'spookyResult={data: $("ul.sn_updates li:first-child").html()};sendCallback(guid, spookyResult);});';

        } else if (data.action === 'evaluate') {
            $scope.spooky.push(data.result.data);
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
        $scope.spookyAction = getSpookyAction($scope.ActionAtADistanceGuid);
    };

    function getSpookyAction(guid) {
        return '$("input#sb_form_q").val("youtube");' +
               '$("input#sb_form_go").click();';
    }

    if (typeof ActionAtADistance.guid !== 'undefined' && ActionAtADistance.guid !== null)
		$scope.reloadLastView();

});