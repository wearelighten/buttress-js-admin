Polymer({
  is: 'bjs-app-dialog',
  behaviors: [BJSBehaviors.Logging, Polymer.BJSEditDialog],
  properties: {
    logLevel: {
      type: Number,
      value: 3,
    }
  }
});
