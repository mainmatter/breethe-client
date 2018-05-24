const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('when offline', function() {
  it('the app loads on the index route', async function() {
    await visit('/', { waitUntil: 'networkidle0' }, async (page) => {
      await page.setOfflineMode(true);
      await page.reload({ waitUntil: 'networkidle0' });

      let element = await page.$('[data-test-ppm-client]');

      expect(element).to.be.ok;
    });
  });

  it('the app loads on the search route', async function() {
    await visit('/search/Salzburg', { waitUntil: 'networkidle0' }, async (page) => {
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

  it('disables the location search field', async function() {
    await visit('/', async (page) => {
      await page.setOfflineMode(true);
      await page.waitFor(10);

      let element = await page.$('[data-test-search-input]:disabled');

      expect(element).to.be.ok;
    });
  });

  it('disables the location search button', async function() {
    await visit('/', async (page) => {
      await page.setOfflineMode(true);
      await page.waitFor(10);

      let element = await page.$('[data-test-search-submit]:disabled');

      expect(element).to.be.ok;
    });
  });

  it('shows an offline warning on the index rotue', async function() {
    await visit('/', async (page) => {
      await page.setOfflineMode(true);
      await page.waitFor(10);

      let element = await page.$('[data-test-offline-warning]');

      expect(element).to.be.ok;
    });
  });

  it('shows an offline warning on the search rotue', async function() {
    await visit('/search/Salzburg', async (page) => {
      await page.setOfflineMode(true);
      await page.waitFor(10);

      let element = await page.$('[data-test-offline-warning]');

      expect(element).to.be.ok;
    });
  });

  it('does not show an offline warning on the location rotue', async function() {
    await visit('/location/2', async (page) => {
      await page.setOfflineMode(true);
      await page.waitFor(10);

      let element = await page.$('[data-test-offline-warning]');

      expect(element).to.be.null;
    });
  });

  describe('when coming back online', function() {
    it('enables the location search field', async function() {
      await visit('/', async (page) => {
        await page.setOfflineMode(true); // go offline
        await page.setOfflineMode(false); // …and back online 
        await page.waitFor(10);

        let element = await page.$('[data-test-search-input]:enabled');

        expect(element).to.be.ok;
      });
    });

    it('enables the location search button', async function() {
      await visit('/', async (page) => {
        await page.setOfflineMode(true); // go offline
        await page.setOfflineMode(false); // …and back online
        await page.waitFor(10);

        let element = await page.$('[data-test-search-submit]:enabled');

        expect(element).to.be.ok;
      });
    });

    it('hides the offline warning', async function() {
      await visit('/', async (page) => {
        await page.setOfflineMode(true); // go offline
        await page.setOfflineMode(false); // …and back online
        await page.waitFor(10);

        let element = await page.$('[data-test-offline-warning]');

        expect(element).to.be.null;
      });
    });
  });
});
