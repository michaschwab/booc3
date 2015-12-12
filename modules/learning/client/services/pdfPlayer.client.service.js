angular.module('learning').service('PdfPlayer', function($interval, $timeout)
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
