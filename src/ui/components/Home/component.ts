import Component, { tracked } from '@glimmer/component';
import { assert } from '@orbit/utils';

export default class PpmClient extends Component {

  @tracked
  locations = null;

  constructor(options) {
    super(options);
    assert('Argument \'store\' must be supplied to this component.', this.args.store);

    this.loadLocations();
  }

  async loadLocations() {
    this.locations = await this.args.store.query((q) => q.findRecords('location'));
  }
}
