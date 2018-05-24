/* eslint-env node */
'use strict';

const path = require('path');
const typescript = require('broccoli-typescript-compiler').typescript;
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'service-worker',

  isDevelopingAddon() {
    return true;
  },

  included(app) {
    this._super(...arguments);

    app.options = app.options || {};
    app.options.fingerprint = app.options.fingerprint || {};
    app.options.fingerprint.exclude = app.options.fingerprint.exclude || [];
    app.options.fingerprint.exclude.push('service-worker.js');
  },

  contentFor(type, config) {
    if (type === 'body-footer') {
      return `
        <script>
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js', { scope: './' }).catch(function() {
              // ignore errors
            });
          }
        </script>
      `
    }
  },

  postprocessTree(type, appTree) {
    if (type !== 'all') {
      return appTree;
    } else {
      let workerTree = this._workerTree();
      return new MergeTrees([appTree, workerTree]);
    }
  },

  _workerTree() {
    return typescript(path.join(this.root, 'workers'), {
      tsconfig: {
        compilerOptions: {
          module: 'es6',
          target: 'es6'
        }
      }
    });
  }
};
