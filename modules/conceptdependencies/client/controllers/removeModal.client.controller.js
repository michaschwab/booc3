angular.module('conceptdependencies').controller('DependencyRemoveModalController',
function ($scope, $modalInstance, dependency, from, to)
{
    $scope.dependency = dependency;
    $scope.from = from;
    $scope.to = to;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
});
