Polymer({
  is: 'c4c-app-db',
  behaviors: [Polymer.C4CLogging],
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
            data: []
          },
          group: {
            status: 'uninitialised',
            data: []
          },
          app: {
            status: 'uninitialised',
            data: []
          }
        }
      },
      notify: true
    }
  },
  observers: [
    '__auth(auth.*)',
  ],

  attached: function() {
  },

  __auth: function() {
    if (!this.auth.user){
      return;
    }
    this.__debug('app-db:auth');
  },
});
