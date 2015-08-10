angular.module('actions').filter('undoMessage', function()
{
    return function(action)
    {
        if(action)
        {
            var text = '';
            var deletedDataCount = {};

            for(var type in action.data)
            {
                if(action.data.hasOwnProperty(type))
                {
                    deletedDataCount[type] = action.data[type].length;

                }
            }

            var typeCount = Object.keys(deletedDataCount).length;
            var i = 0;

            for(type in deletedDataCount)
            {
                if(deletedDataCount.hasOwnProperty(type))
                {
                    var currentCount = action.data[type].length;
                    text += currentCount + ' ' + type;

                    if(currentCount != 1) text += 's'; // Plural for 0 and 2..n

                    if(i < typeCount - 2)
                    {
                        text += ', ';
                    }
                    else if(i == typeCount - 2)
                    {
                        text += ' and ';
                    }

                    i++;
                }
            }

            var pastTense = {};
            pastTense['create'] = 'created';
            pastTense['delete'] = 'deleted';
            pastTense['edit'] = 'edited';

            var undone = action.undone ? 'un' : '';

            text += ' successfully ' + undone + pastTense[action.type] + '.';

            return text;
        }

    };
});
