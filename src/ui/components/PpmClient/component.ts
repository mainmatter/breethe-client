import Component, { tracked } from '@glimmer/component';
import Coordinator, { EventLoggingStrategy, RequestStrategy, SyncStrategy } from '@orbit/coordinator';

import Orbit, { Schema } from '@orbit/data';
import JSONAPIStore from '@orbit/jsonapi';
import Store from '@orbit/store';
import { schemaDefinition } from '../../../utils/data/schema';

// Temporal fix until Orbit binds the window fetch by default if it's available
// https://github.com/orbitjs/orbit/issues/452
if (window.fetch) {
  Orbit.fetch = window.fetch.bind(window);
}

export default class PpmClient extends Component {
  store = this.setupStore();

  @tracked
  locations = null;

  constructor(options) {
    super(options);
    this.loadLocations();
  }

  setupStore() {
    let schema = new Schema(schemaDefinition);

    let store = new Store({ schema });
    // store.update(t => [
    //   t.addRecord({
    //     type: 'location',
    //     id: 1,
    //     attributes: {
    //       city: 'København',
    //       country: 'Denmark',
    //       'last-updated': '2017-03-06',
    //       coordinates: '55.676098, 12.568337'
    //     }
    //   })
    // ]);

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
    let { store } = this;

    let locations = await store.query( (q) => {
      return q.findRecords('location');
    });
    console.log(store);
    console.log(locations);
    this.locations = locations;
    // .then((locations) => {
    //   this.locations = locations;
    // });
  }
}
