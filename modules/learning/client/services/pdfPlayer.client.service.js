angular.module('learning').service('PdfPlayer', function($interval, $timeout, $http, $sce)
{
    var me = this;
    var $scope;

    var player;

    this.start = function(scope)
    {
        $scope = scope;

        $scope.onSetProgress = function(progress, $event)
        {
            // Checking if this functionality is already provided by the learn controller
            if($scope.setPositionPercent)
            {
                $scope.setPositionPercent(progress);
            }
        };

        return this;
    };

    this.play = function()
    {

    };

    this.stop = function()
    {

    };

    this.manageSize = function()
    {
        me.setSize($scope.contentWidth - 15);
    };

    this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
    {
        //console.log('loading pdf player data');

        var url = source.path.indexOf('http') !== -1 ? source.path : './modules/contents/uploads/pdf/' + source.path;

        me.parseDocumentSegmentSourceData(url, function(result)
        {
            var sourceData = {};
            sourceData.document = result;
            sourceData.pdfPath = url;

            if(segment.start)
            {
                $timeout(function()
                {
                    console.log($scope, segment.start);
                    $scope.switchToPdfPage(segment.start);
                    sourceData.slideNumber = segment.start;
                }, 500);
            }

            callback(sourceData);
        })
    };

    this.parseDocumentSegmentSourceData = function(path, callback)
    {
        //console.log('loading pure pdf data');
        // If local file, display. Otherwise, use CORS Proxy for loading.
        var url = path.indexOf('http') !== -1 ? 'http://www.corsproxy.com/' + path.replace('http://','') : path;

        $http.get(url, {responseType:'arraybuffer'}).
        //$http.get('http://www.corsproxy.com/' + source.path.replace('http://',''), {responseType:'arraybuffer'}).
        //success(function(data, status, headers, config) {
        success(function(data) {

            var file = new Blob([data], {type: 'application/pdf'});
            var fileURL = URL.createObjectURL(file);

            var result = $sce.trustAsResourceUrl(fileURL);

            callback(result);
        });
    };

    this.getPosition = function()
    {
        return $scope.getCurrentPdfPage();
    };

    this.setPosition = function(page)
    {
        $scope.switchToPdfPage(page);
    };

    this.setSize = function(goalWidth, goalHeight)
    {
        //console.log(goalWidth);
        var start = $scope.pdfWidth;
        var distance = start - goalWidth;
        var viewer = $('#viewer');
        viewer.animate({ width: goalWidth }, {progress: function(promise, remaining)
        {
            //$scope.courseScope.panelWidth = start - remaining * distance;
            $scope.pdfWidth = start - remaining * distance;

            $scope.safeApply();
        }});
    };

    this.setSizeQuick = function(goalWidth, goalHeight)
    {
        //console.log(goalWidth, 'quick');
        var viewer = $('#viewer');

        viewer.css('width', goalWidth);
        $scope.pdfWidth = goalWidth;

        $scope.safeApply();
    };

});
