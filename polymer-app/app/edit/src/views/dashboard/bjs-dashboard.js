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
    }
  
  },

  /**
   * Set the page header title
   * @override Polymer.BJSListView
   */
  __computeSubPageTitle: function(){
    return 'Dashboard';
  },

  __computeAppsQuery: function() {
    return {};
  },
  __computeUsersQuery: function() {
    return {};
  },
  __computeTrackingsQuery: function() {
    return {};
  },
  __computeActivitiesQuery: function() {
    return {
      $and: [{
        timestamp: {
          $gteDate: Sugar.Date.create('10 minutes ago')
        }
      }]
    };
  }
});
