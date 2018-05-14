/* eslint-env node */
'use strict';

module.exports = {
  name: 'sentry',

  isDevelopingAddon() {
    return true;
  },

  contentFor(type, config) {
    if (type === 'head-footer' && config.environment === 'production') {
      return `
        <script src="https://cdn.ravenjs.com/3.25.1/raven.min.js" crossorigin="anonymous"></script>
        <script>Raven.config('https://8869940c20dc44228cd6f64fb3ca6bce@sentry.io/1205836').install();</script>
      `
    }
  }
};
