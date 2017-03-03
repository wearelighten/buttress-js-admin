Polymer({
  is: 'bjs-apps',
  behaviors: [Polymer.BJSLogging, Polymer.BJSListView],
  properties: {
    logLevel: {
      type: Number,
      value: 4
    }
  },

  attached: function() {
    this.__fab = this.$.fab;
    this.__rmItemDialog = this.$.rmItemDialog;
    this.__editDialog = this.$.editItemDialog;
  },
});
