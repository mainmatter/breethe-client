import Component, { tracked } from '@glimmer/component';

export default class Location extends Component {
  @tracked
  measurements = null;

  @tracked
  notFound = false;

  constructor(options) {
    super(options);
    this.loadMeasurements(this.args.param);
  }

  async loadMeasurements(locationId) {
    // try {
      this.measurements = await this.args.store.query((q) =>
        q.findRelatedRecords({ type: 'location', id: locationId }, 'measurements')
      );
      this.notFound = false;
      this.args.updateParticles(80);
    // } catch (e) {
      // this.notFound = true;
    // }
  }
}
