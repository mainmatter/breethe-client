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

const HTML = fs.readFileSync('dist/index.html').toString();

const { API_HOST } = process.env;
const renderer = new GlimmerRenderer();

app.use(morgan('common'));
app.use(express.static('dist', { index: false }));

async function searchLocation(searchTerm) {
  let response = await request(`${API_HOST}/api/locations?filter%5Bcity%5D=${searchTerm}`);
  let data = JSON.parse(response).data;
  return data;
}

function serializeCacheData(data = []) {
  let serialized = JSON.stringify(data);
  return `<script type="orbit/cache" id="orbit-main-cache">${serialized}</script>`;
}

async function preprender(req, res, next, data = []) {
  try {
    let origin = `${req.protocol}://${req.headers.host}`;
    const sandbox = { origin, renderer, apiHost: API_HOST, data };
    const context = vm.createContext(sandbox);
    let script = new vm.Script(`renderer.render(origin, '${req.url}', apiHost, data);`);
    let app = await script.runInContext(context);
    let body = `<div id="app">${app}</div>`;
    body += serializeCacheData(res.locals.cacheData);
    body = HTML.replace('<div id="app"></div>', body);
    res.send(body);
  } catch(e) {
    next(e);
  }
}

app.get('/', preprender);
app.get('/search/:searchTerm', async function(req, res, next) {
  let data = await searchLocation(req.params.searchTerm);
  res.locals.cacheData = data || [];
  await preprender(req, res, next, data);
});
app.get('/location/:location', preprender);

if (USE_SENTRY) {
  app.use(Raven.errorHandler());
}

app.use(function(err, req, res, next) {
  console.error('Error: ', err);
  res.send(HTML);
});

app.listen(3000, () => console.log('Server listening on port 3000!'))