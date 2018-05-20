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
  });

  describe('the rehydrated app', function() {
    it('is rendered', async function() {
      await visit('/', async (page) => {
        let element = await page.$('[data-test-ppm-client]');
    
        expect(element).to.be.ok;
      });
    });
  });
});
