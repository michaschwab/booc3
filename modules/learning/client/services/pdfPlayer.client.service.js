angular.module('learning').service('PdfPlayer', function($interval, $timeout, $http, $sce)
{
    var me = this;
    var $scope;

    var player;

    this.start = function(scope)
    {
        $scope = scope;

        return this;
    };

    this.play = function()
    {

    };

    this.stop = function()
    {

    };

    this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
    {
        var path = source.path;
        // If local file, display. Otherwise, use CORS Proxy for loading.
        var url = path.indexOf('http') !== -1 ? 'http://www.corsproxy.com/' + path.replace('http://','') : './modules/contents/uploads/pdf/' + path;

        $http.get(url, {responseType:'arraybuffer'}).
        //$http.get('http://www.corsproxy.com/' + source.path.replace('http://',''), {responseType:'arraybuffer'}).
        //success(function(data, status, headers, config) {
        success(function(data) {

            var file = new Blob([data], {type: 'application/pdf'});
            var fileURL = URL.createObjectURL(file);

            var result = $sce.trustAsResourceUrl(fileURL);

            callback({document: result });
            //$scope.sourceData.document = pdfData;
            //callback({video: vidData });
            //callback(result);
        });
    };

    this.setSize = function(goalWidth, goalHeight)
    {
        /*var start = $scope.pdfWidth;
        var distance = start - goalWidth;
        var viewer = $('#viewer');
        viewer.animate({ width: goalWidth }, {progress: function(promise, remaining)
        {
            //$scope.courseScope.panelWidth = start - remaining * distance;
            $scope.pdfWidth = start - remaining * distance;

            $scope.safeApply();
        }});*/
    };

    this.setSizeQuick = function(goalWidth, goalHeight)
    {
        /*var viewer = $('#viewer');

        viewer.css('width', goalWidth);
        $scope.pdfWidth = goalWidth;

        $scope.safeApply();*/
    };

});
