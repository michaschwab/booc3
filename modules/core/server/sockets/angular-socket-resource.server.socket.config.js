'use strict';

// Create the chat configuration
module.exports = function (io, socket, passportSocketIo) {
    var currentSocketId = socket.id;

    socket.on('save', function(data)
    {
        var mod = data.module;
        var entry = data.data;
        var restrictToUserIds = data.restrictToUserIds ? data.restrictToUserIds : false;

        if(restrictToUserIds && passportSocketIo)
        {
            var restrictedUserIds = restrictToUserIds.constructor === Array ? restrictToUserIds : [restrictToUserIds];

            passportSocketIo.filterSocketsByUser(io, function(user)
            {
                var userId = '' + user._id; // converting into string, b/c is object for some reason.
                return restrictedUserIds.indexOf(userId) !== -1;
            }).forEach(function(socket)
            {
                socket.emit('save-' + mod, entry);
            });
        }
        else
        {
            // Send to everyone
            io.sockets.emit('save-' + mod, entry);
        }
    });

    socket.on('update', function(data)
    {
        var mod = data.module;
        var entry = data.data;

        var restrictToUserIds = data.restrictToUserIds ? data.restrictToUserIds : false;

        if(restrictToUserIds && passportSocketIo)
        {
            var restrictedUserIds = restrictToUserIds.constructor === Array ? restrictToUserIds : [restrictToUserIds];

            passportSocketIo.filterSocketsByUser(io, function(user)
            {
                var userId = '' + user._id; // converting into string, b/c is object for some reason.
                return restrictedUserIds.indexOf(userId) !== -1;
            }).forEach(function(socket)
            {
                // Assuming that the active socket will take care of updating himself.
                //if(socket.id !== currentSocketId)
                {
                    socket.emit('update-' + mod, entry);
                }
            });
        }
        else
        {
            // Send to everyone
            socket.broadcast.emit('update-' + mod, entry);
        }
    });

    socket.on('remove', function(data)
    {
        var mod = data.module;
        var entry = data.data;

        io.sockets.emit('remove-' + mod, entry);
    });
};
