import Coordinator, { EventLoggingStrategy, RequestStrategy, SyncStrategy } from '@orbit/coordinator';
import Orbit, { Schema } from '@orbit/data';
import IndexedDBStore from '@orbit/indexeddb';
import JSONAPIStore from '@orbit/jsonapi';
import Store, { Cache } from '@orbit/store';
import { schema as schemaDefinition } from './schema';

declare const __ENV_API_HOST__: string;

interface StoreSetup {
  store: Store;
  local?: IndexedDBStore;
  coordinator?: Coordinator;
}

export function setupStore(appState: AppState): StoreSetup {
  let schema = new Schema(schemaDefinition);
  let store = new Store({ schema });

  if (appState.isSSR) {
    let data = appState.appData;
    data.orbit.forEach((record) => {
      store.cache.patch((t) => t.addRecord(record));
    });

    return {
      store
    };
  } else {
    Orbit.fetch = window.fetch.bind(window);
    let host = __ENV_API_HOST__;

    let remote = new JSONAPIStore({
      name: 'remote',
      namespace: 'api',
      host,
      schema
    });

    let local = new IndexedDBStore({
      name: 'local',
      schema
    });

    let remoteRequestStrategy = new RequestStrategy({
      action: 'pull',
      blocking: true,
      on: 'beforeQuery',
      source: 'store',
      target: 'remote',
    });

    let logger = new EventLoggingStrategy({
      interfaces: ['queryable', 'syncable']
    });

    let remoteStoreSync = new SyncStrategy({
      blocking: true,
      source: 'remote',
      target: 'store'
    });

    const localStoreSync = new SyncStrategy({
      source: 'store',
      target: 'local',
      blocking: true
    });

    const coordinator = new Coordinator({
      sources: [store, local, remote],
      strategies: [remoteRequestStrategy, remoteStoreSync, localStoreSync, logger]
    });

    coordinator.activate();

    return {
      store,
      local,
      coordinator
    };
  }
}
