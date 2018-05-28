const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the main user flow', function() {
  it('works', async function() {
    await visit('/', async (page) => {
      await page.type('[data-test-search-input]', 'Salzburg');
      await page.click('[data-test-search-submit]');
      await page.waitForSelector('[data-test-search-result="Salzburg"]');

      expect(page.url()).to.match(/\/search\/Salzburg$/);

      await page.click('[data-test-search-result="Salzburg"] a');
      await page.waitForSelector('[data-test-location]');

      expect(page.url()).to.match(/\/location\/2$/);

      let element = await page.waitForSelector('[data-test-measurement="PM10"] [data-test-measurement-value="15"]');

      expect(element).to.be.ok;
    });
  });

  it('works without JS', async function() {
    await visit('/search/Salzburg', async (page) => {
      await page.setJavaScriptEnabled(false);
      await page.reload();
      await page.click('[data-test-search-result="Salzburg"] a');
      await page.waitForSelector('[data-test-location]');

      expect(page.url()).to.match(/\/location\/2$/);

      let element = await page.waitForSelector('[data-test-measurement="PM10"] [data-test-measurement-value="15"]');

      expect(element).to.be.ok;

      await page.click('[data-test-home-link]');

      expect(page.url()).to.match(/\/$/);
    });
  });
});
