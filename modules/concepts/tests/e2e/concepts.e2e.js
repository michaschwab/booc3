describe('concept features', function()
{
    var oldTitle = 'test';
    var newTitle = 'abc';

    describe('concept editing', function()
    {
        it('should let you rename concepts', function()
        {
            browser.params.login.admin();

            browser.get('http://localhost:3000/courses/563285ed410846e876f00eb7?mode=admin');

            element.all(by.repeater('child in activeHierarchyChildren')).then(function(concepts)
            {
                var firstTitleInput = concepts[0].element(by.css('input.concept-title'));

                firstTitleInput.getAttribute('id').then(function(inputId)
                {
                    // inputId = concept-title-563285ed410846e876f00eb8
                    var conceptId = inputId.split('-')[2];

                    element(by.css('#concept-' + conceptId + ' text.concept-title')).getInnerHtml().then(function(innerHtml)
                    {
                        expect(innerHtml).not.toContain(newTitle);

                        firstTitleInput.clear().sendKeys(newTitle);

                        element(by.css('#concept-' + conceptId + ' text.concept-title')).getInnerHtml().then(function(innerHtml)
                        {
                            expect(innerHtml).toContain(newTitle);

                            firstTitleInput.clear().sendKeys(oldTitle);
                        });
                    });
                });
            });
        });
    });

    describe('creating', function()
    {
        it('should work', function()
        {
            browser.get('http://localhost:3000/courses/563285ed410846e876f00eb7?mode=admin');

            element.all(by.repeater('child in activeHierarchyChildren')).count().then(function(childCount)
            {
                element(by.css('.concept.add-concept')).click();

                expect(element.all(by.repeater('child in activeHierarchyChildren')).count()).toBe(childCount+1);


            });
        });
    });

    //browser.params.logout();
});
