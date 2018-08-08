import Component, { tracked } from '@glimmer/component';
import FloatingParticle from './particle';

export default class FogBackground extends Component {
  particles: FloatingParticle[] = [];
  ctx: CanvasRenderingContext2D;
  checkDeleted: boolean = false;
  fogImage: HTMLImageElement;

  particlesForIntensity(intensity: number): number {
    return 0.10 * Math.pow(2, intensity);
  }

  didInsertElement() {
    if (window.requestAnimationFrame) {
      this.particlesBackground();
    }
  }

  async particlesBackground() {
    let canvas: HTMLCanvasElement = document.querySelector('#ParticlesBackgroundCanvas');
    let image: HTMLImageElement = document.querySelector('#ParticleImage');
    let ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.ctx = ctx;
    this.fogImage = image;
    this.addParticles(115);
    window.requestAnimationFrame(this.drawParticles);
  }

  addParticles(extras: number) {
    let newParticles = [];
    for (let i = 0; i < extras; i++) {
      let posX = Math.round(Math.random() * window.innerWidth);
      let posY = Math.round(Math.random() * window.innerHeight);
      let newParticle = new FloatingParticle(posX, posY);
      newParticles.push(newParticle);
    }
    this.particles = [...this.particles, ...newParticles];
  }

  drawParticles = () => {
    let { ctx, particles } = this;
    let { innerWidth, innerHeight } = window;

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    let length = this.particles.length;
    for (let i = 0; i < length; i++ ) {
      let opacityFactor = this.particlesForIntensity(this.args.intensity);
      particles[i].draw(ctx, this.fogImage, innerWidth, innerHeight, opacityFactor);
    }

    window.requestAnimationFrame(this.drawParticles);
  }
}
