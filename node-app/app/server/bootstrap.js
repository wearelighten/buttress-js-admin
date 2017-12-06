'use strict';

/**
 * ButtressJS - Realtime datastore for business software
 *
 * @file config.js
 * @description
 * @module Config
 * @author Chris Bates-Keegan
 *
 */

const Config = require('./config');
const Buttress = require('buttress-js-api');
const Auth = require('./auth');

var _installApp = app => {
  Buttress.init({
    buttressUrl: Config.auth.buttress.url,
    appToken: Config.auth.buttress.appToken
  });
  Auth.init(app);
  // Model.init(app);
  // Routes.init(app);

  return Promise.resolve(true);
};

module.exports = {
  app: _installApp
};
