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

const Logging = require('./logging');
const Config = require('./config');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const Buttress = require('buttress-js-api');

module.exports.init = app => {
  passport.use(new GoogleStrategy({
    clientID: Config.auth.google.clientId,
    clientSecret: Config.auth.google.clientSecret,
    callbackURL: `/auth/google/callback`
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
        domains: [`${Config.app.protocol}://${Config.app.host}`],
        permissions: [{
          route: "*",
          permission: "*"
        }]
      };
    }

    Logging.logDebug(authentication);

    Buttress.Auth.findOrCreateUser(user, authentication)
    .then(buttressUser => cb(null, buttressUser))
    .catch(err => console.log(err)); // eslint-disable-line no-console
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

    Buttress.User.load(req.user.buttressId)
    .then(user => {
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
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  const AUTH_SCOPE = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ];
  app.get('/auth/google', passport.authenticate(
    'google', {
      scope: AUTH_SCOPE.join(' ')
    }
  ));
  app.get('/auth/google/callback', passport.authenticate('google', {successRedirect: '/', failureRedirect: '/'}));
};
