import Component, { tracked } from '@glimmer/component';
import { debug } from '@glimmer/opcode-compiler';
import { compareAsc, format as formatDate, parse as parseDate } from 'date-fns';

export default class LocationComponent extends Component {
  @tracked location: any = {};

  @tracked measurements = [];

  @tracked notFound = false;

  @tracked('measurements')
  get measurementLists() {
    let { measurements } = this;
    let halfWay = Math.ceil(measurements.length / 2);
    return {
      first: measurements.slice(0, halfWay),
      second: measurements.slice(halfWay)
    };
  }

  @tracked('measurements')
  get updatedDate() {
    let { measurements } = this;
    if (measurements.length === 0) {
      return '––';
    }
    let dates = measurements.map((measurement) => {
      return parseDate(measurement.attributes.measuredAt);
    });
    dates.sort(compareAsc);

    return formatDate(dates[0], 'HH:MM | DD-MM-YYYY');
  }

  constructor(options) {
    super(options);
    this.loadMeasurements(this.args.location);
  }

  async loadMeasurements(locationId) {
    try {
      let store = await this.args.store;
      let currentDate = new Date().toISOString();
      let locationSignature = { type: 'location', id: locationId };
      this.location = await store.query((q) => q.findRecord(locationSignature));

      store.update((t) =>
        t.replaceAttribute(locationSignature, 'visitedAt', currentDate)
      );

      this.measurements = await store.query((q) => q.findRecords('measurement'));

      this.notFound = false;
      this.args.updateParticles(80);
    } catch (e) {
      this.notFound = true;
    }
  }
}
