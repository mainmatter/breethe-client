import Component, { tracked } from '@glimmer/component';

export default class Location extends Component {
  @tracked
  location = null;

  @tracked
  notFound = false;

  constructor(options) {
    super(options);
    this.loadMeasurements(this.args.param);
  }

  async loadMeasurements(locationId) {
    // try {
      this.location = await this.args.store.query((q) =>
        q.findRecord({ type: 'location', id: locationId })
      );
      this.notFound = false;
    // } catch (e) {
    //   this.notFound = true;
    // }
  }
}
