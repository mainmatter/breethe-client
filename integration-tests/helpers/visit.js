const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';

async function visit(route, callback) {
  let browser = await puppeteer.launch();
  let page = await browser.newPage();
  await page.goto(`${BASE_URL}${route}`);

  try {
    await callback(page);
  } finally {
    await browser.close();
  }
}

module.exports = visit;
