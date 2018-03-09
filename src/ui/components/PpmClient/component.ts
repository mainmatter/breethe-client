import Component, { tracked } from '@glimmer/component';
import Coordinator, { RequestStrategy } from '@orbit/coordinator';
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
  positions = null;

  constructor(options) {
    super(options);
    this.loadPositions();
  }

  setupStore() {
    let schema = new Schema(schemaDefinition);

    let store = new Store({ schema });
    let jsonapi = new JSONAPIStore( {
      namespace: 'api',
      schema
    });
    let requestStrategy = new RequestStrategy({
      action: 'pull',
      blocking: false,
      on: 'beforeQuery',
      source: 'store',
      target: 'jsonapi',
    });

    const coordinator = new Coordinator({
      sources: [store, jsonapi],
      strategies: [requestStrategy]
    });

    coordinator.activate();

    return store;
  }

  loadPositions() {
    let { store } = this;
    store.query( (q) => q.findRecords('position') )
    .then((positions) => {
      this.positions = positions;
    });
  }
}
