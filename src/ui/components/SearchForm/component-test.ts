import hbs from '@glimmer/inline-precompile';
import { setupRenderingTest } from '@glimmer/test-helpers';

const { module, test } = QUnit;

module('Component: SearchForm', function(hooks) {
  setupRenderingTest(hooks);

  test('It renders', async function(assert) {
    await this.render(hbs`<SearchForm @term="alpha" />`);
    let inputValue = this.containerElement.querySelector('[data-test-search-input]').value;
    assert.equal(inputValue, 'alpha', 'Term parameter is rendered');
  });

  module('when rendered for SSR', function() {
    test('it disables the search input field', async function(assert) {
      await this.render(hbs`<SearchForm @isSSR="true" />`);
      let element = this.containerElement.querySelector('[data-test-search-input]:disabled');

      assert.ok(element, 'The search input field is disabled');
    });

    test('it disables the search button', async function(assert) {
      await this.render(hbs`<SearchForm @isSSR="true" />`);
      let element = this.containerElement.querySelector('[data-test-search-submit]:disabled');

      assert.ok(element, 'The search button is disabled');
    });

    test('it renders a loader over the search button', async function(assert) {
      await this.render(hbs`<SearchForm @isSSR="true" />`);
      let element = this.containerElement.querySelector('[data-test-search-submit] [data-test-loading-spinner]');

      assert.ok(element, 'A loader is rendered over the search input button');
    });
  });
});
