const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the search route', function() {
  describe('the SSR response', function() {
    it('is rendered', async function() {
      await visit('/search/Salzburg', { waitUntil: 'domcontentloaded' }, async (page) => {
        let element = await page.$('[data-test-search]');

        expect(element).to.be.ok;
      });
    });

    it('includes the search result', async function() {
      await visit('/search/Salzburg', { waitUntil: 'domcontentloaded' }, async (page) => {
        let element = await page.$('[data-test-search-result="Salzburg"]');

        expect(element).to.be.ok;
      });
    });

    it('includes the orbit cache', async function() {
      await visit('/search/Salzburg', { waitUntil: 'domcontentloaded' }, async (page) => {
        let cache = await page.$eval('#orbit-main-cache', cacheContainer => {
          return JSON.parse(cacheContainer.innerHTML);
        });

        expect(cache.indexOf(r => r.type === 'location' && r.id === 2 && r.attributes.city === 'Salzburg')).to.be.ok;
      });
    });
  });

  describe('the rehydrated app', function() {
    it('is rendered', async function() {
      await visit('/search/Salzburg', async (page) => {
        let element = await page.$('[data-test-search]');

        expect(element).to.be.ok;
      });
    });

    it('renders the search result', async function() {
      await visit('/search/Salzburg', async (page) => {
        let element = await page.$('[data-test-search-result="Salzburg"]');

        expect(element).to.be.ok;
      });
    });
  });
});
