import Component, { tracked } from '@glimmer/component';
import * as Particles from 'particlesjs';
import setupStore from '../../../utils/data/setup-store';
import { getRouteFromPath, IRoute } from '../../../utils/routing';

const DEFAULT_PARTICLES_INDEX = 25;
const MAX_PARTICLES = 1200;

export default class PpmClient extends Component {
  store = setupStore();
  particles: any = null;
  particlesIndex: number = 0;

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

  didInsertElement() {
    this.loadParticles();
  }

  loadParticles() {
    this.particlesIndex = DEFAULT_PARTICLES_INDEX;
    let initialParticles = 200 + MAX_PARTICLES * (this.particlesIndex / 100);
    console.info(initialParticles);
    this.particles = Particles.default.init({
      selector: '.ppm-background__particles',
      color: '#109bff',
      speed: 0.15,
      sizeVariations: 3,
      maxParticles: initialParticles
    });
  }

  updateParticles(particlesIndex: number) {
    if (this.particlesIndex && this.particlesIndex !== particlesIndex) {
      let maxParticles = 200 + MAX_PARTICLES * (particlesIndex / 100);
      console.log(maxParticles);
      this.particles.options.maxParticles = maxParticles;
      this.particles._refresh();
      this.particlesIndex = particlesIndex;
    }
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
