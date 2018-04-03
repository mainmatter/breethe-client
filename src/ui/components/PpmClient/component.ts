import Component, { tracked } from '@glimmer/component';
import { getRouteFromPath, IRoute } from '../../../utils/routing';

export default class PpmClient extends Component {

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

  setupRouting() {
    this.theCurrentView = {...getRouteFromPath(window.location.pathname)};
  }
}
