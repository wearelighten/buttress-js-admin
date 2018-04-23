Polymer({
  is: 'bjs-app-db-query',
  behaviors: [
    BJSBehaviors.Logging
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
    logLabel: {
      type: String,
      value: 'db-query'
    },
    db: {
      type: Object
    },
    doc: {
      type: Object,
      notify: true
    },
    numResults: {
      type: Number,
      value: 0,
      notify: true
    },
    numPages: {
      type: Number,
      value: 0,
      notify: true
    },
    page: {
      type: Number,
      value: 1
    },
    limit: {
      type: Number,
      value: 12
    },
    findOne: {
      type: Object,
      notify: true
    },
    findAll: {
      type: Array,
      notify: true
    },
    findAllUnpaged: {
      type: Array,
      notify: true
    },
    query: {
      type: Object,
    },
    fields: {
      type: Array,
    },
    
    sortPath: {
      type: String
    },
    sortType: {
      type: String,
      value: 'string'
    },
    sortOrder: {
      type: String,
      value: 'DESC'
    },

    paused: {
      type: Boolean,
      value: false
    }
  },
  observers: [
    '__query(query.*, page, limit, paused)',
    '__docStatus(doc, doc.loaded)'
  ],

  attached: function() {
    // if (this.doc.status === 'uninitialised') {
    //   this.set('doc.status', 'initialise');
    // }
  },

  __docStatus: function() {
    if (!this.doc.loaded) {
      this.__silly('__docStatus', this.doc.status, this.doc);
      return;
    }

    this.__silly('__docStatus', 'doc.status', this.doc.status);

    if (this.query) {
      this.__silly('__docStatus', 'query', this.query);
      this.set('query.__loaded', true);
    }
  },
  __query: function() {
    const logLabel = this.get('logLabel');

    this.__debug(logLabel, '__query', this.query);
    if (!this.query) {
      this.__silly('__query', 'no query');
      return;
    }
    if (!this.doc || !this.doc.loaded) {
      this.__debug(logLabel, '__query', 'no doc');
      return;
    }
    if (this.get('paused') === true) {
      this.__silly('__query', 'Paused');
      return;
    }

    let data = this.doc.data;
    this.__silly(data);
    try {
      data = this.__processQuery(this.query, data);
    } catch (err) {
      this.__err(err);
      this.__err('Query was:', this.query);
      return;
    }
    this.__silly(data);

    if (this.get('sortPath')) {
      data = data.sort((a, b) => this.__sort(a, b));
    }

    if (this.limit > 0) {
      this.set('numPages', Math.ceil(data.length / this.limit));
      this.set('numResults', data.length);
      this.set('findAllUnpaged', data.concat([]));

      this.__silly(this.page, this.limit, this.numPages);
      data = data.splice((this.page-1) * this.limit, this.limit);
      this.__debug(logLabel, '__query', data);
    }

    this.set('findAll', data);
    data.forEach((d, idx) => {
      let dataIndex = this.doc.data.indexOf(d);

      this.unlinkPaths(`findAll.#${idx}`);
      if (dataIndex !== -1) {
        this.linkPaths(`findAll.#${idx}`, `doc.data.#${dataIndex}`);
        this.__silly(`Query: findAll.#${idx} linked to doc.data.#${dataIndex}`);
      }
    });

    let dataIndex = data.length > 0 ? this.doc.data.indexOf(data[0]): -1;
    this.set('findOne', data.length > 0 ? data[0] : null);

    this.unlinkPaths('findOne');
    if (dataIndex !== -1) {
      this.linkPaths('findOne', `doc.data.#${dataIndex}`);
      this.__silly(`Query: findOne linked to doc.data.#${dataIndex}`);
    }

    this.__silly(this.findOne);
  },

  __processQuery: function(query, data) {
    let outData = [].concat(data);

    for (let field in query) {
      if (!query.hasOwnProperty(field)) {
        continue;
      }

      if (field === '$and') {
        query[field].forEach(o => {
          outData = this.__processQuery(o, outData);
        });
        continue;
      }

      if (field === '$or') {
        outData = query[field]
          .map(o => this.__processQuery(o, outData))
          .reduce((combined, results) => {
            return combined.concat(results.filter(r => combined.indexOf(r) === -1));
          }, []);

        continue;
      }

      let command = query[field];
      for (let operator in command) {
        if (!command.hasOwnProperty(operator)) {
          continue;
        }

        let operand = command[operator];
        outData = this.__executeQuery(outData, field, operator, operand);
      }
    }
    return outData;
  },

  __sort: function(a, b){
    const sortPath = this.get('sortPath');
    const sortType = this.get('sortType');
    const sortOrder = this.get('sortOrder');

    const pathValueA = this.__parsePath(a, sortPath);
    const pathValueB = this.__parsePath(b, sortPath);

    let valueA = pathValueA[0];
    let valueB = pathValueB[0];

    if (sortType === 'string') {
      valueA = (valueA) ? valueA.toLowerCase(): '';
      valueB = (valueB) ? valueB.toLowerCase(): '';
    }
    if (sortType === 'date') {
      return (sortOrder === 'ASC') ? new Date(valueA) - new Date(valueB) : new Date(valueB) - new Date(valueA);
    }

    if (sortOrder === 'ASC') {
      return valueA.localeCompare(valueB);
    }

    return valueB.localeCompare(valueA);
  },

  __parsePath: function(obj, path) {
    let split = path.split('.');
    return split.reduce((o, key) => {
      if (o === undefined) return [];
      this.__silly(typeof o[key], o instanceof Array); 
      if (o instanceof Array && typeof o[key] === 'undefined') {
        return o.reduce((res, p) => {
          if (p === undefined ||p[key] === undefined) return res;
          res.push(p[key]);
          return res;
        }, []);
      }

      return o[key] === null || Array.isArray(o[key]) === false ? [o[key]] : o[key];
    }, obj);
  },

  __executeQuery: function(data, field, operator, operand) {
    const logLabel = this.get('logLabel');

    let fns = {
      $not: (rhs) => (lhs) => this.__parsePath(lhs, field).findIndex(val => val !== rhs) !== -1,
      $eq: (rhs) => (lhs) => this.__parsePath(lhs, field).findIndex(val => val === rhs) !== -1,
      $gt: (rhs) => (lhs) => this.__parsePath(lhs, field).findIndex(val => val > rhs) !== -1,
      $lt: (rhs) => (lhs) => this.__parsePath(lhs, field).findIndex(val => val < rhs) !== -1,
      $gte: (rhs) => (lhs) => this.__parsePath(lhs, field).findIndex(val => val >= rhs) !== -1,
      $lte: (rhs) => (lhs) => this.__parsePath(lhs, field).findIndex(val => val <= rhs) !== -1,
      $rex: (rhs) => (lhs) => this.__parsePath(lhs, field).findIndex(val => (new RegExp(rhs)).test(val)) !== -1,
      $rexi: (rhs) => (lhs) => this.__parsePath(lhs, field).findIndex(val => (new RegExp(rhs, 'i')).test(val)) !== -1,
      $in: (rhs) => (lhs) => rhs.indexOf(lhs[field]) !== -1,
      $nin: (rhs) => (lhs) => rhs.indexOf(lhs[field]) === -1,
      $exists: (rhs) => (lhs) => this.__parsePath(lhs, field).findIndex(val => val === undefined) === -1 === rhs,
      $inProp: (rhs) => (lhs) => lhs[field].indexOf(rhs) !== -1,
      $elMatch: (rhs) => (lhs) => this.__processQuery(rhs, this.__parsePath(lhs, field)).length > 0,
      $gtDate: (rhs) => {
        if (rhs === null) return false;
        const rhsDate = Sugar.Date.create(rhs);

        return (lhs) => this.__parsePath(lhs, field).findIndex(val => {
          if (val === null) return false; // Dont compare against null value
          return Sugar.Date.isBefore(rhsDate, val);
        }) !== -1;
      },
      $ltDate: (rhs) => {
        if (rhs === null) return false;
        const rhsDate = Sugar.Date.create(rhs);

        return (lhs) => this.__parsePath(lhs, field).findIndex(val => {
          if (val === null) return false; // Dont compare against null value
          return Sugar.Date.isAfter(rhsDate, val);
        }) !== -1;
      },
      $gteDate: (rhs) => {
        if (rhs === null) return false;
        const rhsDate = Sugar.Date.create(rhs);

        return (lhs) => this.__parsePath(lhs, field).findIndex(val => {
          if (val === null) return false; // Dont compare against null value
          return Sugar.Date.isBefore(rhsDate, val) || Sugar.Date.is(rhsDate, val);
        }) !== -1;
      },
      $lteDate: (rhs) => {
        if (rhs === null) return false;
        const rhsDate = Sugar.Date.create(rhs);

        return (lhs) => this.__parsePath(lhs, field).findIndex(val => {
          if (val === null) return false; // Dont compare against null value
          return Sugar.Date.isAfter(rhsDate, val) || Sugar.Date.is(rhsDate, val);
        }) !== -1;
      }
    };

    if (!fns[operator]) {
      this.__err(new Error(`Invalid operator: ${operator}`));
      return [];
    }

    let results = data.filter(fns[operator](operand));

    this.__debug(logLabel, '__executeQuery', field, operator, operand, data.length, results.length);

    return results;
  }
});
