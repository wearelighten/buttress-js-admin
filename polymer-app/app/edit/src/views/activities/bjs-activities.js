Polymer({
  is: 'bjs-activities',
  behaviors: [
    BJSBehaviors.Logging,
    BJSBehaviors.ActivitiesFilterBehaviour,
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

    __activities: Array,
    __activitiesUnpaged: Array,
    __activitiesQuery: {
      type: Object,
      computed: '__computeActivitiesQuery(db.activity.data.length, __filters.*)'
    },
    __activitiesPage: {
      type: Number,
      value: 1
    },
    __activitiesNumPages: {
      type: Number,
      value: 0
    },
    __activitiesTotal: {
      type: Number,
      value: 0
    },

    __trackingInteractionCount: {
      type: Number,
      computed: '__computeTrackingInteractionCount(__activitiesUnpaged)'
    },
    __trackingErrorCount: {
      type: Number,
      computed: '__computeTrackingErrorCount(__activitiesUnpaged)'
    },
    __trackingLoggingCount: {
      type: Number,
      computed: '__computeTrackingLoggingCount(__activitiesUnpaged)'
    }
  },

  /**
   * Set the page header title
   * @override Polymer.BJSListView
   */
  __computeSubPageTitle: function(){
    return 'Activity';
  },

  __computeActivitiesQuery: function() {
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
