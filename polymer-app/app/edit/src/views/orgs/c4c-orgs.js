Polymer({
  is: 'c4c-orgs',
  behaviors: [Polymer.C4CLogging],
  properties: {
    auth: {
      type: Object
    },
    orgs: {
      type: Array,
      notify: true
    },
    __mode: {
      type: String,
      value: ''
    },
    __dialogOpen: {
      type: Boolean,
      computed: '__computeDialogOpen(__mode)'
    },
    __dialogTitle: {
      type: String,
      computed: '__computeDialogTitle(__mode)'
    },
    __selectedModel: {
      type: Object,
      value: null
    },
    __selectedItem: {
      type: Object,
      value: null
    },
    __editOrg: {
      type: Object,
      value: {},
    }
  },
  observers: [
    '__orgCommitted(__editOrg.*)'
  ],
  __addOrg: function() {
    this.__editOrg = {};
    this.__mode = 'add';
    this.$.fab.disabled = true;   
  },
  __rmOrg: function(ev) {
    // this.__debug(ev.model.get('index'));
    this.__selectedItemIndex = ev.model.get('index');
    this.$.rmOrgDialog.open();
    this.$.fab.disabled = true;      
  },
  __updateOrg: function(ev) {
    this.__selectedModel = ev.model;
    this.__editOrg = this.__selectedModel.get('org');
    // this.$.updOrgDialog.open();
    this.$.fab.disabled = true;
    this.__mode = 'update';
  }, 
  
  __rmOrgConfirmed: function() {
    if (this.__selectedItemIndex === -1) {
      this.__warn("tried to delete without selecting");
      return;
    }
    this.splice('orgs', this.__selectedItemIndex, 1);
    this.__selectedItemIndex = -1;
  },
  __dialogClosed: function() {
    this.$.fab.disabled = false;
    this.__mode = '';
  },
  __computeDialogTitle(__mode) {
    let titles = {
      'add': 'Add Organisation',
      'update': 'Update Organisation'
    };
    return titles[__mode];
  },
  __computeDialogOpen(__mode) {
    return __mode === 'add' || __mode === 'update';
  },
  __orgCommitted: function() {
    if (this.__mode === '') {
      return;
    }
    let clone = Object.assign({}, this.__editOrg);
    this.__debug(clone);
    if (this.__mode === 'add') {
      this.push('orgs', clone);
    } else {
      this.set(['orgs',this.__selectedModel.get('index')], clone);
    }
  }
});
