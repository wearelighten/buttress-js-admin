Polymer({
  is: 'bjs-users',
  behaviors: [
    BJSBehaviors.Logging,
    Polymer.BJSListView
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
  },

  attached: function() {

  },
});
