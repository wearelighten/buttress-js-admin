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
const Config = require('node-env-obj')('../../');
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
      profileImgUrl: profile._json.image.url,
      bannerImgUrl: profile._json.cover ? profile._json.cover.coverPhoto.url : ''
    };

    Logging.log(user, Logging.Constants.LogLevel.SILLY);

    // Look up user
    Buttress.User.findUser('google', profile.id)
    .then(buttressUser => {
      if (!buttressUser) {
        return cb(null, null);
      }
      buttressUser.appId = profile.id;
      cb(null, buttressUser);
    })
    .catch(err => {
      Logging.logError(err);
      cb(null, null);
    });
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

    Buttress.User.load(req.user.id)
    .then(user => {
      res.json({
        user: {
          id: user.id,
          authToken: req.user.authToken,
          profiles: user.auth.map(function(a) {
            return {
              app: a.app,
              appId: a.appId,
              email: a.email,
              url: a.profileUrl,
              images: a.images
            };
          }),
          person: {
            title: user.person.title,
            forename: user.person.forename,
            initials: user.person.initials,
            surname: user.person.surname,
            formalName: user.person.formalName
          }
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
