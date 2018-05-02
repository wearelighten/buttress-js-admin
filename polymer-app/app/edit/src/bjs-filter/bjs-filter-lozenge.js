Polymer({
  is: 'bjs-filter-lozenge',
  properties: {
    filter: {
      type: Object,
      value: function() {
        return {
          name: 'name',
          value: ''
        };
      }
    },
    filterIcon: {
      type: String,
      computed: '__computeFilterIcon(filter.name)'
    },
    hideRmButton: {
      type: Boolean,
      value: false
    }
  },

  __rmFilter: function() {
    this.fire('rm-filter');
  },

  __computeFilterIcon: function(name) {
    let map = {
      'path': 'social:person',
      'permissions': 'maps:place'
    };

    if (!map[name]) {
      return map.sector;
    }

    return map[name];
  }
});
