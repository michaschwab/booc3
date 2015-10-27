'use strict';

describe('Courses E2E Tests:', function () {
    describe('Signin Validation', function ()
    {
        it('Should report missing credentials', function ()
        {
            browser.params.logout();
            browser.get('http://localhost:3000/');
            expect(element.all(by.repeater('course in courses')).count()).toEqual(0);
            //browser.driver.wait(function() {}, 10000);
        });

        it('Should should list some courses once logged in', function ()
        {
            browser.params.login.admin();
            browser.get('http://localhost:3000/');

            expect(element.all(by.repeater('course in courses')).count()).toBeGreaterThan(0);

            //browser.params.logout();
        });
    });

    describe('Create Process', function ()
    {
        var newCourseTitle = 'End To End Course';

        it('Should have the proper header', function()
        {
            browser.get('http://localhost:3000/courses/create');

            expect(element(by.css('.page-header h1')).getInnerHtml()).toBe('Create Course');
        });

        it('Should let you create courses', function()
        {
            browser.get('http://localhost:3000/courses/create');



            element( by.model('course.title') ).sendKeys( newCourseTitle );
            element( by.model('course.short') ).sendKeys( 'e2e' );
            element( by.model('course.description') ).sendKeys( 'Lorem Ipsum abc' );

            element( by.partialButtonText('Create')).click();

            browser.waitForAngular();

            expect(element(by.css('.course-title')).getInnerHtml()).toBe(newCourseTitle);
        });

        it('Should let you remove courses', function(done)
        {
            browser.get('http://localhost:3000/courses/');

            function getName(course, callback)
            {
                course.element(by.css('.course-title')).getInnerHtml().then(callback);
            }

            function getNames(courses, callback, i, names)
            {
                if(!names) names = [];
                if(i === undefined) i = 0;

                if(i < courses.length)
                {
                    getName(courses[i], function(courseName)
                    {
                        i++;
                        names.push(courseName);
                        getNames(courses, callback, i, names);
                    });
                }
                else
                {
                    callback(names);
                }
            }

            element.all(by.repeater('course in courses')).count().then(function(count)
            {
                element.all(by.repeater('course in courses')).then(function(courses)
                {
                    getNames(courses, function(courseNames)
                    {
                        for(var i = 0; i < courses.length; i++)
                        {
                            var courseTitle = courseNames[i];
                            var course = courses[i];

                            if(courseTitle == newCourseTitle)
                            {
                                break;
                            }
                        }

                        course.element(by.css('.remove-button')).click().then(function()
                        {
                            element.all(by.repeater('course in courses')).count().then(function(newCount)
                            {
                                expect(newCount).toBe(count - 1);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
