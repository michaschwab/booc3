'use strict';

angular.module('contents').directive('conceptSelect', function()
{
    return {
        restrict: 'E',
        /*scope: {
            concepts: '=concepts',
            onSelect: '=onSelect'
        },*/
        templateUrl: 'modules/contents/views/conceptSelect.client.view.html',
        link: function(scope, element, attrs, ctrls, transcludeFn)
        {
            //console.log(attrs);
            //console.log(scope);
            scope.onSelect = scope[attrs.onSelect];
            scope.concepts = scope[attrs.concepts];
            scope.model = scope[attrs.model];
            scope.id = scope[attrs.id];

            //console.log(attrs.model);
        }
    };
}).directive('conceptMultiSelect', function($timeout)
{
    return {
        restrict: 'E',
        scope: {
         concepts: '=concepts',
         ngModel: '=ngModel'
         },
        templateUrl: 'modules/contents/views/conceptMultiSelect.client.view.html',
        link: function(scope, element, attrs, ctrls, transcludeFn)
        {
            scope.concepts = scope[attrs.concepts];

            scope.addConcept = function(concept, scope)
            {
                //console.log(concept);
                //$scope.activeSegment.conceptObjects.push(concept);
                scope.ngModel.push(concept);
                scope.$select.selected = null;
            };
        }
    };
});
