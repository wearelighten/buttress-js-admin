Polymer({
  is: 'bjs-user-detail',
  behaviors: [
    BJSBehaviors.Logging,
    BJSBehaviors.Helpers
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
    db: {
      type: Object,
      notify: true
    },
    item: {
      type: Object
    },

    __trackingTypes: {
      type: Object,
      value: function(){
        return {
          INTERACTION: 'interaction',
          ERROR: 'error',
          LOGGING: 'logging'
        }
      }
    },

    __firstAuth: {
      type: Object,
      computed: '__computeUserFirstAuth(item)'
    },

    trackingView: {
      type: String,
      value: 'overview'
    },

    __userTrackingQuery: {
      type: Object,
      computed: '__computeUserTrackingQuery(item.id, item)'
    },
    __userActivityQuery: {
      type: Object,
      computed: '__computeUserActivityQuery(item.id, item)'
    },

    __trackingApp: Array,
    __trackingAppQuery: {
      type: Object,
      computed: '__computeTrackingAppQuery(item.appId, db.user.data)'
    },

    itemTimestampFormatted: {
      type: String,
      computed: 'timestampToStringFormatted(item.timestamp)'
    }
  },

  __computeUserFirstAuth: function(user) {
    if (!user || !user.auth) return;

    return (user.auth[0]) ? user.auth[0] : null;
  },

  __computeJsonDebug: function(item) {
    return JSON.stringify(item, null, 2);
  },

  __computeUserTrackingQuery: function(userId) {
    if (!userId) return;

    return {
      userId: {
        $eq: userId
      }
    }
  },
  __computeUserActivityQuery: function(userId) {
    if (!userId) return;

    return {
      userId: {
        $eq: userId
      }
    }
  },

  __computeTrackingAppQuery: function(appId) {
    return {
      id: {
        $eq: appId
      }
    }
  }
});