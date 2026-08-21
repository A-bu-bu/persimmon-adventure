// Epic Boss Entity: 貪吃蟲魔王 (Aphid Titan)
import { Physics } from '../engine/physics.js';
import { particles } from '../engine/particles.js';
import { audio } from '../engine/audio.js';
import { Bullet } from './bullet.js';
import { Enemy } from './enemy.js';

export class Boss {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.name = options.name || '貪吃蟲魔王';
    this.isFinalBoss = options.isFinalBoss || false;
    this.maxHp = options.hp || 35;
    this.hp = this.maxHp;
    this.width = options.width || (this.isFinalBoss ? 110 : 90);
    this.height = options.height || (this.isFinalBoss ? 85 : 70);
    this.vx = 0;
    this.vy = 0;
    this.facing = -1;

    this.active = true;
    this.isDead = false;
    this.hitTimer = 0;
    this.animTimer = 0;

    // AI States: 'APPEAR', 'IDLE', 'CHARGE', 'JUMP_SLAM', 'BURST', 'SUMMON', 'ENRAGED_ROAR'
    this.state = 'APPEAR';
    this.stateTimer = 2.0;
    this.isEnraged = false;
    this.attackPatternIndex = 0;
    this.groundY = y;
  }

  hurt(damage = 1, knockbackX = 0) {
    if (this.isDead || this.state === 'APPEAR') return;

    this.hp -= damage;
    this.hitTimer = 0.15;
    audio.playBossHit();
    particles.createHitSparks(this.x + this.width / 2, this.y + this.height / 2, 10, '#ff9900');

    // Trigger Enrage Phase at 50% HP
    if (!this.isEnraged && this.hp <= this.maxHp * 0.5) {
      this.isEnraged = true;
      this.state = 'ENRAGED_ROAR';
      this.stateTimer = 1.8;
      audio.playBossHit();
      particles.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 30, '#ff2200');
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.active = false;
      audio.playLevelClear();
      particles.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 60, '#ffbb00');
    }
  }

  update(dt, player, tilemap, bullets, enemies, camera) {
    if (!this.active && !this.isDead) return;
    this.animTimer += dt;
    if (this.hitTimer > 0) this.hitTimer -= dt;

    if (this.isDead) {
      // Death death throes fireworks
      if (Math.random() < 0.2) {
        particles.createExplosion(
          this.x + Math.random() * this.width,
          this.y + Math.random() * this.height,
          10,
          '#ffaa00'
        );
      }
      return;
    }

    this.stateTimer -= dt;

    // Apply gravity
    this.vy += 850 * dt;
    this.y += this.vy * dt;
    this.x += this.vx * dt;

    // Resolve simple floor collision
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
    }

    // Facing direction follows player unless currently charging
    if (this.state !== 'CHARGE') {
      this.facing = player.x < this.x + this.width / 2 ? -1 : 1;
    }

    // --- BOSS AI STATE MACHINE ---
    const speedMultiplier = this.isEnraged ? 1.4 : 1.0;

    switch (this.state) {
      case 'APPEAR':
        if (this.stateTimer <= 0) {
          this.state = 'IDLE';
          this.stateTimer = 1.2;
        }
        break;

      case 'IDLE':
        this.vx *= 0.8;
        if (this.stateTimer <= 0) {
          const attacks = this.isEnraged
            ? ['CHARGE', 'JUMP_SLAM', 'BURST', 'SUMMON']
            : ['CHARGE', 'JUMP_SLAM', 'BURST'];
          this.state = attacks[this.attackPatternIndex % attacks.length];
          this.attackPatternIndex++;
          this.stateTimer = 1.5 / speedMultiplier;
        }
        break;

      case 'CHARGE':
        // Rush towards player's position
        this.vx = this.facing * 340 * speedMultiplier;
        if (Math.random() < 0.3) {
          particles.createDust(this.x + this.width / 2, this.y + this.height, 2);
        }
        if (this.stateTimer <= 0) {
          this.vx = 0;
          this.state = 'IDLE';
          this.stateTimer = 1.0 / speedMultiplier;
        }
        break;

      case 'JUMP_SLAM':
        // Jump high into air and slam down creating shockwaves
        if (this.stateTimer > 0.8 && this.y >= this.groundY) {
          this.vy = -540; // Jump
          this.vx = this.facing * 120;
          audio.playJump();
        } else if (this.y >= this.groundY && this.vy === 0 && this.stateTimer < 0.6) {
          // Landed & Slammed
          camera.shake(12, 0.4);
          audio.playBossHit();
          particles.createShockwave(this.x + this.width / 2, this.y + this.height, 70, '#ff5500');

          // Spawn dual shockwave bullets traveling left and right
          bullets.push(new Bullet(this.x - 10, this.y + this.height - 15, -260, 0, 0, false, 1));
          bullets.push(new Bullet(this.x + this.width + 10, this.y + this.height - 15, 260, 0, 0, false, 1));

          this.state = 'IDLE';
          this.stateTimer = 1.2 / speedMultiplier;
        }
        break;

      case 'BURST':
        // Fire needle spread (7-way if final boss, 5-way if regular boss)
        this.vx = 0;
        if (this.stateTimer <= 0.6 && this.stateTimer > 0.4) {
          const angles = this.isFinalBoss ? [-50, -32, -16, 0, 16, 32, 50] : [-40, -20, 0, 20, 40];
          for (let angleDeg of angles) {
            const rad = ((this.facing === 1 ? 0 : 180) + angleDeg) * (Math.PI / 180);
            const speed = (this.isFinalBoss ? 280 : 240) * speedMultiplier;
            bullets.push(
              new Bullet(
                this.x + this.width / 2,
                this.y + this.height / 2,
                Math.cos(rad) * speed,
                Math.sin(rad) * speed,
                0,
                false,
                1
              )
            );
          }
          audio.playShoot(0);
          particles.createHitSparks(this.x + this.width / 2, this.y + this.height / 2, 12, '#ff2a6d');
          this.state = 'IDLE';
          this.stateTimer = (this.isFinalBoss ? 0.7 : 1.0) / speedMultiplier;
        }
        break;

      case 'SUMMON':
        // Spawn minions to harass the player
        this.vx = 0;
        if (enemies.length < 6) {
          enemies.push(new Enemy(this.x + (Math.random() * 40 - 20), this.y - 40, 'flyer'));
          if (this.isFinalBoss) {
            enemies.push(new Enemy(this.x + (Math.random() * 40 - 20), this.y - 40, 'turret'));
          } else {
            enemies.push(new Enemy(this.x + (Math.random() * 40 - 20), this.y - 40, 'crawler'));
          }
        }
        audio.playEnemyDie();
        particles.createExplosion(this.x + this.width / 2, this.y, 15, '#7a3e8c');
        this.state = 'IDLE';
        this.stateTimer = 1.4;
        break;

      case 'ENRAGED_ROAR':
        this.vx = 0;
        camera.shake(8, 0.2);
        if (Math.random() < 0.3) {
          particles.createHitSparks(this.x + this.width / 2, this.y + this.height / 2, 4, '#ff1100');
        }
        if (this.stateTimer <= 0) {
          this.state = 'IDLE';
          this.stateTimer = 0.8;
        }
        break;
    }

    // Check collision with player
    if (Physics.checkAABB(this, player) && !player.isDead) {
      player.hurt(2, (player.x > this.x ? 1 : -1) * 300);
    }
  }

  draw(ctx) {
    if (!this.active && !this.isDead) return;
    ctx.save();

    // Hit flash or Enraged aura
    if (this.hitTimer > 0) {
      ctx.filter = 'brightness(2.2) contrast(1.5)';
    }

    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.facing, 1);

    const bodyColor = this.isFinalBoss
      ? (this.isEnraged ? '#800040' : '#4b1d6e')
      : (this.isEnraged ? '#c42020' : '#4f8c28');
    const highlightColor = this.isFinalBoss
      ? (this.isEnraged ? '#ff0077' : '#9c38d9')
      : (this.isEnraged ? '#ff5533' : '#8cd948');
    const eyeColor = this.isEnraged ? '#ffff00' : '#ff1155';

    // Giant Caterpillar / Beetle Armor Segments
    const breathe = Math.sin(this.animTimer * 6) * 3;

    // Final Boss Cosmic Aura Wings
    if (this.isFinalBoss) {
      ctx.save();
      const wingFlap = Math.sin(this.animTimer * 12) * 0.3;
      ctx.fillStyle = this.isEnraged ? 'rgba(255, 0, 100, 0.4)' : 'rgba(160, 60, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-15, -25 + breathe, 42, 18, -0.4 + wingFlap, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-5, -30 + breathe, 36, 14, -0.2 + wingFlap, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Tail / Rear Segments
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(-30, 8, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Middle Segment
    ctx.fillStyle = highlightColor;
    ctx.beginPath();
    ctx.ellipse(-10, 4 + breathe, 26, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spiky Shell Plates on back
    ctx.fillStyle = this.isFinalBoss ? '#ffcc00' : '#222';
    for (let i = -30; i <= 10; i += 15) {
      ctx.beginPath();
      ctx.moveTo(i, -12 + breathe);
      ctx.lineTo(i + 8, -26 + breathe);
      ctx.lineTo(i + 14, -12 + breathe);
      ctx.fill();
    }

    // Main Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(22, 0 + breathe, 24, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Final Boss Imperial Crown
    if (this.isFinalBoss) {
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(14, -20 + breathe);
      ctx.lineTo(18, -36 + breathe);
      ctx.lineTo(24, -24 + breathe);
      ctx.lineTo(30, -38 + breathe);
      ctx.lineTo(34, -20 + breathe);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Large Glowing Eyes
    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(32, -4 + breathe, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing Horn / Mandible
    ctx.fillStyle = this.isFinalBoss ? '#ff0055' : '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(36, 6 + breathe);
    ctx.lineTo(54, 2 + breathe);
    ctx.lineTo(38, -6 + breathe);
    ctx.fill();

    ctx.restore();
  }
}
