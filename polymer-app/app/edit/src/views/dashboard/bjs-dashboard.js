Polymer({
  is: 'bjs-dashboard',
  behaviors: [
    BJSBehaviors.Logging,
    BJSBehaviors.Helpers,
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

    __activitiesVerbs: {
      type: Object,
      value: function(){
        return {
          POST: 'post',
          PUT: 'put',
          DEL: 'delete'
        }
      }
    },
    __trackingTypes: {
      type: Object,
      value: function(){
        return {
          INTERACTION: 'interaction',
          ERROR: 'error',
          LOGGING: 'logging'
        }
      }
    },

    __activitiesUnpaged: Array,
    __activitiesQuery: {
      type: Object,
      computed: '__computeActivitiesQuery(db.activity.data.length)'
    },
    
    __trackingUnpaged: Array,
    __trackingQuery: {
      type: Object,
      computed: '__computeTrackingQuery(db.tracking.data.length)'
    },

    __activitiesVerbsCounts: {
      type: Object,
    },
    __trackingTypesCounts: {
      type: Object,
    }
  },
  observers: [
    '__activitesVerbsCount(__activitiesUnpaged, __activitiesUnpaged.length)',
    '__trackingTypesCount(__trackingUnpaged, __trackingUnpaged.length)'
  ],

  /**
   * Set the page header title
   * @override Polymer.BJSListView
   */
  __computeSubPageTitle: function(){
    return 'Dashboard';
  },

  __viewEntity: function(path, query) {
    this.fire('view-path', {
      path: path,
      query: query
    })
  },

  __viewTrackingInteraction: function() {
    this.__viewEntity('trackings', {
      filter: 'tracking',
      filter_type: 'interaction'
    });
  },
  __viewTrackingError: function() {
    this.__viewEntity('trackings', {
      filter: 'tracking',
      filter_type: 'error'
    });
  },
  __viewTrackinLogging: function() {
    this.__viewEntity('trackings', {
      filter: 'tracking',
      filter_type: 'logging'
    });
  },
  __viewActivityPost: function() {
    this.__viewEntity('activities', {
      filter: 'activity',
      filter_permissions: 'add'
    });
  },
  __viewActivityPut: function() {
    this.__viewEntity('activities', {
      filter: 'activity',
      filter_permissions: 'write'
    });
  },
  __viewActivityDel: function() {
    this.__viewEntity('activities', {
      filter: 'activity',
      filter_permissions: 'delete'
    });
  },

  __viewOrganisations: function() {
    this.__viewEntity('orgs');
  },
  __viewGroups: function() {
    this.__viewEntity('groups');
  },
  __viewApps: function() {
    this.__viewEntity('apps');
  },
  __viewUsers: function() {
    this.__viewEntity('users');
  },

  __computeActivitiesQuery: function() {
    return { }; // Select all
  },
  __computeTrackingQuery: function() {
    return { }; // Select all
  },

  __activitesVerbsCount: function(activities) {
    const verbs = this.get('__activitiesVerbs');
    const counts = {};
    
    for(let verb in verbs) {
      counts[verb] = activities.filter(a => a.verb === verbs[verb]).length;
    }

    this.set('__activitiesVerbsCounts', counts);
  },
  __trackingTypesCount: function(trackings) {
    const types = this.get('__trackingTypes');
    const counts = {};
    
    for(let type in types) {
      counts[type] = trackings.filter(t => t.type === types[type]).length;
    }

    this.set('__trackingTypesCounts', counts);
  }
});
