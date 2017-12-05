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

    __tracking: Array,
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

    __trackingExpanded: {
      type: Array,
      computed: '__computeTrackingExpanded(__tracking)'
    },
  },

  __onPageBack: function() {
    if (this.__trackingPage <= 1) return;
    this.__trackingPage--;
  },
  __onPageForward: function() {
    if (this.__trackingPage >= this.__numTrackingPages) return;
    this.__trackingPage++;
  },

  __computeTrackingExpanded: function(tracking) {
    return tracking.map(track => {
      return {
        type: track.type,
        name: track.name,
        timestamp: track.timestamp,
        json: JSON.stringify(track, null, 2)
      }
    });
  },
  __computeTrackingQuery: function() {
    return {
      // All
    }
  }
});
