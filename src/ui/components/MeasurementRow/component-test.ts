import hbs from '@glimmer/inline-precompile';
import { setupRenderingTest } from '@glimmer/test-helpers';

const { module, test } = QUnit;

module('Component: MeasurementRow', function(hooks) {
  setupRenderingTest(hooks);

  test('PPM Case', async function(assert) {
    await this.render(hbs`
      <MeasurementRow
        @value=12
        @parameter=pm25
        @unit=ppm
      />
    `);
    let label = this.containerElement.querySelector('.location-route__measurement__label').textContent.trim();
    let value = this.containerElement.querySelector('.location-route__measurement__value__value').textContent.trim();
    let unit = this.containerElement.querySelector('.location-route__measurement__value__unit').textContent.trim();

    assert.equal(label, 'PM25', 'Parameter is rendered');
    assert.equal(value, `12`, 'Value is rendered');
    assert.equal(unit, `ppm`, 'Unit is rendered');
  });

  test('o3 and micro_grams_m3', async function(assert) {
    await this.render(hbs`
      <MeasurementRow
        @value=49
        @parameter=o3
        @unit=micro_grams_m3
      />
    `);
    let labelBase = this.containerElement.querySelector('.location-route__measurement__label__base').textContent.trim();
    let labelSup = this.containerElement.querySelector('.location-route__measurement__label__sup').textContent.trim();
    let value = this.containerElement.querySelector('.location-route__measurement__value__value').textContent.trim();
    let unit = this.containerElement.querySelector('.location-route__measurement__value__unit').textContent.trim();

    assert.equal(labelBase, 'O', 'Label base is rendered');
    assert.equal(labelSup, '3', 'Label sup is rendered');
    assert.equal(value, `49`, 'Value is rendered');
    assert.equal(unit, `µg/m3`, 'Unit is rendered');
  });

  test('SO2 and ppm', async function(assert) {
    await this.render(hbs`
      <MeasurementRow
        @value=41
        @parameter=so2
        @unit=ppm
      />
    `);
    let labelBase = this.containerElement.querySelector('.location-route__measurement__label__base').textContent.trim();
    let labelSup = this.containerElement.querySelector('.location-route__measurement__label__sup').textContent.trim();
    let value = this.containerElement.querySelector('.location-route__measurement__value__value').textContent.trim();
    let unit = this.containerElement.querySelector('.location-route__measurement__value__unit').textContent.trim();

    assert.equal(labelBase, 'SO', 'Label base is rendered');
    assert.equal(labelSup, '2', 'Label sup is rendered');
    assert.equal(value, `41`, 'Value is rendered');
    assert.equal(unit, `ppm`, 'Unit is rendered');
  });
});
