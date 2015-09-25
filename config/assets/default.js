'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/angular-ui-select/dist/select.css',
        'public/lib/font-awesome/css/font-awesome.css',
        'public/lib/ngDialog/css/ngDialog.css',
        'public/lib/ngDialog/css/ngDialog-theme-default.css',
          'public/lib/bootstrap-toggle/css/bootstrap-toggle.css',
          'public/lib/shepherd.js/dist/css/shepherd-theme-arrows.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.js',
        'public/lib/jquery-ui/jquery-ui.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/angular-recursion/angular-recursion.js',
          'public/lib/bootstrap-toggle/js/bootstrap-toggle.js',
          'public/lib/tether/dist/js/tether.js',
          'public/lib/shepherd.js/dist/js/shepherd.js',

        'public/lib/x2js/xml2json.js',
        'public/lib/angular-xml/angular-xml.js',
        'public/lib/angular-socket-resource/socket-resource.js',
        'public/lib/d3/d3.js',
        'public/lib/d3-tip/index.js',

        'public/lib/pdfjs-dist/build/pdf.combined.js',
        'public/lib/ng-pdfviewer/ng-pdfviewer.js',

        'public/lib/angular-ui-select/dist/select.js',
        'public/lib/angular-sanitize/angular-sanitize.js',
        'public/lib/angular-ui-sortable/sortable.js',

        'public/lib/ngDialog/js/ngDialog.js',
        'public/lib/moment/moment.js',
        'public/lib/angular-moment-duration/src/angular-moment-duration.js',
          'public/lib/angular-youtube-mb/src/angular-youtube-embed.js'
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    views: ['modules/*/client/views/**/*.html']
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};
