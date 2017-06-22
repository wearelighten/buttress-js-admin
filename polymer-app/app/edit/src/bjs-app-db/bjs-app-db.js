Polymer({
  is: 'bjs-app-db',
  behaviors: [Polymer.BJSLogging],
  properties: {
    auth: {
      type: Object
    },
    db: {
      type: Object,
      value: function() {
        return {
          org: {
            status: 'uninitialised',
            data: [],
            metadata: {},
          },
          group: {
            status: 'uninitialised',
            data: [],
            metadata: {}
          },
          app: {
            status: 'uninitialised',
            data: [],
            metadata: {}
          }
        }
      },
      notify: true
    }
  },
  observers: [
    '__auth(auth.user)',
  ],

  attached: function() {
  },

  __auth: function() {
    if (!this.auth.user){
      return;
    }
    this.__debug('app-db:auth');
    // if (this.get('db.org.status') === 'uninitialised') {
    //   this.set('db.org.status', 'initialise');
    // }

    // this.set('db.group.status', 'initialise');
    // this.set('db.app.status', 'initialise');
  },
});
