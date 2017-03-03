Polymer({
  is: 'bjs-app-db-query',
  behaviors: [Polymer.BJSLogging],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
    logLabel: {
      type: Number,
      value: 'db-query'
    },
    db: {
      type: Object
    },
    doc: {
      type: Object,
      notify: true
    },
    findOne: {
      type: Object,
      notify: true
    },
    findAll: {
      type: Array,
      notify: true
    },
    query: {
      type: Object,
    },
    fields: {
      type: Array,
    },
    sort: {
      type: Array
    }
  },
  observers: [
    '__query(query.*)',
    '__docStatus(doc.status)'
  ],

  attached: function() {
    // if (this.doc.status === 'uninitialised') {
    //   this.set('doc.status', 'initialise');
    // }
  },

  __docStatus: function() {
    this.__debug(this.doc);
    if (this.doc.status !== 'done') {
      return;
    }

    if (this.query) {
      this.__debug(this.get('query'));
      this.set('query.__loaded', true);
    }
  },
  __query: function() {
    this.__debug(this.query);
    if (!this.query || !this.doc.data) {
      return;
    }

    let data = this.doc.data;
    this.__assert(data);

    for (let field in this.query) {
      if (!this.query.hasOwnProperty(field)) {
        continue;
      }
      let command = this.query[field];
      for (let operator in command) {
        if (!command.hasOwnProperty(operator)) {
          continue;
        }
        let operand = command[operator];
        this.__debug(`${field} ${operator} ${operand}`);
        data = this.__executeQuery(data, field, operator, operand);
      }
    }
    this.__debug(data);
    this.set('findAll', data);

    let dataIndex = data.length > 0 ? this.doc.data.indexOf(data[0]): -1;
    this.set('findOne', data.length > 0 ? data[0] : null);

    this.unlinkPaths('findOne');
    if (dataIndex !== -1) {
      this.linkPaths('findOne', `doc.data.#${dataIndex}`);
      this.__debug(`Query: findOne linked to doc.data.#${dataIndex}`);
    }

    this.__debug(this.findOne);
  },

  __executeQuery: function(data, field, operator, operand) {
    let fns = {
      $not: (rhs) => (lhs) => lhs[field] !== rhs,
      $eq: (rhs) => (lhs) => lhs[field] === rhs,
      $gt: (rhs) => (lhs) => lhs[field] > rhs,
      $lt: (rhs) => (lhs) => lhs[field] < rhs,
      $gte: (rhs) => (lhs) => lhs[field] >= rhs,
      $lte: (rhs) => (lhs) => lhs[field] <= rhs,
      $in: (rhs) => (lhs) => rhs.indexOf(lhs[field]) !== -1
    };

    if (!fns[operator]) {
      this.__err(new Error(`Invalid operator: ${operator}`));
      return [];
    }

    return data.filter(fns[operator](operand));
  }
});
