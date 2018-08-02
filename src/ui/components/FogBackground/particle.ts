interface Particle {
  startX: number;
  startY: number;

  speed: {
    x: number,
    y: number
  };

  radius: number;

  draw: (canvas: CanvasRenderingContext2D) => void;
}

export default class FloatingParticle implements Particle {
  startX;
  startY;

  speed = {
    x: -2 + Math.random() * 2,
    y: -2 + Math.random() * 2
  };

  radius = 5 + Math.random() * 3;

  opacity = Math.random();

  constructor(x, y) {
    this.startX = x;
    this.startY = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.startX, this.startY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();

    this.startX += this.speed.x;
    this.startY += this.speed.y;
  }
}
