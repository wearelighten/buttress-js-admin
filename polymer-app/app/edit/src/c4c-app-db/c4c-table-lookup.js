Polymer({
  is: 'c4c-table-lookup',
  behaviors: [Polymer.C4CLogging],
  properties: {
    logLevel: {
      type: Number,
      value: 3,
    },
    db: {
      type: Object,
      notify: true
    },
    foreign: {
      type: String,
      value: ""
    },
    local: {
      type: String,
      value: "",
    },
    value: {
      type: Object,
      value: null,
      notify: true
    }
  },
  observers: [
    '__db(db.org.status)',
    '__db(db.group.status)',
    '__db(db.app.status)'
  ],
  attached: function() {
    this.__debug(`${this.foreign}:${this.local}`);

    let foreignName = this.foreign.split('.')[0];
    let table = this.get(['db',foreignName]);
    if (table.status === 'uninitialised') {
      this.set(['db',foreignName,'status'], 'initialise');
    }
  },
  __db: function(status) {
    this.__debug(status);
    let foreignName = this.foreign.split('.')[0];
    let table = this.get(['db',foreignName]);
    this.__debug(table);
    let r = table.data.find(f => {
      return f.id === this.local;
    });
    if (r) {
      this.value = r;
    }
  }
});
