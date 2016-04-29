'use strict';

angular.module('learning').directive('boocPdfViewer', function($timeout, PDFViewerService)
{
    var me = this;
    var $scope;

    var init = function(scope)
    {
        //$timeout(function(){console.log(scope);}, 2000);
        scope.courseScope = angular.element('.course-view').scope();
        if(!scope.courseScope) scope.courseScope = angular.element('.contentCol').scope();
        $scope = scope;
        $scope.viewer = PDFViewerService.Instance("viewer");
        $scope.desired = {};
        $scope.pageSelectorOpen = false;
        $scope.pdfScale = 1;
        $scope.desired.zoom = Math.round($scope.pdfScale * 100);
        $scope.courseScope.lastUserChosenPdfPage = 0;
        $scope.state = 'notloaded';
        var pdfViewerPath = '/lib/pdfjs/web/viewer.html';
        $scope.viewerUrl = pdfViewerPath;
        $scope.pdfFrameWindow = null;
        var onStateFinished = [];

        $scope.$watch('sourceData.pdfPath', function(pdfPath)
        {
            $scope.viewerUrl = !pdfPath ? pdfViewerPath : pdfViewerPath + '?file=' + $scope.sourceData.pdfPath.substr(1);
        });

        $scope.$watch('sourceData.slideNumber', function(){
            $scope.jumpToPage($scope.sourceData.slideNumber);
        });

        $scope.jumpToPage = function(pageNumber)
        {
            if(pageNumber == undefined) return;

            //console.log('jumping to ', pageNumber);

            $scope.ensurePdfFrameWin();
            if(!$scope.pdfFrameWindow || !$scope.pdfViewerApp) return;

            try{
                $scope.pdfViewerApp.page = pageNumber;
            }
            catch(e)
            {
                console.error(e);
            }


            /*var event = new Event('pagechange');
            event.pageNumber = pageNumber;
            f.dispatchEvent(event);
            */
        };

        $scope.onPageRendered = function(event)
        {
            $scope.ensurePdfFrameWin();

            //var pageNumber = event.detail.pageNumber;
            //$scope.currentPage = pageNumber-1;

            $scope.currentPage = $scope.pdfViewerApp.page;
            $scope.totalPages = $scope.pdfViewerApp.pagesCount;

            if($scope.state != 'finished')
            {
                $scope.state = 'finished';

                onStateFinished.forEach(function(fct)
                {
                    fct();
                });
            }
        };

        $scope.onPageChanged = function()
        {
            $scope.currentPage = $scope.pdfViewerApp.page;

            var now = Date.now();
            //console.log(now, $scope.courseScope.lastForcedPageSwitch, now - $scope.courseScope.lastForcedPageSwitch);
            if(now - $scope.courseScope.lastForcedPageSwitch > 1000)
            {
                // if the last forced page switch is more than a second ago, assume the user decided to switch pages.
                $scope.courseScope.lastUserChosenPdfPage = now;
            }
        };

        $scope.courseScope.getCurrentPdfPage = function()
        {
            //console.log($scope.currentPage);
            return $scope.currentPage;
        };

        $scope.ensurePdfFrameWin = function()
        {
            if(!$scope.pdfFrameWindow)
            {
                var el = document.getElementById('pdfjsframe');
                $scope.pdfFrameWindow = el.contentWindow || el.contentDocument;
                $scope.pdfViewerApp = $scope.pdfFrameWindow.PDFView || $scope.pdfFrameWindow.PDFViewerApplication;
            }
        };


        function setupWatch()
        {
            $scope.ensurePdfFrameWin();

            $scope.pdfFrameWindow.addEventListener('pagerendered', $scope.onPageRendered);
            $scope.pdfFrameWindow.addEventListener('pagechange', $scope.onPageChanged);
        }
        //todo this timeout should be worked out. it should happen once the pdf viewer is loaded.
        $timeout(setupWatch, 500);
        $timeout(setupWatch, 1000);
        $timeout(setupWatch, 2000);
        $timeout(setupWatch, 5000);
        $timeout(setupWatch, 10000);

        $scope.nextPage = function() {
            $scope.currentPage++;
            $scope.courseScope.sourceData.slideNumber = $scope.currentPage;
            $scope.viewer.nextPage();
            scope.courseScope.lastUserChosenPdfPage = Date.now();
        };

        $scope.prevPage = function() {
            $scope.currentPage--;
            $scope.courseScope.sourceData.slideNumber = $scope.currentPage;
            $scope.viewer.prevPage();
            scope.courseScope.lastUserChosenPdfPage = Date.now();
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
            //$scope.viewer.gotoPage($scope.desired.page);
            $scope.jumpToPage($scope.desired.page);
            scope.courseScope.lastUserChosenPdfPage = Date.now();

            $timeout.cancel(hideTimeout);
            hideTimeout = $timeout(hideFct, 6000);
        };

        /*$scope.loadPDF = function(path) {
            if(path !== undefined)
            {
                var param = path.substr(0,4) !== 'data' ? path : $scope.convertDataURIToBinary(path);
                console.log('loadPDF ', path, param);
                PDFJS.getDocument(param, null, null, $scope.documentProgress).then(function(_pdfDoc) {
                    $scope.pdfDoc = _pdfDoc;
                    $scope.renderPage($scope.pageNum, function(success) {
                        if ($scope.loadProgress) {
                            $scope.loadProgress({state: "finished", loaded: 0, total: 0});
                        }
                    });
                }, function(message, exception) {
                    console.log("PDF load error: " + message);
                    if ($scope.loadProgress) {
                        $scope.loadProgress({state: "error", loaded: 0, total: 0});
                    }
                });
            }

        };*/

        scope.courseScope.switchToPdfPage = function(page)
        {
            //console.log(page, $scope.state);
            var todo = function()
            {
                $scope.courseScope.lastForcedPageSwitch = Date.now();
                $scope.desired.page = page;
                $scope.jumpToPage(page);
                //$scope.viewer.gotoPage(page);
            };
            if($scope.state == 'finished')
            {
                todo();
            }
            else
            {
                onStateFinished.push(todo);
            }
        };

        scope.courseScope.getCurrentPdfPage = function()
        {
            return $scope.currentPage;
        };

        scope.courseScope.getTotalPdfPages = function()
        {
            return $scope.totalPages;
        };

        /*$scope.loadProgress = function(state)
        {
            $scope.state = state;
            if(state == 'finished')
            {
                onStateFinished.forEach(function(fct)
                {
                    fct();
                })
            }
        };*/

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
            $scope.pdfWidth  = $scope.width * $scope.pdfScale -  1;
            $scope.pdfHeight = $scope.height * $scope.pdfScale - 110;
            if(!$scope.showPdfOptions) $scope.pdfHeight += 55;

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

        $scope.$watch('width', resize);
        $scope.$watch('height', resize);
        $scope.$watch('showPdfOptions', resize);
        setSize();

        return this;
    };

    /*this.getCurrentPage = function()
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
    };*/

    return {
        restrict: "E",
        scope: {
            concept: '=',
            segment: '=',
            source: '=',
            sourceData: '=sourcedata',
            showTitle: '=showtitle',
            width: '=',
            height: '='
        },
        transclude: true,
        templateUrl: 'modules/learning/views/players/booc-pdf-viewer.client.view.html',
        replace: true,
        link: init
    };
});
