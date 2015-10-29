describe('concept features', function()
{
    var newTitle = 'abc';

    describe('concept editing', function()
    {
        //browser.params.login.admin();

        it('should let you rename concepts', function()
        {
            //browser.driver.sleep(1);
            //browser.waitForAngular();
            browser.get('http://localhost:3000/courses/563285ed410846e876f00eb7?mode=admin');

            element.all(by.repeater('child in activeHierarchyChildren')).then(function(concepts)
            {
                var firstTitleInput = concepts[0].element(by.css('input.concept-title'));

                firstTitleInput.getAttribute('id', function(inputId)
                {
                    // inputId = concept-title-563285ed410846e876f00eb8
                    var conceptId = inputId.split('-')[2];

                    element(by.css('#concept-' + conceptId + ' text.concept-title')).getInnerHtml().then(function(innerHtml)
                    {
                        expect(innerHtml).not.toContain(newTitle);
                        console.log(innerHtml);
                    });

                    firstTitleInput.clear().sendKeys(newTitle);

                    element(by.css('#concept-' + conceptId + ' text.concept-title')).getInnerHtml().then(function(innerHtml)
                    {
                        expect(innerHtml).toContain(newTitle);
                        console.log(innerHtml);
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


        });
    });

    //browser.params.logout();
});
