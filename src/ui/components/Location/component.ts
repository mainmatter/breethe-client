import Component, { tracked } from '@glimmer/component';
import { debug } from '@glimmer/opcode-compiler';

const ORDERED_PARAMS = ['pm10', 'pm25', 'so2', 'no2', 'o3', 'co'];
const QUALITY_SCALE = ['very_low', 'low', 'medium', 'high', 'very_high'];
const QUALITY_LABEL = ['Excellent', 'Good', 'Ok', 'Poor', 'Very poor'];

export default class LocationComponent extends Component {
  @tracked loading = false;

  @tracked location: any = {};

  @tracked measurements = [];

  @tracked notFound = false;

  @tracked('measurements')
  get measurementLists() {
    let { measurements } = this;

    let orderedMeasurements = ORDERED_PARAMS.map((param) => {
      let measurement = measurements.find((record) => {
        return record.attributes.parameter === param;
      });
      if (measurement) {
        return measurement;
      }
      return {
        attributes: {
          parameter: param
        }
      };
    });

    let halfWay = Math.ceil(orderedMeasurements.length / 2);
    return {
      first: orderedMeasurements.slice(0, halfWay),
      second: orderedMeasurements.slice(halfWay)
    };
  }

  @tracked('measurements')
  get updatedDate() {
    let { measurements } = this;
    if (measurements.length === 0) {
      return '–';
    }
    let dates = measurements
      .filter((measurement) => {
        return !!measurement.attributes.measuredAt;
      })
      .map((measurement) => {
        return new Date(measurement.attributes.measuredAt);
      });
    if (dates.length === 0) {
      return '–';
    }
    dates.sort((dateLeft, dateRight) => {
      if (dateLeft > dateRight) {
        return 1;
      } else if (dateLeft < dateRight) {
        return -1;
      }
      return 0;
    });

    return dates[0].toLocaleString();
  }

  @tracked('measurements')
  get noMeasurements() {
    return this.measurements.length === 0;
  }

  @tracked('measurements')
  get qualityIndex() {
    let { measurements, noMeasurements } = this;
    if (noMeasurements) {
      return 1;
    }
    let indexes = measurements
      .filter((measurement) => {
        return !!measurement.attributes.qualityIndex;
      })
      .map((measurement) => {
        return QUALITY_SCALE.indexOf(measurement.attributes.qualityIndex);
      })
      .sort((a, b) => {
        if (a > b) {
          return -1;
        } else if (a < b) {
          return 1;
        } else {
          return 0;
        }
      });
    return indexes[0];
  }

  @tracked('qualityIndex')
  get qualityLabel() {
    let { qualityIndex } = this;
    return QUALITY_LABEL[qualityIndex];
  }

  constructor(options) {
    super(options);
    this.loadMeasurements(this.args.location);
  }

  async loadMeasurements(locationId) {
      let { pullIndexedDB, store } = this.args;
      await pullIndexedDB();
      let currentDate = new Date().toISOString();
      let locationSignature = { type: 'location', id: locationId };

      let locationQuery = (q) => q.findRecord(locationSignature);
      try {
        this.location = store.cache.query(locationQuery);
      } catch (e) {
        try {
          this.loading = true;
          this.location = await store.query(locationQuery);
        } catch (e) {
          this.notFound = true;
        }
      }

      store.update((t) =>
        t.replaceAttribute(locationSignature, 'visitedAt', currentDate)
      );

      let measurementQuery = (q) => q.findRelatedRecords(locationSignature, 'measurements');
      this.measurements = store.cache.query(measurementQuery);

      if (this.measurements.length === 0) {
        this.loading = true;
      }
      this.measurements = await store.query(measurementQuery);
      this.loading = false;

      this.notFound = false;
      this.args.updateParticles(this.qualityIndex);
  }
}
