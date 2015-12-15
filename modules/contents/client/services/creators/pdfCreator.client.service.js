angular.module('contents').service('PdfCreator', function($http, FileUploader, $window, $timeout, $sce, PdfViewer)
    {
        var me = this;
        var $scope = null;

        this.start = function(scope)
        {
            $scope = scope;

            PdfViewer.init($scope);
            $scope.source.data = {};
            $scope.sourceData = {};

            $scope.$watch('source.path', me.updatePdfPath);

            function setupPdfUploader()
            {
                $scope.uploader = new FileUploader({
                    url: 'api/sources/pdf'
                });

                $scope.cancelUpload = function ()
                {
                    $scope.uploader.clearQueue();
                    //$scope.zipURL = $scope.user.profileImageURL;
                };

                $scope.uploader.onSuccessItem  = function (fileItem, response, status, headers)
                {
                    // Show success message
                    $scope.uploadSuccess = true;

                    $scope.source.path = response.fileName;
                    me.updatePdfPath();

                    $scope.cancelUpload();
                };

                $scope.uploader.onAfterAddingFile = function (fileItem)
                {
                    if ($window.FileReader) {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(fileItem._file);

                        fileReader.onload = function (fileReaderEvent) {
                            $timeout(function () {
                                //$scope.zipURL = fileReaderEvent.target.result;
                                //console.log($scope.zipURL);

                                $scope.uploader.uploadAll();
                            }, 0);
                        };
                    }
                };

                $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
                    // Clear upload buttons
                    $scope.cancelUpload();

                    // Show error message
                    console.error(response.message);
                };

                $scope.uploadPdf = function(element)
                {
                    if(element.files.length == 1)
                    {
                        var file = element.files[0];
                        $scope.uploader.addToQueue(file);
                    }
                };
            }

            setupPdfUploader();

        };

        this.getCurrentPosition = function()
        {
            return PdfViewer.getCurrentPage();
        };

        this.updatePdfPath = function()
        {
            if($scope.source.path)
            {
                me.parseDocumentSegmentSourceData('./modules/contents/uploads/pdf/' + $scope.source.path, function(pdfData)
                {
                    $scope.sourceData.document = pdfData;
                });
            }
        };

        this.parseDocumentSegmentSourceData = function(path, callback)
        {
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
            //callback({video: vidData });
        };



        return (this);
    });
