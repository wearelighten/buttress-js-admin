Polymer({
  is: 'bjs-users',
  behaviors: [
    Polymer.BJSLogging,
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
