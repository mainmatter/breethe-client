import Component, { tracked } from '@glimmer/component';
import Coordinator from '@orbit/coordinator';
import IndexedDBStore from '@orbit/indexeddb';
import JSONAPIStore from '@orbit/jsonapi';
import Store from '@orbit/store';
import Navigo from 'navigo';
import restoreCache from '../../../utils/data/restore-cache';
import { setupStore } from '../../../utils/data/setup-store';

const MODE_SEARCH: string = 'search';
const MODE_RESULTS: string = 'results';

interface SearchParams {
  searchTerm?: string;
  coordinates?: number[];
  locationNotFound?: boolean;
}

interface LocationParams {
  locationId?: string;
}

export default class Breethe extends Component {
  appState: AppState;

  router: Navigo;

  store: Store;
  local: IndexedDBStore;
  remote: JSONAPIStore;
  coordinator: Coordinator;
  searchResults: string[];
  loadedLocal: boolean = false;

  @tracked
  fogIntensity: number = 0;

  @tracked
  isOnline: boolean = true;

  @tracked
  mode: string;

  @tracked
  locationId: string;

  @tracked
  searchTerm: string;

  @tracked
  coordinates: number[];

  @tracked
  locationNotFound: boolean;

  @tracked('mode')
  get isSearchMode(): boolean {
    return this.mode === MODE_SEARCH;
  }

  @tracked('mode')
  get isResultsMode(): boolean {
    return this.mode === MODE_RESULTS;
  }

  @tracked('mode', 'isOnline')
  get showOfflineWarning(): boolean {
    return this.mode === MODE_SEARCH && !this.isOnline;
  }

  constructor(options) {
    super(options);

    this.appState = this.appState || {
      origin: window.location.origin,
      route: window.location.pathname,
      isSSR: false,
      appData: {}
    };

    if (!this.appState.isSSR) {
      let { store, local, remote, coordinator } = setupStore(this.appState);
      this.store = store;
      this.local = local;
      this.remote = remote;
      this.coordinator = coordinator;
      let cacheData = restoreCache(this.store);
      if (cacheData) {
        this.searchResults = cacheData.searchResults;
      }
    } else if (this.appState.appData) {
      let { store } = setupStore(this.appState);
      this.store = store;
      let { searchResults } = this.appState.appData;
      this.searchResults = searchResults;
    }

    this._setupRouting();
    this._bindInternalLinks();
    this._bindOnlineStatus();
  }

  pullIndexedDB = async () => {
    if (!this.loadedLocal) {
      let transform = await this.local.pull((q) => q.findRecords());
      await this.store.sync(transform);
      this.coordinator.activate();
      this.loadedLocal = true;
    }
  }

  updateFogEffect(intensity: number) {
    this.fogIntensity = intensity;
  }

  _setupRouting() {
    this.router = new Navigo(this.appState.origin);

    this.router
      .on('/', () => this._setMode(MODE_SEARCH))
      .on('/search', () => this._setMode(MODE_SEARCH))
      .on(/search\/([-+]?[0-9]*\.?[0-9]*),([-+]?[0-9]*\.?[0-9]*)/, (lat, lon) =>
        this._setMode(MODE_SEARCH, { coordinates: [lat, lon] })
      )
      .on('/search/location-not-found', () => this._setMode(MODE_SEARCH, { locationNotFound: true }))
      .on('/search/:searchTerm', (params) => this._setMode(MODE_SEARCH, params))
      .on('/location/:locationId/', (params) => this._setMode(MODE_RESULTS, params))
      .resolve(this.appState.route);
  }

  _setMode(mode: string, params: SearchParams | LocationParams = {}) {
    this.mode = mode;

    switch (mode) {
      case MODE_SEARCH:
        params = params as SearchParams;
        this.locationId = null;
        this.searchTerm = params.searchTerm;
        this.coordinates = params.coordinates;
        this.locationNotFound = params.locationNotFound;
        break;
      case MODE_RESULTS:
        params = params as LocationParams;
        this.locationId = params.locationId;
        this.searchTerm = null;
        this.coordinates = null;
        break;
    }
  }

  _bindOnlineStatus() {
    if (!this.appState.isSSR) {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.isOnline = true);
      window.addEventListener('offline', () => this.isOnline = false);
    }
  }

  _bindInternalLinks() {
    if (!this.appState.isSSR) {
      document.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;

        if (target.tagName === 'A' && target.dataset.navigo !== undefined) {
          event.preventDefault();
          this.router.navigate(target.getAttribute('href'));
        }
      });
    }
  }
}
