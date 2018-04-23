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

    __appTracking: Array,
    __appTrackingUnpaged: Array,
    __appTrackingQuery: {
      type: Object,
      computed: '__computeAppTrackingQuery(item.appId, item.timestamp, db.tracking.data.*)'
    },
    __appActivity: Array,
    __appActivityUnpaged: Array,
    __appActivityQuery: {
      type: Object,
      computed: '__computeAppActivityQuery(item.appId, item.timestamp, db.activity.data.*)'
    },

    __userTracking: Array,
    __userTrackingUnpaged: Array,
    __userTrackingQuery: {
      type: Object,
      computed: '__computeUserTrackingQuery(item.userId, item.appId, item.timestamp, db.tracking.data.*)'
    },
    __userActivity: Array,
    __userActivityUnpaged: Array,
    __userActivityQuery: {
      type: Object,
      computed: '__computeUserActivityQuery(item.userId, item.appId, item.timestamp, db.activity.data.*)'
    },

    trackingView: {
      type: String,
      value: 'overview'
    },
    
    jsonDebug: {
      type: String,
      computed: '__computeJsonDebug(item, item.*)'
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
  __computeUserTrackingQuery: function(userId, appId, timestamp) {
    return {
      userId: {
        $eq: userId
      },
      appId: {
        $eq: appId
      },
      timestamp: {
        $lteDate: timestamp
      }
    }
  },

  __computeAppActivityQuery: function(appId) {
    return {

    }
  },
  __computeUserActivityQuery: function(appId) {
    return {

    }
  }
});