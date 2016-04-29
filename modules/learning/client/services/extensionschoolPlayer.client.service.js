angular.module('learning').service('ExtensionSchoolPlayer', function($http, $sce, $window)
{
    var me = this;
    var $scope;

    var player;
    var vidPath = '';

    this.start = function(scope)
    {
        $scope = scope;
        $scope.currentTime = 0;

        $scope.onSetProgress = function(progress, $event)
        {
            // Checking if this functionality is already provided by the learn controller
            if($scope.setPositionPercent)
            {
                $scope.setPositionPercent(progress);
            }
        };

        $window.addEventListener('message', this.receiveMessage, false);

        return this;
    };

    this.receiveMessage = function(event)
    {
        if(event.data.sender == 'dce-player')
        {
            if(event.data.name == 'timeupdate')
            {
                $scope.currentTime = event.data.value;
            }
        }
    };

    this.stop = function()
    {
        player = null;
    };

    this.getPosition = function()
    {
        return $scope.currentTime;
    };

    this.setPosition = function(pos, pause)
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
