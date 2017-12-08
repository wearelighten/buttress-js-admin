Polymer({
  is: "bjs-pagination",
  properties: {
    current: {
      type: Number,
      notify: true,
      value: 1
    },
    first: {
      type: Number,
      value: 1
    },
    last: Number,

    maxSteps: {
      type: Number,
      value: 5
    },

    steps: {
      type: Array,
      computed: '__computeSteps(last, current, maxSteps)'
    },

    isFirst: {
      type: Boolean,
      computed: '__computeIsCurrent(current, first)'
    },
    isLast: {
      type: Boolean,
      computed: '__computeIsCurrent(current, last)'
    }
    
  },

  __setPage: function(ev) {
    this.set('current', ev.model.item.page);
  },
  __bumpPrev: function()  {
    if(this.get('current') <= this.get('first')) return;
    this.set('current', this.get('current') - 1);
  },
  __bumpNext: function()  {
    if(this.get('current') >= this.get('last')) return;
    this.set('current', this.get('current') + 1);
  },

  __computeSteps: function() {
    const current = this.get('current');
    const first = this.get('first');
    const last = this.get('last');
    const maxSteps = this.get('maxSteps');

    let steps = [];
    let offset = current - Math.floor(maxSteps/2);
    for(let x = offset; x <= last; x++) {
      if (x < first) continue;
      if (x >= maxSteps + current || x >= maxSteps + offset) break;
      steps.push({
        page: x,
        isCurrent: (current === x)
      });
    }

    return steps;
  },

  __computeIsCurrent: function(current, target) {
    return current === target;
  }

});
