Polymer({
  is: 'bjs-trackings',
  behaviors: [
    BJSBehaviors.Logging,
    BJSBehaviors.TrackingsFilterBehaviour,
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
      computed: '__computeTrackingQuery(db.tracking.data.length, __filters.*)'
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
    const orGroups = [];
    const query = {
      $and: []
    };

    let filters = this.get('__filters');
    filters.forEach(f => {
      if (!f.value) return;

      let split = f.value.split(',').filter(s => s.trim().length > 0);
      if (!split.length) return;

      orGroups.push(split.map(s => {
        return {[f.name]: {$rexi: s}};
      }));
    });
    if (orGroups.length) {
      query.$and = query.$and.concat(orGroups.map(o => ({$or: o})));
    }

    return query;
  },

  __computeUsersQuery: function() {
    return { 
      // Fetch all
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
