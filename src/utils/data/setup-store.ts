import Coordinator, { EventLoggingStrategy, RequestStrategy, SyncStrategy } from '@orbit/coordinator';
import Orbit, { Schema } from '@orbit/data';
import JSONAPIStore from '@orbit/jsonapi';
import Store, { Cache } from '@orbit/store';
import { schema as schemaDefinition } from './schema';

export default function setupStore(appState): Store  {
  let schema = new Schema(schemaDefinition);
  let store = new Store({ schema });

  if (appState.isSSR) {
    let data = appState.appData as Array<{}>;
    data.forEach((record) => {
      store.cache.patch((t) => t.addRecord(record));
    });
  } else {
    Orbit.fetch = window.fetch.bind(window);
    let host = appState.apiHost || 'http://localhost:3001';

    let jsonapi = new JSONAPIStore({
      host,
      schema,
      namespace: 'api'
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
  }

  return store;
}
