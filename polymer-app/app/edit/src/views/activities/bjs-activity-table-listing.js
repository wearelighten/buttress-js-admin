Polymer({
  is: 'bjs-activity-table-listing',
  behaviors: [
    BJSBehaviors.Logging,
    BJSBehaviors.ActivitiesFilterBehaviour
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 4
    },

    db: {
      type: Object
    },

    baseQuery: {
      type: Object
    },

    __activities: Array,
    __activitiesUnpaged: Array,
    __activitiesQuery: {
      type: Object,
      computed: '__computeActivitiesQuery(baseQuery, db.activity.data.length, __filters.*)'
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
    }
  },

  __computeActivitiesQuery: function(baseQuery) {
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
  }

});
