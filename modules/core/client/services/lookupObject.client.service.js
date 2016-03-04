function LookupObject(list, key)
{
    var object = {};
    if(!key) key = '_id';

    if(list && list.length)
    {
        list.forEach(function(element)
        {
            object[element[key]] = element;
        });
    }

    return object;
}
