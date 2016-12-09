Polymer({
  is: "c4c-data-service",
  behaviors: [
    Polymer.C4CLogging
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
    logLabel: {
      type: String,
      value: 'data-service'
    },
    auth: {
      type: Object,
      value: {
        user: null
      }
    },
    status: {
      type: String,
      value: '',
      notify: true,
    },
    route: {
      type: String,
      value: ''
    },
    data: {
      type: Array,
      value: [],
      notify: true
    },
    liveData: {
      type: Array,
      value: []
    },
    urlPrefix: {
      type: String,
      value: function() {
        return 'http://dev.rhizome.com/api/v1';
      }
    },
    vectorBaseUrl: {
      type: String,
      computed: "__computeVectorBaseUrl(urlPrefix, route)"
    },
    scalarBaseUrl: {
      type: String,
      computed: "__computeScalarBaseUrl(urlPrefix, route, rqEntityId)"
    },
    requestQueue: {
      type: Array,
      value: function () {
        return [];
      }
    },
    request: {
      type: Object,
      value: {
        url: this.vectorBaseUrl,
        contentType: '',
        response: [],
        entityId: '',
        body: {}
      }
    },
    rqEntityId: String,
    rqUrl: String,
    rqContentType: String,
    rqParams: {},
    rqBody: {},
    rqResponse: []
  },
  observers: [
    '__dataSplices(data.splices)',
    '__dataChanges(data.*)',
    '__auth(route, auth.user)'
  ],

  __auth: function() {
    this.__debug(`data:${this.route}:${this.status}`);

    if (!this.get('auth.user')) {
      return;
    }

    if (this.status === "uninitialised") {
      this.__generateListRequest();
    }
  },

  /**
   * Used to generate Add and Remove requests
   * @param {Object} changeRecord - data needed to calculate what has changed
   * @private
   */
  __dataSplices: function(changeRecord) {
    if (!changeRecord) {
      return;
    }
    this.__debug(changeRecord);

    changeRecord.indexSplices.forEach(i => {
      i.addedKeys.forEach(a => {
        this.__generateAddRequest(this.get(`data.${a}`));
      });

      i.removed.forEach(r => {
        this.__generateRmRequest(r.id);
      });
    });
  },

  /**
   * Used to update individual records
   * @param {Object} changeRecord - definition of what's changed
   * @private
   */
  __dataChanges: function(changeRecord) {
    this.__debug(changeRecord);
    if (changeRecord.value instanceof Array === true ||
        changeRecord.value instanceof Object === false ||
        changeRecord.path === 'data.length' ||
        changeRecord.path === 'data.splices') {
      return;
    }
    this.__generateUpdateRequest(changeRecord.value);
  },

  __generateListRequest: function() {
    this.__debug(`list rq`);

    this.rqEntityId = -1;
    let request = {
      type: 'list',
      url: this.vectorBaseUrl,
      entityId: this.rqEntityId,
      method: 'GET',
      contentType: '',
      body: {}
    };

    this.__queueRequest(request);
  },
  __generateRmRequest: function(entityId) {
    this.__debug(`remove rq: ${entityId}`);

    this.rqEntityId = entityId;
    let request = {
      type: 'rm',
      url: this.scalarBaseUrl,
      entityId: this.rqEntityId,
      method: 'DELETE',
      contentType: '',
      body: {}
    };

    this.__queueRequest(request);
  },
  __generateAddRequest: function(entity) {
    this.__debug(`add rq: ${entity.name}`);

    this.rqEntityId = -1;
    let request = {
      type: 'add',
      url: this.vectorBaseUrl,
      entityId: this.rqEntityId,
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      body: entity
    };
    this.__queueRequest(request);
  },
  __generateUpdateRequest: function(entity) {
    this.__debug(`update rq: ${entity.id}`)

    this.rqEntityId = entity.id;
    let request = {
      type: 'add',
      url: this.scalarBaseUrl,
      entityId: this.rqEntityId,
      method: 'PUT',
      contentType: 'application/x-www-form-urlencoded',
      body: entity
    };
    this.__queueRequest(request);
  },

  __queueRequest: function(request) {
    this.requestQueue.push(request);
    if (this.status !== 'working') {
      this.__generateRequest(this.requestQueue[0]);
    }
  },

  __generateRequest: function(rq) {
    rq.response = null;
    rq.params = {
      urq: Date.now(),
      token: this.auth.user.authToken
    };

    this.__debug(rq);
    this.rqUrl = rq.url;
    this.rqMethod = rq.method;
    this.rqContentType = rq.contentType;
    this.rqParams = rq.params;
    this.rqBody = rq.body;

    this.$.ajaxService.generateRequest();
    this.status = 'working';
  },

  __ajaxResponse: function(ev) {
    let rq = this.requestQueue.shift();

    rq.response = ev.detail.response;
    if (rq.type === 'list') {
      this.__ajaxListResponse(rq);
    }

    if (rq.type === 'add') {
      this.__ajaxAddResponse(rq);
    }
    this.status = 'done';
  },
  __ajaxError: function() {
    this.status = 'error';
  },

  __ajaxListResponse: function(rq) {
    this.data = this.liveData = rq.response;
  },
  __ajaxAddResponse: function(rq) {
    this.data.forEach((d, idx) => {
      if (!d.id) {
        this.set(['data',idx, 'id'], rq.response.id);
      }
    })
  },

  __computeVectorBaseUrl: function(urlPrefix, route) {
    return `${urlPrefix}/${route}`
  },
  __computeScalarBaseUrl: function() {
    return `${this.urlPrefix}/${this.route}/${this.rqEntityId}`
  }
});


