import Component, { tracked } from '@glimmer/component';

export default class FogBackground extends Component {
  @tracked('args')
  get opacityStyle(): string {
    let { intensity } = this.args;
    let opacity = Math.pow(2.5, intensity) / 10;
    return `opacity: ${(opacity > 1) ? 1 : opacity}`;
  }
}
