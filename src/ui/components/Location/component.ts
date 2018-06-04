/* tslint:disable:max-line-length */
import Component, { tracked } from '@glimmer/component';
import { debug } from '@glimmer/opcode-compiler';

const ORDERED_PARAMS = ['pm10', 'pm25', 'so2', 'no2', 'o3', 'co'];
const QUALITY_SCALE = ['very_low', 'low', 'medium', 'high', 'very_high'];
const QUALITY_LABEL = ['Excellent', 'Good', 'Ok', 'Poor', 'Very poor'];

export default class LocationComponent extends Component {
  @tracked
  location: Location | {} = {};

  @tracked
  measurements: Measurement[] = [];

  @tracked
  loading: boolean = false;

  @tracked
  notFound: boolean = false;

  @tracked('measurements')
  get measurementLists(): { first: Measurement[]; second: Measurement[] } {
    let { measurements } = this;

    let orderedMeasurements = ORDERED_PARAMS.map((parameter) => {
      let measurement = measurements.find((record) => {
        return record.attributes.parameter === parameter;
      });
      if (measurement) {
        return measurement;
      }
      return {
        id: '',
        attributes: {
          parameter,
          measuredAt: '',
          unit: '',
          value: '',
          qualityIndex: ''
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
  get updatedDate(): string {
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

  get recordsFound(): boolean {
    return this.location && this.measurements.length > 0;
  }

  @tracked('measurements')
  get qualityIndex(): number {
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
  get qualityLabel(): string {
    let { qualityIndex } = this;
    return QUALITY_LABEL[qualityIndex];
  }

  constructor(options) {
    super(options);
    this.loadMeasurements(this.args.locationId);
  }

  async loadMeasurements(locationId: string) {
    let { pullIndexedDB, store, isSSR, localStore } = this.args;

    let locationSignature = { type: 'location', id: locationId };
    let locationQuery = (q) => q.findRecord(locationSignature);
    let measurementQuery = (q) => q.findRelatedRecords(locationSignature, 'measurements');

    let readFromCache = () => {
      this.location = store.cache.query(locationQuery);
      this.measurements = store.cache.query(measurementQuery);
    };

    try {
      // always try loading data from cache
      readFromCache();

      // work around a bug in Orbit.js - see https://github.com/orbitjs/orbit/issues/476
      if (this.recordsFound && !isSSR) {
        await localStore.push((t) => t.replaceRelatedRecords(
          locationSignature,
          'measurements',
          this.measurements
        ));
      }
    } catch {
      // fall through to other loading options…
    }

    if (!isSSR) {
      try {
        await pullIndexedDB();
        // try loading data from cache again after IndexedDB has been restored
        readFromCache();
      } catch {
        // fall through to other loading options…
      }

      if (!this.recordsFound) {
        this.loading = true;
      }

      try {
        // regardless of whether record was found in cache, refresh
        let location = await store.query(locationQuery);
        let measurements = await store.query(measurementQuery);

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
      } catch {
        // only show not found error, if no records were found, if refresh failed, just continue showing records from cache
        this.notFound = !this.recordsFound;
      } finally {
        // loading is done in any case
        this.loading = false;
      }
    }
  }
}
