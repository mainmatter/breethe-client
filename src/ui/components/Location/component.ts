import Component, { tracked } from '@glimmer/component';

export default class Location extends Component {
  @tracked
  measurements = null;

  @tracked
  notFound = false;

  constructor(options) {
    super(options);
    this.loadMeasurements(this.args.location);
  }

  async loadMeasurements(locationId) {
    // try {
      let store = await this.args.store;
      this.measurements = await store.query((q) =>
        q.findRelatedRecords({ type: 'location', id: locationId }, 'measurements')
      );
      this.notFound = false;
      this.args.updateParticles(80);
    // } catch (e) {
      // this.notFound = true;
    // }
  }
}
