Polymer({
  is: 'bjs-socket-io',
  behaviors: [
    BJSBehaviors.Logging
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 2
    },
    auth: {
      type: Object
    },
    endpoint: {
      type: String,
      value: 'localhost'
    },
    connected: {
      type: Boolean,
      value: false,
      notify: true
    },
    rxEvents: {
      type: Array,
      value: function() {
        return [];
      }
    },
    tx: {
      type: Array,
      value: function() {
        return [];
      }
    },
    rx: {
      type: Array,
      value: function() {
        return [];
      }
    }
  },

  observers: [
    '__auth(auth.user)',
    '__tx(tx.splices)'
  ],

  attached: function() {
  },

  __auth: function() {
    if (!this.auth.user) {
      // io.disconnect();
      return;
    }

    this.connect();
  },

  connect: function() {
    const app = this.get('app');
    const user = this.get('auth.user');
    this.__debug('Attempting Socket connection', `${this.endpoint}/${app.publicId}`);
    try {
      this.socket = io.connect(`${this.endpoint}/${app.publicId}`, {
        query: {
          token: user.authToken
        }
      });
      this.socket.on('connect',() => {
        this.connected = true;
        this.__debug('Connected');
        this.__configureRxEvents();
      });
      this.socket.on('disconnect',() => {
        this.connected = false;
      });
    } catch (err) {
      this.__err(err);
      this.fire('error', err);
    }
  },

  __configureRxEvents: function() {
    this.rxEvents.forEach(ev => {
      this.__debug('__configureRxEvents', ev);
      this.socket.on(ev, (data) => {
        this.__debug('rxEvents:');
        this.__debug(data);
        this.fire('rx-event', Object.assign({}, { type: ev, payload: data }));
      });
    });
  },

  __tx: function(cr) {
    if (!this.socket) {
      return;
    }

    this.__debug(cr);

    cr.indexSplices.forEach(i => {
      if (i.type !== 'splice' || i.addedCount === 0) {
        return;
      }
      this.__debug('tx.added');

      for (let x=0; x<i.addedCount; x++) {
        let o = i.object[x+i.index];
        this.__debug(`emitting: ${o.type}`);
        this.socket.emit(o.type, o.payload);
      }
    });

  },
});
