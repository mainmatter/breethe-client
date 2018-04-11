import Component, { tracked } from '@glimmer/component';

export default class Home extends Component {
  goToRoute(search) {
    this.args.transitionTo(`/search/${search}`);
  }
}
