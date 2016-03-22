'use strict';

angular.module('logs').service('Logger', function (Authentication, $location, Log, $stateParams, $timeout)
{
    var keepEventProps = ['altKey', 'ctrlKey', 'detail', 'eventPhase', 'metaKey', 'shitKey', 'which', 'clientX', 'clientY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY', 'timeStamp', 'type'];
    this.log = function(action, data, event)
    {
        if (Authentication.user !== undefined && Authentication.user.hasOwnProperty('trackingConsent') && Authentication.user.trackingConsent)
        {
            var log = new Log();
            log.user = Authentication.user._id;
            log.address = $location.url();
            log.action = action;
            log.data = data;
            log.course = $stateParams.courseId;

            getEvent(log, event);

            var err = new Error();
            log.callstack = err.stack;

            $timeout(function()
            {
                log.$save();
            }, 1000);
        }
        else
        {
            console.log('Trying to log, but seems like you did not consent.');
            console.log('Please consider consenting to logging your clicks anonymously, as this will help improve this software.');
        }
    };

    function getEvent(log, event)
    {
        event = event || d3.event;
        if(event && event.target)
        {
            log.eventTargetId = event.target.id;
        }

        var newEvent = {};
        for(var prop in event)
        {
            if(keepEventProps.indexOf(prop) !== -1)
                newEvent[prop] = event[prop];
        }
        log.event = newEvent;
    }

    return (this);
});

/*{
    action: {
        type: String,
            required: 'need action type'
    },
    event: {
        type: Object
    },
    eventTargetId: {
        type: String
    },
    callstack: {
        type: Object
    },
    data: {
        type: Object
    },
    time: {
        type: Date,
    default: Date.now
    },
    address: String,
        course: { type: Schema.ObjectId, ref: 'Course' },
    user: { type: Schema.ObjectId, ref: 'User' }
}*/
