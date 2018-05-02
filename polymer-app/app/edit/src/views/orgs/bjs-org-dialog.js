Polymer({
  is: 'bjs-org-dialog',
  behaviors: [BJSBehaviors.Logging, Polymer.BJSEditDialog],
  properties: {
    logLevel: {
      type: Number,
      value: 4,
    }
  }
});
