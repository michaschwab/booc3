'use strict';

angular.module('learning').directive('progressBar', function()
{
    var me = this;
    var $scope;

    var init = function(scope)
    {
        $scope = scope;

        $scope.progressClick = function($event)
        {
            if($scope.onSetProgress && typeof $scope.onSetProgress == 'function')
            {
                var progressPercent = Math.round(100 * $event.offsetX / $event.toElement.clientWidth);

                $scope.onSetProgress(progressPercent, $event);
            }
        };

        return this;
    };

    return {
        restrict: "E",
        scope: {
            width: '=',
            progressPercent: '=',
            currentPosition: '=',
            sourcetype: '=',
            onSetProgress: '=',
            segment: '='
        },
        transclude: true,
        templateUrl: 'modules/learning/views/progress-bar.client.view.html',
        replace: true,
        link: init
    };
});
