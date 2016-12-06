Polymer({
  is: 'c4c-app',
  behaviors: [
    Polymer.C4CLogging
  ],  
  properties: {
    mode: {
      type: String,
      value: "authenticating"
    },
    authStatus: {
      type: String,
      value: "idle",
    },
    auth: {
      type: Object,
      value: {
        user: null,
      },
      notify: true
    },
    orgsStatus: {
      type: String,
      value: "idle",
    },
    dataStatus: {
      type: String,
      value: "idle",
    },
    orgs: {
      type: Array,
    },
    orgsData: {
      type: Array,
    },
    page: {
      type: String,
      reflectToAttribute: true,
      observer: '_pageChanged'
    }
  },

  observers: [
    '_routePageChanged(routeData.page)',
    '_authChanged(authStatus)',
  ],

  attached: function() {
    this.authStatus = "begin";
  },

  _toggleDrawer: function() {
    this.$.drawer.toggle();
  },

  _routePageChanged: function(page) {
    this.page = page || "orgs";
  },

  _pageChanged: function(page) {
    // Load page import on demand. Show 404 page if fails
    var resolvedPageUrl = this.resolveUrl(`../views/c4c-${page}.html`);
    this.importHref(resolvedPageUrl, null, this._showPage404, true);
  },

  _authChanged: function() {
    if ( this.authStatus !== "done") {
      return;
    }
    this.__debug(this.auth.user);
    if (this.auth.user) {
      this.mode = "application";
      this.orgsStatus = "begin";
      this.dataStatus = "begin";
    } else {
      this.mode = "authenticate";
    }
  },

  _showPage404: function() {
    this.page = 'view404';
  }
});
