'use strict';

const fs = require('fs');
const path = require('path');
const GlimmerApp = require('@glimmer/application-pipeline').GlimmerApp;
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const MergeTrees = require('broccoli-merge-trees');
const typescript = require('broccoli-typescript-compiler').typescript;
const Funnel = require('broccoli-funnel');
const Rollup = require('broccoli-rollup');
const BroccoliCleanCss = require('broccoli-clean-css');
const Map = require('broccoli-stew').map;
const Sass = require('node-sass');

const MODULE_CONFIG = require('@glimmer/application-pipeline/dist/lib/broccoli/default-module-configuration.js').default;

const ApiHost = process.env.API_HOST || 'http://localhost:4200';

function scssPreprocessor(file, data, _configuration, _sourceMap) {
  return new Promise((resolve, reject) => {
    const sassOptions = {
      file,
      data,
      outputStyle: 'expanded',
      sourceMap: true,
      outFile: file
    };
    Sass.render(sassOptions, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          content: res.css.toString(),
          sourceMap: res.map.toString(),
          dependencies: [],
        })
      };
    });
  })
}

class BreetheGlimmerApp extends GlimmerApp {
  javascriptTree() {
    let originalNodeEnv =  process.env.NODE_ENV;
    process.env.NODE_ENV = null;
    let result = super.javascriptTree();
    process.env.NODE_ENV = originalNodeEnv;
    return result;
  }

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
      },
      throwOnError: false
    });
  }

  cssTree() {
    let resetCss = fs.readFileSync(path.join(this.project.root, 'vendor', 'reset.css'));
    let cssTree = Funnel(super.cssTree(...arguments), {
      include: ['app.css']
    });

    cssTree = Map(cssTree, (content) => `${resetCss}${content}`);

    if (this.options.minifyCSS.enabled) {
      cssTree = new BroccoliCleanCss(cssTree);
    }

    return cssTree;
  }

  packageSSR() {
    let jsTree = new Funnel(this.javascriptTree(), {
      exclude: ['src/index.js']
    });
    let ssrTree = this.ssrTree();

    let appTree = new MergeTrees([jsTree, ssrTree]);
    return new Rollup(appTree, {
      rollup: {
        input: 'ssr/index.js',
        output: {
          file: 'ssr-app.js',
          format: 'cjs'
        },
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
  }

  package() {
    let appTree = super.package(...arguments);
    let ssrTree = this.packageSSR();

    return new MergeTrees([appTree, ssrTree]);
  }
}

module.exports = function(defaults) {
  let app = new BreetheGlimmerApp(defaults, {
    rollup: {
      plugins: [
        resolve({ jsnext: true, module: true, main: true }),
        commonjs(),
        replace({
          __ENV_API_HOST__: JSON.stringify(ApiHost)
        })
      ]
    },
    'css-blocks': {
      entry: 'Breethe',
      output: 'src/ui/styles/app.css',
      parserOpts: {
        preprocessors: {
          css: scssPreprocessor
        }
      }
    },
    minifyCSS: {
      enabled: process.env.EMBER_ENV === 'production'
    },
    fingerprint: {
      exclude: ['ssr-app.js']
    }
  });

  return app.toTree();
};
