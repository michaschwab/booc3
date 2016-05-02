'use strict';

angular.module('learning').directive('progressButtons', function()
{
    var me = this;
    var $scope;

    var init = function(scope)
    {
        $scope = scope;

        return this;
    };

    return {
        restrict: "E",
        scope: {
            currentPositionPercent: '=',
            currentPosition: '=',
            onSetProgress: '=',
            segment: '=',
            sourcetype: '=',
            width: '='
        },
        transclude: true,
        templateUrl: 'modules/learning/views/progress-buttons.client.view.html',
        replace: true,
        link: init
    };
});
