'use strict';

angular.module('concepts').controller('ConceptsBulkEditController', ['$scope', '$stateParams', '$location', 'Authentication',
    'Concepts', 'Conceptdependencies', 'Courses',
	function($scope, $stateParams, $location, Authentication, Concept, Cdependencies, Courses//, ConceptDependency
    )
	{
        $scope.authentication = Authentication;

        // consistent sort function

        var conceptsSortFunction = function(a,b){

                   var aComp = "",
                       bComp= "";

                   if (a.parents.length>0){
                       aComp = a.parents[0] ;
                   }
                   if (b.parents.length>0){
                       bComp = b.parents[0];
                   }

                    aComp+="-"+ a.order;
                    bComp+="-"+ b.order;

                   if (aComp > bComp) {
                       return 1;
                   }
                   if (aComp< bComp) {
                       return -1;
                   }
                   // a must be equal to b
                   return 0;
               }





        // -- for listing concepts
		$scope.find = function(){
            console.log("find --- ");
            $scope.selectedConcepts ={};
            Concept.query({},function(d,e){

                $scope.concepts =d;
                $scope.concepts.sort(conceptsSortFunction);
                $scope.potentialParents = [{title:"--none--", color:"#000000"}].concat(d);
                $scope.selectedConcepts.concept  = $scope.potentialParents[0];


                Courses.query(function(courses){
                    if (courses.length>0){
                        $scope.courses = courses;
                        $scope.selectedCourse = $scope.courses[0];
                    }

                })




               $scope.$watch(function () {
                   return $scope.selectedConcepts.concept
               }, function (n,o) {
                   if (n === undefined || n.title == "--none--") {
                       $scope.concepts = d;
                       $scope.concepts.sort(conceptsSortFunction);
                   } else {
                       $scope.concepts = d.filter(function (value) {
                          return (value.parents.indexOf(n._id)>-1 || value._id == n._id);
                       });
                       $scope.concepts.sort(conceptsSortFunction);
                   }
               })

            })
		}


        // -- for concept detail view
        $scope.findTheOne = function(){
            console.log("find the one");
			Concept.query({},function(d,e){
				$scope.concepts =d;

				var dataMap = {};
				d.forEach(function(dd){
					dataMap[dd._id]= dd;
				})

				var actualConcept = dataMap[$stateParams.conceptId]
				$scope.concept = actualConcept;

				$scope.children = actualConcept.children.map(function(dd){
					var child = dataMap[dd];
                    if (!child){
                        child = new Concept({_id:dd});
                    }
                    return child;
				})
                //
				$scope.dependencies =[];
                $scope.provides =[];
				Cdependencies.query( function(deps){
                    console.log("DEPS", deps);
					deps.forEach(function (dep) {

                        // --- DEPENDENDANT ---
                        if (dep.dependant == actualConcept._id){
                            var depCon = dataMap[dep.provider];
                            if (!depCon){
                                depCon = new Concept({_id:dep.provider});
                            }
                            $scope.dependencies.push(depCon)
                        }

                        // --- PROVIDER ---
                        if (dep.provider == actualConcept._id){
                            var depCon = dataMap[dep.dependant];
                            if (!depCon){
                                depCon = new Concept({_id:dep.dependant});
                            }
                            $scope.provides.push(depCon)
                        }
					})

				})

			});


		}

		$scope.update = function(){

			$scope.concept.children = $scope.children.map(function(d){
				return d._id;
			})


            Concept.update({_id:$scope.concept._id}, $scope.concept,
                function(v){
                    console.log("saved:", v);
                    $scope.error = "saved  at " +new Date();
                },
                function(err){
                    console.log("ERROR saving:", err);
                    console.log(err.data);
                    $scope.error = "DID NOT SAVE !! (Error) ";
                }
            );

		}


		$scope.delete = function(concept){
			concept.$remove(function(){
                $scope.find();
            });


		}

		$scope.bulkAdd= function(){ // TODO: @HEN fix that !!!

			console.log("THIs",this);
			var that = this;
			var parentConcept = this.selectedConcepts.concept;

			if (parentConcept.title==="--none--"){ // TODO: make less redundant...
				//simple mode

				Concept.query({parents: []}, function(toplevel){
					// define smallest order number:

					var order = -1;
					toplevel.forEach(function(tl){
						if (tl.order && tl.order>order) order = tl.order;
					})


					order++;

					var splits = that.bulkAddContent.split("\n");


                    var toBeSavedConcepts = [];

					splits.forEach(function(cName,i){
						var name = cName.trim();

						if (name.length>0){
							var concept = new Concept({
								title:name,
								order:(order+i),
								parents:[],
								courses: [$scope.selectedCourse._id]
							})

                            toBeSavedConcepts.push(concept);


						}
					})




                    var saveAll = function(array, callback){

                        if (array.length < 1){

                            $scope.find();

                        }else{

                            var c = array.pop();

                            c.$save(function(){
                                console.log(name + " saved");
                                callback(array, callback)
                            })


                        }

                    }

                    saveAll(toBeSavedConcepts, saveAll);


				})




			}else{
				// a bit more complicated
				console.log("parent", parentConcept);
				Concept.query({parents:parentConcept._id}, function(toplevel){
					// define smallest order number:

					var order = -1;
					toplevel.forEach(function(tl){
						if (tl.order && tl.order>order) order = tl.order;
					})

					order++;

					var splits = that.bulkAddContent.split("\n");

                    var toBeSavedConcepts = [];

					splits.forEach(function(cName,i){
						var name = cName.trim();

						if (name.length>0){
							var concept = new Concept({
								title:name,
								order:(order+i),
								parents:[parentConcept._id],
								courses:[$scope.selectedCourse._id],
								color:parentConcept.color
							})


                            toBeSavedConcepts.push(concept);
			
						}
					})


                    var saveAll = function(array, parentConcept, callback){

                        if (array.length < 1){

                            $scope.find();

                        }else{

                            var c = array.pop();

                            c.$save(function(){
                                //parentConcept.children.push(c._id)
                                /*parentConcept.save(function(){
                                    console.log(name + " saved");
                                    callback(array, parentConcept, callback)
                                });*/
                                //Concept.update({_id: parentConcept._id}, parentConcept, function()
                                //{
                                //    console.log(parentConcept.title + " saved");
                                    callback(array, parentConcept, callback)
                                //},
                                //    function(err){
                                //        console.log("ERROR saving:", err);
                                //        console.log(err.data);
                                //        $scope.error = "DID NOT SAVE !! (Error) ";
                                //    })

                            })


                        }

                    }

                    saveAll(toBeSavedConcepts, parentConcept, saveAll);


					console.log(toplevel, order);
				})


			}






		}



	}
]);
