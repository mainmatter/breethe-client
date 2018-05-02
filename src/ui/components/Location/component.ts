import Component, { tracked } from '@glimmer/component';

export default class Location extends Component {
  @tracked
  measurements = [];

  @tracked
  notFound = false;

  @tracked('measurements')
  get measurementLists() {
    let { measurements } = this;
    let halfWay = Math.ceil(measurements.length / 2);
    return {
      first: measurements.slice(0, halfWay),
      second: measurements.slice(halfWay)
    };
  }

  constructor(options) {
    super(options);
    this.loadMeasurements(this.args.location);
  }

  async loadMeasurements(locationId) {
    // try {
      let store = await this.args.store;
      // this.measurements = await store.query((q) =>
      //   q.findRelatedRecords({ type: 'location', id: locationId }, 'measurements')
      // );
      this.measurements = await store.query((q) =>
        q.findRecords('measurement')
      );
      // console.log(this.measurements);
      this.notFound = false;
      this.args.updateParticles(80);
    // } catch (e) {
      // this.notFound = true;
    // }
  }
}
