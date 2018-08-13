import Component from '@glimmer/component';
import FloatingParticle from './particle';

export default class FogBackground extends Component {
  particles: FloatingParticle[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  fogImage: HTMLImageElement;

  args: {
    intensity: number;
    isSSR: boolean;
  };

  didInsertElement() {
    if (window.requestAnimationFrame && !this.args.isSSR) {
      this.renderParticlesBackground();
    }
  }

  opacityForIntensity(intensity: number): number {
    return intensity === 0 ? 0 : 0.1 * Math.pow(2, intensity);
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

  async renderParticlesBackground() {
    let canvas: HTMLCanvasElement = document.querySelector(
      '#ParticlesBackgroundCanvas'
    );
    let background: HTMLDivElement = document.querySelector(
      '#ParticlesBackground'
    );
    let image = await this.loadFogImage();
    let ctx = canvas.getContext('2d');

    canvas.width = background.clientWidth;
    canvas.height = background.clientHeight;

    this.ctx = ctx;
    this.fogImage = image;
    this.canvas = canvas;
    this.setupParticles(60, canvas.width, canvas.height, image);
    window.requestAnimationFrame(this.drawParticles);
  }

  setupParticles(particles: number, canvasWidth: number, canvasHeight: number, image: HTMLImageElement) {
    this.particles = [];
    for (let i = 0; i < particles; i++) {
      let posX = Math.random() * canvasWidth - (image.width / 2);
      let posY = Math.random() * canvasHeight - (image.height / 2);
      let particle = new FloatingParticle(posX, posY);
      this.particles.push(particle);
    }
  }

  drawParticles = () => {
    let { ctx, particles } = this;
    let { width, height } = this.canvas;
    let opacityFactor = this.opacityForIntensity(this.args.intensity);

    ctx.clearRect(0, 0, width, height);

    let length = this.particles.length;
    for (let i = 0; i < length; i++) {
      particles[i].draw(
        ctx,
        this.fogImage,
        innerWidth,
        innerHeight,
        opacityFactor
      );
    }

    window.requestAnimationFrame(this.drawParticles);
  }
}
