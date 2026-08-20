// Player and Enemy Bullets & Projectiles
import { particles } from '../engine/particles.js';
import { audio } from '../engine/audio.js';

export class Bullet {
  constructor(x, y, vx, vy, type = 0, isPlayer = true, damage = 1) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type; // 0: single, 1: spread, 2: mega
    this.isPlayer = isPlayer;
    this.damage = damage;
    this.active = true;
    this.pierce = type === 2 ? 3 : 1; // Mega shot pierces enemies

    if (this.isPlayer) {
      if (type === 0) {
        this.width = 14;
        this.height = 10;
        this.color = '#ff9900';
        this.life = 1.2;
      } else if (type === 1) {
        this.width = 12;
        this.height = 8;
        this.color = '#ffcc00';
        this.life = 0.8;
      } else if (type === 2) {
        this.width = 28;
        this.height = 24;
        this.color = '#ff5500';
        this.life = 1.8;
      }
    } else {
      // Enemy projectile
      this.width = 10;
      this.height = 10;
      this.color = '#ff2a6d';
      this.life = 2.5;
    }
  }

  update(dt, tilemap) {
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Check solid tile collision
    const startTileX = Math.floor(this.x / tilemap.tileSize);
    const endTileX = Math.floor((this.x + this.width) / tilemap.tileSize);
    const startTileY = Math.floor(this.y / tilemap.tileSize);
    const endTileY = Math.floor((this.y + this.height) / tilemap.tileSize);

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const tile = tilemap.getTile(tx, ty);
        if (tile && tile.solid) {
          this.active = false;
          particles.createHitSparks(this.x + this.width / 2, this.y + this.height / 2, 6, this.color);
          return;
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.isPlayer) {
      if (this.type === 0) {
        // Seed Blaster: Glowing persimmon seed shape
        ctx.fillStyle = '#ff7700';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 4, this.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 1) {
        // Spread Gold Shot: Golden diamond/leaf
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffe066';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width / 2 - 2, this.y + this.height / 2 - 2, 4, 4);
      } else if (this.type === 2) {
        // Mega Blast: Giant glowing persimmon orb with pulsing rings
        ctx.fillStyle = '#ff4500';
        ctx.shadowColor = '#ff9900';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Little green calyx (persimmon hat)
        ctx.fillStyle = '#7ac943';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 4, 6, 0, Math.PI * 2);
        ctx.fill();

        // White hot center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Enemy projectile (purple/magenta energy orb or thorn)
      ctx.fillStyle = '#ff2a6d';
      ctx.shadowColor = '#ff2a6d';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
