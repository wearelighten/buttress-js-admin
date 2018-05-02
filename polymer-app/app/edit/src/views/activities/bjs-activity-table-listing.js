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

    name: {
      type: String,
      value: "activity-table"
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
  observers: [
    '__queryParamsChanged(queryParams, queryParams.*)'
  ],

  __queryParamsChanged: function() {
    const filterParamMatch = 'filter_';
    const params = this.get('queryParams');
    if (!params) return;

    if (params.filter && params.filter === 'activity') {
      // Purge __filters for query items
      this.get('__filters').filter(i => i.query)
        .forEach(i => {
          const idx = this.get('__filters').indexOf(i);
          this.splice('__filters', idx, 1);
        });

      for(let param in params) {
        if (param.indexOf(filterParamMatch) === -1) continue;
        const type = param.substr(filterParamMatch.length);
        this.push('__filters', {
          name: type,
          value: params[param],
          query: true
        });
      }
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
