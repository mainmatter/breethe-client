import Component, { tracked } from '@glimmer/component';
import FloatingParticle from './particle';

export default class FogBackground extends Component {
  particles: FloatingParticle[] = [];
  ctx: CanvasRenderingContext2D;

  @tracked('args')
  get calculate(): string {
    let { intensity } = this.args;
    let opacity = Math.pow(2.5, intensity) / 10;
    return `opacity: ${(opacity > 1) ? 1 : opacity}`;
  }

  particlesForIntensity(intensity: number): number {
    return 50 + (Math.pow(2.5, intensity)) * 10;
  }

  didInsertElement() {
    let canvas: HTMLCanvasElement = document.querySelector('#ParticlesBackgroundCanvas');
    let ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.beginPath();
    ctx.arc(300, 300, 200, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fill();

    this.ctx = ctx;

    let initialParticles = this.particlesForIntensity(this.args.intensity);
    console.log(initialParticles);
    this.addParticles(initialParticles);
    window.requestAnimationFrame(this.drawParticles);
  }

  addParticles(extras: number) {
    let newParticles = [];
    for (let i = 0; i < extras; i++) {
      let posX = Math.random() * window.innerWidth;
      let posY = Math.random() * window.innerHeight;
      let newParticle = new FloatingParticle(posX, posY);
      newParticles.push(newParticle);
    }
    this.particles = [...this.particles, ...newParticles];
  }

  drawParticles = () => {
    let { ctx } = this;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.particles.forEach((particle) => {
      particle.draw(ctx);
    });
    window.requestAnimationFrame(this.drawParticles);
  }
}
