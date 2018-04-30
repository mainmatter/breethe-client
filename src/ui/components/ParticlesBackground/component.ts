import Component, { tracked } from '@glimmer/component';

export default class ParticlesBackground extends Component {
  @tracked
  lastParticles: number = 0;

  constructor(options) {
    super(options);
    this.lastParticles = this.args.index;
  }

  @tracked('args')
  get particles() {
    let numParticles = this.args.index;
    let { lastParticles } = this;
    if (numParticles > lastParticles) {
      let extraParticles = Array.from(Array(numParticles - lastParticles).keys());
      let particles = Array.from(Array(lastParticles).keys());
      this.lastParticles = numParticles;
      return {
        particles,
        extraParticles
      };
    } else {
      let particles = Array.from(Array(numParticles).keys());
      this.lastParticles = numParticles;
      return {
        particles
      };
    }
  }
}
