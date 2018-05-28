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

  get recordsFound() {
    return this.location && this.measurements.length > 0;
  }

  @tracked('measurements')
  get qualityIndex() {
    let { measurements } = this;
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
    this.loadMeasurements(this.args.locationId);
  }

  async loadMeasurements(locationId) {
    let { pullIndexedDB, store, isSSR } = this.args;

    let locationSignature = { type: 'location', id: locationId };
    let locationQuery = (q) => q.findRecord(locationSignature);
    let measurementQuery = (q) => q.findRelatedRecords(locationSignature, 'measurements');

    try {
      // always try loading data from cache
      this.location = store.cache.query(locationQuery);
      this.measurements = store.cache.query(measurementQuery);
    } catch(e) {
      console.error('this did not work', e);
    } finally {
      // if no records could be found in cache, go to laoding state
      if (!this.recordsFound) {
        this.loading = true;
      }
    }

    if (!isSSR) {
      try {
        // regardless of whether record was found in cache, refresh location
        let location = await store.query(locationQuery);

        // regardless of whether record was found in cache, refresh measurements
        let measurements = await store.query(measurementQuery);

        // only assign these if found
        if (location && measurements) {
          this.location = location;
          this.measurements = measurements;

          // remember we saw this location
          let currentDate = new Date().toISOString();
          store.update((t) =>
            t.replaceAttribute(locationSignature, 'visitedAt', currentDate)
          );
        }

        // if records were found, update fog effect
        if (this.recordsFound) {
          this.args.updateFogEffect(this.qualityIndex);
        }
      } catch (e) {
        console.error('err', e);
        // only show not found error, if no records were found, if refresh failed, just continue showing records from cache
        this.notFound = !this.recordsFound;
      } finally {
        console.log(this.location);
        console.log(this.measurements);
        // loading is done in any case
        this.loading = false;
      }
    }
  }
}
