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
const GlimmerAnalyzer = require('@css-blocks/glimmer').GlimmerAnalyzer;
const GlimmerProject = require('@css-blocks/glimmer').Project;
const Sass = require('node-sass');

const MODULE_CONFIG = require('@glimmer/application-pipeline/dist/lib/broccoli/default-module-configuration.js').default;

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
    return super.package(...arguments);
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
    },
    'css-blocks': {
      entry: 'PpmClient',
      output: 'src/ui/styles/app.css',
      getAnalyzer: (app) => {
        let parserOpts = {
          preprocessors: {
            css: function(filePath, content, _options, sourceMap) {
              let sourceDir = path.dirname(filePath);
              let result = Sass.renderSync({ data: content, sourceMap: true, outFile: filePath, includePaths: [sourceDir] });
              return Promise.resolve({ content: result.css.toString(), sourceMap: result.map.toString() });
            }
          }
        };
        return new GlimmerAnalyzer(new GlimmerProject(app.project.root, MODULE_CONFIG, parserOpts), parserOpts, {});
      }
    },
    minifyCSS: {
      enabled: process.env.EMBER_ENV === 'production'
    }
  });

  return app.toTree();
};
