Polymer({
  is: 'bjs-dashboard',
  behaviors: [
    BJSBehaviors.Logging,
    BJSBehaviors.Helpers,
    Polymer.BJSListView
  ],
  properties: {
    logLevel: {
      type: Number,
      value: 4
    },

    db: {
      type: Object
    },

    __activitiesVerbs: {
      type: Object,
      value: function(){
        return {
          POST: 'post',
          PUT: 'put',
          DEL: 'delete'
        }
      }
    },
    __trackingTypes: {
      type: Object,
      value: function(){
        return {
          INTERACTION: 'interaction',
          ERROR: 'error',
          LOGGING: 'logging'
        }
      }
    },

    __activitiesUnpaged: Array,
    __activitiesQuery: {
      type: Object,
      computed: '__computeActivitiesQuery(db.activity.data.length)'
    },
    
    __trackingUnpaged: Array,
    __trackingQuery: {
      type: Object,
      computed: '__computeTrackingQuery(db.tracking.data.length)'
    },
    
    __trackingPieChartConfig: {
      type: Object
    },
    __trackingPieChart: {
      type: Object
    },

    __activitesPieChartConfig: {
      type: Object
    },
    __activitesPieChart: {
      type: Object
    },

    __activityChartConfig: {
      type: Object
    },
    __activityChart: {
      type: Object
    },

    __activitiesVerbsCounts: {
      type: Object,
    },
    __trackingTypesCounts: {
      type: Object,
    }
  },
  observers: [
    '__activitesVerbsCount(__activitiesUnpaged, __activitiesUnpaged.length)',
    '__trackingTypesCount(__trackingUnpaged, __trackingUnpaged.length)',
    '__computeChartActivity(__activitiesUnpaged, __trackingTypesCounts, __trackingPieChart, __activitesPieChart, __activityChart)'
  ],
  ready: function() {
    const trackingPieChartConfig = {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        hover: {
          animationDuration: 0
        },
        responsiveAnimationDuration: 0
      }
    };
    const activitesPieChartConfig = {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        hover: {
          animationDuration: 0
        },
        responsiveAnimationDuration: 0
      }
    };
    const activityChartConfig = {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0
          },
          hover: {
            animationDuration: 0
          },
          responsiveAnimationDuration: 0,
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Day'
              }
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: '(N)'
              },
              ticks: {
                  beginAtZero:true
              }
            }]
          }
      }
    };

    this.set('__trackingPieChartConfig', trackingPieChartConfig);
    this.set('__activitesPieChartConfig', activitesPieChartConfig);
    this.set('__activityChartConfig', activityChartConfig);

    this.set('__trackingPieChart', new Chart(this.$.trackingPieChart, this.get('__trackingPieChartConfig')));
    this.set('__activitesPieChart', new Chart(this.$.activitesPieChart, this.get('__activitesPieChartConfig')));
    this.set('__activityChart', new Chart(this.$.activityChart, this.get('__activityChartConfig')));
  },

  __computeChartActivity: function() {
    const trackingPieChart = this.get('__trackingPieChart');
    const activitesPieChart = this.get('__activitesPieChart');
    const activityChart = this.get('__activityChart');

    const trackingTypesCounts = this.get('__trackingTypesCounts');
    const activitiesVerbsCounts = this.get('__activitiesVerbsCounts');
  
    const now = Sugar.Date.create('30 days ago');
    const activites = this.get('__activitiesUnpaged').filter(a => {
      return Sugar.Date.isBefore(now, a.timestamp);
    });

    const groupedDates = activites.reduce((dates, activity) => {
      const dateShort = activity.timestamp.substring(0, activity.timestamp.indexOf('T'));

      if (!dates[dateShort]) dates[dateShort] = 0;
      dates[dateShort]++;
      
      return dates;
    }, {});

    const graphLabels = Object.keys(groupedDates).map(label => {
      return Sugar.Date.format(Sugar.Date.create(label), '{dd}/{MM}/{yyyy}');
    });
    const graphData = Object.values(groupedDates);

    this.set('__trackingPieChartConfig.data', {
      labels: ['Interaction', 'Error', 'Logging'],
      datasets: [{
        backgroundColor: ['green', 'red', 'orange'],
        data: [
          trackingTypesCounts.INTERACTION,
          trackingTypesCounts.ERROR,
          trackingTypesCounts.LOGGING
        ]
      }]
    });
    this.set('__activitesPieChartConfig.data', {
      labels: ['POST', 'PUT', 'DEL'],
      datasets: [{
        backgroundColor: ['green', 'orange', 'red'],
        data: [
          activitiesVerbsCounts.POST,
          activitiesVerbsCounts.PUT,
          activitiesVerbsCounts.DEL
        ]
      }]
    });
    this.set('__activityChartConfig.data', {
      labels: graphLabels,
      datasets: [{
        label: 'Activites',
        backgroundColor: '#c62828',
        borderColor: '#c62828',
        data: graphData,
        fill: false,
      }]
    });

    trackingPieChart.update();
    activitesPieChart.update();
    activityChart.update();
  },

  /**
   * Set the page header title
   * @override Polymer.BJSListView
   */
  __computeSubPageTitle: function(){
    return 'Dashboard';
  },

  __viewEntity: function(path, query) {
    this.fire('view-path', {
      path: path,
      query: query
    })
  },

  __viewTrackingInteraction: function() {
    this.__viewEntity('trackings', {
      filter: 'tracking',
      filter_type: 'interaction'
    });
  },
  __viewTrackingError: function() {
    this.__viewEntity('trackings', {
      filter: 'tracking',
      filter_type: 'error'
    });
  },
  __viewTrackinLogging: function() {
    this.__viewEntity('trackings', {
      filter: 'tracking',
      filter_type: 'logging'
    });
  },
  __viewActivityPost: function() {
    this.__viewEntity('activities', {
      filter: 'activity',
      filter_permissions: 'add'
    });
  },
  __viewActivityPut: function() {
    this.__viewEntity('activities', {
      filter: 'activity',
      filter_permissions: 'write'
    });
  },
  __viewActivityDel: function() {
    this.__viewEntity('activities', {
      filter: 'activity',
      filter_permissions: 'delete'
    });
  },

  __viewOrganisations: function() {
    this.__viewEntity('orgs');
  },
  __viewGroups: function() {
    this.__viewEntity('groups');
  },
  __viewApps: function() {
    this.__viewEntity('apps');
  },
  __viewUsers: function() {
    this.__viewEntity('users');
  },

  __computeActivitiesQuery: function() {
    return { }; // Select all
  },
  __computeTrackingQuery: function() {
    return { }; // Select all
  },

  __activitesVerbsCount: function(activities) {
    const verbs = this.get('__activitiesVerbs');
    const counts = {};
    
    for(let verb in verbs) {
      counts[verb] = activities.filter(a => a.verb === verbs[verb]).length;
    }

    this.set('__activitiesVerbsCounts', counts);
  },
  __trackingTypesCount: function(trackings) {
    const types = this.get('__trackingTypes');
    const counts = {};
    
    for(let type in types) {
      counts[type] = trackings.filter(t => t.type === types[type]).length;
    }

    this.set('__trackingTypesCounts', counts);
  }
});
