import Component from '@glimmer/component';
import { schemaDefinition } from '../../../utils/data/schema';
import Orbit, { Schema } from '@orbit/data';
import Store from '@orbit/store';
import JSONAPIStore from '@orbit/jsonapi';
import Coordinator from '@orbit/coordinator';
import { RequestStrategy } from '@orbit/coordinator';

Orbit.fetch = window.fetch.bind(window)

export default class PpmClient extends Component {
  store = this.setupStore();

  setupStore() {
    let schema = new Schema(schemaDefinition);

    let store = new Store({ schema });
    let jsonapi = new JSONAPIStore( { schema });
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
}
