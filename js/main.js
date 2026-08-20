// Main Game Lifecycle, Loop & State Machine
import { input } from './engine/input.js';
import { audio } from './engine/audio.js';
import { Camera } from './engine/camera.js';
import { particles } from './engine/particles.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { Boss } from './entities/boss.js';
import { Tilemap } from './world/tilemap.js';
import { LEVELS } from './world/levelData.js';
import { Collectible, SpringMushroom, MovingPlatform, CrumblingPlatform, WarpPortal } from './world/objects.js';
import { HUD } from './ui/hud.js';
import { initPWA } from './pwa.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Virtual Game Resolution (16:9 Aspect Ratio)
    this.virtualWidth = 960;
    this.virtualHeight = 540;
    this.canvas.width = this.virtualWidth;
    this.canvas.height = this.virtualHeight;

    this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'LEVEL_CLEAR', 'GAME_OVER', 'GAME_COMPLETE'
    this.currentLevelIndex = 0;
    this.currentLevel = null;

    // Subsystems
    this.camera = new Camera(this.virtualWidth, this.virtualHeight);
    this.tilemap = new Tilemap(32);
    this.hud = new HUD();
    this.player = new Player(100, 100);

    // Entity lists
    this.bullets = [];
    this.enemies = [];
    this.collectibles = [];
    this.springs = [];
    this.movingPlatforms = [];
    this.crumblingPlatforms = [];
    this.portal = null;
    this.boss = null;

    this.lastTime = performance.now();
    this.setupWindowResize();
    this.bindUIEvents();
    initPWA();

    // Start loop
    requestAnimationFrame((t) => this.loop(t));
  }

  setupWindowResize() {
    const resize = () => {
      const container = document.getElementById('game-container');
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      const scale = Math.min(winW / this.virtualWidth, winH / this.virtualHeight);
      const displayW = Math.floor(this.virtualWidth * scale);
      const displayH = Math.floor(this.virtualHeight * scale);

      this.canvas.style.width = `${displayW}px`;
      this.canvas.style.height = `${displayH}px`;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 100));
    resize();
  }

  bindUIEvents() {
    // Start Game Button
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      audio.resume();
      this.startNewGame();
    });

    // Instructions modal
    const helpModal = document.getElementById('modal-help');
    document.getElementById('btn-how-to-play')?.addEventListener('click', () => {
      helpModal.style.display = 'flex';
    });
    document.getElementById('btn-close-help')?.addEventListener('click', () => {
      helpModal.style.display = 'none';
    });

    // Next Level Button
    document.getElementById('btn-next-level')?.addEventListener('click', () => {
      this.loadNextLevel();
    });

    // Retry Level Button
    document.getElementById('btn-retry-level')?.addEventListener('click', () => {
      this.loadLevel(this.currentLevelIndex);
      this.setState('PLAYING');
    });

    // Play Again (After Game Complete)
    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.startNewGame();
    });

    // Audio Mute Toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    soundBtn?.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      soundBtn.textContent = isMuted ? '🔇 音效: 關' : '🔊 音效: 開';
    });

    // Resume from Pause
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.togglePause();
    });

    // Return to Menu from Pause/GameOver
    document.querySelectorAll('.btn-return-menu').forEach((btn) => {
      btn.addEventListener('click', () => {
        audio.stopBGM();
        this.setState('MENU');
      });
    });

    // Toggle Touch Controls Button
    const touchToggleBtn = document.getElementById('btn-toggle-touch');
    const touchOverlay = document.getElementById('touch-controls');
    touchToggleBtn?.addEventListener('click', () => {
      if (touchOverlay.style.display === 'none') {
        touchOverlay.style.display = 'block';
        touchToggleBtn.textContent = '🎮 觸控搖桿: 開';
      } else {
        touchOverlay.style.display = 'none';
        touchToggleBtn.textContent = '🎮 觸控搖桿: 關';
      }
    });

    // Auto-detect mobile devices to display touch controls
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || ('ontouchstart' in window);
    if (isMobile && touchOverlay) {
      touchOverlay.style.display = 'block';
      if (touchToggleBtn) touchToggleBtn.textContent = '🎮 觸控搖桿: 開';
    }
  }

  setState(newState) {
    this.state = newState;

    // Hide all overlay modals
    document.querySelectorAll('.overlay-modal').forEach((modal) => {
      modal.style.display = 'none';
    });

    // Show active modal
    if (newState === 'MENU') {
      document.getElementById('modal-start').style.display = 'flex';
      audio.playBGM('orchard');
    } else if (newState === 'PAUSED') {
      document.getElementById('modal-pause').style.display = 'flex';
    } else if (newState === 'LEVEL_CLEAR') {
      document.getElementById('modal-level-clear').style.display = 'flex';
      document.getElementById('level-clear-score').textContent = `本關累積得分: ${this.player.score}`;
      document.getElementById('level-clear-coins').textContent = `收集甜柿金幣: ${this.player.coins}`;
    } else if (newState === 'GAME_OVER') {
      document.getElementById('modal-game-over').style.display = 'flex';
    } else if (newState === 'GAME_COMPLETE') {
      document.getElementById('modal-game-complete').style.display = 'flex';
      document.getElementById('final-score-val').textContent = `最終總分: ${this.player.score}`;
      document.getElementById('final-coins-val').textContent = `總收集甜柿: ${this.player.coins}`;
    }
  }

  startNewGame() {
    this.currentLevelIndex = 0;
    this.player.score = 0;
    this.player.coins = 0;
    this.loadLevel(0);
    this.setState('PLAYING');
  }

  loadLevel(index) {
    this.currentLevelIndex = index;
    this.currentLevel = LEVELS[index];

    this.tilemap.loadLevel(this.currentLevel);
    this.camera.setBounds(0, 0, this.currentLevel.width * 32, this.currentLevel.height * 32);

    // Reset Player
    this.player.reset(this.currentLevel.playerStart.x, this.currentLevel.playerStart.y);
    this.camera.follow(this.player);

    // Clear and build entities
    this.bullets = [];
    particles.clear();

    // Build Collectibles
    this.collectibles = (this.currentLevel.collectibles || []).map(
      (c) => new Collectible(c.x, c.y, c.type)
    );

    // Springs
    this.springs = (this.currentLevel.springs || []).map(
      (s) => new SpringMushroom(s.x, s.y, s.power)
    );

    // Moving Platforms
    this.movingPlatforms = (this.currentLevel.movingPlatforms || []).map(
      (p) => new MovingPlatform(p.x, p.y, p.width, p.height, p.moveX, p.moveY, p.speed)
    );

    // Crumbling Platforms
    this.crumblingPlatforms = (this.currentLevel.crumblingPlatforms || []).map(
      (c) => new CrumblingPlatform(c.x, c.y, c.width, c.height)
    );

    // Portal
    if (this.currentLevel.portal) {
      this.portal = new WarpPortal(this.currentLevel.portal.x, this.currentLevel.portal.y);
    } else {
      this.portal = null;
    }

    // Enemies
    this.enemies = (this.currentLevel.enemies || []).map(
      (e) => new Enemy(e.x, e.y, e.type)
    );

    // Boss (Level 3)
    if (this.currentLevel.hasBoss) {
      this.boss = new Boss(this.currentLevel.bossStart.x, this.currentLevel.bossStart.y);
      audio.playBGM('boss');
    } else {
      this.boss = null;
      audio.playBGM(this.currentLevel.theme);
    }
  }

  loadNextLevel() {
    if (this.currentLevelIndex + 1 < LEVELS.length) {
      this.loadLevel(this.currentLevelIndex + 1);
      this.setState('PLAYING');
    } else {
      this.setState('GAME_COMPLETE');
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
    } else if (this.state === 'PAUSED') {
      this.setState('PLAYING');
    }
  }

  // --- GAME UPDATE & TICK ---
  update(dt) {
    input.update();

    if (input.justPressed('pause')) {
      this.togglePause();
      return;
    }

    if (this.state !== 'PLAYING') return;

    // 1. Update Platforms
    this.movingPlatforms.forEach((p) => p.update(dt));
    this.crumblingPlatforms.forEach((c) => c.update(dt));

    const activePlatforms = [...this.movingPlatforms, ...this.crumblingPlatforms];

    // 2. Update Player
    this.player.update(dt, input, this.tilemap, activePlatforms, this.bullets, this.camera);

    // If player died
    if (this.player.isDead && this.state === 'PLAYING') {
      setTimeout(() => {
        if (this.state === 'PLAYING') this.setState('GAME_OVER');
      }, 900);
    }

    // 3. Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.update(dt, this.tilemap);
      if (!b.active) {
        this.bullets.splice(i, 1);
      }
    }

    // 4. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this.player, this.tilemap, this.bullets, this.camera);

      // Bullet hit enemy
      for (const b of this.bullets) {
        if (b.isPlayer && b.active && e.active) {
          if (
            b.x < e.x + e.width &&
            b.x + b.width > e.x &&
            b.y < e.y + e.height &&
            b.y + b.height > e.y
          ) {
            e.hurt(b.damage, b.vx > 0 ? 150 : -150);
            b.pierce--;
            if (b.pierce <= 0) b.active = false;

            if (!e.active) {
              this.player.score += e.scoreVal;
              // Drop collectible chance
              if (Math.random() < 0.6) {
                this.collectibles.push(new Collectible(e.x, e.y, Math.random() < 0.2 ? 'heart' : 'persimmon'));
              }
            }
          }
        }
      }

      if (!e.active && e.hitTimer <= 0) {
        this.enemies.splice(i, 1);
      }
    }

    // 5. Update Boss
    if (this.boss) {
      this.boss.update(dt, this.player, this.tilemap, this.bullets, this.enemies, this.camera);

      // Bullet hit Boss
      for (const b of this.bullets) {
        if (b.isPlayer && b.active && this.boss.active) {
          if (
            b.x < this.boss.x + this.boss.width &&
            b.x + b.width > this.boss.x &&
            b.y < this.boss.y + this.boss.height &&
            b.y + b.height > this.boss.y
          ) {
            this.boss.hurt(b.damage);
            b.pierce--;
            if (b.pierce <= 0) b.active = false;

            if (this.boss.isDead) {
              this.player.score += 5000;
              setTimeout(() => {
                this.setState('GAME_COMPLETE');
              }, 2500);
            }
          }
        }
      }
    }

    // 5.5 Bullet vs Bullet Collision (Player can shoot down enemy red bullets!)
    for (const pb of this.bullets) {
      if (pb.isPlayer && pb.active) {
        for (const eb of this.bullets) {
          if (!eb.isPlayer && eb.active) {
            if (
              pb.x < eb.x + eb.width &&
              pb.x + pb.width > eb.x &&
              pb.y < eb.y + eb.height &&
              pb.y + pb.height > eb.y
            ) {
              eb.active = false;
              pb.pierce--;
              if (pb.pierce <= 0) pb.active = false;
              audio.playEnemyHit();
              particles.createHitSparks(eb.x + eb.width / 2, eb.y + eb.height / 2, 8, '#ff2a6d');
            }
          }
        }
      }
    }

    // 6. Update Bullets hitting Player
    for (const b of this.bullets) {
      if (!b.isPlayer && b.active && !this.player.isDead) {
        if (
          b.x < this.player.x + this.player.width &&
          b.x + b.width > this.player.x &&
          b.y < this.player.y + this.player.height &&
          b.y + b.height > this.player.y
        ) {
          this.player.hurt(b.damage, b.vx > 0 ? 180 : -180);
          b.active = false;
        }
      }
    }

    // 7. Update Springs & Collectibles
    this.springs.forEach((s) => s.update(dt, this.player));
    this.collectibles.forEach((c) => c.update(dt, this.player));

    // 8. Update Portal
    if (this.portal && (!this.boss || this.boss.isDead)) {
      this.portal.update(dt, this.player, () => {
        audio.playLevelClear();
        this.setState('LEVEL_CLEAR');
      });
    }

    // 9. Camera & Particles
    this.camera.update(dt);
    particles.update(dt);
  }

  // --- RENDER PIPELINE ---
  render() {
    this.ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);

    if (this.state === 'MENU') {
      // Draw pretty menu background with floating particles
      this.tilemap.drawBackground(this.ctx, this.camera);
      particles.update(0.016);
      particles.draw(this.ctx);
      return;
    }

    // 1. Draw Parallax Background
    this.tilemap.drawBackground(this.ctx, this.camera);

    // Apply Camera Transform
    this.camera.apply(this.ctx);

    // 2. Draw World Tiles
    this.tilemap.drawTiles(this.ctx, this.camera);

    // 3. Draw Moving & Crumbling Platforms
    this.movingPlatforms.forEach((p) => p.draw(this.ctx));
    this.crumblingPlatforms.forEach((c) => c.draw(this.ctx));

    // 4. Draw Springs & Collectibles
    this.springs.forEach((s) => s.draw(this.ctx));
    this.collectibles.forEach((c) => c.draw(this.ctx));

    // 5. Draw Exit Portal
    if (this.portal && (!this.boss || this.boss.isDead)) {
      this.portal.draw(this.ctx);
    }

    // 6. Draw Enemies & Boss
    this.enemies.forEach((e) => e.draw(this.ctx));
    if (this.boss) {
      this.boss.draw(this.ctx);
    }

    // 7. Draw Bullets
    this.bullets.forEach((b) => b.draw(this.ctx));

    // 8. Draw Player
    this.player.draw(this.ctx);

    // 9. Draw Particle Systems
    particles.draw(this.ctx);

    // Restore Camera Transform
    this.camera.restore(this.ctx);

    // 10. Draw Screen Space HUD
    if (this.currentLevel) {
      this.hud.draw(this.ctx, this.player, this.currentLevel, this.boss, this.camera);
    }
  }

  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Instantiate Game on DOM Loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
