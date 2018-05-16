const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the location route', function() {
  it('is served', async function() {
    await visit('/location/2', async (page) => {
      let element = await page.$('[data-test-location]');

      expect(element).to.be.ok;
    });
  });
});
