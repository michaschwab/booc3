angular.module('courses').service('ConceptStructure', function(Concepts, Conceptdependencies, $cacheFactory, $timeout)
{
    var me = this;
    var courseId;
    var $scope;
    var depCache, todoCache;

    this.init = function(scope, courseIdentifier)
    {
        $scope = scope;
        courseId = courseIdentifier;

        if($scope.conceptMap === undefined)
        {
            $scope.conceptMap = {};
        }
        if($scope.dependencyMap === undefined)
        {
            $scope.dependencyMap = {};
        }

        $scope.getConceptById = function(id)
        {
            return $scope.conceptMap[id];
        };

        $scope.$on('conceptsReordered', me.emptyCache);
        $scope.$on('dataUpdated', me.emptyCache);
        $scope.$watchCollection('concepts.downloadedUpdates', this.setConceptsFromRemote);
    };

    this.emptyCache = function()
    {
        depCache.removeAll();
        todoCache.removeAll();
    };

    this.getConceptDependencyConcepts = function(concept, followChildren, providing)
    {
        var deps = this.getConceptDependencies(concept, followChildren, null, null, providing);

        return deps.map(function(dep) { return dep.concept; });
    };

    this.getConceptProvidings = function(concept, followChildren)
    {
        return this.getConceptDependencies(concept, followChildren, null, null, true);
    };

    depCache = $cacheFactory('depCache');

    this.getConceptDependencies = function(concept, followChildren, ignoreDeps, ignoreConcepts, providing)
    {
        var me = this;

        ignoreDeps = ignoreDeps || [];
        ignoreConcepts  = ignoreConcepts || [];
        providing = providing ? true : false;

        if(!concept || $scope.dependencies === undefined || ignoreConcepts.indexOf(concept.concept._id) !== -1)
        {
            return [];
        }

        var key = concept.concept._id + '-' + followChildren  + '-' +  providing  + '-' +  ignoreDeps.length + '-' + ignoreConcepts.length;
        var cacheVal = depCache.get(key);

        if(cacheVal)
        {
            return cacheVal;
        }
        //console.count(key);
        //console.count('hi');

        ignoreConcepts.push(concept.concept._id);

        if(followChildren === undefined)
        {
            followChildren = true;
        }

        var deps = [];
        $scope.dependencies.filter(function(dependency)
        {
            return $scope.directories.concepts[dependency.provider] && $scope.directories.concepts[dependency.dependant]
                && ((!providing && dependency.dependant === concept.concept._id) ||
                (providing && dependency.provider === concept.concept._id))
                && ignoreDeps.indexOf(dependency._id) === -1;
        })
        .forEach(function(dependency)
        {
            ignoreDeps.push(dependency._id);
            var provider = $scope.directories.concepts[dependency.provider];
            var dependant = $scope.directories.concepts[dependency.dependant];

            deps.push({ dependency: dependency, concept: provider, dependant: dependant });
            deps = deps.concat(me.getConceptDependencies(provider, true, ignoreDeps, ignoreConcepts, providing));
        });

        if(concept.parentData)
        {
            deps = me.getConceptDependencies(concept.parentData, false, ignoreDeps, ignoreConcepts, providing).concat(deps);
        }

        if(followChildren && concept.children && concept.children.length > 0)
        {
            concept.children.forEach(function(child)
            {
                deps = deps.concat(me.getConceptDependencies(child, true, ignoreDeps, ignoreConcepts, providing));
            });
        }

        if(!providing)
        {
            deps.push({ dependency: null, concept: concept });
        }

        depCache.put(key, deps);

        return deps;
    };


    /*var concepts = {};
    concepts['1'] = '564e1fef53071f405cf3957b';

    concepts['2'] = '564e1ff253071f405cf3957c';
    concepts['2-1'] = '5653d9836b58fbc037a7b930';
    concepts['2-2'] = '5653d9846b58fbc037a7b931';
    concepts['2-3'] = '5653d9846b58fbc037a7b932';

    concepts['3'] = '564e1ff353071f405cf3957d';
    concepts['3-1'] = '5653d9876b58fbc037a7b933';
    concepts['3-2'] = '5653d9886b58fbc037a7b934';
    concepts['3-3'] = '5653d9896b58fbc037a7b935';

    $timeout(function()
    {
        var checks = [];
        checks.push(['1', '2']);
        checks.push(['2', '3']);
        checks.push(['3', '2']);
        checks.push(['2-1', '2-2']);
        checks.push(['2-1', '2-3']);
        checks.push(['2-2', '2-3']);
        checks.push(['2-3', '2-2']);
        checks.push(['2-1', '2']);
        checks.push(['3-1', '3']);

        checks.forEach(function(check)
        {
            console.log(check[0], check[1], me.depIsPossible($scope.directories.concepts[concepts[check[0]]], $scope.directories.concepts[concepts[check[1]]]));
        });

    }, 2000);*/

    this.depExists = function(provider, dependant)
    {
        var sameDeps = $scope.dependencies.filter(function(dependency)
        {
            return dependency.provider == provider.concept._id && dependency.dependant == dependant.concept._id;
        });

        return sameDeps.length != 0;
    };

    this.depIsPossible = function(provider, dependant)
    {
        var complete = me.getTodoListSorted();

        var indexProvider = complete.indexOf(provider);
        var indexDependant = complete.indexOf(dependant);

        if(indexProvider === -1 || indexDependant === -1)
        {
            console.error('can not find dependency concepts in concept list of this course', indexProvider, indexDependant, provider, dependant, complete);
            return false;
        }
        if(indexProvider >= indexDependant)
        {
            return false;
        }
        //todo more checks.
        return true;

    };

    this.getProvidingListSorted = function(concept)
    {
        return this.getTodoListSorted(concept, true);
    };

    todoCache = $cacheFactory('todoCache');

    this.getTodoListSorted = function(concept, providing)
    {
        var depIds;
        providing = providing ? true : false;

        // making sure the caches of the different concepts or different courses are not mixed up
        var key = concept ? concept.concept._id + '-' + providing : 'course' + courseId + '-' + providing;
        var cacheVal = concept ? todoCache.get(key) : null;

        if(cacheVal && cacheVal.length > 0)
        {
            return cacheVal;
        }

        if(!concept)
        {
            depIds = $scope.concepts.map(function(c) { return c._id; });
        }
        else
        {
            var deps = this.getConceptDependencyConcepts(concept, true, providing);

            depIds = deps.map(function(dep) { return dep.concept._id; });
            //console.log(deps, depIds);
        }


        var filtered = this.filterConcepts($scope.active.topLevelConcepts, depIds);
        todoCache.put(key, filtered);

        //console.log(concept, depIds, filtered);

        return filtered;
    };

    this.filterConcepts = function(list, acceptedIds)
    {
        var me = this;
        var newlist = [];
        list.filter(function(c) { return acceptedIds.indexOf(c.concept._id) !== -1; }).sort(function(a,b){
            return d3.ascending(a.concept.order, b.concept.order);
        }).forEach(function(c)
        {
            //if(c.depth < 2) console.log(c);
            newlist.push(c);
            if(c.children && c.children.length > 0)
            {
                newlist = newlist.concat(me.filterConcepts(c.children, acceptedIds));
            }
        });
        return newlist;
    };

    this.setConceptsFromRemote = function()
    {
        //console.log('setting concepts from remote');

        $scope.concepts.forEach(function(concept)
        {
            $scope.conceptMap[concept._id] = concept;
        });
    };

    this.setDependencies = function()
    {
        $scope.dependencies = $scope.rawDeps.filter(function (dep) {
            return $scope.conceptMap[dep.provider] && $scope.conceptMap[dep.dependant];
        });

        $scope.dependencyMap = {};
        $scope.dependencies.forEach(function (dependency) {
            $scope.dependencyMap[dependency._id] = dependency;
        });
    };

    this.getConceptsAndDeps = function(callback)
    {
        Concepts.query({ courses: courseId }).$promise.then(function(d)
        {
            $scope.concepts = d;

            me.setConceptsFromRemote();

            Conceptdependencies.query({ course: courseId }).$promise.then(function(dp)
            {
                $scope.rawDeps = dp;
                me.setDependencies(dp);

                if(callback !== undefined)
                {
                    callback($scope.dependencies);
                }

                $scope.$watchCollection('rawDeps.downloadedUpdates', function()
                {
                    me.setDependencies($scope.rawDeps);
                    $scope.$broadcast('dataUpdated');
                });
            });
        })
    };

    this.getConceptChildrenFlat = function(concept)
    {
        if(concept === null) return [];

        var children = [concept];
        var me = this;

        if(concept.children && concept.children.length > 0)
        {
            concept.children.sort(function(a,b){return d3.ascending(a.concept.order, b.concept.order);}).forEach(function(child)
            {
                children = children.concat(me.getConceptChildrenFlat(child));
            });
        }

        return children;
    };

    this.getConceptChildren = function(array, parentId, parentData, depth, foreach)
    {
        $scope.concepts
            .filter(function(concept){
                if (parentId) {
                    return concept.parents.indexOf(parentId)>-1
                }else{
                    return concept.parents.length==0;
                }
            })
            .sort(function(a,b){return d3.ascending(a.order, b.order);})
            .forEach(function(concept, i){
                var obj = {
                    concept:concept,
                    depth: depth
                };
                if(parentData !== null && parentData !== undefined)
                {
                    obj.parentData = parentData;
                }
                $scope.directories.concepts[concept._id] = obj;
                array.push(obj);
            });

        array.forEach(function(concept, i)
        {
            if(foreach !== undefined)
            {
                foreach(array, depth, concept, i);
            }

            concept.children = [];
            me.getConceptChildren(concept.children, concept.concept._id, concept, depth+1, foreach);
        });

    };


    return (this);
});
