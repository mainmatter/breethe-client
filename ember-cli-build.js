'use strict';

const GlimmerApp = require('@glimmer/application-pipeline').GlimmerApp;
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const MergeTrees = require('broccoli-merge-trees');
const typescript = require('broccoli-typescript-compiler').typescript;
const Funnel = require('broccoli-funnel');
const Rollup = require('broccoli-rollup');

class PpmGlimmerApp extends GlimmerApp {
  ssrTree() {
    let ssrTree = typescript('ssr', {
      workingPath: this.project.root
    });

    return new Funnel(ssrTree, {
      destDir: 'ssr'
    });
  }

  packageSSR() {
    let jsTree = new Funnel(this.javascriptTree(), {
      exclude: ['src/index.js']
    });
    let ssrTree = this.ssrTree();

    let appTree = new MergeTrees([jsTree, ssrTree]);
    appTree = new Rollup(appTree, {
      rollup: {
        entry: 'ssr/index.js',
        dest: 'ssr-app.js',
        format: 'cjs'
      }
    });

    return appTree;
  }

  package() {
    let appTree = super.package(...arguments);
    let ssrTree = this.packageSSR();

    return new MergeTrees([appTree, ssrTree]);
  }
}

module.exports = function(defaults) {
  let app = new PpmGlimmerApp(defaults, {
    rollup: {
      plugins: [
        resolve({ jsnext: true, module: true, main: true }),
        commonjs()
      ]
    }
  });

  return app.toTree();
};
