// 2D Smooth Follow Camera with Screen Shake & Viewport Bounds
export class Camera {
  constructor(viewportWidth = 960, viewportHeight = 540) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.target = null;
    this.lerpSpeed = 0.1; // Smoothness factor
    this.offsetX = 0;
    this.offsetY = 0;

    // World Bounds
    this.minX = 0;
    this.maxX = 5000;
    this.minY = 0;
    this.maxY = 1200;

    // Screen Shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
  }

  follow(target) {
    this.target = target;
  }

  setBounds(minX, minY, maxX, maxY) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  shake(intensity = 8, duration = 0.25) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  update(dt) {
    if (this.target) {
      // Look slightly ahead of the target in moving direction
      const lookAhead = (this.target.facing || 1) * 60;
      const targetX = this.target.x + (this.target.width || 32) / 2 + lookAhead - this.viewportWidth / 2;
      const targetY = this.target.y + (this.target.height || 48) / 2 - this.viewportHeight / 2 - 20;

      this.x += (targetX - this.x) * this.lerpSpeed;
      this.y += (targetY - this.y) * this.lerpSpeed;

      // Clamp camera within map bounds
      const maxCamX = Math.max(0, this.maxX - this.viewportWidth);
      const maxCamY = Math.max(0, this.maxY - this.viewportHeight);

      this.x = Math.max(this.minX, Math.min(this.x, maxCamX));
      this.y = Math.max(this.minY, Math.min(this.y, maxCamY));
    }

    // Process Shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const progress = this.shakeTimer / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * progress;
      this.offsetX = (Math.random() * 2 - 1) * currentIntensity;
      this.offsetY = (Math.random() * 2 - 1) * currentIntensity;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.shakeIntensity = 0;
    }
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(
      -Math.round(this.x + this.offsetX),
      -Math.round(this.y + this.offsetY)
    );
  }

  restore(ctx) {
    ctx.restore();
  }

  // Check if an entity is within the visible camera viewport
  isVisible(x, y, width = 32, height = 32, margin = 100) {
    return (
      x + width >= this.x - margin &&
      x <= this.x + this.viewportWidth + margin &&
      y + height >= this.y - margin &&
      y <= this.y + this.viewportHeight + margin
    );
  }
}
