'use strict';

//Conceptdependencies service used to communicate Conceptdependencies REST endpoints
angular.module('actions').service('Undo', function($injector, ModelToServiceMap)
{
    this.undo = function(action)
    {
        if(action.type == 'delete')
        {
            // Bring back
            var data = action.data;

            for(var dataType in data)
            {
                if(data.hasOwnProperty(dataType) && data[dataType].length > 0)
                {
                    // dataType is eg LearnedConcept, Conceptdependency, or Concept.
                    data[dataType].forEach(function(entry)
                    {
                        var Service = $injector.get(ModelToServiceMap.map(dataType));
                        var document = new Service(entry);
                        document.triggerAction = false; // to avoid duplicating the action

                        document.$save();
                    });
                }
            }

            action.undone = true;
            action.undoneDate = Date.now();
            action.$update();
        }
        else if(action.type == 'edit')
        {
            // TODO Undo editing.
            // TODO Replace action.data with the current data, so the data is not lost and it can be redone.
        }
        else if(action.type == 'create')
        {
            // TODO Undo creating.
        }
    };

    this.redo = function(action)
    {
        if(action.type == 'delete')
        {
            // Delete again.
            // TODO: that most of the data will automatically be deleted by just deleting 1 of the documents,
            // e.g. this will try to manually delete conceptdependencies that are already automatically being deleted because of the deletion of the concept.
            var data = action.data;

            for(var dataType in data)
            {
                if(data.hasOwnProperty(dataType) && data[dataType].length > 0)
                {
                    // dataType is eg LearnedConcept, Conceptdependency, or Concept.
                    data[dataType].forEach(function(entry)
                    {
                        var Service = $injector.get(ModelToServiceMap.map(dataType));
                        var document = new Service(entry);

                        document.$remove({triggerAction: false});
                    });
                }
            }

            action.undone = false;
            //$scope.action.undoneDate = Date.now();
            action.$update();
        }
        else if(action.type == 'edit')
        {
            // TODO Redo editing.
            // TODO Replace action.data with the previous data, so it can be undone.
        }
        else if(action.type == 'create')
        {
            // TODO Redo creating.
        }
    };

    return (this);
});
