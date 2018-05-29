const { expect } = require('chai');
const visit = require('../helpers/visit');

describe('the index route', function() {
  describe('the SSR response', function() {
    it('is rendered', async function() {
      await visit('/', async (page, $response) => {
        let element = $response('[data-test-ppm-client]');
    
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
        let element = await page.waitForSelector('[data-test-ppm-client]');
    
        expect(element).to.be.ok;
      });
    });
  });
});
