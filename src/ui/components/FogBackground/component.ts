import Component, { tracked } from '@glimmer/component';
import FloatingParticle from './particle';

export default class FogBackground extends Component {
  shownIntensity: number;
  particles: FloatingParticle[] = [];
  ctx: CanvasRenderingContext2D;
  checkDeleted: boolean = false;

  particlesForIntensity(intensity: number): number {
    return Math.round(10 + (Math.pow(2.5, intensity)) * 10);
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
    this.addParticles(initialParticles);
    this.shownIntensity = this.args.intensity;
    window.requestAnimationFrame(this.drawParticles);
  }

  didUpdate() {
    let { intensity } = this.args;
    let { shownIntensity } = this;

    if (intensity !== shownIntensity) {
      let currentParticles = this.particlesForIntensity(shownIntensity);
      let targetParticles = this.particlesForIntensity(intensity);
      console.info(targetParticles);
      if (intensity > shownIntensity) {
        this.addParticles(targetParticles - currentParticles);
      } else {
        this.removeParticles(currentParticles - targetParticles);
      }
      this.shownIntensity = intensity;
    }
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

  removeParticles(count: number) {
    let { particles } = this;
    for (let i = 0; i < count; i++) {
      particles[i].toDelete = true;
    }
    this.checkDeleted = true;
  }

  drawParticles = () => {
    let { ctx, particles } = this;
    let { innerWidth, innerHeight } = window;

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    let length = this.particles.length;
    for (let i = 0; i < length; i++ ) {
      particles[i].draw(ctx, innerWidth, innerHeight);
    }
    let clearedParticles = particles.filter((particle) => {
      return !(particle.toDelete && particle.radius <= 0);
    });

    if (clearedParticles.length !== particles.length) {
      this.particles = clearedParticles;
    }

    window.requestAnimationFrame(this.drawParticles);
  }
}
