Polymer({
  is: 'bjs-activities',
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

    __activitiesQuery: {
      type: Object,
      value: function() {
        return {};
      }
    }
  },

  /**
   * Set the page header title
   * @override Polymer.BJSListView
   */
  __computeSubPageTitle: function(){
    return 'Activity';
  }

});
