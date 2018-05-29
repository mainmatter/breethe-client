import Component, { tracked } from '@glimmer/component';
import Navigo from 'navigo';
import restoreCache from '../../../utils/data/restore-cache';
import { setupStore } from '../../../utils/data/setup-store';
import Location from '../Location/component';

const MODE_SEARCH = 'search';
const MODE_RESULTS = 'results';

interface ISearchParams {
  searchTerm?: string;
  coordinates?: number[];
}
interface ILocationParams {
  locationId?: string;
}

export default class Breethe extends Component {

  appState: {
    origin: string,
    route: string,
    isSSR: boolean,
    appData: any
  };

  router;

  store;
  local;
  coordinator;
  searchResults;
  loadedLocal = false;

  @tracked
  fogIntensity = 0;

  @tracked
  isOnline = true;

  @tracked
  mode: string;
  @tracked
  locationId: {};
  @tracked
  searchTerm: string;
  @tracked
  coordinates: number[];

  @tracked('mode')
  get isSearchMode() {
    return this.mode === MODE_SEARCH;
  }

  @tracked('mode')
  get isResultsMode() {
    return this.mode === MODE_RESULTS;
  }

  @tracked('mode', 'isOnline')
  get showOfflineWarning() {
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
      let { store, local, coordinator } = setupStore(this.appState);
      this.store = store;
      this.local = local;
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
      await this.coordinator.activate();
      this.loadedLocal = true;
    }
  }

  updateFogEffect(intensity) {
    this.fogIntensity = intensity;
  }

  _setupRouting() {
    this.router = new Navigo(this.appState.origin);

    this.router
      .on('/', () => this._setMode(MODE_SEARCH))
      .on('/search', () => this._setMode(MODE_SEARCH))
      .on(/search\/(\-?\d+(\.\d+)?,\s*\-?\d+(\.\d+)?)/, (coordinates) => this._setMode(MODE_SEARCH, { coordinates }))
      .on('/search/:searchTerm', (params) => this._setMode(MODE_SEARCH, params))
      .on('/location/:locationId/', (params) => this._setMode(MODE_RESULTS, params))
      .resolve(this.appState.route);
  }

  _setMode(mode, params: ISearchParams | ILocationParams = {}) {
    this.mode = mode;

    switch (mode) {
      case MODE_SEARCH:
        params = params as ISearchParams;
        this.locationId = null;
        this.searchTerm = params.searchTerm;
        this.coordinates = params.coordinates;
        break;
      case MODE_RESULTS:
        params = params as ILocationParams;
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
