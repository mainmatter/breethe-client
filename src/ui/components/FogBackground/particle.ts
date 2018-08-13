export default class FloatingParticle {
  startX: number;
  startY: number;

  speed = {
    x: (-1 + Math.random() * 2),
    y: (-1 + Math.random() * 2)
  };

  opacity: number = 0;
  targetOpacity: number = Math.random();

  toDelete: boolean = false;
  deleted: boolean = false;

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
    let { startX, startY, opacity, targetOpacity } = this;

    if (opacity !== 0) {
      ctx.beginPath();
      ctx.drawImage(image, Math.round(startX), Math.round(startY), image.width, image.height);
      ctx.globalAlpha = opacity;
      ctx.fill();

      startX += this.speed.x;
      startY += this.speed.y;

      if (startX + (image.width / 2) > maxWidth || startX < -1 * (image.width / 2)) {
        this.speed.x = -1 * this.speed.x;
      }
      if (startY + (image.height / 2) > maxHeight || startY < -1 * (image.height / 2)) {
        this.speed.y = -1 * this.speed.y;
      }

      this.startX = startX;
      this.startY = startY;
    }

    let outcomeOpacity = targetOpacity * opacityFactor;
    let delta = outcomeOpacity - opacity;
    let step = 0.03;

    if (outcomeOpacity === 0 && opacity > 0) {
      opacity = opacity - step;
      if (opacity < 0) {
        opacity = 0;
      }
    } else {
      if (Math.abs(delta) > step && delta > 0) {
        opacity = opacity + step;
        if (opacity > 1) {
          opacity = 1;
        }
      }
    }

    this.opacity = opacity;
  }
}
