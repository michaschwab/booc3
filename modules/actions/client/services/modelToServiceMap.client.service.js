'use strict';

//Conceptdependencies service used to communicate Conceptdependencies REST endpoints
angular.module('actions').service('ModelToServiceMap',
    function()
    {
        var mapping = {};
        mapping['Concept'] = 'Concepts';
        mapping['Conceptdependency'] = 'Conceptdependencies';
        mapping['LearnedConcept'] = 'LearnedConcepts';

        this.map = function(modelName)
        {
            return mapping[modelName] ? mapping[modelName] : modelName + 's';
        };

        return this;
    }
);
