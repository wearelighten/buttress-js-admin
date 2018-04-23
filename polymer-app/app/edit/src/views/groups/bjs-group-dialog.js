Polymer({
  is: 'bjs-group-dialog',
  behaviors: [BJSBehaviors.Logging, Polymer.BJSEditDialog],
  properties: {
    logLevel: {
      type: Number,
      value: 4,
    },
  }
});
