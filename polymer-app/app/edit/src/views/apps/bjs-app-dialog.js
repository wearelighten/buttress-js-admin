Polymer({
  is: 'bjs-app-dialog',
  behaviors: [Polymer.BJSLogging, Polymer.BJSEditDialog],
  properties: {
    logLevel: {
      type: Number,
      value: 3,
    }
  }
});
