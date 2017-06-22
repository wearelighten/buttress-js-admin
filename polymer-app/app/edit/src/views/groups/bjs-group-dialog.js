Polymer({
  is: 'bjs-group-dialog',
  behaviors: [Polymer.BJSLogging, Polymer.BJSEditDialog],
  properties: {
    logLevel: {
      type: Number,
      value: 4,
    },
  }
});
