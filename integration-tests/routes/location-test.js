const { expect } = require('chai');
const visit = require('../helpers/visit');

describe('the location route', function() {
  describe('the SSR response', function() {
    it('is rendered', async function() {
      await visit('/location/2', async (page, $response) => {
        let element = $response('[data-test-location]');
    
        expect(element.length).to.be.ok;
      });
    });

    it('includes the measurements data', async function() {
      await visit('/location/2', async (page, $response) => {
        let element = $response('[data-test-measurement="PM10"] [data-test-measurement-value="15"]');

        expect(element.length).to.be.ok;
      });
    });

    it('falls back to rendering the empty HTML in case of errors', async function() {
      await visit('/location/error', async (page, $response) => {
        expect($response('#app').html()).to.be.empty;
      });
    });
  });

  describe('the rehydrated app', function() {
    it('is rendered', async function() {
      await visit('/location/2', async (page) => {
        let element = await page.$('[data-test-location]');
    
        expect(element).to.be.ok;
      });
    });
  });
});
