angular.module('concepts').directive('contenteditable', ['$sce', function($sce) {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model
                //console.log(scope, ngModel, element);

                // Specify how UI should be updated
                ngModel.$render = function() {
                    //console.log(ngModel.$viewValue);
                    element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                };

                // Listen for change events to enable binding
                element.on('blur keyup change', function() {
                    scope.$evalAsync(read);
                });
                read(); // initialize

                // Write data to the model
                function read() {
                    //console.log(ngModel.$viewValue);
                    var html = element.html();
                    //console.log(html);
                    // When we clear the content editable the browser leaves a <br> behind
                    // If strip-br attribute is provided then we strip this out
                    if ( attrs.stripBr && html == '<br>' ) {
                        html = '';
                    }
                    if(html.length > 0)
                    {
                        ngModel.$setViewValue(html);
                        //ngModel.$render();
                    }
                    //
                }
            }
        };
    }]);