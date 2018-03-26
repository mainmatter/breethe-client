import Component, { tracked } from '@glimmer/component';
import setupStore from '../../../utils/data/setup-store';

export default class PpmClient extends Component {
  store = setupStore();

  @tracked
  locations = null;

  @tracked
  measurements = null;

  constructor(options) {
    super(options);
    this.loadLocations();
    this.loadMeasurements();
  }

  async loadLocations() {
    this.locations = await this.store.query((q) => q.findRecords('location'));
  }

  async loadMeasurements() {
    this.measurements = await this.store.query((q) => q.findRecords('measurement'));
  }
}
