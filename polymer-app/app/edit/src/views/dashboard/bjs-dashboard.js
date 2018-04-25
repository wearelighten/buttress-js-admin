Polymer({
  is: 'bjs-dashboard',
  behaviors: [
    BJSBehaviors.Logging,
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

    this.__warn('__trackingTypesCount', trackings);
    
    for(let type in types) {
      counts[type] = trackings.filter(t => t.type === types[type]).length;
    }

    this.set('__trackingTypesCounts', counts);
  }
});
