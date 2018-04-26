Polymer({
  is: 'bjs-tracking-table-listing',
  behaviors: [
    BJSBehaviors.Logging,
    BJSBehaviors.TrackingsFilterBehaviour
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 4
    },

    db: {
      type: Object
    },

    name: {
      type: String,
      value: "tracking-table"
    },
    
    baseQuery: {
      type: Object
    },

    __tracking: Array,
    __trackingUnpaged: Array,
    __trackingQuery: {
      type: Object,
      computed: '__computeTrackingQuery(baseQuery, db.tracking.data.length, __filters.*)'
    },
    __trackingPage: {
      type: Number,
      value: 1
    },
    __trackingNumPages: {
      type: Number,
      value: 0
    },
    __trackingTotal: {
      type: Number,
      value: 0
    }
  },

  __computeTrackingQuery: function(baseQuery) {
    const orGroups = [];
    const query = {
      $and: [baseQuery]
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
  }

});
