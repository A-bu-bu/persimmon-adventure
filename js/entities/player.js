// Player Entity: The Persimmon Hero (柿子小勇士)
import { Physics } from '../engine/physics.js';
import { particles } from '../engine/particles.js';
import { audio } from '../engine/audio.js';
import { Bullet } from './bullet.js';

export class Player {
  constructor(x = 100, y = 100) {
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 54;
    this.vx = 0;
    this.vy = 0;

    // Movement tuning
    this.moveSpeed = 270;
    this.accel = 1600;
    this.friction = 1600;
    this.gravity = 880;
    this.jumpForce = -540; // 強力跳躍！
    this.maxFallSpeed = 600;

    // States & Timers
    this.grounded = false;
    this.wasGrounded = false;
    this.facing = 1; // 1: right, -1: left
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.maxJumps = 2; // 支援二段跳！
    this.jumpsLeft = 2;
    this.isWallLeft = false;
    this.isWallRight = false;
    this.isWallSliding = false;

    // Dash
    this.canDash = true;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.18;
    this.dashSpeed = 580;
    this.dashCooldown = 0.55;
    this.dashCooldownTimer = 0;

    // Combat & Weapons
    this.weapon = 0; // 0: Normal Seed, 1: Spread Tri-Shot, 2: Mega Blast
    this.shootCooldownTimer = 0;
    this.chargeTimer = 0;
    this.maxChargeTime = 0.75;
    this.isCharging = false;

    // Health & Score
    this.maxHp = 5;
    this.hp = 5;
    this.energy = 100;
    this.maxEnergy = 100;
    this.invulnerableTimer = 0;
    this.coins = 0;
    this.score = 0;
    this.isDead = false;

    // Procedural Animation parameters
    this.runAnimTimer = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.dropThrough = false;

    // Hero Sprite Image
    this.spriteSrc = './assets/hero_transparent.png';
    this.sprite = new Image();
    this.sprite.src = this.spriteSrc;
    this.spriteLoaded = false;
    this.sprite.onload = () => {
      this.spriteLoaded = true;
    };
  }

  setHeroSprite(src) {
    if (this.spriteSrc === src) return;
    this.spriteSrc = src;
    this.spriteLoaded = false;
    this.sprite = new Image();
    this.sprite.src = src;
    this.sprite.onload = () => {
      this.spriteLoaded = true;
    };
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.energy = this.maxEnergy;
    this.isDead = false;
    this.invulnerableTimer = 0;
    this.isDashing = false;
    this.dashCooldownTimer = 0;
    this.jumpsLeft = this.maxJumps;
  }

