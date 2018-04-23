Polymer({
  is: 'bjs-tracking-detail',
  behaviors: [
    Polymer.BJSLogging
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
    db: {
      type: Object,
      notify: true
    },
    item: {
      type: Object
    },
    
    jsonDebug: {
      type: String,
      computed: '__computeJsonDebug(item, item.*)'
    }
  },

  __computeJsonDebug: function(item) {
    return JSON.stringify(item, null, 2);
  }
});