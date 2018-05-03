/* eslint-env node */
'use strict';

const STRIP_ENVIRONMENT = 'production';

module.exports = {
  name: 'strip-test-selectors',

  isDevelopingAddon() {
    return true;
  },

  included(app) {
    if (app.env === STRIP_ENVIRONMENT) {
      let StripTestSelectorsPlugin = require('./strip-test-selectors');
      app.registry.add('glimmer-ast-plugin', StripTestSelectorsPlugin);
    }
  }
};
