Polymer({
  is: 'bjs-user-table-listing',
  behaviors: [
    BJSBehaviors.Logging,
    BJSBehaviors.UsersFilterBehaviour
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
      value: "user-table"
    },
    
    baseQuery: {
      type: Object
    },

    __user: Array,
    __userUnpaged: Array,
    __userQuery: {
      type: Object,
      computed: '__computeUserQuery(baseQuery, db.user.data.length, __filters.*)'
    },
    __userPage: {
      type: Number,
      value: 1
    },
    __userNumPages: {
      type: Number,
      value: 0
    },
    __userTotal: {
      type: Number,
      value: 0
    }
  },

  __computeUserQuery: function(baseQuery) {
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
