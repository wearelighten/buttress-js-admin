const AppDb = {
  Schema: {
    schema: [],
    getSchema: function(collection) {
      const schema = AppDb.Schema.schema.find(r => r.collection === collection);
      if (!schema) {
        return false;
      }
    
      return schema;
    },
    
    getFlattened: function(schema) {
      const __buildFlattenedSchema = (property, parent, path, flattened) => {
        path.push(property);
    
        let isRoot = true;
        for (let childProp in parent[property]) {
          if (!parent[property].hasOwnProperty(childProp)) continue;
          if (/^__/.test(childProp)) {
            continue;
          }
    
          isRoot = false;
          __buildFlattenedSchema(childProp, parent[property], path, flattened);
        }
    
        if (isRoot === true) {
          flattened[path.join('.')] = parent[property];
          path.pop();
          return;
        }
    
        path.pop();
        return;
      };
    
      const flattened = {};
      const path = [];
      for (let property in schema.properties) {
        if (!schema.properties.hasOwnProperty(property)) continue;
        __buildFlattenedSchema(property, schema.properties, path, flattened);
      }
    
      return flattened;
    },

    clean: function(collection, path, value) {
      const schema = this.getSchema(collection);

      if (!schema) {
        return false;
      }

      let flatSchema = this.getFlattened(schema);

      for (let property in flatSchema) {
        if (!flatSchema.hasOwnProperty(property)) continue;
        if (property !== path) continue;
        const schemaProp = flatSchema[property];

        switch (schemaProp.__type) {
          case 'boolean':
            value = (/^true$/i).test(value);
            break;
          case 'number':
            value = value.replace(/[^\d\.\-\ ]/g, '');
            break;
        }

        break;
      }

      return value;
    }
  },
  Model: {
    validate: function(collection, object) {
      const flattenedSchema = AppDb.Schema.getFlattened(AppDb.Schema.getSchema(collection));
      const flattenedObject = this.__getFlattened(object);
      console.log(flattenedSchema);
      console.log(flattenedObject);

      return this.__validate(flattenedSchema, flattenedObject, '');
    },
    __getFlattened: function(body) {
      const __buildFlattenedBody = (property, parent, path, flattened) => {
        path.push(property);
    
        if (typeof parent[property] !== 'object' || parent[property] instanceof Date || Array.isArray(parent[property]) || parent[property] === null) {
          flattened.push({
            path: path.join('.'),
            value: parent[property]
          });
          path.pop();
          return;
        }
    
        for (let childProp in parent[property]) {
          if (!parent[property].hasOwnProperty(childProp)) continue;
          __buildFlattenedBody(childProp, parent[property], path, flattened);
        }
    
        path.pop();
        return;
      };
    
      const flattened = [];
      const path = [];
      for (let property in body) {
        if (!body.hasOwnProperty(property)) continue;
        __buildFlattenedBody(property, body, path, flattened);
      }
    
      return flattened;
    },
   
    __validateProp: function(prop, config) {
      let type = typeof prop.value;
      let valid = false;
    
      if (prop.value === null) {
        return true; // Pass if value is null value
      }
    
      switch (config.__type) {
        default:
        case 'boolean':
          if (type === 'string') {
            const bool = prop.value === 'true' || prop.value === 'yes';
            prop.value = bool;
            type = typeof prop.value;
          }
          if (type === 'number') {
            const bool = prop.value === 1;
            prop.value = bool;
            type = typeof prop.value;
          }
          valid = type === config.__type;
          break;
        case 'number':
          if (type === 'string') {
            const number = Number(prop.value);
            if (Number.isNaN(number) === false) {
              prop.value = number;
              type = typeof prop.value;
            }
          }
          valid = type === config.__type;
          break;
        case 'id':
          valid = type === 'string';
          break;
        case 'object':
          valid = type === config.__type;
          break;
        case 'string':
          if (type === 'number') {
            prop.value = String(prop.value);
            type = typeof prop.value;
          }
    
          valid = type === config.__type;
          if (config.__enum && Array.isArray(config.__enum)) {
            valid = !prop.value || config.__enum.indexOf(prop.value) !== -1;
          }
          break;
        case 'array':
          valid = Array.isArray(prop.value);
          break;
        case 'date':
          if (prop.value === null) {
            valid = true;
          } else {
            let date = new Date(prop.value);
            prop.value = date;
          }
          break;
      }
    
      return valid;
    },
    
    __validate: function(schema, values, parentProperty) {
      const res = {
        isValid: true,
        missing: [],
        invalid: []
      };
    
      for (let property in schema) {
        if (!schema.hasOwnProperty(property)) continue;
        let propVal = values.find(v => v.path === property);
        const config = schema[property];
    
        if (propVal === undefined && config.__default !== undefined) {
          propVal = {
            path: property,
            value: AppDb.Factory.getPropDefault(config)
          };
          values.push(propVal);
        }
    
        if (propVal === undefined) {
          if (config.__required) {
            res.isValid = false;
            res.missing.push(property);
          }
          continue;
        }
    
        if (!this.__validateProp(propVal, config)) {
          res.isValid = false;
          res.invalid.push(`${parentProperty}${property}:${propVal.value}[${typeof propVal.value}]`);
          continue;
        }
    
        if (config.__type === 'array' && config.__schema) {
          propVal.value.reduce((errors, v, idx) => {
            const values = this.__getFlattenedBody(v);
            const res = this.__validate(config.__schema, values, `${property}.${idx}.`);
            if (!res.invalid) return errors;
            if (res.missing.length) {
              errors.missing = errors.missing.concat(res.missing);
            }
            if (res.invalid.length) {
              errors.invalid = errors.invalid.concat(res.invalid);
            }
    
            return errors;
          }, res);
        }
      }

      return res;
    }
  },
  Factory: {
    create: function(collection) {
      let schema = AppDb.Schema.getSchema(collection);
      if (!collection) {
        return false;
      }

      const __inflateObject = (parent, path, value) => {
        if (path.length > 1) {
          let parentKey = path.shift();
          if (!parent[parentKey]) {
            parent[parentKey] = {};
          }
          __inflateObject(parent[parentKey], path, value);
          return;
        }
      
        parent[path.shift()] = value;
        return;
      };
     
      const flattenedSchema = AppDb.Schema.getFlattened(schema);
    
      const res = {};
      const objects = {};
      for (let property in flattenedSchema) {
        if (!flattenedSchema.hasOwnProperty(property)) continue;
        const config = flattenedSchema[property];
        let propVal = {
          path: property,
          value: AppDb.Factory.getPropDefault(config)
        };
    
        const path = propVal.path.split('.');
        const root = path.shift();
        let value = propVal.value;
        if (path.length > 0) {
          if (!objects[root]) {
            objects[root] = {};
          }
          __inflateObject(objects[root], path, value);
          value = objects[root];
        }
    
        res[root] = value;
      }
      return res;
    },
    getPropDefault: function(config) {
      let res;
      switch (config.__type) {
        default:
        case 'boolean':
          res = config.__default !== undefined ? config.__default : false;
          break;
        case 'string':
          res = config.__default !== undefined ? config.__default : '';
          break;
        case 'number':
          res = config.__default !== undefined ? config.__default : 0;
          break;
        case 'array':
          res = config.__default !== undefined ? config.__default : [];
          break;
        case 'object':
          res = config.__default !== undefined ? config.__default : {};
          break;
        case 'id':
          res = config.__default !== undefined ? config.__default : null;
          break;
        case 'date':
          if (config.__default === null) {
            res = null;
          } else {
            res = new Date();
          }
      }
      return res;
    }
  }
}

