import Component, { tracked } from '@glimmer/component';

export default class PpmClient extends Component {
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
      this.measurements = await this.args.store.query((q) =>
        q.findRelatedRecords({ type: 'location', id: locationId }, 'measurements')
      );
      this.notFound = false;
    } catch (e) {
      this.notFound = true;
    }
  }
}
