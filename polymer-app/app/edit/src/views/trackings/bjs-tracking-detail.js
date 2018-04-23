Polymer({
  is: 'bjs-tracking-detail',
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

    __userTracking: Array,
    __userTrackingUnpaged: Array,
    __userTrackingQuery: {
      type: Object,
      computed: '__computeUserTrackingQuery(item.userId, item.appId, item.timestamp, db.tracking.data.*)'
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
});