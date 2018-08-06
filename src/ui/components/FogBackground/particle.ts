const COLORS = ['#33b0e2', '#37a8dc', '#2776bb'];

export default class FloatingParticle {
  startX: number;
  startY: number;

  speed = {
    x: Math.round(-1 + Math.random() * 2),
    y: Math.round(-1 + Math.random() * 2)
  };

  targetRadius: number = Math.round(5 + Math.random() * 3);
  radius: number = 0;

  opacity: number = Math.random();

  color: string = COLORS[Math.round(Math.random() * COLORS.length) - 1];

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

    let diameter = 2 * radius;

    if (startX > maxWidth + diameter || startX < -1 * diameter) {
      this.speed.x = -1 * this.speed.x;
    }
    if (startY > maxHeight + diameter || startY < -1 * diameter) {
      this.speed.y = -1 * this.speed.y;
    }

    this.startX = startX;
    this.startY = startY;
    if (this.radius < this.targetRadius) {
      this.radius = radius + 0.25;
    }
  }
}
