angular.module('contents').service('LTICreator', function($http, $resource)
{
    var me = this;
    var $scope = null;

    this.start = function(scope)
    {
        $scope = scope;
        $scope.source.data = {};

        $scope.xmlUrlRegex = /^(?:https?:\/{2})?(?:w{3}\.)?.*?\.xml$/;

        $scope.$watch('source.path', me.updatePath);
    };

    this.updatePath = function()
    {
        var path = $scope.source.path;

        if(path)
        {
            /*$http.jsonp($scope.source.path).success(function (data)
            {
                console.log(data);
            });*/
            /*var data = $resource($scope.source.path);
            data.get({}, function(ab)
            {
                console.log(ab);
                console.log(data);
            })*/
            /*$.get($scope.source.path, function(abc)
            {
                console.log(abc);
            });*/
            $.ajax({
                url : $scope.source.path,
                dataType:"jsonp"
            })
        }
    };

    this.getCurrentPosition = function()
    {
        return 0;
    };

    this.stop = function()
    {

    };

    return (this);
});
