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
        $scope.pdfScale = 1;
        $scope.desired.zoom = Math.round($scope.pdfScale * 100);

        $scope.nextPage = function() {
            $scope.viewer.nextPage();
        };

        $scope.prevPage = function() {
            $scope.viewer.prevPage();
        };

        $scope.zoomIn = function()
        {
            $scope.pdfScale = Math.round(($scope.pdfScale + 0.3) * 100) / 100;
            $scope.desired.zoom = Math.round($scope.pdfScale * 100);
            setSize();
        };

        $scope.zoomOut = function()
        {
            $scope.pdfScale = Math.round(($scope.pdfScale - 0.3) * 100) / 100;
            $scope.desired.zoom = Math.round($scope.pdfScale * 100);
            setSize();
        };

        $scope.resetZoom = function()
        {
            $scope.pdfScale = 1;
            $scope.desired.zoom = Math.round($scope.pdfScale * 100);
        };

        $scope.pageLoaded = function(curPage, totalPages) {
            $scope.currentPage = curPage;
            $scope.desired.page = curPage;
            $scope.totalPages = totalPages;
        };

        var hideFct = function() { $scope.pageSelectorOpen = false; $scope.zoomSelectorOpen = false; };

        $scope.openPageSelector = function()
        {
            $scope.pageSelectorOpen = true;
            $timeout(function()
            {
                var input = $('#desiredPageInput');
                input.focus();
                input.select();
                input.blur(hideFct);
            }, 100);
            $timeout.cancel(hideTimeout);
            hideTimeout = $timeout(hideFct, 6000);
        };

        $scope.openZoomSelector = function()
        {
            $scope.zoomSelectorOpen = true;
            $timeout(function()
            {
                var input = $('#desiredZoomInput');
                input.focus();
                input.select();
                input.blur(hideFct);
            }, 100);
            $timeout.cancel(hideTimeout);
            hideTimeout = $timeout(hideFct, 6000);
        };

        var hideTimeout = null;
        $scope.updateDesiredPage = function()
        {
            $scope.viewer.gotoPage($scope.desired.page);

            $timeout.cancel(hideTimeout);
            hideTimeout = $timeout(hideFct, 6000);
        };

        $scope.updateDesiredZoom = function()
        {
            if($scope.desired.zoom > 29 && $scope.desired.zoom < 451)
            {
                $scope.pdfScale = Math.round($scope.desired.zoom) / 100;
                setSize();
            }

            $timeout.cancel(hideTimeout);
            hideTimeout = $timeout(hideFct, 6000);
        };

        var setSize = function()
        {
            $scope.pdfWidth  = $scope.contentWidth * $scope.pdfScale -  30;
            $scope.pdfHeight = $scope.windowHeight * $scope.pdfScale - 120;

            lastSetSize = Date.now();
        };
        var setSizeTimeout;
        var lastSetSize = 0;

        var resize = function()
        {
            var now = Date.now();
            var diff = now - lastSetSize;
            $timeout.cancel(setSizeTimeout);

            if(diff > 100)
            {
                setSize();
            }
            else
            {
                setSizeTimeout = $timeout(setSize, 150);
            }
        };

        $scope.$watch('contentWidth', resize);
        $scope.$watch('windowHeight', resize);
        setSize();

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
