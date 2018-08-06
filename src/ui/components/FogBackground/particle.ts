interface Particle {
  startX: number;
  startY: number;

  speed: {
    x: number,
    y: number
  };

  radius: number;

  draw: (canvas: CanvasRenderingContext2D, maxWidth: number, maxHeight: number) => void;
}

const COLORS = ['#33b0e2', '#37a8dc', '#2776bb'];

export default class FloatingParticle implements Particle {
  startX;
  startY;

  speed = {
    x: Math.round(-1 + Math.random() * 2),
    y: Math.round(-1 + Math.random() * 2)
  };

  radius = Math.round(5 + Math.random() * 3);

  opacity = Math.random();

  color = COLORS[Math.round(Math.random() * COLORS.length) - 1];

  constructor(x, y) {
    this.startX = x;
    this.startY = y;
  }

  draw(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number) {
    let { startX, startY, radius, color, opacity } = this;

    ctx.beginPath();
    ctx.globalAlpha = opacity;
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    startX += this.speed.x;
    startY += this.speed.y;

    let diameter = 2 * this.radius;

    if (startX > maxWidth + diameter || startX < -1 * diameter) {
      this.speed.x = -1 * this.speed.x;
    }
    if (startY > maxHeight + diameter || startY < -1 * diameter) {
      this.speed.y = -1 * this.speed.y;
    }

    this.startX = startX;
    this.startY = startY;
  }
}
