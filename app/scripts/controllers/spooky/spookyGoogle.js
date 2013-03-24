'use strict';

actionatadistanceApp.controller('SpookyGoogleCtrl', function($scope, ActionAtADistance) {

	ActionAtADistance.on('connect', function () {
        ActionAtADistance.emit('init');
    });

    ActionAtADistance.on('initResp', function (data) {
        $scope.ActionAtADistanceGuid = data.guid;
       	ActionAtADistance.guid = $scope.ActionAtADistanceGuid;
        console.log('ActionAtADistanceGuid ' + $scope.ActionAtADistanceGuid);
        ActionAtADistance.emit('open', {guid: $scope.ActionAtADistanceGuid, url: 'http://www.google.com/search?q=casperjs'});
    });

    ActionAtADistance.on('callback', function (data) {
        if (data.action === 'start') {
            $scope.spookyAction = getSpookyAction($scope.ActionAtADistanceGuid);

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
        $scope.spookyAction = getSpookyAction($scope.ActionAtADistanceGuid);
    };

    function getSpookyAction(guid) {
        return 'var guid="' + guid + '";' +
                'var links=document.querySelectorAll("h3.r a");' +
                'links=Array.prototype.map.call(links,function(e){return e.getAttribute("href")});' +
                'var spookyResult = {data: links};';

//                 'var guid="' + guid + '";' +
// '$(\'input[name="q"]\').simulate("key-sequence", {sequence: "casperjs"});' +
// 'waitFor(function() { ' +
// 'function() { ' +
// 'return $("h3.r a").is(":visible"); ' +
// '};' +
// '}, function() {' +
// 'console.log("The sign-in dialog should be visible now.");' +
// 'var links=document.querySelectorAll("h3.r a");' +
// 'links=Array.prototype.map.call(links,function(e){return e.getAttribute("href")});' +
// '}); ' +
// 'var spookyResult = {data: links};'
    }

    if (typeof ActionAtADistance.guid !== 'undefined' && ActionAtADistance.guid !== null)
		$scope.reloadLastView();

});