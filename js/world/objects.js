// Interactive World Objects: Collectibles, Springs, Platforms, Spikes & Warp Portals
import { Physics } from '../engine/physics.js';
import { particles } from '../engine/particles.js';
import { audio } from '../engine/audio.js';

export class Collectible {
  constructor(x, y, type = 'persimmon') {
    this.x = x;
    this.y = y;
    this.type = type; // 'persimmon', 'ingot', 'heart'
    this.width = 24;
    this.height = 24;
    this.active = true;
    this.animTimer = Math.random() * Math.PI * 2;
    this.baseY = y;
  }

  update(dt, player) {
    if (!this.active) return;
    this.animTimer += dt * 3;
    this.y = this.baseY + Math.sin(this.animTimer) * 4;

    if (Physics.checkAABB(this, player)) {
      this.active = false;
      if (this.type === 'persimmon') {
        player.addCoins(1, 100);
      } else if (this.type === 'ingot') {
        player.addCoins(5, 500);
      } else if (this.type === 'heart') {
        player.heal(1);
      }
    }
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    if (this.type === 'persimmon') {
      // Small glowing persimmon
      ctx.fillStyle = '#ff7700';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 2, 9, 0, Math.PI * 2);
      ctx.fill();

      // Green Leaf/Cap
      ctx.fillStyle = '#7ac943';
      ctx.beginPath();
      ctx.arc(0, -6, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'ingot') {
      // Golden Ingot (金元寶)
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, 2, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -1, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'heart') {
      // 吉祥紅心果實
      ctx.fillStyle = '#ff3366';
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-10, 0, -10, -8, 0, -8);
      ctx.bezierCurveTo(10, -8, 10, 0, 0, 8);
      ctx.fill();
    }

    ctx.restore();
  }
}

export class SpringMushroom {
  constructor(x, y, power = -620) {
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 24;
    this.power = power;
    this.bounceTimer = 0;
  }

  update(dt, player) {
    if (this.bounceTimer > 0) this.bounceTimer -= dt;

    if (Physics.checkAABB(this, player) && player.vy > 0 && player.y + player.height <= this.y + 16) {
      player.y = this.y - player.height;
      player.vy = this.power;
      player.grounded = false;
      this.bounceTimer = 0.25;
      audio.playSpring();
      particles.createLeaves(this.x + this.width / 2, this.y, 6);
    }
  }

  draw(ctx) {
    ctx.save();
    const squash = this.bounceTimer > 0 ? 0.6 : 1.0;
    ctx.translate(this.x + this.width / 2, this.y + this.height);
    ctx.scale(1, squash);

    // Mushroom Cap
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(0, -16, 18, Math.PI, 0);
    ctx.fill();

    // White polka dots
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-8, -20, 3, 0, Math.PI * 2);
    ctx.arc(0, -26, 3, 0, Math.PI * 2);
    ctx.arc(8, -20, 3, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.fillStyle = '#f5e4c3';
    ctx.fillRect(-6, -14, 12, 14);

    ctx.restore();
  }
}

export class MovingPlatform {
  constructor(x, y, width = 80, height = 16, moveX = 140, moveY = 0, speed = 60) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.width = width;
    this.height = height;
    this.moveX = moveX;
    this.moveY = moveY;
    this.speed = speed;
    this.active = true;
    this.vx = 0;
    this.vy = 0;
    this.progress = 0;
    this.direction = 1;
  }

  update(dt) {
    const totalDist = Math.hypot(this.moveX, this.moveY) || 1;
    this.progress += (this.speed * dt * this.direction) / totalDist;

    if (this.progress >= 1) {
      this.progress = 1;
      this.direction = -1;
    } else if (this.progress <= 0) {
      this.progress = 0;
      this.direction = 1;
    }

    const prevX = this.x;
    const prevY = this.y;

    this.x = this.startX + this.moveX * this.progress;
    this.y = this.startY + this.moveY * this.progress;

    this.vx = (this.x - prevX) / dt;
    this.vy = (this.y - prevY) / dt;
  }

  draw(ctx) {
    ctx.save();
    // Wooden floating raft design
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = '#a66e38';
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

    // Green moss / vine edge
    ctx.fillStyle = '#6cb738';
    ctx.fillRect(this.x, this.y, this.width, 3);
    ctx.restore();
  }
}

export class CrumblingPlatform {
  constructor(x, y, width = 64, height = 16) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.active = true;
    this.state = 'SOLID'; // 'SOLID', 'CRUMBLING', 'BROKEN'
    this.timer = 0;
    this.shakeOffset = 0;
  }

  onStepped(player) {
    if (this.state === 'SOLID') {
      this.state = 'CRUMBLING';
      this.timer = 0.45;
    }
  }

  update(dt) {
    if (this.state === 'CRUMBLING') {
      this.timer -= dt;
      this.shakeOffset = (Math.random() * 4 - 2);
      if (this.timer <= 0) {
        this.state = 'BROKEN';
        this.active = false;
        this.timer = 2.8; // Respawn timer
        particles.createDust(this.x + this.width / 2, this.y, 8, '#a67c52');
      }
    } else if (this.state === 'BROKEN') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = 'SOLID';
        this.active = true;
        this.shakeOffset = 0;
        particles.createLeaves(this.x + this.width / 2, this.y, 4);
      }
    }
  }

  draw(ctx) {
    if (this.state === 'BROKEN') return;
    ctx.save();
    ctx.translate(this.shakeOffset, 0);

    ctx.fillStyle = this.state === 'CRUMBLING' ? '#80593f' : '#9c6f4f';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Cracks
    if (this.state === 'CRUMBLING') {
      ctx.strokeStyle = '#331c0e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 10, this.y);
      ctx.lineTo(this.x + 24, this.y + 12);
      ctx.moveTo(this.x + 36, this.y);
      ctx.lineTo(this.x + 50, this.y + 14);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export class WarpPortal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 64;
    this.animTimer = 0;
  }

  update(dt, player, onTrigger) {
    this.animTimer += dt * 4;
    if (Physics.checkAABB(this, player)) {
      onTrigger();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Golden Swirl Portal (柿柿順利豐收之門)
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate(this.animTimer * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / 3);
      ctx.strokeStyle = i === 0 ? '#ffaa00' : (i === 1 ? '#ffea00' : '#ff7700');
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18 + i * 4, 28 + i * 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Portal core light
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
