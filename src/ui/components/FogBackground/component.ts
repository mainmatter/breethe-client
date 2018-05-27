import Component, { tracked } from '@glimmer/component';

export default class FogBackground extends Component {
  @tracked('args')
  get opacityStyle() {
    let { intensity } = this.args;
    return `opacity: ${0.2 * intensity}`;
  }
}
