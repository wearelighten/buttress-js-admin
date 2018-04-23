Polymer({
  is: 'bjs-app',
  behaviors: [
    Polymer.BJSLogging,
    Polymer.BJSRealtimeDbMsgHandler
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 4
    },

    mode: {
      type: String,
      value: "authenticating"
    },
    app: {
      type: Object,
      value: function() {
        return {
          publicId: '%BUTTRESS_ADMIN_APP_PUBLIC_ID%'
        };
      }
    },
    auth: {
      type: Object,
      notify: true,
      value: function() {
        return {
          user: null,
          gapi: {
            signedIn: false,
            user: null
          }
        }
      },
    },
    authStatus: {
      type: String,
      value: "idle",
    },

    db: {
      type: Object
    },
    iodb: {
      type: Object,
      value: function() {
        return {
          endpoint: '//%BUTTRESS_ADMIN_BUTTRESS_HOST%',
          connected: false,
          rxEvents: [
            'db-activity'
          ],
          rx: []
        };
      }
    },

    context: {
      type: Object,
      value: function() {
        return {
          auth: {},
          db: {},
          page: '',
          title: '',
          route: {},
          routeData: {},
          subroute: {},
          subrouteData: {}
        };
      }
    },
    page: {
      type: String,
      reflectToAttribute: true,
      observer: '__pageChanged'
    },
    mainTitle: {
      type: String,
      computed: '__computeMainTitle(page, subPageTitle)'
    },
    subPageTitle: {
      type: String
    },

    __hideMenuButton: {
      type: Boolean,
      computed: '__computeHideMenuButton(subroute.path)'
    },
    __hideBackButton: {
      type: Boolean,
      computed: '__computeHideBackButton(subroute.path)'
    }
  },
  observers: [
    '__routePageChanged(routeData.page)',
    '__dbConnected(iodb.connected)',
    '__authChanged(authStatus)'
  ],
  listeners: {
    'view-path': '__viewPath',
  },

  attached: function() {
    this.authStatus = "begin";
  },

  __toggleDrawer: function() {
    this.$.drawer.toggle();
  },

  __routePageChanged: function(page) {
    this.page = page || 'orgs';
  },

  __pageChanged: function(page) {
    // Load page import on demand. Show 404 page if fails
    var resolvedPageUrl = this.resolveUrl(`../views/${page}/bjs-${page}.html`);
    this.importHref(resolvedPageUrl, null, this.__showPage404, true);
  },

  __viewPath: function(ev) {
    const path = ev.detail;
    if (!path) {
      this.__warn('__viewPath', 'Called with no path specified', path);
      return;
    }
    this.__debug('__viewPath', path);
    this.set('route.path', `/${path}`);
  },

  __authChanged: function() {
    if ( this.authStatus !== "done") {
      return;
    }
    if (this.auth.user) {
      this.mode = "application";
    } else {
      this.mode = "authenticate";
    }
  },
  __dataServiceError: function(ev) {
    this.__silly(ev);

    this.$.toast.text = ev.detail.error.message;
    this.$.toast.open();
  },

  __dbConnected: function(connected) {
    this.__debug(`db: connected: ${connected}`);
  },
  __dbRxEvent: function(ev) {
    this.__debug('__dbRxEvent', ev);

    let authUser = this.get('auth.user');
    if (!authUser) {
      return;
    }

    this.__handleRxEvent(ev, authUser);
  },

  __showPage404: function() {
    this.page = 'view404';
  },

  __backButton: function() {
    this.set('subroute.path', '');
  },

  __computeMainTitle: function(page) {
    if (this.subPageTitle) {
      return this.subPageTitle;
    }
    let titles = {
      'orgs': 'Organisations',
      'apps': 'Applications',
      'groups': 'Groups',
      'users': 'Users'
    };
    if (!page || !titles[page]) {
      return 'Admin';
    }
    return titles[page];
  },

  __computeHideMenuButton: function() {
    return this.subroute.path ? true : false
  },
  __computeHideBackButton: function() {
    return this.subroute.path ? false : true
  }
});
