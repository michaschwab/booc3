'use strict';

//Menu service used for managing  menus
angular.module('core').service('FocusManager',
    function ($rootScope, $location, $timeout)
    {
        var me = this;
        var lastLearnMode;

        this.focusLearningMaterial = function()
        {
            $('.learnContent').focus();
            console.log('focusing learning content');
        };

        this.checkIfLearning = function()
        {
            var searchParams = $location.search();
            var learnMode = false;

            if(searchParams.learn && searchParams.learn === 'yes')
            {
                learnMode = true;
            }

            if(learnMode)
            {
                me.focusLearningMaterial();

                $timeout(me.focusLearningMaterial, 1000);
            }
        };

        this.init = function()
        {
            $timeout(me.checkIfLearning, 5000);
            $rootScope.$on('$locationChangeSuccess', me.checkIfLearning);
        };
    });
