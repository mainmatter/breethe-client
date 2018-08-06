import Component, { tracked } from '@glimmer/component';
import FloatingParticle from './particle';

export default class FogBackground extends Component {
  shownIntensity: number;
  particles: FloatingParticle[] = [];
  ctx: CanvasRenderingContext2D;
  checkDeleted: boolean = false;
  fogImage: HTMLImageElement;

  particlesForIntensity(intensity: number): number {
    return Math.round((Math.pow(2.5, intensity)) * 3) - 3;
  }

  didInsertElement() {
    this.particlesBackground();
  }

  loadFogImage(): Promise<HTMLImageElement> {
    let fogImage = new Image(500, 500);
    return new Promise((resolve, reject) => {
      fogImage.onload = () => {
        resolve(fogImage);
      };
      fogImage.onerror = (error) => {
        reject(error);
      };
      fogImage.src = '/images/fog-particle.png';
    });
  }

  async particlesBackground() {
    let canvas: HTMLCanvasElement = document.querySelector('#ParticlesBackgroundCanvas');
    let ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.ctx = ctx;
    this.fogImage = await this.loadFogImage();

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
      let newParticle = new FloatingParticle(posX, posY, this.fogImage);
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
      return !(particle.toDelete && particle.opacity <= 0);
    });

    if (clearedParticles.length !== particles.length) {
      this.particles = clearedParticles;
    }

    window.requestAnimationFrame(this.drawParticles);
  }
}
