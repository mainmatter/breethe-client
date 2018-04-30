import Component, { tracked } from '@glimmer/component';

export default class ParticlesBackground extends Component {
  @tracked('args')
  get particles() {
    let { index } = this.args;
    let numParticles = index;
    let particles = Array.from(Array(numParticles).keys());
    return particles;
  }
}
