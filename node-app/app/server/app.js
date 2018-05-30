'use strict';

/**
 * ButtressJS - Realtime datastore for business software
 *
 * @file app.js
 * @description
 * @module System
 * @author Chris Bates-Keegan
 *
 */

const express = require('express');
const session = require('express-session');
const LevelStore = require('level-session-store')(session);
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Bootstrap = require('./bootstrap');
const Config = require('node-env-obj')('../');
const Logging = require('./logging');
const passport = require('passport');

/**
 * Express
 */
const app = module.exports = express();

/**
 * Configuration
 */
const configureDevelopment = () => {
  Config.env = 'dev';
  app.use(morgan('short'));
  app.set('port', Config.listenPort);
};

const configureProduction = () => {
  Config.env = 'prod';
  app.use(morgan('short'));
  app.set('port', Config.listenPort);
};

const configureTest = () => {
  Config.env = 'test';
  app.use(morgan('short'));
  app.set('port', Config.listenPort);
};

const configureApp = env => {
  app.enable('trust proxy', 1);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(methodOverride());

  app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: '6gZ1GsaKbZG4Pq7boSMp7YuZQTGnP6KVBvNpptn38sfHLrSoo0pYClRasSbVGCc',
    store: new LevelStore(`${Config.appDataPath}/sessions`)
  }));

  app.use(express.static(`${Config.appDataPath}/static`));
  app.use(passport.initialize());
  app.use(passport.session());

  switch (env) {
    default:
      break;
    case 'dev':
      configureDevelopment();
      break;
    case 'prod':
      configureProduction();
      break;
    case 'test':
      configureTest();
      break;
  }
};

configureApp(Config.env);

/**
 *
 */
Bootstrap
  .app(app)
  .then(() => {
    Logging.log(`${Config.app.title} ${Config.app.version} listening on port ` +
      `${Config.listenPort} in ${app.settings.env} mode.`, Logging.Constants.LogLevel.INFO);
    app.server = app.listen(app.set('port'));
  })
  .catch(Logging.Promise.logError());
