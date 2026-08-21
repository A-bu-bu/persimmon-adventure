// Main Game Lifecycle, Loop & State Machine
import { input } from './engine/input.js';
import { audio } from './engine/audio.js';
import { Camera } from './engine/camera.js';
import { particles } from './engine/particles.js';
import { saveManager } from './engine/saveManager.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { Boss } from './entities/boss.js';
import { Tilemap } from './world/tilemap.js';
import { LEVELS } from './world/levelData.js';
import {
  Collectible,
  SpringMushroom,
  LuckyPawPad,
  MovingPlatform,
  CrumblingPlatform,
  WarpPortal
} from './world/objects.js';
import { HUD } from './ui/hud.js';
import { initPWA } from './pwa.js';
import { PawStompGame } from './minigames/pawStompGame.js';
import { CatchCoinsGame } from './minigames/catchCoinsGame.js';

class Game {
  constructor() {
    console.log('[Game] Initializing Persimmon Adventure Engine...');
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Virtual Game Resolution (16:9 Aspect Ratio)
    this.virtualWidth = 960;
    this.virtualHeight = 540;
    this.canvas.width = this.virtualWidth;
    this.canvas.height = this.virtualHeight;

    this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'LEVEL_CLEAR', 'GAME_OVER', 'GAME_COMPLETE', 'MINIGAME'
    this.currentLevelIndex = 0;
    this.currentLevel = null;
    this.currentMiniGame = null;

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
    this.pawPads = [];
    this.movingPlatforms = [];
    this.crumblingPlatforms = [];
    this.portal = null;
    this.boss = null;

    this.lastTime = performance.now();
    this.setupWindowResize();
    this.bindUIEvents();
    this.bindCanvasInput();
    initPWA();

    this.updateStartMenuState();

    // Start loop
    requestAnimationFrame((t) => this.loop(t));
    console.log('[Game] Engine started successfully in state:', this.state);
  }

