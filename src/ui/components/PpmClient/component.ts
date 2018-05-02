import Component, { tracked } from '@glimmer/component';
import setupStore from '../../../utils/data/setup-store';
import { getRouteFromPath, IRoute } from '../../../utils/routing';

export default class PpmClient extends Component {
  store = setupStore();
  particles: any = null;

  @tracked
  particlesIndex: number = 20;

  @tracked
  theCurrentView: IRoute = {
    name: '',
    title: '',
    componentName: '',
    notFound: false
  };

  constructor(options) {
    super(options);
    this.setupRouting();
  }

  updateParticles(particlesIndex: number) {
    this.particlesIndex = particlesIndex;
  }

  loadFromUrl(path) {
    let routeState = getRouteFromPath(path);
    window.history.pushState(routeState, routeState.title, `${path}`);
    this.theCurrentView = routeState;
  }

  bindInternalLinks() {
    document.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'A' &&
        target.classList.contains('internal-link')
      ) {
        event.preventDefault();
        this.loadFromUrl(target.getAttribute('href'));
      }
    });
  }

  setupRouting() {
    window.onpopstate = (event) => {
      if (event.state) {
        const view = event.state;
        this.theCurrentView = view;
      }
    };
    this.loadFromUrl(window.location.pathname);
    this.bindInternalLinks();
  }
}