  hurt(damage = 1, knockbackX = 0) {
    if (this.invulnerableTimer > 0 || this.isDashing || this.isDead) return;

    this.hp -= damage;
    this.invulnerableTimer = 1.2;
    this.vy = -220;
    this.vx = knockbackX || -this.facing * 180;
    audio.playHurt();
    particles.createHitSparks(this.x + this.width / 2, this.y + this.height / 2, 12, '#ff4444');

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      audio.playGameOver();
      particles.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 30, '#ff7700');
    }
  }

  heal(amount = 1) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    audio.playPowerup();
    particles.createCoinSparkle(this.x + this.width / 2, this.y + this.height / 2);
  }

  addCoins(amount = 1, scoreVal = 100) {
    this.coins += amount;
    this.score += scoreVal;
    this.energy = Math.min(this.maxEnergy, this.energy + amount * 5);
    audio.playCoin();
    particles.createCoinSparkle(this.x + this.width / 2, this.y + this.height / 2);
  }

  switchNextWeapon() {
    this.weapon = (this.weapon + 1) % 3;
    audio.playPowerup();
  }

  update(dt, input, tilemap, platforms, bullets, camera) {
    if (this.isDead) return;

    // Reset wall detection flags for this frame
    this.isWallLeft = false;
    this.isWallRight = false;

    // Energy regeneration
    this.energy = Math.min(this.maxEnergy, this.energy + dt * 4);

    // Update timers
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
    if (this.shootCooldownTimer > 0) this.shootCooldownTimer -= dt;

    // Squash & Stretch Recovery
    this.scaleX += (1 - this.scaleX) * 12 * dt;
    this.scaleY += (1 - this.scaleY) * 12 * dt;

    // --- WEAPON SWITCHING ---
    if (input.justPressed('switchWeapon')) {
      this.switchNextWeapon();
    }

    // --- DASH SYSTEM ---
    if (input.justPressed('dash') && this.dashCooldownTimer <= 0 && !this.isDashing && this.energy >= 15) {
      this.isDashing = true;
      this.dashTimer = this.dashDuration;
      this.dashCooldownTimer = this.dashCooldown;
      this.energy -= 15;
      this.vy = 0; // Freeze gravity during dash
      this.vx = this.facing * this.dashSpeed;
      this.scaleX = 1.35;
      this.scaleY = 0.75;
      audio.playDash();
      camera.shake(4, 0.15);
      particles.createLeaves(this.x + this.width / 2, this.y + this.height / 2, 4);
    }

    if (this.isDashing) {
      this.dashTimer -= dt;
      // Spawn dash ghost trails
      if (Math.random() < 0.6 && this.spriteLoaded) {
        particles.createGhostTrail(
          this.sprite,
          this.x - 10,
          this.y - 12,
          this.width + 20,
          this.height + 20,
          this.facing,
          0.6
        );
      }
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx = this.facing * this.moveSpeed;
      }
    }

    // --- COYOTE TIME & JUMP BUFFER ---
    if (this.grounded) {
      this.coyoteTimer = 0.12;
    } else {
      this.coyoteTimer -= dt;
    }

    if (input.justPressed('jump')) {
      this.jumpBufferTimer = 0.12;
    } else {
      this.jumpBufferTimer -= dt;
    }

    // Drop through one-way platform if holding Down + Jump
    if (input.isDown('down') && input.justPressed('jump')) {
      this.dropThrough = true;
      setTimeout(() => { this.dropThrough = false; }, 200);
    }

    // --- HORIZONTAL MOVEMENT ---
    if (!this.isDashing) {
      let moveDir = 0;
      if (input.isDown('left')) moveDir -= 1;
      if (input.isDown('right')) moveDir += 1;

      if (moveDir !== 0) {
        this.facing = moveDir;
        this.vx += moveDir * this.accel * dt;
        if (Math.abs(this.vx) > this.moveSpeed) {
          this.vx = moveDir * this.moveSpeed;
        }
        this.runAnimTimer += dt * 12;
        if (this.grounded && Math.random() < 0.15) {
          particles.createDust(this.x + this.width / 2, this.y + this.height, 1);
        }
      } else {
        // Apply friction
        if (this.vx > 0) {
          this.vx = Math.max(0, this.vx - this.friction * dt);
        } else if (this.vx < 0) {
          this.vx = Math.min(0, this.vx + this.friction * dt);
        }
        this.runAnimTimer = 0;
      }
    }

    // --- WALL SLIDING & WALL JUMP ---
    this.isWallSliding = false;
    if (!this.grounded && !this.isDashing) {
      if ((this.isWallLeft && input.isDown('left')) || (this.isWallRight && input.isDown('right'))) {
        if (this.vy > 0) {
          this.isWallSliding = true;
          this.vy = Math.min(this.vy, 110); // Wall slide friction
          if (Math.random() < 0.2) {
            particles.createDust(this.isWallLeft ? this.x : this.x + this.width, this.y + this.height / 2, 1);
          }
        }
      }
    }

    // --- JUMP EXECUTION ---
    if (this.jumpBufferTimer > 0) {
      if (this.coyoteTimer > 0) {
        // Ground Jump
        this.vy = this.jumpForce;
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;
        this.jumpsLeft = 1; // Used ground jump, 1 air jump remains
        this.scaleX = 0.75;
        this.scaleY = 1.35;
        audio.playJump();
        particles.createDust(this.x + this.width / 2, this.y + this.height, 4);
      } else if (this.isWallSliding || this.isWallLeft || this.isWallRight) {
        // Wall Jump
        const wallDir = this.isWallLeft ? 1 : -1;
        this.vx = wallDir * this.moveSpeed * 1.1;
        this.vy = this.jumpForce * 0.95;
        this.facing = wallDir;
        this.jumpBufferTimer = 0;
        this.jumpsLeft = 1;
        this.scaleX = 0.8;
        this.scaleY = 1.25;
        audio.playJump();
        particles.createDust(this.x + this.width / 2, this.y + this.height / 2, 4);
      } else if (this.jumpsLeft > 0) {
        // Air Double Jump! (二段跳)
        this.vy = this.jumpForce * 0.98;
        this.jumpsLeft = 0;
        this.jumpBufferTimer = 0;
        this.scaleX = 0.7;
        this.scaleY = 1.4;
        audio.playJump();
        particles.createLeaves(this.x + this.width / 2, this.y + this.height, 8);
        particles.createCoinSparkle(this.x + this.width / 2, this.y + this.height / 2);
      }
    }

    // Variable Jump (Release jump early to cut height smoothly)
    if (input.justReleased('jump') && this.vy < -200) {
      this.vy *= 0.6;
    }

    // Apply Gravity
    if (!this.isDashing) {
      this.vy = Math.min(this.maxFallSpeed, this.vy + this.gravity * dt);
    }

    // --- PHYSICS & COLLISION RESOLUTION ---
    this.wasGrounded = this.grounded;
    Physics.resolveTilemapCollisions(this, tilemap, dt);
    Physics.resolvePlatformObjects(this, platforms, dt);

    // Landing feedback (Squash & Refresh Jumps)
    if (this.grounded) {
      this.jumpsLeft = this.maxJumps;
    }
    if (!this.wasGrounded && this.grounded) {
      this.scaleX = 1.25;
      this.scaleY = 0.8;
      particles.createDust(this.x + this.width / 2, this.y + this.height, 3);
    }

    // Check Map Fall Death
    if (this.y > tilemap.height * tilemap.tileSize + 100) {
      this.hurt(5);
    }

    // --- SHOOTING & WEAPONS ---
    this.handleCombat(dt, input, bullets, camera);
  }

  handleCombat(dt, input, bullets, camera) {
    if (this.weapon === 2) {
      // Weapon 2: Charged Mega Blast
      if (input.isDown('shoot')) {
        this.isCharging = true;
        this.chargeTimer += dt;
        if (Math.random() < 0.25) {
          particles.createCoinSparkle(this.x + this.width / 2 + this.facing * 20, this.y + this.height / 2);
        }
      } else if (input.justReleased('shoot') || (!input.isDown('shoot') && this.isCharging)) {
        if (this.chargeTimer >= this.maxChargeTime && this.energy >= 25) {
          // Fire Mega Blast!
          const spawnX = this.x + (this.facing > 0 ? this.width + 4 : -28);
          const spawnY = this.y + this.height / 2 - 12;
          bullets.push(new Bullet(spawnX, spawnY, this.facing * 420, 0, 2, true, 4));
          this.energy -= 25;
          audio.playShoot(2);
          camera.shake(6, 0.2);
          particles.createShockwave(spawnX, spawnY, 30);
        } else if (this.chargeTimer >= 0.15) {
          // Fired uncharged single shot
          const spawnX = this.x + (this.facing > 0 ? this.width + 2 : -14);
          const spawnY = this.y + this.height / 2 - 5;
          bullets.push(new Bullet(spawnX, spawnY, this.facing * 480, 0, 0, true, 1));
          audio.playShoot(0);
        }
        this.chargeTimer = 0;
        this.isCharging = false;
      }
    } else {
      // Weapon 0 & 1: Normal and Spread
      this.isCharging = false;
      this.chargeTimer = 0;

      if (input.isDown('shoot') && this.shootCooldownTimer <= 0) {
        if (this.weapon === 0) {
          // Weapon 0: Normal Seed Shot
          this.shootCooldownTimer = 0.22;
          const spawnX = this.x + (this.facing > 0 ? this.width + 2 : -14);
          const spawnY = this.y + this.height / 2 - 5;
          bullets.push(new Bullet(spawnX, spawnY, this.facing * 520, 0, 0, true, 1));
          audio.playShoot(0);
        } else if (this.weapon === 1 && this.energy >= 8) {
          // Weapon 1: Spread Tri-Shot
          this.shootCooldownTimer = 0.35;
          this.energy -= 8;
          const spawnX = this.x + (this.facing > 0 ? this.width + 2 : -12);
          const spawnY = this.y + this.height / 2 - 4;
          const speed = 480;
          bullets.push(new Bullet(spawnX, spawnY, this.facing * speed, 0, 1, true, 1));
          bullets.push(new Bullet(spawnX, spawnY, this.facing * speed * 0.95, -80, 1, true, 1));
          bullets.push(new Bullet(spawnX, spawnY, this.facing * speed * 0.95, 80, 1, true, 1));
          audio.playShoot(1);
          camera.shake(2, 0.1);
        }
      }
    }
  }

  draw(ctx) {
    if (this.isDead) return;

    // Flash when invulnerable
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer * 20) % 2 === 0) {
      return;
    }

    ctx.save();

    // Procedural Running Bobbing & Persimmon Wobble
    let bobY = 0;
    let tiltAngle = 0;
    if (this.grounded && Math.abs(this.vx) > 20) {
      bobY = Math.sin(this.runAnimTimer) * 4;
      tiltAngle = this.facing * 0.08 + Math.sin(this.runAnimTimer) * 0.05;
    } else if (!this.grounded) {
      tiltAngle = this.facing * 0.06;
    }

    ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + bobY);
    ctx.scale(this.facing * this.scaleX, this.scaleY);
    ctx.rotate(tiltAngle);

    // Draw Charge Aura if holding mega shot
    if (this.isCharging && this.chargeTimer > 0.2) {
      const chargeRatio = Math.min(1.0, this.chargeTimer / this.maxChargeTime);
      ctx.strokeStyle = chargeRatio >= 1.0 ? '#ffea00' : 'rgba(255, 120, 0, 0.7)';
      ctx.lineWidth = 3 + Math.sin(Date.now() * 0.02) * 2;
      ctx.beginPath();
      ctx.arc(0, 0, 32 + chargeRatio * 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.spriteLoaded) {
      // Draw Hero Sprite
      // The hero is carrying the persimmon on the back!
      const drawW = 62;
      const drawH = 62;
      ctx.drawImage(
        this.sprite,
        -drawW / 2,
        -drawH / 2 - 4,
        drawW,
        drawH
      );
    } else {
      // Fallback procedural canvas render
      // Big Persimmon on back
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.arc(-8, -4, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7ac943';
      ctx.beginPath();
      ctx.arc(-8, -18, 6, 0, Math.PI * 2);
      ctx.fill();

      // Cute Little Body & Head
      ctx.fillStyle = '#f5e6ca';
      ctx.fillRect(0, -10, 16, 26);
      ctx.fillStyle = '#7ac943';
      ctx.fillRect(0, -16, 16, 8); // Green cap
      ctx.fillStyle = '#333';
      ctx.fillRect(8, -6, 4, 6); // Eye
    }

    ctx.restore();
  }
}
