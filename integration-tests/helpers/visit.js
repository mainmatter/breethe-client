const puppeteer = require('puppeteer');
const cheerio = require('cheerio')

const BASE_URL = 'http://localhost:3000';

async function visit(route, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  let gotoOpts = Object.assign({}, { waitUntil: 'load' }, options);

  let browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  let page = await browser.newPage();

  // make sure old service workers are gone…
  await page._client.send('ServiceWorker.enable');
  await page._client.send('ServiceWorker.stopAllWorkers');

  let response = await page.goto(`${BASE_URL}${route}`, gotoOpts);
  let responseBody = await response.text();

  try {
    await callback(page, cheerio.load(responseBody));
  } finally {
    await browser.close();
  }
}

module.exports = visit;
