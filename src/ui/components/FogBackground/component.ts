import Component, { tracked } from '@glimmer/component';

export default class FogBackground extends Component {
  @tracked('args')
  get opacityStyle() {
    let { index } = this.args;
    return `opacity: ${index}`;
  }
}
