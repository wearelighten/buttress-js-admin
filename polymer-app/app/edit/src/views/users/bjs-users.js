Polymer({
  is: 'bjs-users',
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
      value: 'Users'
    },

    __userQuery: {
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
    return 'Users';
  },

});
