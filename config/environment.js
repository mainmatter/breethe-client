'use strict';

const moduleConfiguration = {
  types: {
    application: { definitiveCollection: 'main' },
    component: { definitiveCollection: 'components' },
    'component-test': { unresolvable: true },
    helper: { definitiveCollection: 'components' },
    'helper-test': { unresolvable: true },
    renderer: { definitiveCollection: 'main' },
    template: { definitiveCollection: 'components' },
    stylesheet: { definitiveCollection: 'components' }
  },
  collections: {
    main: {
      types: ['application', 'renderer']
    },
    components: {
      group: 'ui',
      types: ['component', 'component-test', 'template', 'helper', 'helper-test', 'stylesheet'],
      defaultType: 'component',
      privateCollections: ['utils']
    },
    utils: {
      unresolvable: true
    },
    styles: {
      group: 'ui',
      unresolvable: true
    },
  }
};

module.exports = function(environment) {
  let ENV = {
    environment,
    rootURL: '/',
    modulePrefix: 'breethe',
    locationType: 'auto',
    moduleConfiguration
  };

  return ENV;
};
