const cheerio = require('cheerio');
const request = require('request-promise-native');

const BASE_URL = 'http://localhost:3000';

async function visit(route, options = {}) {
  options.uri = BASE_URL + route;
  options.headers = options.headers || {};
  options.headers['Accept'] = 'text/html';
  options.resolveWithFullResponse = true;

  let response = await request(options);
  if (response.body.length) {
    response.$ = cheerio.load(response.body);
  }

  return response;
}

module.exports = visit;
