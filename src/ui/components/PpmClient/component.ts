import Component, { tracked } from '@glimmer/component';
import { schemaDefinition } from '../../../utils/data/schema';
import Orbit, { Schema } from '@orbit/data';
import Store from '@orbit/store';
import JSONAPIStore from '@orbit/jsonapi';
import Coordinator from '@orbit/coordinator';
import { RequestStrategy } from '@orbit/coordinator';

// Temporal fix until Orbit binds the window fetch by default if it's available
// https://github.com/orbitjs/orbit/issues/452
if (window.fetch) {
  Orbit.fetch = window.fetch.bind(window);
}

export default class PpmClient extends Component {
  store = this.setupStore();

  @tracked
  positions = null

  constructor(options) {
    super(options);
    this.loadPositions();
  }

  setupStore() {
    let schema = new Schema(schemaDefinition);

    let store = new Store({ schema });
    let jsonapi = new JSONAPIStore( {
      schema,
      namespace: 'api'
    });
    let requestStrategy = new RequestStrategy({
      source: 'store',
      on: 'beforeQuery',
      target: 'jsonapi',
      action: 'pull',
      blocking: false
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
    store.query( q => q.findRecords('position') )
    .then((positions) => {
      this.positions = positions;
    })
  }
}
