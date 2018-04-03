import Component, { tracked } from '@glimmer/component';
import setupStore from '../../../utils/data/setup-store';

export default class PpmClient extends Component {
  store = setupStore();

  @tracked
  measurements = null;

  constructor(options) {
    super(options);
    this.loadMeasurements();
  }

  async loadMeasurements() {
    this.measurements = await this.store.query((q) => q.findRecords('measurement'));
  }
}
