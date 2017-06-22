'use strict';

/**
 * ButtressJS - Realtime datastore for business software
 *
 * @file app.js
 * @description App model definition.
 * @module Model
 * @exports model, schema, constants
 * @author Chris Bates-Keegan
 *
 */

var mongoose = require('mongoose');

/**
 * Constants
*/

var apps = ['google', 'facebook', 'twitter', 'linkedin'];
var App = {
  GOOGLE: apps[0],
  FACEBOOK: apps[1],
  TWITTER: apps[2],
  LINKEDIN: apps[3]
};

var constants = {
  App: App
};

/**
 * Schema
 */
var schema = new mongoose.Schema({
  app: String,
  appId: String,
  username: String,
  profileUrl: String,
  images: {
    profile: String,
    banner: String
  },
  email: String,
  locale: String,
  token: String,
  tokenSecret: String,
  extras: String
});

var ModelDef = null;

/**
 * Schema Virtual Methods
 */
schema.virtual('details').get(function() {
  return {
    id: this._id,
    app: this.app,
    appId: this.appId,
    username: this.username,
    token: this.token,
    tokenSecret: this.tokenSecret,
    profileUrl: this.profileUrl,
    images: this.images,
    email: this.email
  };
});

/**
 * Schema Static Methods
 */

ModelDef = mongoose.model('AppAuth', schema);

/**
 * Exports
 */
module.exports.constants = constants;
module.exports.schema = schema;
module.exports.model = ModelDef;
