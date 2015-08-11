'use strict';

module.exports = {
  app: {
    title: 'Course Explorer',
    description: 'Online Learning - non-linear, and perfect for you',
    keywords: 'mooc, learning, course, non-linear',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  sessionSecret: 'MEAN',
  sessionCollection: 'sessions',
  logo: 'modules/core/img/brand/logo.png',
  favicon: 'modules/core/img/brand/favicon.ico'
};
