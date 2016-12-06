Polymer({
  is: 'c4c-org-dialog',
  behaviors: [Polymer.C4CLogging],
  properties: {
    org: {
      type: Object,
      notify: true,
      value: {},
    },
    logLevel: {
      type: Number,
      value: 4,
    },
    __edit: {
      type: Object,
      value: {
        name: '',
        type: '',
        website: ''
      }
    },
    open: {
      type: Boolean,
      notify: true,
      observer: '__openChanged'
    }
  },

  __openChanged: function() {
    if (this.open === true) {
      // this.__debug(this.org);
      if (this.org) {
        this.__edit = Object.assign({},this.org);
      } else {
        this.__edit = Object.assign({});
      }
      this.$.dialog.open();
    } else {
      this.$.dialog.close();         
    }
  },

  __formChanged: function() {
    this.$.submit.disabled = !this.$.form.validate();
  },

  __formBeginSubmit: function() {
    if (!this.$.form.validate()) {
      return;
    }
    this.$.form.submit();
  },

  __formPresubmit: function() {
    this.org = Object.assign({},this.__edit);
    this.$.form.reset();
    this.$.dialog.close();
  },
  __dialogClosed: function(ev) {
    if (ev.target === this.$.dialog) {
      this.fire('dialog-closed');
    }
  }
});