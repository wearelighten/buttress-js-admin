Polymer({
  is: "bjs-auth-service",
  behaviors: [
    BJSBehaviors.Logging
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
    status: {
      type: String,
      value: "idle",
      notify: true,
      observer: "_onStatusChanged"
    },
    auth: {
      type: Object,
      notify: true
    }
  },

  listeners: {
    'gapi-signedin': '__gapiSignedIn'
  },

  __gapiSignedIn: function(ev) {
    this.set('auth.gapi.signedIn', ev.detail.signedIn);
    this.set('auth.gapi.user', ev.detail.user);
    this.__debug(this.auth.gapi);
  },

  attached: function() {
  },

  onAjaxResponse: function(ev, detail) {
    if (!detail.response) {
      this.set('status', 'done');
      return;
    }

    this.set('auth.user', detail.response.user);
    this.set('status', 'done');
  },

  onAjaxError: function() {
    this.set('status', 'error');
  },

  _onStatusChanged: function() {
    this.__debug(`auth:${this.status}`);
    if (this.status === "begin") {
      this._generateAuthenticatedRequest();
    }
  },

  _generateAuthenticatedRequest: function() {
    this.$.authenticated.params = {
      urq: Date.now()
    };
    this.$.authenticated.generateRequest();
    this.status = "working";
  }
});
