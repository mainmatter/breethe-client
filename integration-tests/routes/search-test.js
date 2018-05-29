const { expect } = require('chai');
const visit = require('../helpers/visit');

describe('the search route', function() {
  describe('the SSR response', function() {
    it('is rendered', async function() {
      await visit('/search/Salzburg', async (page, $response) => {
        let element = $response('[data-test-search]');

        expect(element.length).to.be.ok;
      });
    });

    it('is rendered without a search term', async function() {
      await visit('/search/', async (page, $response) => {
        let element = $response('[data-test-search]');

        expect(element.length).to.be.ok;
      });
    });

    it('includes the search result', async function() {
      await visit('/search/Salzburg', async (page, $response) => {
        let element = $response('[data-test-search-result="Salzburg"]');

        expect(element.length).to.be.ok;
      });
    });

    it('renders a loader over the search form', async function() {
      await visit('/search/Salzburg', async (page, $response) => {
        let element = $response('[data-test-form-laoder]');

        expect(element.length).to.be.ok;
      });
    });

    it('includes the orbit cache', async function() {
      await visit('/search/Salzburg', async (page, $response) => {
        let cache = JSON.parse($response('#orbit-main-cache').html());

        expect(cache.orbit.indexOf(r => r.type === 'location' && r.id === 2 && r.attributes.city === 'Salzburg')).to.be.ok;
      });
    });

    it('falls back to rendering the empty HTML in case of errors', async function() {
      await visit('/search/error', async (page, $response) => {
        expect($response('#app').html()).to.be.empty;
      });
    });
  });

  describe('the rehydrated app', function() {
    it('is rendered', async function() {
      await visit('/search/Salzburg', async (page) => {
        let element = await page.waitForSelector('[data-test-search]');

        expect(element).to.be.ok;
      });
    });

    it('renders the search result', async function() {
      await visit('/search/Salzburg', async (page) => {
        let element = await page.waitForSelector('[data-test-search-result="Salzburg"]');

        expect(element).to.be.ok;
      });
    });

    it('shows no results in case of errors', async function() {
      await visit('/search/error', async (page, $response) => {
        let element = await page.waitForSelector('[data-test-no-results]');

        expect(element).to.be.ok;
      });
    });
  });
});
