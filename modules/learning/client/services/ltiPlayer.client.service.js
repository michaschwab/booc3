

angular.module('learning').config(['OAuthProvider', function(OAuthProvider)
{
    var launchUrl = 'https://app.perusall.com/lti/launch/advanced-quantitative-research-methodology-gov2001';
    var consumerKey = 'advanced-quantitative-research-methodology-gov2001';
    var sharedSecret = '4ucxWopJxjodjU-RkljbiVM2P7fUXF91dpMJn5diiIa';

    OAuthProvider.configure({
        baseUrl: launchUrl,
        clientId: consumerKey,
        clientSecret: sharedSecret
    });
}]
).service('LtiPlayer', function($interval, $timeout, $http, $sce, OAuth, Authentication)
    {
        var me = this;
        var $scope;

        var player;

        var user = Authentication.user;

        console.log(Authentication);

        this.start = function(scope)
        {
            $scope = scope;

            var launchUrl = 'https://app.perusall.com/lti/launch/advanced-quantitative-research-methodology-gov2001';
            var consumerKey = 'advanced-quantitative-research-methodology-gov2001';
            var sharedSecret = '4ucxWopJxjodjU-RkljbiVM2P7fUXF91dpMJn5diiIa';

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

            var signature = oauthSignature.generate('GET', launchUrl, {}, sharedSecret, options);
            // console.log(signature);

            var token = user.providerData.accessToken;

            /*var config = { params: {}};
         var oauthParams = {
         oauth_consumer_key: user.provider,
         oauth_token: token,
         /!*oauth_signature_method: 'HMAC-SHA1',
         oauth_signature: signature,*!/
         /!*oauth_timestamp: 1191242096,*!/
         /!*oauth_nonce: 'kllo9940pd9333jh',*!/
         oauth_version: 1.0
         };
         config.params = angular.extend(oauthParams, options);*/


            // sig = oauth_sig(userAttributes, sharedSecret)
            // POST(userAttributes, sharedSecret)

            //console.log(config.params);

            // oauth_token=nnch734d00sl2jdk&oauth_signature_method=HMAC-SHA1&oauth_signature=tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D&oauth_timestamp=1191242096&oauth_nonce=kllo9940pd9333jh&oauth_version=1.0
            // http://photos.example.net/photos?file=vacation.jpg&size=original&oauth_consumer_key=dpf43f3p2l4k3l03&oauth_token=nnch734d00sl2jdk&oauth_signature_method=HMAC-SHA1&oauth_signature=tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D&oauth_timestamp=1191242096&oauth_nonce=kllo9940pd9333jh&oauth_version=1.0

            //options['oauth_consumer_key'] = id;
            //options['']

            //var data = angular.copy(options);
            //data['oauth_signature'] = signature;

            /*var formData = new FormData();

            for(var key in options)
            {
                if(options.hasOwnProperty(key))
                {
                    formData.append(key, options[key]);
                }
            }

            formData.append('oauth_signature', signature);*/

            $timeout(function()
            {
                //var doc = $('#lti-frame').document;

                var iframe = document.getElementById("lti-frame");
                var doc = (iframe.contentWindow || iframe.contentDocument);
                if (doc.document) doc = doc.document;
                //console.log(doc);

                var f = doc.createElement('form');
                f.setAttribute('method', 'get');
                f.setAttribute('name', 'lti-launch-form');
                f.setAttribute('id', 'lti-launch-form');
                f.setAttribute('action', launchUrl);
                f.setAttribute('target', '_blank');

                var addData = function(name, value)
                {
                    var i = doc.createElement("input");
                    i.setAttribute('type', "text");
                    i.setAttribute('name', name);
                    i.setAttribute('value', value);
                    f.appendChild(i);
                };

                for(var key in options)
                {
                    if(options.hasOwnProperty(key))
                    {
                        //formData.append(key, options[key]);
                        addData(key, options[key]);
                    }
                }

                addData('oauth_signature', signature);

                doc.getElementsByTagName('body')[0].appendChild(f);

                $timeout(function()
                {
                    doc.getElementById('lti-launch-form').submit();
                }, 1000);

            }, 1000);
            /*$http.post(launchUrl, data).then(function(response, b)
            {
                console.log(response);
                console.log(b);
            }, function(e)
            {
                console.error(e);
            });*/

            /*OAuth.getAccessToken({username: 'slaediap@trashmail.ws', password: 'testtest'}).then(function(token)
            {
                console.log(token);
            }, function(e)
            {
                console.error(e);
            });*/






            /*var consumer = new lti.ToolConsumer(address, id, secret);

             consumer.withSession(function(session)
             {
             var payload = {
             lti_version: 'LTI-1p0',
             lti_message_type: 'basic-lti-launch-request',
             resource_link_id: '0',
             tool_consumer_instance_guid: 'booc',
             user_id: 'abc',
             roles: 'Student',
             lis_person_name_full: 'ab cd',
             lis_person_name_given: 'ab',
             lis_person_name_family: 'cd',
             lis_person_contact_email_primary: 'me@michaschwab.de'
             };

             session.basicLaunch(payload).then(function(r)
             {
             console.log(r);
             r.map(function(a) {
             console.dir(a);
             });
             //res.json({a: 0});
             })
             .catch(function(e)
             {
             console.log(e);
             })
             .done(function()
             {
             res.json({a: 1})
             });
             });*/

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
            //console.log('loading pdf player data');

            /*var url = source.path.indexOf('http') !== -1 ? source.path : './modules/contents/uploads/pdf/' + source.path;

             me.parseDocumentSegmentSourceData(url, function(result)
             {
             callback({document: result});

             if(segment.start)
             {
             $timeout(function()
             {
             PdfViewer.goToPage(segment.start);
             }, 500);
             }
             })*/
        };

        this.parseDocumentSegmentSourceData = function(path, callback)
        {
            //console.log('loading pure pdf data');
            // If local file, display. Otherwise, use CORS Proxy for loading.
            /*var url = path.indexOf('http') !== -1 ? 'http://www.corsproxy.com/' + path.replace('http://','') : path;

             $http.get(url, {responseType:'arraybuffer'}).
             //$http.get('http://www.corsproxy.com/' + source.path.replace('http://',''), {responseType:'arraybuffer'}).
             //success(function(data, status, headers, config) {
             success(function(data) {

             var file = new Blob([data], {type: 'application/pdf'});
             var fileURL = URL.createObjectURL(file);

             var result = $sce.trustAsResourceUrl(fileURL);

             callback(result);
             });*/
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
