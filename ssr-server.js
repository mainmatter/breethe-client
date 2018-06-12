const express = require('express');
const Raven = require('raven');
const fs = require('fs');
const vm = require('vm');
const morgan = require('morgan');
const request = require('request-promise-native');
const GlimmerRenderer = require('./dist/ssr-app.js');

const HTML = fs.readFileSync('dist/index.html').toString();

const { PORT = 3000 } = process.env;

const { API_HOST } = process.env;
const renderer = new GlimmerRenderer();

const { SENTRY_DSN } = process.env;
const USE_SENTRY = !!SENTRY_DSN;

if (USE_SENTRY) {
  Raven.config(SENTRY_DSN).install();
}

const app = express();

if (USE_SENTRY) {
  app.use(Raven.requestHandler());
}

app.use(morgan('common'));
app.use(express.static('dist', { index: false }));

async function searchLocation(searchTermOrCoordinates) {
  let url;
  if (Array.isArray(searchTermOrCoordinates)) {
    let [lat, lon] = searchTermOrCoordinates;
    url = `${API_HOST}/api/locations?filter%5Bcoordinates%5D=${lat},${lon}`;
  } else {
    url = `${API_HOST}/api/locations?filter%5Bname%5D=${searchTermOrCoordinates}`;
  }

  let response = await request(url);
  let data = JSON.parse(response).data;
  let ids = data.map((result) => result.id);

  return {
    orbit: data,
    searchResults: ids
  };
}

async function locationMeasurements(locationId) {
  let location = await request(`${API_HOST}/api/locations/${locationId}`);
  let measurements = await request(`${API_HOST}/api/locations/${locationId}/measurements`);
  let data = [JSON.parse(location).data, ...JSON.parse(measurements).data];
  return {
    orbit: data
  };
}

function serializeCacheData(data) {
  let serialized = JSON.stringify(data);
  return `<script type="orbit/cache" id="orbit-main-cache">${serialized}</script>`;
}

async function preprender(req, res, next, data = {orbit: []}) {
  try {
    let origin = `${req.protocol}://${req.headers.host}`;
    const sandbox = { origin, renderer, data };
    const context = vm.createContext(sandbox);
    let script = new vm.Script(`renderer.render(origin, '${req.url}', data);`);
    let app = await script.runInContext(context);
    let body = `<div id="app">${app}</div>`;
    body += serializeCacheData(data);
    body = HTML.replace('<div id="app"></div>', body);
    res.send(body);
  } catch(e) {
    next(e);
  }
}

app.get('/', preprender);
app.get('/search', async function(req, res, next) {
  let searchTerm = req.query['search-term'];
  if (searchTerm) {
    res.redirect(`/search/${searchTerm}`);
  } else {
    await preprender(req, res, next);
  }
});

app.get('/search/:lat,:lon', async function(req, res, next) {
  try {
    let data = await searchLocation([req.params.lat, req.params.lon]);
    await preprender(req, res, next, data);
  } catch(e) {
    next(e);
  }
});

app.get('/search/:searchTerm', async function(req, res, next) {
  try {
    let data = await searchLocation(req.params.searchTerm);
    await preprender(req, res, next, data);
  } catch(e) {
    next(e);
  }
});

app.get('/location/:location', async function(req, res, next) {
  try{
    let data = await locationMeasurements(req.params.location);
    await preprender(req, res, next, data);
  } catch(e) {
    next(e);
  }
});

if (USE_SENTRY) {
  app.use(Raven.errorHandler());
}

app.use(function(err, req, res, next) {
  console.error(err);
  res.send(HTML);
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`))
