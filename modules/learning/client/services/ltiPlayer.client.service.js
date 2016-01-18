

angular.module('learning').service('LtiPlayer', function($interval, $timeout, $http, $sce, Authentication)
    {
        var me = this;
        var $scope;

        var player;

        var user = Authentication.user;

        var randomString = function(length) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for(var i = 0; i < length; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };

        this.start = function(scope)
        {
            $scope = scope;


            return this;
        };

        this.play = function()
        {

        };

        this.stop = function()
        {

        };

        this.manageSize = function()
        {
            me.setSize($scope.contentWidth - 15);
        };

        this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
        {
            /*
            var launchUrl = 'https://app.perusall.com/lti/launch/advanced-quantitative-research-methodology-gov2001';
            var consumerKey = 'advanced-quantitative-research-methodology-gov2001';
            var sharedSecret = '4ucxWopJxjodjU-RkljbiVM2P7fUXF91dpMJn5diiIa';
            */
            var launchUrl = source.path;
            var consumerKey = source.data.consumerKey;
            var sharedSecret = source.data.sharedSecret;

            var nonce = randomString(32);
            var timestamp = Math.round(Date.now() / 1000);

            var oauthParameters = {
                oauth_consumer_key : consumerKey,
                oauth_timestamp: timestamp,
                oauth_nonce: nonce,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_version : '1.0'
            };

            var options = {
                lti_version: 'LTI-1p0',
                lti_message_type: 'basic-lti-launch-request',
                resource_link_id: '0',
                tool_consumer_instance_guid: 'booc',
                user_id: user.providerData.id,
                roles: 'Learner',
                lis_person_name_full: user.providerData.displayName,
                lis_person_name_given: user.providerData.name.givenName,
                lis_person_name_family: user.providerData.name.familyName,
                lis_person_contact_email_primary: user.providerData.emails[0].value
            };

            if(segment.data && segment.data.resource_link_title)
            {
                options.resource_link_title = segment.data.resource_link_title;
            }
            if(segment.data && segment.data.resource_link_id)
            {
                options.resource_link_id = segment.data.resource_link_id;
            }

            var combinedData = angular.extend({}, oauthParameters, options);

            var signature = oauthSignature.generate('POST', launchUrl, combinedData, sharedSecret, '', { encodeSignature: false});

            $timeout(function()
            {
                //var doc = $('#lti-frame').document;

                var iframe = document.getElementById("lti-frame");
                var doc = (iframe.contentWindow || iframe.contentDocument);
                if (doc.document) doc = doc.document;

                var link = doc.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('href', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css');
                doc.getElementsByTagName('head')[0].appendChild(link);

                var f = doc.createElement('form');
                f.setAttribute('method', 'post');
                f.setAttribute('name', 'lti-launch-form');
                f.setAttribute('id', 'lti-launch-form');
                f.setAttribute('action', launchUrl);
                f.setAttribute('target', '_blank');

                var addData = function(name, value)
                {
                    var i = doc.createElement("input");
                    i.setAttribute('type', "hidden");
                    i.setAttribute('name', name);
                    i.setAttribute('value', value);
                    f.appendChild(i);
                };

                for(var key in combinedData)
                {
                    if(combinedData.hasOwnProperty(key))
                    {
                        addData(key, combinedData[key]);
                    }
                }

                addData('oauth_signature', signature);

                var i = doc.createElement("button");
                //i.setAttribute('type', 'submit');
                //i.setAttribute('name', 'submitButton');
                i.setAttribute('value', 'Open LTI');
                i.setAttribute('class', 'btn btn-default');
                i.innerHTML = '<span class="glyphicon glyphicon-new-window"></span> Open LTI in New Window';
                i.onclick = function()
                {
                    doc.getElementById('lti-launch-form').submit();
                    return false;
                };
                f.appendChild(i);

                doc.getElementsByTagName('body')[0].appendChild(f);

                /*$timeout(function()
                 {
                 doc.getElementById('lti-launch-form').submit();
                 }, 1000);*/

            }, 1000);
        };

        this.parseDocumentSegmentSourceData = function(path, callback)
        {

        };

        this.setSize = function(goalWidth, goalHeight)
        {
            //console.log(goalWidth);
            /*var start = $scope.pdfWidth;
             var distance = start - goalWidth;
             var viewer = $('#viewer');
             viewer.animate({ width: goalWidth }, {progress: function(promise, remaining)
             {
             //$scope.courseScope.panelWidth = start - remaining * distance;
             $scope.pdfWidth = start - remaining * distance;

             $scope.safeApply();
             }});*/
        };

        this.setSizeQuick = function(goalWidth, goalHeight)
        {
            //console.log(goalWidth, 'quick');
            /*var viewer = $('#viewer');

             viewer.css('width', goalWidth);
             $scope.pdfWidth = goalWidth;

             $scope.safeApply();*/
        };

    });
