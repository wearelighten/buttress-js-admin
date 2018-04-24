Polymer({
  is: 'bjs-filter',
  behaviors: [
    BJSBehaviors.Logging
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 3
    },
    filterTypes: {
      type: Object,
      value: function() {
        return {
          TEXT: 'text',
          DROPDOWN: 'dropdown'
        }
      }
    },
    filters: {
      type: Array,
      value: function() {
        return [];
      },
      notify: true,
    },
    filterSpec: {
      type: Array
    },
    __selectedFilter: {
      type: Object
    },
    __editing: {
      type: Object
    },
    isText: {
      type: Boolean,
      value: 'text',
      computed: '__computeEditingType(filterTypes.TEXT, __selectedFilter)'
    },
    isDropdown: {
      type: Boolean,
      value: 'text',
      computed: '__computeEditingType(filterTypes.DROPDOWN, __selectedFilter)'
    }
  },
  observers: [
    '__filters(filters.*)',
    '__editingChanged(__editing.*)',
    '__selectedFilterChanged(__selectedFilter)',
    '__filterSpecChanged(filterSpec)'
  ],

  attached: function() {
    this.__editing = this.get('filters.0');
    this.linkPaths('__editing', 'filters.0');
    this.set('__selectedFilter', this.get('filterSpec.0'));
    this.__attached = true;
  },

  __selectedFilterChanged: function() {
    const selected = this.get('__selectedFilter');
    this.set('__editing.name', selected.name);
    this.set('__editing.value', '');
  },
  __filterSpecChanged: function() {
    const filterSpec = this.get('filterSpec');
    if (!this.get('__selectedFilter') && filterSpec.length > 0) {
      this.set('__selectedFilter', filterSpec[0]);
    }
  },

  __computeEditingType: function(type, editing) {
    return type === editing.type;
  },

  __filters: function(cr) {
    this.__debug(cr);
    if (this.__attached) {
      this.fire('changed');
    }
  },
  __editingChanged: function(cr) {
    this.__debug(cr);
    if (this.__attached) {
      this.fire('changed');
    }
  },

  __addFilter: function() {
    if (!this.get('__editing.value')) {
      return;
    }

    this.push('filters', {
      name: this.get('__editing.name'),
      value: this.get('__editing.value')
    });

    this.set('__editing.value', '');
    // this.set('__editing.name', '');

    this.__debug(this.filters);
  },

  __formPresubmit: function() {

  },

  __rmFilter: function(ev) {
    let index = ev.model.get('index');
    let filter = ev.model.get('item');
    this.__debug(filter);
    this.splice('filters', index+1, 1);
    this.fire('changed');
    // this.__filterChanged = !this.__filterChanged;
  },

  __ignoreEditing: function(item) {
    return item.editing !== true;
  },

  __computeFilterIcon: function(name) {
    let map = {
      'name': 'social:person',
      'place': 'maps:place'
    };

    if (!map[name]) {
      return map.sector;
    }

    return map[name];
  }
});
