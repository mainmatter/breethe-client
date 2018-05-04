'use strict';

const GlimmerApp = require('@glimmer/application-pipeline').GlimmerApp;
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const MergeTrees = require('broccoli-merge-trees');
const typescript = require('broccoli-typescript-compiler').typescript;
const Funnel = require('broccoli-funnel');

class PpmGlimmerApp extends GlimmerApp {
  ssrTree() {
    let jsTree = this.javascriptTree();
    let ssrTree = typescript('ssr', {
      workingPath: this.project.root
    });
    ssrTree = new Funnel(ssrTree, {
      destDir: 'src'
    });
    ssrTree = this.processESLatest(ssrTree);
    ssrTree = new MergeTrees([jsTree, ssrTree], { overwrite: true });

    return ssrTree;
  }

  package() {
    let appTree = super.package(...arguments);
    let ssrTree = this.ssrTree();
    ssrTree = this.rollupTree(ssrTree);
    ssrTree = new Funnel(ssrTree, {
      destDir: 'ssr'
    });

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
