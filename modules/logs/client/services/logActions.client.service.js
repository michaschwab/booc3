'use strict';

angular.module('logs').service('LogActions', function ()
{
    var actions = [];
    actions.push('ConceptSearchSelect');
    actions.push('ConceptSearchUnSelect');

    actions.push('PanelConceptClick');
    actions.push('PanelLectureConceptClick');
    actions.push('PanelConceptCircleClick');
    actions.push('PanelSegmentClick');
    actions.push('PanelLectureSegmentClick');
    actions.push('PanelLectureClick');

    actions.push('PanelMaximizeClick');
    actions.push('PanelMinimizeClick');
    actions.push('PanelUnderstoodClick');
    actions.push('PanelSeenClick');
    actions.push('PanelNotSeenClick');
    actions.push('PanelPreviousClick');
    actions.push('PanelNextClick');
    actions.push('LectureTabClick');
    actions.push('PlanTabClick');
    actions.push('PanelLearnClick');
    actions.push('PanelMapClick');
    actions.push('PanelGoalClick');
    actions.push('PanelUnsetGoalClick');
    actions.push('PanelCourseClick');

    actions.push('WindowLoad');
    actions.push('WindowUnload');

    actions.push('FeedbackModalCancel');

    actions.push('HeaderTourClick');
    actions.push('HeaderLogoClick');
    actions.push('HeaderSignoutClick');
    actions.push('HeaderFeedbackClick');

    actions.push('EnterCourse');

    actions.push('MapZoomOut');
    actions.push('MapZoomIn');

    actions.push('MapFuturePlansToggleClick');
    actions.push('MapConceptPlay');
    actions.push('MapStartClick');

    actions.push('TourYes');
    actions.push('TourNo');
    actions.push('TourExit');
    actions.push('TourBack');
    actions.push('TourNext');
    actions.push('TourFinish');

    this.getArray = function()
    {
        return actions;
    };

    return (this);
});
