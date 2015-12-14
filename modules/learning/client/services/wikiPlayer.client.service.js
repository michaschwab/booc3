angular.module('learning').service('WikiPlayer', function(YoutubePlayer, $interval, $timeout, LearnHelper, $sce)
{
    var me = this;
    var $scope;

    this.start = function(scope)
    {
        $scope = scope;

        //$scope.wikiWidth = $scope.contentWidth - 30;

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
        d3.select('#websiteframe').transition()
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

    this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
    {
        var url = source.path;
        if (url.substr(0, 7) == 'http://') {
            url = 'https://' + url.substr(7);
        }
        console.log(url);
        callback({path: $sce.trustAsResourceUrl(url)});
    };
});
