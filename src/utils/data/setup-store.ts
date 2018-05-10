import Coordinator, { EventLoggingStrategy, RequestStrategy, SyncStrategy } from '@orbit/coordinator';
import Orbit, { Schema } from '@orbit/data';
import JSONAPIStore from '@orbit/jsonapi';
import Store from '@orbit/store';
import { schema as schemaDefinition } from './schema';

export default function setupStore(appState): Store  {
  let host = '';

  if (appState.isSSR) {
    host = appState.apiHost || host;
    Orbit.fetch = require('node-fetch');
  } else {
    Orbit.fetch = window.fetch.bind(window);
  }

  let schema = new Schema(schemaDefinition);

  let store = new Store({ schema });
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

  return store;
}
