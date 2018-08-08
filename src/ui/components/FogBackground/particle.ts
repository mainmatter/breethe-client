export default class FloatingParticle {
  startX: number;
  startY: number;

  speed = {
    x: Math.round(-1 + Math.random() * 2),
    y: Math.round(-1 + Math.random() * 2)
  };

  opacity: number = 0;
  targetOpacity: number = Math.random();

  toDelete: boolean = false;
  deleted: boolean = false;

  imageWidth = 500;

  constructor(x, y) {
    this.startX = x;
    this.startY = y;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    maxWidth: number,
    maxHeight: number,
    opacityFactor: number
  ) {
    let { startX, startY, opacity, targetOpacity, imageWidth } = this;

    if (opacity !== 0) {
      ctx.beginPath();
      ctx.drawImage(image, startX, startY, imageWidth, imageWidth);
      // ctx.fillRect(startX, startY, 100, 100);
      ctx.globalAlpha = opacity;
      ctx.fill();

      startX += this.speed.x;
      startY += this.speed.y;

      if (startX > maxWidth + imageWidth || startX < -1 * imageWidth) {
        this.speed.x = -1 * this.speed.x;
      }
      if (startY > maxHeight + imageWidth || startY < -1 * imageWidth) {
        this.speed.y = -1 * this.speed.y;
      }

      this.startX = startX;
      this.startY = startY;
    }

    let outcomeOpacity = targetOpacity * opacityFactor;
    if (opacity < outcomeOpacity) {
      opacity = opacity + 0.02;
      if (opacity > outcomeOpacity) {
        opacity = outcomeOpacity;
      }
    }
    if (opacity > outcomeOpacity) {
      opacity = opacity - 0.02;
      if (opacity < 0) {
        opacity = 0;
      }
    }
    this.opacity = opacity;
  }
}
