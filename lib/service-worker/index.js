/* eslint-env node */
'use strict';

module.exports = {
  name: 'service-worker',

  isDevelopingAddon() {
    return true;
  },

  contentFor(type, config) {
    if (type === 'body-footer') {
      return `
        <script>
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service.js', { scope: './' }).catch(function() {
              // ignore errors
            });
          }
        </script>
      `
    }
  }
};
