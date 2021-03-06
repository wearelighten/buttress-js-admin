Polymer({
  is: 'bjs-activity-detail',
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


    trackingView: {
      type: String,
      value: 'overview'
    },

    __appTrackingQuery: {
      type: Object,
      computed: '__computeAppTrackingQuery(item.appId, item.timestamp)'
    },
    __appActivityQuery: {
      type: Object,
      computed: '__computeAppActivityQuery(item.appId, item.timestamp)'
    },

    __trackingUser: Array,
    __trackingUserQuery: {
      type: Object,
      computed: '__computeTrackingUserQuery(item.userId, db.user.data)'
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

  __computeJsonDebug: function(item) {
    return JSON.stringify(item, null, 2);
  },

  __computeAppTrackingQuery: function(appId, timestamp) {
    return {
      appId: {
        $eq: appId
      },
      timestamp: {
        $lteDate: timestamp
      }
    }
  },
  __computeAppActivityQuery: function(appId, timestamp) {
    return {
      appId: {
        $eq: appId
      },
      timestamp: {
        $lteDate: timestamp
      }
    }
  },

  __computeTrackingUserQuery: function(userId) {
    return {
      id: {
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