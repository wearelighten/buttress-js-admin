Polymer({
  is: "c4c-orgs-service",
  behaviors: [
    Polymer.C4CLogging
  ],  
  properties: {
    status: {
      type: String,
      value: "",
      notify: true,
      observer: "_onStatusChanged"
    },
    orgs: {
      type: Array,
      value: [],
      notify: true
    },
    auth: {
      type: Object,
      value: {
        user: null
      }
    }
  },
  attached: function() {
  },

  _onStatusChanged: function() {
    this.__debug(`orgs:${this.status}`);
    if (this.auth === null) {
      return;
    }

    if (this.status === "begin") {
      this._generateGetRequest();
    }
  },

  _onAjaxResponse: function(ev, detail) {
    if (!detail.response) {
      return;
    }
    this.status = "done";
    this.orgs = detail.response;
  },

  _onAjaxError: function(error) {
    this.__err(error);
    this.status = "error";
  },

  _generateGetRequest: function() {
    this.$.service.params = {
      urq: Date.now(),
      token: this.auth.user.authToken
    };
    this.$.service.generateRequest()
    this.status = "working";
  }
});
