import Component, { tracked } from '@glimmer/component';
import setupStore from '../../../utils/data/setup-store';

export default class PpmClient extends Component {
  store = setupStore();

  @tracked
  locations = null;

  constructor(options) {
    super(options);
    this.loadLocations();
  }

  async loadLocations() {
    this.locations = await this.store.query((q) => q.findRecords('location'));
  }
}
