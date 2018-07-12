import Component, { tracked } from '@glimmer/component';
import { Transform } from '@orbit/data';
import IndexedDBStore from '@orbit/indexeddb';
import JSONAPIStore from '@orbit/jsonapi';
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
    localStore: IndexedDBStore;
    remoteStore: JSONAPIStore;
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

  @tracked('measurements')
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

  @tracked('qualityIndex')
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
    let { store, localStore, remoteStore } = this.args;
    try {
      this.location = await store.query((q) =>
        q.findRecord(locationSignature)
      );
    } catch {
      // Fail silently
    }
    try {
      // Fetch data from the API
      let transform: Transform[] = await remoteStore.pull((q) =>
        q.findRelatedRecords(locationSignature, 'measurements')
      );

      // Remove old data
      let cachedResults = store.cache.query((q) =>
        q.findRelatedRecords(locationSignature, 'measurements')
      );

      // Remove previous relationships and records
      await store.update((t) => {
        return cachedResults.reduce((accumulator, result) => {
          let measurementSignature = { type: 'measurement', id: result.id };
          let deleteRelationship = t.removeFromRelatedRecords(
            locationSignature,
            'measurements',
            measurementSignature
          );
          let deleteRecord = t.removeRecord(
            measurementSignature
          );
          return [...accumulator, deleteRelationship, deleteRecord];
        }, [] as Transform[]);
      });

      // Add new data to store
      await store.sync(transform);
      this.measurements = store.cache.query((q) =>
        q.findRelatedRecords(locationSignature, 'measurements')
      );

      // Remember we saw this location
      let currentDate = new Date().toISOString();
      store.update((t) =>
        t.replaceAttribute(locationSignature, 'visitedAt', currentDate)
      );
    } catch {
      // Only show error if no records could be found in any source
      this.notFound = !this.recordsFound;
    }
  }

  async loadMeasurements(locationId: string) {
    let { isSSR } = this.args;

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
