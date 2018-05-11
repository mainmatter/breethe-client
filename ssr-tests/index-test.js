const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the index route', function() {
  it('is served', async function() {
    let response = await visit('/');

    expect(response.statusCode).to.equal(200);
    expect(response.$('[data-test-ppm-client]').length).to.be.ok;
  });
});
