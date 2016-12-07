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
      observer: "_onStatusChanged"
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
    '__dataChanges(data.*)'
  ],

  _onStatusChanged: function() {
    this.__silly(`data:${this.status}`);
    if (this.auth === null) {
      return;
    }

    if (this.status === "begin") {
      this.__generateListRequest();
    }
  },

  __dataSplices: function(changeRecord) {
    if (!changeRecord) {
      return;
    }
    this.__silly(changeRecord);

    changeRecord.indexSplices.forEach(i => {
      i.addedKeys.forEach(a => {
        this.__generateAddRequest(this.get(`data.${a}`));
      });

      i.removed.forEach(r => {
        this.__generateRmRequest(r.id);
      });
    });
  },

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
    this.request.entityId = this.rqEntityId;
    this.request.url = this.vectorBaseUrl;
    this.request.method = 'GET';
    this.request.contentType = '';
    this.request.body = {};

    this.__generateRequest();
  },
  __generateRmRequest: function(entityId) {
    this.__debug(`remove rq: ${entityId}`);
    this.rqEntityId = entityId;
    this.request.url = this.scalarBaseUrl;
    this.request.entityId = this.rqEntityId;
    this.request.method = 'DELETE';
    this.request.contentType = '';
    this.request.body = {};
    this.__generateRequest();
  },
  __generateAddRequest: function(entity) {
    this.__debug(`add rq: ${entity.name}`);
    this.rqEntityId = -1;
    this.request.url = this.vectorBaseUrl;
    this.request.entityId = this.rqEntityId;
    this.request.contentType = 'application/x-www-form-urlencoded';
    this.request.method = 'POST';
    this.request.body = entity;
    this.__generateRequest();
  },
  __generateUpdateRequest: function(entity) {
    this.__debug(`update rq: ${entity.id}`)
    this.rqEntityId = entity.id;
    this.request.url = this.scalarBaseUrl;
    this.request.entityId = this.rqEntityId;
    this.request.method = 'PUT';
    this.request.contentType = 'application/x-www-form-urlencoded';
    this.request.body = entity;
    this.__generateRequest();
  },
  __generateRequest: function() {
    this.request.params = {
      urq: Date.now(),
      token: this.auth.user.authToken
    };
    this.request.response = null;
    this.__debug(this.request);
    this.rqEntityId = this.request.entityId;
    this.rqUrl = this.request.url;
    this.rqMethod = this.request.method;
    this.rqContentType = this.request.contentType;
    this.rqParams = this.request.params;
    this.rqBody = this.request.body;

    this.async(() => {
      this.__silly(this.$.ajaxService.toRequestOptions())
      this.$.ajaxService.generateRequest();
    }, 100)

    this.status = 'working';
  },

  __ajaxResponse: function(ev) {
    if (this.request.method === 'GET' && ev.detail.response instanceof Array) {
      this.__ajaxListResponse(ev.detail.response);
    }

    if (this.request.method === 'POST') {
      this.__ajaxAddResponse(ev.detail.response);
    }
    this.status = 'done';
  },
  __ajaxError: function() {
    this.status = 'error';
  },

  __ajaxListResponse: function(response) {
    this.data = this.liveData = this.request.response = response;
  },
  __ajaxAddResponse: function(response) {
    this.data.forEach((d, idx) => {
      if (!d.id) {
        this.set(['data',idx, 'id'], response.id);
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


