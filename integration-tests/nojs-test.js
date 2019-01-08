const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the main flow without javascript', function() {
  it('works', async function() {
    await visit('/', { disableJavascript: true }, async (page) => {
      await page.type('[data-test-search-input]', 'Salzburg');
      await Promise.all([
        page.click('[data-test-search-submit]'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' })
      ]);

      expect(page.url()).to.match(/\/search\/Salzburg$/);

      await Promise.all([
        page.click('[data-test-search-result="Salzburg"] a'),
        page.waitForNavigation()
      ]);

      expect(page.url()).to.match(/\/location\/2$/);

      let element = await page.waitForSelector('[data-test-measurement="PM10"] [data-test-measurement-value="15"]');

      expect(element).to.be.ok;
    });
  });
});
