import Component, { tracked } from '@glimmer/component';
import Coordinator, { EventLoggingStrategy, RequestStrategy, SyncStrategy } from '@orbit/coordinator';
import Orbit, { Schema } from '@orbit/data';
import JSONAPIStore from '@orbit/jsonapi';
import Store from '@orbit/store';
import { measurement, schemaDefinition } from '../../../utils/data/schema';

// Temporal fix until Orbit binds the window fetch by default if it's available
// https://github.com/orbitjs/orbit/issues/452
if (window.fetch) {
  Orbit.fetch = window.fetch.bind(window);
}

export default class PpmClient extends Component {
  store = this.setupStore();

  @tracked
  locations = null;

  @tracked
  measurements = null;

  constructor(options) {
    super(options);
    this.loadLocations();
    this.loadMeasurements();
  }

  setupStore() {
    let schema = new Schema(schemaDefinition);

    let store = new Store({ schema });
    let jsonapi = new JSONAPIStore({
      namespace: 'api',
      schema
    });
    let requestStrategy = new RequestStrategy({
      action: 'pull',
      blocking: true,
      on: 'beforeQuery',
      source: 'store',
      target: 'jsonapi',
    });

    let logger = new EventLoggingStrategy({
      interfaces: ['queryable', 'syncable']
    });

    let syncStrategy = new SyncStrategy({
      blocking: true,
      source: 'jsonapi',
      target: 'store'
    });

    const coordinator = new Coordinator({
      sources: [store, jsonapi],
      strategies: [requestStrategy, syncStrategy, logger]
    });

    coordinator.activate();

    return store;
  }

  async loadLocations() {
    this.locations = await this.store.query( (q) => {
      return q.findRecords('location');
    });
  }

  async loadMeasurements() {
    this.measurements = await this.store.query( (q) => {
      return q.findRecords('measurement');
    });
  }
}
