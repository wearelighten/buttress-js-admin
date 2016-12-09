Polymer({
  is: 'c4c-app-db-query',
  behaviors: [Polymer.C4CLogging],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
    db: {
      type: Object
    },
    doc: {
      type: Object
    },
    scalar: {
      type: Object,
      notify: true
    },
    vector: {
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
    if (this.doc.status === 'uninitialised') {
      this.set('doc.status', 'initialise');
    }
  },

  __docStatus: function() {
    this.__debug(this.doc.status);
    if (this.doc.status !== 'done') {
      return;
    }

    this.set('query.__loaded', true);
  },
  __query: function() {
    this.__debug(this.query);
    if (!this.query) {
      return;
    }

    let data = this.doc.data;
    this.__debug(data);

    for (let field in this.query) {
      let command = this.query[field];
      for (let operator in command) {
        let operand = command[operator];
        this.__debug(`${field} ${operator} ${operand}`);
        data = this.__executeQuery(data, field, operator, operand);
      }
    }
    this.__debug(data);
    this.vector = data;
    this.scalar = data.length > 0 ? data[0] : null;
    this.__debug(this.scalar);
  },

  __executeQuery: function(data, field, operator, operand) {
    let fns = {
      $eq: (rhs) => (lhs) => lhs[field] === rhs,
      $gt: (rhs) => (lhs) => lhs[field] > rhs,
      $lt: (rhs) => (lhs) => lhs[field] < rhs,
      $gte: (rhs) => (lhs) => lhs[field] >= rhs,
      $lte: (rhs) => (lhs) => lhs[field] <= rhs,
    };

    if (!fns[operator]) {
      this.__err(new Error(`Invalid operator: ${operator}`));
      return [];
    }

    return data.filter(fns[operator](operand));
  }
});
