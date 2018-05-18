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
});
