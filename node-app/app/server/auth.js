'use strict';

/**
 * ButtressJS - Realtime datastore for business software
 *
 * @file auth.js
 * @description
 * @module System
 * @author Chris Bates-Keegan
 *
 */

var Logging = require('./logging');
var Config = require('./config');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Buttress = require('buttress-js-api');

module.exports.init = app => {
  passport.use(new GoogleStrategy({
    clientID: Config.auth.google.clientId,
    clientSecret: Config.auth.google.clientSecret,
    callbackURL: `${Config.app.protocol}://${Config.app.host}/auth/google/callback`
  }, (accessToken, refreshToken, profile, cb) => {
    const user = {
      app: 'google',
      id: profile.id,
      token: accessToken,
      name: profile.displayName,
      email: profile.emails[0].value,
      profileUrl: profile._json.url,
      profileImgUrl: profile._json.image.url
      // bannerImgUrl: profile._json.cover.coverPhoto.url
    };

    Logging.logDebug(user);

    var authenticated = Config.auth.users.indexOf(user.email) !== -1;
    var authentication;
    if (authenticated) {
      authentication = {
        authLevel: 3,
        domains: ["http://dev.admin.buttressjs.com"],
        permissions: [{
          route: "*",
          permission: "*"
        }]
      };
    }

    Logging.logDebug(authentication);

    Buttress.Auth
      .findOrCreateUser(user, authentication)
      .then(Logging.Promise.log("ButtressUser: "))
      .then(buttressUser => cb(null, buttressUser))
      .catch(Logging.Promise.logError());
  }));

  passport.serializeUser((user, done) => {
    Logging.log('Auth Serialise User', Logging.Constants.LogLevel.VERBOSE);
    Logging.log(user, Logging.Constants.LogLevel.DEBUG);
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    Logging.log('Auth Deserialise User', Logging.Constants.LogLevel.VERBOSE);
    Logging.log(user, Logging.Constants.LogLevel.DEBUG);
    done(null, user);
  });

  app.get('/authenticated', (req, res) => {
    if (!req.user) {
      res.json(null);
      return;
    }

    res.json({
      user: {
        profiles: req.user.auth.map(function(a) {
          return {
            app: a.app,
            email: a.email,
            url: a.profileUrl,
            images: a.images
          };
        }),
        person: {
          title: req.user.person.title,
          forename: req.user.person.forename,
          initials: req.user.person.initials,
          surname: req.user.person.surname,
          formalName: req.user.person.formalName
        },
        authToken: req.user.buttressAuthToken
      }
    });
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/auth/google', passport.authenticate(
    'google', {
      scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
    }
  ));
  app.get('/auth/google/callback', passport.authenticate('google', {successRedirect: '/', failureRedirect: '/'}));
};
