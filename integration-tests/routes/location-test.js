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
        let element = await page.waitForSelector('[data-test-location]');
    
        expect(element).to.be.ok;
      });
    });

    it('shows most recent data points', async function() {
      await visit('/location/2', async (page, $response) => {
        let element = await page.waitForSelector('[data-test-measurement="NO"]');

        let no2Value = $response('[data-test-measurement="NO"] [data-test-measurement-value]').text().trim();
        let coValue = $response('[data-test-measurement="CO"] [data-test-measurement-value]').text().trim();

        expect(element).to.be.ok;
        expect(no2Value).to.equal('51');
        expect(coValue).to.equal('37');
      });
    });

    it('calculates the date based on the measurements displayed', async function() {
      await visit('/location/2', async (page, $response) => {
        let element = await page.waitForSelector('[data-test-last-update]');

        let dateValue = $response('[data-test-last-update]').text().trim();

        expect(element).to.be.ok;
        expect(dateValue).to.match(/(2016).(10).(28)/);
      });
    })

    it('cache does not accumulate old data', async function() {
      await visit('/location/2', async (page) => {
        await page.waitForSelector('[data-test-measurement="NO"]');
        await page.reload();
        await page.waitForSelector('[data-test-measurement="NO"]');
  
        let rowsCount = await page.evaluate(() => {
          return new Promise((resolve, reject) => {
            let opendb = window.indexedDB.open('orbit', 1);
            opendb.onsuccess = () => {
              let db = opendb.result;
              let transaction = db
              .transaction('measurement')
              .objectStore('measurement')
              .count();
    
              transaction.onsuccess = (event) => {
                resolve(event.target.result);
              };
              transaction.onerror = (error) => {
                reject(error);
              };
            };
          });
        });
        expect(rowsCount).to.equal(6);
      });
    });
  });
});
