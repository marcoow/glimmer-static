'use strict';

const fs = require('fs');
const path = require('path');

const GlimmerApp = require('@glimmer/application-pipeline').GlimmerApp;
const BroccoliCleanCss = require('broccoli-clean-css');
const Funnel = require('broccoli-funnel');
const Map = require('broccoli-stew').map;
const glob = require('glob');

class GlimmerStaticApp extends GlimmerApp {
  cssTree() {
    let resetCss = fs.readFileSync(path.join(this.project.root, 'vendor', 'css', 'reset.css'));
    let cssTree = Funnel(super.cssTree(...arguments), {
      include: ['app.css']
    });
	
    cssTree = Map(cssTree, (content) => `${resetCss}${content}`);
	
    if (this.options.minifyCSS.enabled) {
      cssTree = new BroccoliCleanCss(cssTree);
    }
	
    return cssTree;
  }
}

module.exports = function(defaults) {
  let allComponents = glob.sync('*/', {
    cwd: path.join(__dirname, 'src/ui/components')
  }).map((component) => component.replace(/\/$/, ''));

  let app = new GlimmerStaticApp(defaults, {
    'css-blocks': {
      entry: allComponents,
      output: 'src/ui/styles/app.css',
    },
    minifyCSS: {
      enabled: process.env.EMBER_ENV === 'production'
    },
  });

  return app.toTree();
};
