import Component, { tracked } from '@glimmer/component';

const DEFAULT_PARTICLES_INDEX = 25;
const MAX_PARTICLES = 500;

export default class ParticlesBackground extends Component {

  @tracked('args')
  get particles() {
    let { index } = this.args;
    let numParticles = 50;
    let particles = Array.from(Array(numParticles).keys());
    return particles;
  }
}
