const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the SSR response', function() {
  it('does not contain the effect background', async function() {
    await visit('/', async (page, $response) => {
      let element = $response('[data-test-effects-background]');

      expect(element.length).to.not.be.ok;
    });
  });
});
