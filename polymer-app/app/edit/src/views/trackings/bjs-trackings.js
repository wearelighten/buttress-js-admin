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

    subPageTitle: {
      type: String,
      value: 'Tracking'
    },

    __tracking: Array,
    __trackingUnpaged: Array,
    __trackingQuery: {
      type: Object,
      computed: '__computeTrackingQuery(db.tracking.data.length)'
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
    }
  },

  /**
   * Set the page header title
   * @override Polymer.BJSListView
   */
  __computeSubPageTitle: function(){
    return 'Tracking';
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
  }

});
