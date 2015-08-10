'use strict';

angular.module('concepts').controller('DependencyBulkEditController', ['$scope','$stateParams', '$location', 'Authentication','Concepts', 'Conceptdependencies', //' Course',
    function($scope, $stateParams, $location, Authentication, Concept, ConceptDependency)
    {
        $scope.authentication = Authentication;

        $scope.find = function(){

            Concept.query(function(concepts,e){
                $scope.concepts =concepts;
                //$scope.potentialParents = [{title:"--none--", color:"#000000"}].concat(d);
                //$scope.selectedConcept  = $scope.concepts[0];

                $scope.selectedConcepts = {}

                var dataMap = {};
                concepts.forEach(function(concept){
                    dataMap[concept._id]= concept;
                })

                ConceptDependency.query(function (deps, e) {
                    //$scope.dependencies = deps;
                    console.log(deps);



                    $scope.depsRich = deps.map(function(d,e){
                        var ret = {};


                        var proivderC = dataMap[d.provider];
                        if (proivderC !== undefined){
                            ret.providerConcept = proivderC;
                            if (ret.providerConcept.parents.length>0){
                                ret.providerParent = dataMap[proivderC.parents[0]].title;
                            }else{
                                ret.providerParent = " -- ";
                            }
                        }else{
                            ret.providerConcept = {title: "-- deleted concept--", color:"#000000"};
                            ret.providerParent = " -- ";
                        }


                        var dependantC = dataMap[d.dependant];

                        if (dependantC !== undefined){
                            ret.dependantConcept = dependantC;

                            if (ret.dependantConcept.parents.length>0){
                                ret.dependantParent = dataMap[dependantC.parents[0]].title;
                            }else{
                                ret.dependantParent = " -- ";
                            }



                        }else{
                            ret.dependantConcept = {title: "-- deleted concept--", color:"#000000"};
                            ret.dependantParent = " -- ";
                        }


                        ret._id = d._id;
                        ret.original = d;



                        return ret;

                    }).sort(function(a,b){
                        if (a.providerConcept.title > b.providerConcept.title) {
                            return 1;
                        }
                        if (a.providerConcept.title < b.providerConcept.title) {
                            return -1;
                        }
                        // a must be equal to b
                        return 0;
                    })








                })

                //Course.$query({}, function(courses,ee){
                //    $scope.courses = courses;
                //    $scope.selectedCourse = $scope.courses[0];
                //})


            });

        }

        $scope.addDep = function(){

            var selCo = $scope.selectedConcepts;

            if (selCo.hasOwnProperty("provider") && selCo.hasOwnProperty("dependant")){
                var cd = new ConceptDependency({
                    dependant: selCo.dependant._id,
                    provider: selCo.provider._id
                })


                cd.$save(function () {
                    console.log(cd._id+ " saved.");
                    $scope.selectedConcepts ={};
                    $scope.find();

                })

            }






        }

        $scope.deleteDep = function(dependency){

            dependency.original.$remove(function(){
                $scope.find();
            })



            //var selCo = $scope.activeHierarchy;
            //
            //if (selCo.hasOwnProperty("provider") && selCo.hasOwnProperty("dependant")){
            //    var cd = new ConceptDependency({
            //        dependant: selCo.dependant._id,
            //        provider: selCo.provider._id
            //    })
            //
            //
            //    cd.save(function () {
            //        console.log(cd._id+ " saved.");
            //        $scope.activeHierarchy ={};
            //        $scope.find();
            //
            //    })
            //
            //}






        }
	}
]);
