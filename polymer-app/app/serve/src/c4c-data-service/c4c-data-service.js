Polymer({
  is: "c4c-data-service",
  behaviors: [
    Polymer.C4CLogging
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 4
    },
    status: {
      type: String,
      value: '',
      notify: true,
      observer: "_onStatusChanged"
    },
    url: {
      type: String,
      value: function() {
        return 'http://dev.rhizome.com/api/v1';
      }
    },
    orgs: {
      type: Array,
      value: [],
      notify: true
    },
    liveOrgsData: {
      type: Array,
      value: []
    },
    orgId: {
      type: String,
      value: ""
    },
    orgsBaseUrl: {
      type: String,
      computed: "_computeOrgsBaseUrl(status)"
    },
    orgBaseUrl: {
      type: String,
      computed: "_computeOrgBaseUrl(orgId)"
    },
    auth: {
      type: Object,
      value: {
        user: null
      }
    },
  },
  observers: [
    '__orgsSplices(orgs.splices)',
    '__orgsChanges(orgs.*)',
    '__addResponse(addResponse)'
  ],

  _onStatusChanged: function() {
    this.__debug(`data:${this.status}`);
    if (this.auth === null) {
      return;
    }

    if (this.status === "begin") {
      this._generateGetRequest();
    }
  },

  __orgsSplices: function(changeRecord) {
    if (!changeRecord) {
      return;
    }
    this.__debug("splices");
    this.__debug(changeRecord);

    changeRecord.indexSplices.forEach(i => {
      i.addedKeys.forEach(a => {
        this._generatePostRequest(this.get(`orgs.${a}`));
      });

      i.removed.forEach(r => {
        this._generateDelRequest(r.id);
      });
    });

  },
  __orgsChanges: function(changeRecord) {
    this.__debug(changeRecord);
    if (changeRecord.value instanceof Array === true ||
        changeRecord.value instanceof Object === false) {
      return;
    }
    this.__debug("changes");
    this.__debug(changeRecord.value);
    this._generatePutRequest(changeRecord.value);
  },

  _generateDelRequest: function(orgId) {
    this.$.orgsRmService.params = {
      urq: Date.now(),
      token: this.auth.user.authToken
    };
    this.orgId = orgId;
    this.$.orgsRmService.generateRequest()
    this.status = "working";
  },
  _generateGetRequest: function() {
    this.$.orgsService.params = {
      urq: Date.now(),
      token: this.auth.user.authToken
    };
    this.$.orgsService.generateRequest()
    this.status = "working";
  },
  _generatePostRequest: function(org) {
    this.$.orgsAddService.params = {
      urq: Date.now(),
      token: this.auth.user.authToken
    };
    this.__debug(org);
    this.$.orgsAddService.body = org;
    this.$.orgsAddService.generateRequest();
    this.status = "working";
  },
  _generatePutRequest: function(org) {
    this.$.orgsPutService.params = {
      urq: Date.now(),
      token: this.auth.user.authToken
    };
    this.orgId = org.id;
    this.$.orgsPutService.body = org;
    this.$.orgsPutService.generateRequest();
    this.status = "working";
  },
  __addResponse: function(res) {
    this.__debug(res);
    this.orgs.forEach((o, idx) => {
      if (!o.id) {
        this.set(['orgs',idx, 'id'], res.id);
      }
    })
  },
  _computeOrgsBaseUrl: function(status) {
    status;
    return `${this.url}/org`
  },
  _computeOrgBaseUrl: function(orgId) {
    return `${this.url}/org/${orgId}`
  }
});