  setupWindowResize() {
    const resize = () => {
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

  bindCanvasInput() {
    const getCanvasPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.virtualWidth / rect.width;
      const scaleY = this.virtualHeight / rect.height;
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('click', (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame) {
        const pos = getCanvasPos(e);
        this.currentMiniGame.handleClick(pos.x, pos.y);
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame && this.currentMiniGame.handleMouseMove) {
        const pos = getCanvasPos(e);
        this.currentMiniGame.handleMouseMove(pos.x);
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame && this.currentMiniGame.handleMouseMove) {
        const pos = getCanvasPos(e);
        this.currentMiniGame.handleMouseMove(pos.x);
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame) {
        if (this.currentMiniGame.handleKeyDown) this.currentMiniGame.handleKeyDown(e.code);
        if (this.currentMiniGame.handleKey) this.currentMiniGame.handleKey(e.key);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame && this.currentMiniGame.handleKeyUp) {
        this.currentMiniGame.handleKeyUp(e.code);
      }
    });
  }

  updateStartMenuState() {
    const saveData = saveManager.data;
    const continueBtn = document.getElementById('btn-continue-game');
    const continueLvlNum = document.getElementById('continue-lvl-num');

    if (continueBtn && continueLvlNum) {
      if (saveData.highestLevel > 1) {
        continueBtn.style.display = 'block';
        continueLvlNum.textContent = saveData.currentLevel || saveData.highestLevel;
      } else {
        continueBtn.style.display = 'none';
      }
    }

    const pawScoreEl = document.getElementById('score-pawStomp');
    if (pawScoreEl) pawScoreEl.textContent = (saveData.miniGameScores && saveData.miniGameScores.pawStomp) || 0;

    const coinsScoreEl = document.getElementById('score-catchCoins');
    if (coinsScoreEl) coinsScoreEl.textContent = (saveData.miniGameScores && saveData.miniGameScores.catchCoins) || 0;
  }

  bindUIEvents() {
    // Start Game Button
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[UI] Start Game Clicked');
        audio.resume();
        this.startNewGame();
      });
    }

    // Continue Saved Game
    const continueBtn = document.getElementById('btn-continue-game');
    if (continueBtn) {
      continueBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[UI] Continue Game Clicked');
        audio.resume();
        const targetLvl = (saveManager.data.currentLevel || 1) - 1;
        this.loadLevel(Math.min(LEVELS.length - 1, Math.max(0, targetLvl)));
        this.setState('PLAYING');
      });
    }

    // Level Select Modal
    const levelSelectModal = document.getElementById('modal-level-select');
    document.getElementById('btn-open-level-select')?.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('[UI] Open Level Select Clicked');
      this.renderLevelSelectGrid();
      levelSelectModal.style.display = 'flex';
    });
    document.getElementById('btn-close-level-select')?.addEventListener('click', (e) => {
      e.preventDefault();
      levelSelectModal.style.display = 'none';
    });

    // Mini-Games Modal
    const minigamesModal = document.getElementById('modal-minigames');
    const openMiniGames = (e) => {
      if (e) e.preventDefault();
      console.log('[UI] Open Mini-Games Clicked');
      this.updateStartMenuState();
      minigamesModal.style.display = 'flex';
    };
    document.getElementById('btn-open-minigames')?.addEventListener('click', openMiniGames);
    document.getElementById('btn-open-minigames-top')?.addEventListener('click', openMiniGames);
    document.getElementById('btn-close-minigames')?.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      minigamesModal.style.display = 'none';
    });

    // Play Mini-Game Buttons
    document.querySelectorAll('.btn-play-minigame').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const gameId = e.currentTarget.getAttribute('data-game');
        console.log('[UI] Play Mini-Game Clicked:', gameId);
        minigamesModal.style.display = 'none';
        this.startMiniGame(gameId);
      });
    });

    // Instructions Modal
    const helpModal = document.getElementById('modal-help');
    document.getElementById('btn-how-to-play')?.addEventListener('click', (e) => {
      e.preventDefault();
      helpModal.style.display = 'flex';
    });
    document.getElementById('btn-close-help')?.addEventListener('click', (e) => {
      e.preventDefault();
      helpModal.style.display = 'none';
    });

    // Next Level Button
    document.getElementById('btn-next-level')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadNextLevel();
    });

    // Retry Level Button
    document.getElementById('btn-retry-level')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadLevel(this.currentLevelIndex);
      this.setState('PLAYING');
    });

    // Play Again (After Game Complete)
    document.getElementById('btn-play-again')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.startNewGame();
    });

    // Audio Mute Toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    soundBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const isMuted = audio.toggleMute();
      soundBtn.textContent = isMuted ? '🔇 音效: 關' : '🔊 音效: 開';
    });

    // Resume from Pause
    document.getElementById('btn-resume')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.togglePause();
    });

    // Return to Menu
    document.querySelectorAll('.btn-return-menu').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        audio.stopBGM();
        this.setState('MENU');
      });
    });

    // Toggle Touch Controls Button
    const touchToggleBtn = document.getElementById('btn-toggle-touch');
    const touchOverlay = document.getElementById('touch-controls');
    touchToggleBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (touchOverlay.style.display === 'none') {
        touchOverlay.style.display = 'block';
        touchToggleBtn.textContent = '🎮 觸控搖桿: 開';
      } else {
        touchOverlay.style.display = 'none';
        touchToggleBtn.textContent = '🎮 觸控搖桿: 關';
      }
    });

    // Auto-detect mobile devices
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || ('ontouchstart' in window);
    if (isMobile && touchOverlay) {
      touchOverlay.style.display = 'block';
      if (touchToggleBtn) touchToggleBtn.textContent = '🎮 觸控搖桿: 開';
    }
  }

  renderLevelSelectGrid() {
    const grid = document.getElementById('level-select-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const highestUnlocked = saveManager.data.highestLevel || 1;

    LEVELS.forEach((lvl, idx) => {
      const lvlNum = idx + 1;
      const isUnlocked = lvlNum <= highestUnlocked;

      const card = document.createElement('div');
      card.className = `level-card-btn ${isUnlocked ? '' : 'locked'}`;
      card.innerHTML = `
        <div class="level-card-num">${isUnlocked ? '第 ' + lvlNum + ' 關' : '🔒 鎖定'}</div>
        <div class="level-card-name">${lvl.name}</div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          document.getElementById('modal-level-select').style.display = 'none';
          audio.resume();
          this.loadLevel(idx);
          this.setState('PLAYING');
        });
      }

      grid.appendChild(card);
    });
  }

  startMiniGame(gameId) {
    audio.resume();
    audio.stopBGM();
    this.setState('MINIGAME');

    if (gameId === 'pawStomp') {
      audio.playBGM('orchard');
      this.currentMiniGame = new PawStompGame(this.canvas, () => this.exitMiniGame());
    } else if (gameId === 'catchCoins') {
      audio.playBGM('boss');
      this.currentMiniGame = new CatchCoinsGame(this.canvas, () => this.exitMiniGame());
    }
  }

  exitMiniGame() {
    this.currentMiniGame = null;
    this.setState('MENU');
    this.updateStartMenuState();
  }

  setState(newState) {
    this.state = newState;
    console.log('[Game] State changed to:', newState);

    // Hide all overlay modals
    document.querySelectorAll('.overlay-modal').forEach((modal) => {
      modal.style.display = 'none';
    });

    // Show active modal
    if (newState === 'MENU') {
      this.updateStartMenuState();
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

    saveManager.reachLevel(index);

    this.tilemap.loadLevel(this.currentLevel);
    this.camera.setBounds(0, 0, this.currentLevel.width * 32, this.currentLevel.height * 32);

    this.player.setHeroSprite(this.currentLevel.heroSprite || './assets/hero_transparent.png');

    this.player.reset(this.currentLevel.playerStart.x, this.currentLevel.playerStart.y);
    this.camera.follow(this.player);

    this.bullets = [];
    particles.clear();

    this.collectibles = (this.currentLevel.collectibles || []).map(
      (c) => new Collectible(c.x, c.y, c.type)
    );

    this.springs = (this.currentLevel.springs || []).map(
      (s) => new SpringMushroom(s.x, s.y, s.power)
    );

    this.pawPads = (this.currentLevel.pawPads || []).map(
      (p) => new LuckyPawPad(p.x, p.y, p.power)
    );

    this.movingPlatforms = (this.currentLevel.movingPlatforms || []).map(
      (p) => new MovingPlatform(p.x, p.y, p.width, p.height, p.moveX, p.moveY, p.speed)
    );

    this.crumblingPlatforms = (this.currentLevel.crumblingPlatforms || []).map(
      (c) => new CrumblingPlatform(c.x, c.y, c.width, c.height)
    );

    if (this.currentLevel.portal) {
      this.portal = new WarpPortal(this.currentLevel.portal.x, this.currentLevel.portal.y);
    } else {
      this.portal = null;
    }

    this.enemies = (this.currentLevel.enemies || []).map(
      (e) => new Enemy(e.x, e.y, e.type)
    );

    if (this.currentLevel.hasBoss) {
      this.boss = new Boss(
        this.currentLevel.bossStart.x,
        this.currentLevel.bossStart.y,
        this.currentLevel.bossOptions || {}
      );
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
    if (this.state === 'MINIGAME' && this.currentMiniGame) {
      this.currentMiniGame.update(dt);
      return;
    }

    input.update();

    if (input.justPressed('pause')) {
      this.togglePause();
      return;
    }

    if (this.state !== 'PLAYING') return;

    // 1. Update Platforms
    this.movingPlatforms.forEach((p) => p.update(dt));
    this.crumblingPlatforms.forEach((p) => p.update(dt, this.player));

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

    // 4. Update Enemies & Check Player Stomp (踩腳丫/踩怪)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this.player, this.tilemap, this.bullets, this.camera);

      // Player jump-stomp enemy from above
      if (
        e.active &&
        !this.player.isDead &&
        this.player.vy > 0 &&
        this.player.x + this.player.width > e.x &&
        this.player.x < e.x + e.width &&
        this.player.y + this.player.height >= e.y &&
        this.player.y + this.player.height <= e.y + 24
      ) {
        e.hurt(3, 0);
        this.player.vy = -540;
        audio.playJump();
        audio.playEnemyHit();
        particles.createExplosion(e.x + e.width / 2, e.y, 16, '#ffd700');
        this.player.addCoins(1, 150);
      }

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
              if (Math.random() < 0.6) {
                this.collectibles.push(
                  new Collectible(e.x, e.y, Math.random() < 0.2 ? 'heart' : 'persimmon')
                );
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
              this.player.score += this.boss.isFinalBoss ? 10000 : 5000;
              setTimeout(() => {
                if (this.currentLevelIndex + 1 < LEVELS.length) {
                  this.setState('LEVEL_CLEAR');
                } else {
                  this.setState('GAME_COMPLETE');
                }
              }, 2500);
            }
          }
        }
      }
    }

    // 5.5 Bullet vs Bullet Collision
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

    // 7. Update Springs, Lucky Paw Pads & Collectibles
    this.springs.forEach((s) => s.update(dt, this.player));
    this.pawPads.forEach((p) => p.update(dt, this.player));
    this.collectibles.forEach((c) => c.update(dt, this.player));

    // 8. Update Portal
    if (this.portal && (!this.boss || this.boss.isDead)) {
      this.portal.update(dt, this.player, () => {
        audio.playLevelClear();
        saveManager.updateScore(this.player.score, this.player.coins);
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

    if (this.state === 'MINIGAME' && this.currentMiniGame) {
      this.currentMiniGame.draw();
      return;
    }

    if (this.state === 'MENU') {
      this.tilemap.drawBackground(this.ctx, this.camera);
      particles.update(0.016);
      particles.draw(this.ctx);
      return;
    }

    // 1. Draw Parallax Background
    this.tilemap.drawBackground(this.ctx, this.camera);

    this.ctx.save();
    this.camera.apply(this.ctx);

    // 2. Draw World Tiles
    this.tilemap.drawTiles(this.ctx, this.camera);

    // 3. Draw Moving & Crumbling Platforms
    this.movingPlatforms.forEach((p) => p.draw(this.ctx));
    this.crumblingPlatforms.forEach((p) => p.draw(this.ctx));

    // 4. Draw Springs & Paw Pads
    this.springs.forEach((s) => s.draw(this.ctx));
    this.pawPads.forEach((p) => p.draw(this.ctx));

    // 5. Draw Collectibles
    this.collectibles.forEach((c) => c.draw(this.ctx));

    // 6. Draw Warp Portal
    if (this.portal && (!this.boss || this.boss.isDead)) {
      this.portal.draw(this.ctx);
    }

    // 7. Draw Enemies
    this.enemies.forEach((e) => e.draw(this.ctx));

    // 8. Draw Boss
    if (this.boss) {
      this.boss.draw(this.ctx);
    }

    // 9. Draw Bullets
    this.bullets.forEach((b) => b.draw(this.ctx));

    // 10. Draw Player
    this.player.draw(this.ctx);

    // 11. Draw Particle Effects
    particles.draw(this.ctx);

    this.ctx.restore();

    // 12. Draw In-Game HUD
    this.hud.draw(this.ctx, this.player, this.currentLevel, this.boss, this.camera);
  }

  // Main Loop
  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Robust Game Bootstrapper: Works whether DOM is loading or already loaded!
function initPersimmonAdventure() {
  if (!window.gameInstance) {
    window.gameInstance = new Game();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPersimmonAdventure);
} else {
  initPersimmonAdventure();
}
