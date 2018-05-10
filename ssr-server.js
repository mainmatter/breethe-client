const express = require('express');
const Raven = require('raven');
const fs = require('fs');
const vm = require('vm');
const morgan = require('morgan');
const GlimmerRenderer = require('./dist/ssr-app.js');

const { SENTRY_DSN } = process.env;
const USE_SENTRY = !!SENTRY_DSN;

if (USE_SENTRY) {
  Raven.config(SENTRY_DSN).install();
}

const app = express();

if (USE_SENTRY) {
  app.use(Raven.requestHandler());
}

const html = fs.readFileSync('dist/index.html').toString();
const renderer = new GlimmerRenderer();
const sandbox = { require, renderer };
const context = vm.createContext(sandbox);

app.use(morgan('common'));
app.use(express.static('dist', { index: false }));

async function preprender(req, res, next) {
  try {
    let script = new vm.Script(`renderer.render('${req.url}');`);
    let app = await script.runInContext(context);
    let body = html.replace('<div id="app"></div>', `<div id="app">${app}</div>`);
    res.send(body);
  } catch(e) {
    next(e);
  }
}

app.get('/', preprender);
app.get('/search/:searchTerm', preprender);
app.get('/location/:location', preprender);

if (USE_SENTRY) {
  app.use(Raven.errorHandler());
}

app.listen(3000, () => console.log('Server listening on port 3000!'))
