angular.module('learning').service('ExtensionSchoolPlayer', function($http, $sce, $interval, $timeout)
{
    var me = this;
    var $scope;

    var player;
    var vidPath = '';

    this.start = function(scope)
    {
        $scope = scope;

        return this;
    };

    this.stop = function()
    {
        player = null;
    };

    this.getPosition = function()
    {
        return -1;
    };

    this.setPosition = function(pos)
    {
        $scope.sourceData.path = $sce.trustAsResourceUrl(vidPath + '#t=' + pos);
    };

    this.manageSize = function()
    {
    };

    this.setSize = function(goalWidth, goalHeight)
    {

    };

    this.play = function()
    {

    };

    this.stopPlay = function()
    {

    };

    this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
    {
        var start = segment === null ? 0 : segment.start;
        vidPath = source.path;
        var totalPath = source.path + '#t=' + start;

        callback({path: $sce.trustAsResourceUrl(totalPath)});
    };
});
