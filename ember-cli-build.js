'use strict';

const GlimmerApp = require('@glimmer/application-pipeline').GlimmerApp;
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const MergeTrees = require('broccoli-merge-trees');
const typescript = require('broccoli-typescript-compiler').typescript;
const Funnel = require('broccoli-funnel');
const Rollup = require('broccoli-rollup');

const ApiHost = process.env.API_HOST || 'http://localhost:4200';

class PpmGlimmerApp extends GlimmerApp {
  ssrTree() {
    let tsTree = new Funnel('.', {
      include: ['ssr/**/*', 'config/**/*']
    });

    return typescript(tsTree, {
      workingPath: this.project.root,
      tsconfig: {
        compilerOptions: {
          target: 'es6',
          moduleResolution: 'node'
        }
      }
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
        format: 'cjs',
        onwarn: function(warning) {
          if (warning.code === 'THIS_IS_UNDEFINED') {
            return;
          }
          console.log('Rollup warning: ', warning.message);
        },
        plugins: [
          resolve({ jsnext: true, module: true, main: true }),
          commonjs(),
          replace({
            __ENV_API_HOST__: JSON.stringify(ApiHost)
          })
        ]
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
        commonjs(),
        replace({
          __ENV_API_HOST__: JSON.stringify(ApiHost)
        })
      ]
    }
  });

  return app.toTree();
};
