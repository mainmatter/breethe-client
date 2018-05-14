const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the location route', function() {
  it('is served', async function() {
    let response = await visit('/location/2');

    expect(response.statusCode).to.equal(200);
    expect(response.$('[data-test-location]').length).to.be.ok;
  });
});
