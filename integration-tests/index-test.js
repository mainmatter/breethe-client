const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the index route', function() {
  it('is served', async function() {
    await visit('/', async (page) => {
      let element = await page.$('[data-test-ppm-client]');

      expect(element).to.be.ok;
    });
  });
});
