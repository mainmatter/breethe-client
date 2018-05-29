const { expect } = require('chai');
const visit = require('../helpers/visit');

describe('the index route', function() {
  describe('the SSR response', function() {
    it('is rendered', async function() {
      await visit('/', async (page, $response) => {
        let element = $response('[data-test-breethe]');
    
        expect(element.length).to.be.ok;
      });
    });

    it('disables the location search field', async function() {
      await visit('/', async (page, $response) => {
        expect($response('[data-test-search-input]').is(':disabled')).to.be.true;
      });
    });

    it('disables the location search button', async function() {
      await visit('/', async (page, $response) => {
        expect($response('[data-test-search-submit]').is(':disabled')).to.be.true;
      });
    });
  });

  describe('the rehydrated app', function() {
    it('is rendered', async function() {
      await visit('/', async (page) => {
        let element = await page.waitForSelector('[data-test-breethe]');
    
        expect(element).to.be.ok;
      });
    });

    it('allows searching for locations with a search term', async function() {
      await visit('/', async (page) => {
        await page.type('[data-test-search-input]', 'Salzburg');
        await page.click('[data-test-search-submit]');
        await page.waitForSelector('[data-test-search-result="Salzburg"]');

        expect(page.url()).to.match(/\/search\/Salzburg$/);

        let element = await page.waitForSelector('[data-test-search-result="Salzburg"] a');

        expect(element).to.be.ok;
      });
    });

    it('allows searching for locations with coordinates', async function() {
      await visit('/', async (page) => {
        await page.evaluate(() => {
          navigator.geolocation.getCurrentPosition = function(success, failure) {
            success({
              coords: {
                latitude: 1.11,
                longitude: 2.22
              }, timestamp: Date.now()
            });
          };
        });
        await page.click('[data-test-search-near]');
        await page.waitForSelector('[data-test-search-result="Salzburg"]');

        expect(page.url()).to.match(/\/search\/1.11,2.22/);

        let element = await page.waitForSelector('[data-test-search-result="Salzburg"] a');

        expect(element).to.be.ok;
      });
    });
  });
});
