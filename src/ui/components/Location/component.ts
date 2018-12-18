import Component, { tracked } from '@glimmer/component';
import { debug } from '@glimmer/opcode-compiler';
import IndexedDBSource from '@orbit/indexeddb';
import Store from '@orbit/store';

const ORDERED_PARAMS = ['pm10', 'pm25', 'so2', 'no2', 'o3', 'co'];
const QUALITY_SCALE = ['very_low', 'low', 'medium', 'high', 'very_high'];
const QUALITY_LABEL = ['Excellent', 'Good', 'Ok', 'Poor', 'Very poor'];

interface RecordSignature {
  type: string;
  id: string;
}

export default class LocationComponent extends Component {
  args: {
    locationId: string;
    isSSR: boolean;
    store: Store;
    localStore: IndexedDBSource;
    updateFogEffect: (index: number) => void;
    pullIndexedDB: () => void;
  };

  @tracked
  location: Location | {} = {};

  @tracked
  measurements: Measurement[] = [];

  @tracked
  loading: boolean = false;

  @tracked
  notFound: boolean = false;

  get recordsFound(): boolean {
    return this.location && this.measurements.length > 0;
  }

  @tracked
  get sortedMeasurements(): Measurement[] {
    let { measurements } = this;
    return [...measurements].sort((left, right) => {
      // Sort most recent dates first
      return this.sortMeasurements(
        right.attributes.measuredAt,
        left.attributes.measuredAt
      );
    });
  }

  @tracked
  get measurementLists(): { first: Measurement[]; second: Measurement[] } {
    let { sortedMeasurements } = this;

    let orderedMeasurements = ORDERED_PARAMS.map((parameter) => {
      let measurement = sortedMeasurements.find((record) => {
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

  @tracked
  get updatedDate(): string {
    let { measurementLists, sortMeasurements } = this;
    let dates = [...measurementLists.first, ...measurementLists.second]
      .filter((measurement) => {
        return !!measurement.attributes.measuredAt;
      })
      .map((measurement) => {
        return new Date(measurement.attributes.measuredAt);
      })
      .sort(sortMeasurements);

    return dates.length > 0 ? dates[0].toLocaleString() : '–';
  }

  @tracked
  get qualityIndex(): number {
    let { measurements, sortMeasurements } = this;
    let indexes = measurements
      .filter((measurement) => {
        return !!measurement.attributes.qualityIndex;
      })
      .map((measurement) => {
        return QUALITY_SCALE.indexOf(measurement.attributes.qualityIndex);
      })
      .sort(sortMeasurements);
    return indexes[0];
  }

  @tracked
  get qualityLabel(): string {
    let { qualityIndex } = this;
    return QUALITY_LABEL[qualityIndex];
  }

  constructor(options) {
    super(options);
    this.loadMeasurements(this.args.locationId);
  }

  sortMeasurements(left, right) {
    if (left > right) {
      return 1;
    } else if (left < right) {
      return -1;
    }
    return 0;
  }

  readFromCache(locationSignature: RecordSignature) {
    let { store } = this.args;
    this.location = store.cache.query((q) => q.findRecord(locationSignature));
    this.measurements = store.cache.query((q) =>
      q.findRelatedRecords(locationSignature, 'measurements')
    );
  }

  async loadFromInlineCache(locationSignature: RecordSignature) {
    try {
      let { isSSR, localStore } = this.args;

      this.readFromCache(locationSignature);

      // work around a bug in Orbit.js - see https://github.com/orbitjs/orbit/issues/476
      if (this.recordsFound && !isSSR) {
        await localStore.push((t) =>
          t.replaceRelatedRecords(
            locationSignature,
            'measurements',
            this.measurements
          )
        );
      }
    } catch {
      // Allow other methods to find data
    }
  }

  async loadFromIndexedDB(locationSignature: RecordSignature) {
    try {
      await this.args.pullIndexedDB();
      // try loading data from cache again after IndexedDB has been restored
      this.readFromCache(locationSignature);
    } catch {
      // Allow other methods to find data
    }
  }

  async loadFromAPI(locationSignature: RecordSignature) {
    let { store } = this.args;
    try {
      let location: Location = await store.query((q) =>
        q.findRecord(locationSignature)
      );
      let measurements: Measurement[] = await store.query((q) =>
        q.findRelatedRecords(locationSignature, 'measurements')
      );

      if (location && measurements) {
        this.location = location;
        this.measurements = measurements;

        // Remember we saw this location
        let currentDate = new Date().toISOString();
        store.update((t) =>
          t.replaceAttribute(locationSignature, 'visitedAt', currentDate)
        );
      }
    } catch {
      // Only show error if no records could be found in any source
      this.notFound = !this.recordsFound;
    }
  }

  async loadMeasurements(locationId: string) {
    let { store, isSSR } = this.args;

    let locationSignature = { type: 'location', id: locationId };

    await this.loadFromInlineCache(locationSignature);

    if (!isSSR) {
      await this.loadFromIndexedDB(locationSignature);

      if (!this.recordsFound) {
        this.loading = true;
      }

      // Regardless of whether record was found in cache, refresh from API
      await this.loadFromAPI(locationSignature);

      // If records were found, update fog effect
      if (this.recordsFound) {
        this.args.updateFogEffect(this.qualityIndex);
      }

      // Loading is done in any case
      this.loading = false;
    }
  }
}