Polymer({
  is: 'bjs-app-db',
  behaviors: [Polymer.BJSLogging],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
    auth: {
      type: Object
    },
    loaded: {
      type: Boolean,
      notify: true
    },
    __maxConcurrentRequests: {
      type: Number,
      value: 4
    },
    rqSchemaParams: {
      type: Object
    },
    dbSchema: {
      type: Array,
      value: function() {
        return [];
      }
    },
    db: {
      type: Object,
      value: function() {
        return {
          org: {
            status: 'uninitialised',
            data: [],
            metadata: {}
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
          },
          user: {
            status: 'uninitialised',
            data: [],
            metadata: {}
          }
        }
      },
      notify: true
    },
    __services: {
      type: Array,
      value: function() { return []; }
    },
    __numRequests: {
      type: Number,
      value: 0
    }
  },
  observers: [
    '__auth(auth.user)',
    '__dbSchema(dbSchema.*)'
  ],

  listeners: {
    'data-service-list': '__onDataLoaded'
  },
  
  attached: function() {
    new Fingerprint2().get(result => {
      let nibbles = result.match(/.{1}/g).map(n => parseInt(`0x${n}`, 16) > 7 ? 1 : 0);
      let id = 0;
      nibbles.forEach((n,idx) => id |= n << idx);
      this.__machineId = id;
      this.__processId = Math.floor(Math.random() * 100000) % 0xFFFF;
      this.__inc = Math.floor(Math.random() * 65535) % 0xFFFF;
    });
  },

  __auth: function() {
    if (!this.auth.user){
      return;
    }

    if (this.auth.user.authToken) {
      this.rqSchemaParams = {
        urq: Date.now(),
        token: this.auth.user.authToken
      };
      this.$.schema.generateRequest();
    }   

    this.__services = Polymer.dom(this.root).querySelectorAll('crm-data-service:not([loaded])');
    this.__services.sort((a,b) => a.priority - b.priority);
    for (let x=0; x<this.__maxConcurrentRequests; x++)
      this.__onDataLoaded();
  },

  __dbSchema: function() {
    AppDb.Schema.schema = this.get('dbSchema');
    this.__debug(AppDb.Factory.create('documents'));
  },

  __onDataLoaded: function(ev) {
    if (!ev) {
      this.__services.shift().triggerGet();
      this.__numRequests++;
      return;
    }
    
    if (--this.__numRequests === 0) {
      this.__debug('All loaded');
      this.set('loaded', true);
    }
    if (!this.__services.length) {
      return;
    }

    this.__services.shift().triggerGet();
    this.__numRequests++;
  },

  genObjectId: function(time) {
    if ('number' != typeof time) {
      time = ~~(Date.now()/1000);
    }

    const memory = new ArrayBuffer(12);
    const buffer   = new Uint8Array(memory);

    this.__inc++;

    this.__silly(time);

    // Encode time
    buffer[3] = time & 0xff;
    buffer[2] = (time >> 8) & 0xff;
    buffer[1] = (time >> 16) & 0xff;
    buffer[0] = (time >> 24) & 0xff;
    // Encode machine
    buffer[6] = this.__machineId & 0xff;
    buffer[5] = (this.__machineId >> 8) & 0xff;
    buffer[4] = (this.__machineId >> 16) & 0xff;
    // Encode pid
    buffer[8] = this.__processId & 0xff;
    buffer[7] = (this.__processId >> 8) & 0xff;
    // Encode index
    buffer[11] = this.__inc & 0xff;
    buffer[10] = (this.__inc >> 8) & 0xff;
    buffer[9] = (this.__inc >> 16) & 0xff;

    this.__silly(this.__inc);
    this.__silly(buffer);
    let objectStr = '';

    for (let x=0; x<12; x++) {
      objectStr += buffer[x].toString(16).padStart(2, '0');
    }

    this.__silly(objectStr);

    let hexRex = new RegExp("^[0-9a-fA-F]{24}$");
    this.__assert(hexRex.test(objectStr));

    return objectStr;
  }
});
