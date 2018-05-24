const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('when offline', function() {
  it('still works', async function() {
    await visit('/', { waitUntil: 'networkidle0' }, async (page) => {
      await page.setOfflineMode(true);
      await page.reload({ waitUntil: 'networkidle0' });

      let element = await page.$('[data-test-ppm-client]');

      expect(element).to.be.ok;
    });
  });
});
