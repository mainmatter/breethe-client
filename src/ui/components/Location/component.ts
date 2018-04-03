import Component, { tracked } from '@glimmer/component';
import setupStore from '../../../utils/data/setup-store';

export default class PpmClient extends Component {
  store = setupStore();

  @tracked
  measurements = null;

  @tracked
  notFound = false;

  constructor(options) {
    super(options);
    this.loadMeasurements(this.args.id);
  }

  async loadMeasurements(locationId) {
    try {
      this.measurements = await this.store.query((q) =>
        q.findRelatedRecords({ type: 'location', id: locationId }, 'measurements')
      );
      this.notFound = false;
    } catch (e) {
      this.notFound = true;
    }
  }
}
