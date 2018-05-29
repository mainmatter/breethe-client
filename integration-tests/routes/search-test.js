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

    it('renders a loader over the search form', async function() {
      await visit('/search/Salzburg', async (page, $response) => {
        let element = $response('[data-test-form-laoder]');

        expect(element.length).to.be.ok;
      });
    });

    it('falls back to rendering the empty HTML in case of errors', async function() {
      await visit('/search/error', async (page, $response) => {
        expect($response('#app').html()).to.be.empty;
      });
    });

    describe('with a search term', function() {
      it('includes the search result', async function() {
        await visit('/search/Salzburg', async (page, $response) => {
          let element = $response('[data-test-search-result="Salzburg"]');

          expect(element.length).to.be.ok;
        });
      });

      it('renders the correct title for the search results', async function() {
        await visit('/search/Salzburg', async (page, $response) => {
          let element = $response('[data-test-locations-for-search-term]');

          expect(element.length).to.be.ok;
        });
      });

      it('includes the orbit cache', async function() {
        await visit('/search/Salzburg', async (page, $response) => {
          let cache = JSON.parse($response('#orbit-main-cache').html());

          expect(cache.orbit.indexOf(r => r.type === 'location' && r.id === 2 && r.attributes.city === 'Salzburg')).to.be.ok;
        });
      });
    });

    describe('with coordinates', function() {
      it('includes the search result', async function() {
        await visit('/search/1.11,2.22', async (page, $response) => {
          let element = $response('[data-test-search-result="Madrid"]');

          expect(element.length).to.be.ok;
        });
      });

      it('renders the correct title for the search results', async function() {
        await visit('/search/1.11,2.22', async (page, $response) => {
          let element = $response('[data-test-near-locations]');

          expect(element.length).to.be.ok;
        });
      });

      it('includes the orbit cache', async function() {
        await visit('/search/1.11,2.22', async (page, $response) => {
          let cache = JSON.parse($response('#orbit-main-cache').html());

          expect(cache.orbit.indexOf(r => r.type === 'location' && r.id === 2 && r.attributes.city === 'Madrid')).to.be.ok;
        });
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

    it('renders recent locations if there are any', async function() {
      await visit('/search/Salzburg', async (page) => {
        await page.waitForSelector('[data-test-search-result="Salzburg"]');
        await page.click('[data-test-search-result="Salzburg"] a');
        await page.waitForSelector('[data-test-measurement="PM10"] [data-test-measurement-value="15"]');
        await page.click('[data-test-home-link]');

        element = await page.waitForSelector('[data-test-search-result="Salzburg"] a');

        expect(element).to.be.ok;
      });
    });

    it('renders the correct title for recent locations', async function() {
      await visit('/search/Salzburg', async (page) => {
        await page.waitForSelector('[data-test-search-result="Salzburg"]');
        await page.click('[data-test-search-result="Salzburg"] a');
        await page.waitForSelector('[data-test-measurement="PM10"] [data-test-measurement-value="15"]');
        await page.click('[data-test-home-link]');

        element = await page.waitForSelector('[data-test-recent-locations]');

        expect(element).to.be.ok;
      });
    });

    describe('with a search term', function() {
      it('renders the search results', async function() {
        await visit('/search/Salzburg', async (page) => {
          let element = await page.waitForSelector('[data-test-search-result="Salzburg"]');

          expect(element).to.be.ok;
        });
      });

      it('renders the correct title for the search results', async function() {
        await visit('/search/Salzburg', async (page) => {
          let element = await page.waitForSelector('[data-test-locations-for-search-term]');

          expect(element).to.be.ok;
        });
      });

      it('shows a no results message in case of errors', async function() {
        await visit('/search/error', async (page) => {
          let element = await page.waitForSelector('[data-test-no-results]');

          expect(element).to.be.ok;
        });
      });
    });

    describe('with coordinates', function() {
      it('renders the search result', async function() {
        await visit('/search/1.11,2.22', async (page) => {
          let element = await page.waitForSelector('[data-test-search-result="Madrid"]');

          expect(element).to.be.ok;
        });
      });

      it('renders the correct title for the search results', async function() {
        await visit('/search/1.11,2.22', async (page) => {
          let element = await page.waitForSelector('[data-test-near-locations]');

          expect(element).to.be.ok;
        });
      });

      it('shows an error message if accessing the location fails', async function() {
        await visit('/', async (page) => {
          await page.evaluate(() => {
            navigator.geolocation.getCurrentPosition = function(success, failure) {
              failure({
                code: 13
              });
            };
          });
          await page.click('[data-test-search-near]');
          await page.waitForSelector('[data-test-location-error]');
          let element = await page.waitForSelector('[data-test-location-error]');

          expect(element).to.be.ok;
        });
      });

      it('does not show an error message if the user disallows access to the location', async function() {
        await visit('/', async (page) => {
          await page.evaluate(() => {
            navigator.geolocation.getCurrentPosition = function(success, failure) {
              failure({
                code: 1
              });
            };
          });
          await page.click('[data-test-search-near]');
          await page.waitFor(100);
          let element = await page.$('[data-test-location-error]');

          expect(element).to.be.null;
        });
      });
    });
  });
});
