import Component, { tracked } from '@glimmer/component';
import Navigo from 'navigo';
import setupStore from '../../../utils/data/setup-store';
import IS_SSR from '../../../utils/ssr/detect';

const router = new Navigo('http://localhost:3000');

const MODE_SEARCH = 'search';
const MODE_RESULTS = 'results';

export default class PpmClient extends Component {
  store = setupStore();
  particles: any = null;

  router = router;

  @tracked
  particlesIndex: number = 20;

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

  constructor(options) {
    super(options);

    this._setupRouting();
    this._bindInternalLinks();
  }

  updateParticles(particlesIndex: number) {
    this.particlesIndex = particlesIndex;
  }

  _setupRouting() {
    this.router
      .on('/', () => this._setMode(MODE_SEARCH))
      .on('/search/:searchTerm', (params) => this._setMode(MODE_SEARCH, params))
      .on('/location/:location/', (params) => this._setMode(MODE_RESULTS, params))
      .resolve();
  }

  _setMode(mode, params = {}) {
    this.mode = mode;

    switch (mode) {
      case MODE_SEARCH:
        this.location = null;
        this.searchTerm = params.searchTerm;
        break;
      case MODE_RESULTS:
        this.location = params.location;
        this.searchTerm = null;
        break;
    }
  }

  _bindInternalLinks() {
    if (!IS_SSR) {
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
