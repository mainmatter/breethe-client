const express = require('express');
const Raven = require('raven');
const fs = require('fs');
const vm = require('vm');
const morgan = require('morgan');
const request = require('request-promise-native');
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

const { API_HOST } = process.env;
const renderer = new GlimmerRenderer();

app.use(morgan('common'));
app.use(express.static('dist', { index: false }));

async function searchLocation(searchTerm) {
  let response = await request(`${API_HOST}/api/locations?filter%5Bcity%5D=${searchTerm}`);
  let data = JSON.parse(response).data;
  return data;
}

async function preprender(req, res, next, data = []) {
  try {
    console.log(data);
    let script = new vm.Script(`renderer.render('http://localhost:3000', '${req.url}', apiHost, data);`);
    const sandbox = { require, renderer, apiHost: API_HOST, data };
    const context = vm.createContext(sandbox);
    let app = await script.runInContext(context);
    let body = html.replace('<div id="app"></div>', `<div id="app">${app}</div>`);
    res.send(body);
  } catch(e) {
    next(e);
  }
}

app.get('/', preprender);
app.get('/search/:searchTerm', async function(req, res, next) {
  let data = await searchLocation(req.params.searchTerm);
  await preprender(req, res, next, data);
});
app.get('/location/:location', preprender);

if (USE_SENTRY) {
  app.use(Raven.errorHandler());
}

app.listen(3000, () => console.log('Server listening on port 3000!'))
