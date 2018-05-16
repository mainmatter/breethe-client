const { expect } = require('chai');
const visit = require('./helpers/visit');

describe('the search route', function() {
  it('is served', async function() {
    let response = await visit('/search/Salzburg');

    expect(response.statusCode).to.equal(200);
    expect(response.$('[data-test-search]').length).to.be.ok;
  });

  it('includes the search result', async function() {
    let response = await visit('/search/Salzburg');

    expect(response.$('[data-test-search-result="Salzburg"]').length).to.be.ok;
  });

  it('includes the orbit cache', async function() {
    let response = await visit('/search/Salzburg');
    let cache = JSON.parse(response.$('#orbit-main-cache').html());

    expect(cache.indexOf(r => r.type === 'location' && r.id === 2 && r.attributes.city === 'Salzburg')).to.be.ok;
  });
});
