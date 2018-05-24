import Component, { tracked } from '@glimmer/component';
import Navigo from 'navigo';
import restoreCache from '../../../utils/data/restore-cache';
import { initializeStore, setupCoordinator } from '../../../utils/data/setup-store';
import Location from '../Location/component';

const MODE_SEARCH = 'search';
const MODE_RESULTS = 'results';

interface ISearchParams {
  searchTerm?: string;
}
interface ILocationParams {
  location?: string;
}

export default class PpmClient extends Component {

  appState: {
    origin: string,
    route: string,
    isSSR: boolean,
    appData: any
  };

  router;

  store;
  local;
  searchResults;
  loadedLocal = false;

  @tracked
  particlesIndex: number = 20;

  @tracked
  isOnline = true;

  @tracked
  mode: string;
  @tracked
  location: {};
  @tracked
  searchTerm: string;

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

    let { store, schema } = initializeStore(this.appState);
    this.store = store;

    if (!this.appState.isSSR) {
      let cacheData = restoreCache(this.store);
      if (cacheData) {
        this.searchResults = cacheData.searchResults;
      }
      let { local } = setupCoordinator(this.store, schema, this.appState);
      this.local = local;
    } else if (this.appState.appData) {
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
      this.loadedLocal = true;
    }
  }

  updateParticles(particlesIndex: number) {
    this.particlesIndex = particlesIndex;
  }

  _setupRouting() {
    this.router = new Navigo(this.appState.origin);

    this.router
      .on('/', () => this._setMode(MODE_SEARCH))
      .on('/search/:searchTerm', (params) => this._setMode(MODE_SEARCH, params))
      .on('/location/:location/', (params) => this._setMode(MODE_RESULTS, params))
      .resolve(this.appState.route);
  }

  _setMode(mode, params: ISearchParams | ILocationParams = {}) {
    this.mode = mode;

    switch (mode) {
      case MODE_SEARCH:
        params = params as ISearchParams;
        this.location = null;
        this.searchTerm = params.searchTerm;
        break;
      case MODE_RESULTS:
        params = params as ILocationParams;
        this.location = params.location;
        this.searchTerm = null;
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
