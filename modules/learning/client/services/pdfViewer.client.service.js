angular.module('learning').service('PdfViewer', function($timeout, PDFViewerService)
{
    var me = this;
    var $scope;

    this.init = function(scope)
    {
        $scope = scope;
        $scope.viewer = PDFViewerService.Instance("viewer");
        $scope.desired = {};
        $scope.pageSelectorOpen = false;

        $scope.nextPage = function() {
            $scope.viewer.nextPage();
        };

        $scope.prevPage = function() {
            $scope.viewer.prevPage();
        };

        $scope.pageLoaded = function(curPage, totalPages) {
            $scope.currentPage = curPage;
            $scope.desired.page = curPage;
            $scope.totalPages = totalPages;
        };

        var hideFct = function() { $scope.pageSelectorOpen = false; };

        $scope.openSelector = function()
        {
            $scope.pageSelectorOpen = true;
            $timeout(function()
            {
                var input = $('#desiredPageInput');
                input.focus();
                input.select();
                input.blur(hideFct);
            }, 100);
            hideTimeout = $timeout(hideFct, 6000);
        };

        var hideTimeout = null;
        $scope.updateDesiredPage = function()
        {
            $scope.viewer.gotoPage($scope.desired.page);

            $timeout.cancel(hideTimeout);
            hideTimeout = $timeout(hideFct, 6000);
        };

        return this;
    };

    this.getCurrentPage = function()
    {
        return $scope.currentPage;
    };

    this.getTotalPages = function()
    {
        return $scope.totalPages;
    };

    this.goToPage = function(page)
    {
        $scope.viewer.gotoPage(page);
    };

    return (this);
});
