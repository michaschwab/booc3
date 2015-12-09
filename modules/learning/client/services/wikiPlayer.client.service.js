angular.module('learning').service('WikiPlayer', function(YoutubePlayer, $interval, $timeout, LearnHelper)
{
    var me = this;
    var $scope;

    this.start = function(scope)
    {
        $scope = scope;

        $scope.wikiWidth = $scope.contentWidth - 30;

        return this;
    };

    var resizeTimeout;

    this.manageSize = function()
    {
        $timeout.cancel(resizeTimeout);

        resizeTimeout = $timeout(function()
        {
            me.setSize($scope.contentWidth - 30);
        }, 400);
    };

    this.setSize = function(goalWidth, goalHeight)
    {
        d3.select('#wikiframe').transition()
            .style('width', goalWidth + 'px')
            .each('end', function()
            {
                $scope.wikiWidth = goalWidth;
                $scope.safeApply();
            });
    };

    this.play = function()
    {

    };

    this.stop = function()
    {

    };
});
