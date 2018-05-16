const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the location route', function() {
  describe('the SSR response', function() {
    it('is rendered', async function() {
      await visit('/location/2', { waitUntil: 'domcontentloaded' }, async (page) => {
        let element = await page.$('[data-test-location]');
    
        expect(element).to.be.ok;
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
