// Enemy Entities: Ground Patrol Caterpillar, Flying Bat/Moth, and Spike Flower Turret
import { Physics } from '../engine/physics.js';
import { particles } from '../engine/particles.js';
import { audio } from '../engine/audio.js';
import { Bullet } from './bullet.js';

export class Enemy {
  constructor(x, y, type = 'crawler') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
    this.vx = 0;
    this.vy = 0;
    this.facing = -1;
    this.hitTimer = 0;
    this.animTimer = 0;
    this.grounded = false;

    if (type === 'crawler') {
      // 貪吃毛毛蟲 (Ground patroller)
      this.width = 36;
      this.height = 24;
      this.maxHp = 2;
      this.hp = 2;
      this.speed = 70;
      this.vx = -this.speed;
      this.scoreVal = 150;
    } else if (type === 'flyer') {
      // 暗影枯葉蝠 (Flying swooper)
      this.width = 34;
      this.height = 28;
      this.maxHp = 2;
      this.hp = 2;
      this.speed = 110;
      this.baseY = y;
      this.scoreVal = 200;
    } else if (type === 'turret') {
      // 刺刺花苞砲塔 (Stationary shooter)
      this.width = 32;
      this.height = 36;
      this.maxHp = 3;
      this.hp = 3;
      this.shootCooldown = 2.2;
      this.shootTimer = Math.random() * 1.5;
      this.scoreVal = 250;
    }
  }

  hurt(damage = 1, knockbackX = 0) {
    this.hp -= damage;
    this.hitTimer = 0.12;
    this.vx += knockbackX * 0.5;
    audio.playEnemyHit();
    particles.createHitSparks(this.x + this.width / 2, this.y + this.height / 2, 8, '#ff5533');

    if (this.hp <= 0) {
      this.active = false;
      audio.playEnemyDie();
      particles.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 16, '#98d148');
    }
  }

  update(dt, player, tilemap, bullets, camera) {
    if (!this.active) return;
    this.animTimer += dt;
    if (this.hitTimer > 0) this.hitTimer -= dt;

    if (this.type === 'crawler') {
      // Crawl along ground, flip when hitting a wall or edge
      this.vy += 800 * dt; // Gravity
      this.x += this.vx * dt;

      // Check wall collision
      const checkX = this.vx > 0 ? this.x + this.width + 2 : this.x - 2;
      const tileX = Math.floor(checkX / tilemap.tileSize);
      const tileY = Math.floor((this.y + this.height / 2) / tilemap.tileSize);
      const wallTile = tilemap.getTile(tileX, tileY);

      // Check edge of cliff
      const floorTileY = Math.floor((this.y + this.height + 4) / tilemap.tileSize);
      const floorTile = tilemap.getTile(tileX, floorTileY);

      if ((wallTile && wallTile.solid) || (!floorTile || !floorTile.solid)) {
        this.vx = -this.vx;
        this.facing = this.vx > 0 ? 1 : -1;
      }

      // Vertical tile resolution
      this.y += this.vy * dt;
      const startTX = Math.floor(this.x / tilemap.tileSize);
      const endTX = Math.floor((this.x + this.width - 0.01) / tilemap.tileSize);
      const bottomTY = Math.floor((this.y + this.height) / tilemap.tileSize);

      for (let tx = startTX; tx <= endTX; tx++) {
        const tile = tilemap.getTile(tx, bottomTY);
        if (tile && (tile.solid || tile.oneWay)) {
          this.y = bottomTY * tilemap.tileSize - this.height;
          this.vy = 0;
          this.grounded = true;
          break;
        }
      }
    } else if (this.type === 'flyer') {
      // Fly with sinusoidal hover & swoop towards player if close
      const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
      if (distToPlayer < 280) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.facing = this.vx > 0 ? 1 : -1;
      } else {
        this.vx = Math.sin(this.animTimer * 2) * 60;
        this.vy = Math.cos(this.animTimer * 3) * 40;
      }
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    } else if (this.type === 'turret') {
      // Turn towards player and fire needle projectile
      this.facing = player.x > this.x ? 1 : -1;
      this.shootTimer += dt;
      if (this.shootTimer >= this.shootCooldown) {
        this.shootTimer = 0;
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < 450 && camera.isVisible(this.x, this.y)) {
          const angle = Math.atan2(player.y - (this.y + 10), player.x - (this.x + this.width / 2));
          const bulletSpeed = 220;
          bullets.push(
            new Bullet(
              this.x + this.width / 2,
              this.y + 10,
              Math.cos(angle) * bulletSpeed,
              Math.sin(angle) * bulletSpeed,
              0,
              false,
              1
            )
          );
          audio.playShoot(0);
          particles.createHitSparks(this.x + this.width / 2, this.y + 10, 4, '#ff2a6d');
        }
      }
    }

    // Check collision with player
    if (Physics.checkAABB(this, player) && !player.isDead) {
      player.hurt(1, (player.x > this.x ? 1 : -1) * 220);
    }
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();

    // White flash on hit
    if (this.hitTimer > 0) {
      ctx.filter = 'brightness(2) contrast(1.5)';
    }

    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.facing, 1);

    if (this.type === 'crawler') {
      // 貪吃毛毛蟲 (Cute green segmented caterpillar with big eyes)
      const wiggle = Math.sin(this.animTimer * 10) * 3;

      // Body segments
      ctx.fillStyle = '#6cb738';
      ctx.beginPath();
      ctx.arc(-8 + wiggle, 2, 8, 0, Math.PI * 2);
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.arc(8 - wiggle, 1, 9, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#8bd64e';
      ctx.beginPath();
      ctx.arc(12, -2, 10, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(15, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(16, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Antenna
      ctx.strokeStyle = '#4e9420';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, -10);
      ctx.lineTo(18, -16);
      ctx.stroke();
    } else if (this.type === 'flyer') {
      // 枯葉蝠 (Purple/brown winged pest)
      const wingFlap = Math.sin(this.animTimer * 16) * 12;

      // Wings
      ctx.fillStyle = '#7a3e8c';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-14, -10 - wingFlap);
      ctx.lineTo(-6, 8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(14, -10 - wingFlap);
      ctx.lineTo(6, 8);
      ctx.fill();

      // Body
      ctx.fillStyle = '#491b5c';
      ctx.beginPath();
      ctx.arc(0, 2, 9, 0, Math.PI * 2);
      ctx.fill();

      // Glowing red eyes
      ctx.fillStyle = '#ff2255';
      ctx.fillRect(2, 0, 3, 3);
      ctx.fillRect(-5, 0, 3, 3);
    } else if (this.type === 'turret') {
      // 刺刺花苞 (Spiky pod turret)
      const pulse = Math.sin(this.animTimer * 4) * 2;

      // Stem/Base
      ctx.fillStyle = '#3a5f2d';
      ctx.fillRect(-6, 8, 12, 10);

      // Bud/Flower head
      ctx.fillStyle = '#d43f67';
      ctx.beginPath();
      ctx.arc(0, -2 + pulse, 14, 0, Math.PI * 2);
      ctx.fill();

      // Cannon Mouth
      ctx.fillStyle = '#61162c';
      ctx.beginPath();
      ctx.arc(8, -2 + pulse, 6, 0, Math.PI * 2);
      ctx.fill();

      // Spikes
      ctx.fillStyle = '#ffd152';
      ctx.beginPath();
      ctx.moveTo(0, -18 + pulse);
      ctx.lineTo(-6, -10 + pulse);
      ctx.lineTo(6, -10 + pulse);
      ctx.fill();
    }

    ctx.restore();
  }
}
