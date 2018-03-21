import hbs from '@glimmer/inline-precompile';
import { setupRenderingTest } from '@glimmer/test-helpers';
// import * as pretender from 'pretender';

const { module, test } = QUnit;

const locations = [
  {
    id: 1,
    type: 'location',
    attributes: {
      'city': 'København',
      'coordinates': '55.676098, 12.568337',
      'country': 'Denmark',
      'last-updated': '2017-03-06'
    }
  },
  {
    id: 2,
    type: 'location',
    attributes: {
      'city': 'Salzburg',
      'country': 'Austria',
      'last-updated': '2017-03-07',
      'coordinates': '47.811195, 13.033229'
    }
  }
];

module('Component: PpmClient', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let server = new Pretender();
    server.get('/api/locations', function() {
      let data = JSON.stringify({
        data: locations
      });
      return [
        200,
        { 'Content-Type': 'application/vnd.api+json' },
        data
      ];
    });

    await this.render(hbs`<PpmClient />`);
    let location1 = this.containerElement.querySelector('.test__location-1');
    assert.ok(!!location1, 'Location loaded');

    let location2 = this.containerElement.querySelector('.test__location-2');
    assert.ok(!!location2, 'Location loaded');

    server.shutdown();
    // assert.equal(this.containerElement.textContent, 'Welcome to Glimmer!\n');
  });
});
