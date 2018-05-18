const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';

async function visit(route, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  let gotoOpts = Object.assign({}, { waitUntil: 'load' }, options);

  let browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  let page = await browser.newPage();
  await page.goto(`${BASE_URL}${route}`, gotoOpts);

  try {
    await callback(page);
  } finally {
    await browser.close();
  }
}

module.exports = visit;
