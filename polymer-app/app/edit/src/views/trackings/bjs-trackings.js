Polymer({
  is: 'bjs-trackings',
  behaviors: [
    Polymer.BJSLogging,
    Polymer.BJSListView
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 4
    },

    db: {
      type: Object
    },

    __users: Array,
    __usersQuery: {
      type: Object,
      computed: '__computeUsersQuery(db.users.data)'
    },

    __apps: Array,
    __appsQuery: {
      type: Object,
      computed: '__computeAppsQuery(db.users.data)'
    },

    __tracking: Array,
    __trackingUnpaged: Array,
    __trackingQuery: {
      type: Object,
      computed: '__computeTrackingQuery(db.tracking.data)'
    },
    __trackingPage: {
      type: Number,
      value: 1
    },
    __numTrackingPages: {
      type: Number,
      value: 0
    },
    __totalTracking: {
      type: Number,
      value: 0
    }, 

    __trackingInteractionCount: {
      type: Number,
      computed: '__computeTrackingInteractionCount(__trackingUnpaged)'
    },
    __trackingErrorCount: {
      type: Number,
      computed: '__computeTrackingErrorCount(__trackingUnpaged)'
    },
    __trackingLoggingCount: {
      type: Number,
      computed: '__computeTrackingLoggingCount(__trackingUnpaged)'
    },
    
    __trackingExpanded: {
      type: Array,
      computed: '__computeTrackingExpanded(__tracking)'
    },
  },

  __computeTrackingExpanded: function(tracking) {
    const apps = this.get('__apps');
    const users = this.get('__users');
    return tracking.map(track => {
      const user = users.find(u => u.id === track.userId);
      let email = (user) ? user.auth[0].email : '-';

      const app = users.find(a => a.id === track.appId);
      let appName = (app) ? app.name : '-';

      return {
        type: track.type,
        name: track.name,
        app: appName,
        user: email,
        timestamp: track.timestamp,
        json: JSON.stringify(track, null, 2)
      }
    });
  },
  __computeTrackingQuery: function() {
    return {
      // All
    }
  },

  __computeTrackingInteractionCount: function(items) {
    return items.filter(item => item.type === 'interaction').length;
  },
  __computeTrackingErrorCount: function(items) {
    return items.filter(item => item.type === 'error').length;
  },
  __computeTrackingLoggingCount: function(items) {
    return items.filter(item => item.type === 'logging').length;
  },

  __computeUsersQuery: function() {
    return {
      // All
    }
  },
  __computeAppsQuery: function() {
    return {
      // All
    }
  }

});