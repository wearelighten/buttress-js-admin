Polymer({
  is: 'bjs-trackings',
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

    subPageTitle: {
      type: String,
      value: 'Tracking'
    },

    __trackingQuery: {
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
    return 'Tracking';
  },

});
