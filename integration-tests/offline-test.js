const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('when offline', function() {
  it('the app loads', async function() {
    await visit('/', { waitUntil: 'networkidle0' }, async (page) => {
      await page.setOfflineMode(true);
      await page.reload({ waitUntil: 'networkidle0' });

      let element = await page.$('[data-test-ppm-client]');

      expect(element).to.be.ok;
    });
  });

  it('the app loads on the location route', async function() {
    await visit('/location/2', { waitUntil: 'networkidle0' }, async (page) => {
      await page.setOfflineMode(true);
      await page.reload({ waitUntil: 'networkidle0' });

      let element = await page.$('[data-test-ppm-client]');

      expect(element).to.be.ok;
    });
  });
});
