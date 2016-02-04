'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('contents').factory('RandomString',
    function()
    {
        var service = {};

        service.get = function(length)
        {
            if(!length) length = 15;
            var alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
            var randomString = '';
            for(var i = 0; i < length; i++) {
                randomString += alphabet[Math.round(Math.random() * (alphabet.length - 1))];
            }
            return randomString;
        };

        service.getHex = function(length)
        {
            if(!length) length = 6;
            var alphabet = '0123456789abcdef';
            var randomString = '';
            for(var i = 0; i < length; i++) {
                randomString += alphabet[Math.round(Math.random() * (alphabet.length - 1))];
            }
            return randomString;
        };

        return service;
    }
);
