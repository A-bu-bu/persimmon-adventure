// Main Game Lifecycle, Loop & State Machine with 10 Mini-Games
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

// 10 Mini-Games
import { PawStompGame } from './minigames/pawStompGame.js';
import { CatchCoinsGame } from './minigames/catchCoinsGame.js';
import { WhackMoleGame } from './minigames/whackMoleGame.js';
import { ShootingGalleryGame } from './minigames/shootingGalleryGame.js';
import { CloudGliderGame } from './minigames/cloudGliderGame.js';
import { BossParryGame } from './minigames/bossParryGame.js';
import { RiverRaftGame } from './minigames/riverRaftGame.js';
import { NightMarketGame } from './minigames/nightMarketGame.js';
import { IceGliderGame } from './minigames/iceGliderGame.js';
import { RhythmParryGame } from './minigames/rhythmParryGame.js';

class Game {
  constructor() {
    console.log('[Game] Initializing Persimmon Adventure with 10 Unique Mini-Games...');
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
    console.log('[Game] Engine started successfully! Active User:', saveManager.currentUsername);
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
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const handleAction = (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame) {
        const pos = getCanvasPos(e);
        if (this.currentMiniGame.handleClick) {
          this.currentMiniGame.handleClick(pos.x, pos.y);
        }
      }
    };

    this.canvas.addEventListener('click', handleAction);
    this.canvas.addEventListener('touchstart', (e) => {
      handleAction(e);
    }, { passive: true });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame && this.currentMiniGame.handleMouseMove) {
        const pos = getCanvasPos(e);
        this.currentMiniGame.handleMouseMove(pos.x, pos.y);
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame && this.currentMiniGame.handleMouseMove) {
        const pos = getCanvasPos(e);
        this.currentMiniGame.handleMouseMove(pos.x, pos.y);
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame && this.currentMiniGame.handleKeyDown) {
        this.currentMiniGame.handleKeyDown(e.code);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.state === 'MINIGAME' && this.currentMiniGame && this.currentMiniGame.handleKeyUp) {
        this.currentMiniGame.handleKeyUp(e.code);
      }
    });
  }

  updateStartMenuState() {
    const p = saveManager.data;
    const uname = saveManager.currentUsername || '背柿小勇士';

    const accountBarName = document.getElementById('account-bar-username');
    if (accountBarName) accountBarName.textContent = uname;

    const accountBarCoins = document.getElementById('account-bar-coins');
    if (accountBarCoins) accountBarCoins.textContent = `$${p.totalCoins || 0}`;

    const accountBarLevel = document.getElementById('account-bar-level');
    if (accountBarLevel) accountBarLevel.textContent = `第 ${p.highestLevel || 1} 關`;

    const userBadge = document.getElementById('current-user-badge');
    if (userBadge) {
      userBadge.innerHTML = `👤 當前帳號：<b>${uname}</b> (已到第 ${p.highestLevel || 1} 關 | 總資產: $${p.totalCoins || 0})`;
    }

    const btnResume = document.getElementById('btn-resume-game');
    if (btnResume) {
      if (p.highestLevel > 1 || (p.levelScores && Object.keys(p.levelScores).some(k => p.levelScores[k] > 0))) {
        btnResume.style.display = 'inline-block';
        btnResume.textContent = `▶ 繼續冒險 (第 ${p.highestLevel || 1} 關)`;
      } else {
        btnResume.style.display = 'none';
      }
    }
  }

  bindUIEvents() {
    // 1. Account Button -> Show Login Modal
    document.getElementById('btn-account-switch')?.addEventListener('click', (e) => {
      e.preventDefault();
      audio.resume();
      this.openLoginModal();
    });

    // Top-bar Account Button
    document.getElementById('btn-top-account')?.addEventListener('click', (e) => {
      e.preventDefault();
      audio.resume();
      this.openLoginModal();
    });

    // 2. Profile Stats Modal
    document.getElementById('btn-profile-stats')?.addEventListener('click', (e) => {
      e.preventDefault();
      audio.resume();
      this.openProfileModal();
    });

    document.getElementById('btn-profile-stats-menu')?.addEventListener('click', (e) => {
      e.preventDefault();
      audio.resume();
      this.openProfileModal();
    });

    document.getElementById('btn-close-profile')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('modal-profile').style.display = 'none';
    });

    // 3. Login Modal Actions
    document.getElementById('btn-do-login')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleLoginSubmit();
    });

    document.getElementById('login-username-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleLoginSubmit();
      }
    });

    document.getElementById('btn-close-login')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('modal-login').style.display = 'none';
    });

    // 4. Start Game Buttons
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      audio.resume();
      this.startNewGame();
    });

    document.getElementById('btn-resume-game')?.addEventListener('click', () => {
      audio.resume();
      const resumeLvl = Math.max(0, (saveManager.data.highestLevel || 1) - 1);
      this.loadLevel(resumeLvl);
      this.setState('PLAYING');
    });

    // 5. Level Select Modal
    document.getElementById('btn-level-select')?.addEventListener('click', () => {
      audio.resume();
      this.renderLevelSelectGrid();
      document.getElementById('modal-level-select').style.display = 'flex';
    });

    document.getElementById('btn-close-level-select')?.addEventListener('click', () => {
      document.getElementById('modal-level-select').style.display = 'none';
    });

    // 6. Mini Games Modal
    const openMiniGames = () => {
      audio.resume();
      this.renderMiniGamesModal();
      document.getElementById('modal-minigames').style.display = 'flex';
    };
    document.getElementById('btn-minigames')?.addEventListener('click', openMiniGames);
    document.getElementById('btn-minigames-menu')?.addEventListener('click', openMiniGames);

    document.getElementById('btn-close-minigames')?.addEventListener('click', () => {
      document.getElementById('modal-minigames').style.display = 'none';
    });

    // 7. How to Play Modal
    document.getElementById('btn-how-to-play')?.addEventListener('click', () => {
      audio.resume();
      document.getElementById('modal-help').style.display = 'flex';
    });

    document.getElementById('btn-close-help')?.addEventListener('click', () => {
      document.getElementById('modal-help').style.display = 'none';
    });

    // 8. In-Game Modals
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.setState('PLAYING');
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.loadLevel(this.currentLevelIndex);
      this.setState('PLAYING');
    });

    document.getElementById('btn-retry-game')?.addEventListener('click', () => {
      this.loadLevel(this.currentLevelIndex);
      this.setState('PLAYING');
    });

    document.getElementById('btn-next-level')?.addEventListener('click', () => {
      this.loadNextLevel();
    });

    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.startNewGame();
    });

    document.querySelectorAll('.btn-quit-to-menu').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setState('MENU');
      });
    });

    // Top Bar Touch, Sound & Fullscreen
    document.getElementById('btn-toggle-touch')?.addEventListener('click', () => {
      const touchEl = document.getElementById('touch-controls');
      const btn = document.getElementById('btn-toggle-touch');
      if (touchEl) {
        const isHidden = touchEl.style.display === 'none';
        touchEl.style.display = isHidden ? 'flex' : 'none';
        if (btn) btn.textContent = isHidden ? '🎮 觸控搖桿: 開' : '🎮 觸控搖桿: 關';
      }
    });

    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      document.getElementById('btn-toggle-sound').textContent = isMuted ? '🔇 靜音' : '🔊 音效';
    });

    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  openLoginModal() {
    this.renderAccountList();
    const inputEl = document.getElementById('login-username-input');
    if (inputEl) inputEl.value = '';
    document.getElementById('modal-login').style.display = 'flex';
    setTimeout(() => inputEl?.focus(), 100);
  }

  renderAccountList() {
    const container = document.getElementById('account-history-list');
    if (!container) return;
    container.innerHTML = '';

    const users = saveManager.getAllUsers();
    users.forEach((u) => {
      const isCurrent = u.username === saveManager.currentUsername;
      const item = document.createElement('div');
      item.className = `account-item ${isCurrent ? 'active' : ''}`;
      item.innerHTML = `
        <div class="account-item-info">
          <span class="name">👤 ${u.username} ${isCurrent ? '<span style="color: #ffd700; font-size: 11px;">(當前使用)</span>' : ''}</span>
          <span class="badge">已到第 ${u.highestLevel} 關 | 總資產: $${u.totalCoins}</span>
        </div>
        <div class="account-item-actions">
          ${!isCurrent ? `<button class="secondary-btn btn-switch-user" data-user="${u.username}" style="padding: 4px 10px; font-size: 12px;">切換</button>` : ''}
          <button class="secondary-btn btn-del-user" data-user="${u.username}" style="padding: 4px 8px; font-size: 12px; color: #ff5722;">✖</button>
        </div>
      `;

      item.querySelector('.btn-switch-user')?.addEventListener('click', (e) => {
        e.preventDefault();
        saveManager.login(u.username);
        this.updateStartMenuState();
        this.renderAccountList();
        document.getElementById('modal-login').style.display = 'none';
      });

      item.querySelector('.btn-del-user')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm(`確定要刪除帳號「${u.username}」的遊戲存檔紀錄嗎？`)) {
          saveManager.deleteUser(u.username);
          this.updateStartMenuState();
          this.renderAccountList();
        }
      });

      container.appendChild(item);
    });
  }

  handleLoginSubmit() {
    const inputEl = document.getElementById('login-username-input');
    const name = (inputEl?.value || '').trim();
    if (!name) {
      alert('請輸入您的帳號名稱！');
      return;
    }
    saveManager.login(name);
    this.updateStartMenuState();
    document.getElementById('modal-login').style.display = 'none';
  }

  openProfileModal() {
    this.renderProfileStats();
    document.getElementById('modal-profile').style.display = 'flex';
  }

  getMiniGamesList() {
    const highestUnlocked = saveManager.data.highestLevel || 1;
    const isClearedAll = saveManager.data.gameCompleted || highestUnlocked > 10;

    return [
      {
        id: 'pawStomp',
        name: '🐾 神速踩腳丫大對決',
        desc: '6隻萌貓腳爪快節奏伸出！限時精準點擊踩中爪墊，比比誰的反應最快！',
        unlockCondition: '通關第 1 關',
        isUnlocked: highestUnlocked >= 2,
        scoreKey: 'pawStomp',
        unit: '分'
      },
      {
        id: 'catchCoins',
        name: '💰 天降財神接金鈔',
        desc: '左右移動金柿寶籃，接住漫天掉落的柿金幣與大金元寶，小心躲避毒黑菇！',
        unlockCondition: '通關第 2 關',
        isUnlocked: highestUnlocked >= 3,
        scoreKey: 'catchCoins',
        unit: '元'
      },
      {
        id: 'whackMole',
        name: '🔨 果園保衛打地鼠',
        desc: '9處地洞冒出貪吃毛毛蟲、紫飛蟲與黃金福柿，敲擊害蟲守衛果園！',
        unlockCondition: '通關第 3 關',
        isUnlocked: highestUnlocked >= 4,
        scoreKey: 'whackMole',
        unit: '分'
      },
      {
        id: 'shootingGallery',
        name: '🎯 柿界神射手靶場',
        desc: '多軌道移動飛行標靶、幽浮與彩虹柿，考驗預判彈道與連射技巧！',
        unlockCondition: '通關第 4 關',
        isUnlocked: highestUnlocked >= 5,
        scoreKey: 'shootingGallery',
        unit: '分'
      },
      {
        id: 'cloudGlider',
        name: '🪂 雲霄無盡滑翔傘',
        desc: '萬米高空降落傘滑翔俯衝，避開雷雲閃電，穿過彩虹環收集滿天金幣！',
        unlockCondition: '通關第 5 關',
        isUnlocked: highestUnlocked >= 6,
        scoreKey: 'cloudGlider',
        unit: '分'
      },
      {
        id: 'bossParry',
        name: '🥋 真魔王彈刀大對決',
        desc: '極限節奏格擋！在魔王暗黑彈幕到達面前瞬間揮劍「完美彈刀」反彈轟殺！',
        unlockCondition: '通關第 6 關',
        isUnlocked: highestUnlocked >= 7,
        scoreKey: 'bossParry',
        unit: '分'
      },
      {
        id: 'riverRaft',
        name: '🌊 激流接柿・大溯源',
        desc: '乘木筏在湍急河流上左右靈活穿梭，接住落下的鮮柿與金錠，閃避落石漂流木！',
        unlockCondition: '通關第 7 關',
        isUnlocked: highestUnlocked >= 8,
        scoreKey: 'riverRaft',
        unit: '分'
      },
      {
        id: 'nightMarket',
        name: '🌙 夜市大胃王闖關',
        desc: '夜市攤位美食大爆發！快速點選關東煮、臭豆腐、蚵仔煎餵飽排隊客人！',
        unlockCondition: '通關第 8 關',
        isUnlocked: highestUnlocked >= 9,
        scoreKey: 'nightMarket',
        unit: '分'
      },
      {
        id: 'iceGlider',
        name: '❄️ 冰上大滑行大逃脫',
        desc: '滑溜冰道急速滑行！考驗慣性控制，左右滑移躲避冰裂縫、冰柱與雪崩巨石！',
        unlockCondition: '通關第 9 關',
        isUnlocked: highestUnlocked >= 10,
        scoreKey: 'iceGlider',
        unit: '分'
      },
      {
        id: 'rhythmParry',
        name: '🌋 終極魔王節奏彈刀',
        desc: '混沌滅世魔皇終極挑戰！跟隨節奏光圈完美格擋連段反擊，打出致命反彈！',
        unlockCondition: '通關第 10 關',
        isUnlocked: isClearedAll,
        scoreKey: 'rhythmParry',
        unit: '分'
      }
    ];
  }

  renderMiniGamesModal() {
    const container = document.getElementById('minigames-modal-list');
    if (!container) return;
    container.innerHTML = '';

    const minigames = this.getMiniGamesList();
    minigames.forEach((mg) => {
      const highScore = (saveManager.data.miniGameScores && saveManager.data.miniGameScores[mg.scoreKey]) || 0;
      const card = document.createElement('div');
      card.className = `minigame-card ${mg.isUnlocked ? '' : 'locked'}`;
      card.style.opacity = mg.isUnlocked ? '1' : '0.6';
      card.innerHTML = `
        <div class="minigame-icon">${mg.name.slice(0, 2)}</div>
        <div class="minigame-info">
          <h3>${mg.name} ${mg.isUnlocked ? '🌟' : '🔒'}</h3>
          <p>${mg.desc}</p>
          <div class="minigame-meta">
            ${mg.isUnlocked ? `最高紀錄: ${highScore} ${mg.unit}` : `🔒 ${mg.unlockCondition}即可解鎖！`}
          </div>
        </div>
        <button class="primary-btn btn-play-minigame" data-game="${mg.id}" style="padding: 8px 16px; font-size: 13px; flex-shrink: 0; ${mg.isUnlocked ? '' : 'opacity: 0.5; cursor: not-allowed;'}" ${mg.isUnlocked ? '' : 'disabled'}>
          ${mg.isUnlocked ? '挑戰 ➔' : '🔒 未解鎖'}
        </button>
      `;

      if (mg.isUnlocked) {
        card.querySelector('button')?.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('modal-minigames').style.display = 'none';
          this.startMiniGame(mg.id);
        });
      }

      container.appendChild(card);
    });
  }

  renderLevelSelectGrid() {
    const grid = document.getElementById('level-select-grid');
    if (grid) {
      grid.innerHTML = '';
      const highestUnlocked = saveManager.data.highestLevel || 1;

      LEVELS.forEach((lvl, idx) => {
        const lvlNum = idx + 1;
        const isUnlocked = lvlNum <= highestUnlocked;
        const bestScore = (saveManager.data.levelScores && saveManager.data.levelScores[lvlNum]) || 0;

        const card = document.createElement('div');
        card.className = `level-card-btn ${isUnlocked ? '' : 'locked'}`;
        card.innerHTML = `
          <div class="level-card-num">${isUnlocked ? '第 ' + lvlNum + ' 關' : '🔒 鎖定'}</div>
          <div class="level-card-name">${lvl.name}</div>
          ${isUnlocked && bestScore > 0 ? `<div style="font-size: 10px; color: #a3ff44;">最高: ${bestScore}分</div>` : ''}
        `;

        if (isUnlocked) {
          card.onclick = (e) => {
            if (e) e.preventDefault();
            document.getElementById('modal-level-select').style.display = 'none';
            audio.resume();
            this.loadLevel(idx);
            this.setState('PLAYING');
          };
        }

        grid.appendChild(card);
      });
    }

    // Render Overpass / Unlocked Mini-Games Section inside Level Select
    const miniGamesContainer = document.getElementById('level-select-minigames');
    if (miniGamesContainer) {
      miniGamesContainer.innerHTML = '';
      const minigames = this.getMiniGamesList();

      minigames.forEach((mg) => {
        const highScore = (saveManager.data.miniGameScores && saveManager.data.miniGameScores[mg.scoreKey]) || 0;
        const card = document.createElement('div');
        card.className = `minigame-card ${mg.isUnlocked ? '' : 'locked'}`;
        card.style.opacity = mg.isUnlocked ? '1' : '0.65';
        card.innerHTML = `
          <div class="minigame-icon">${mg.name.slice(0, 2)}</div>
          <div class="minigame-info">
            <h3 style="margin: 0 0 4px; color: ${mg.isUnlocked ? '#ffd700' : '#bbb'}; font-size: 15px;">
              ${mg.name} ${mg.isUnlocked ? '🌟' : '🔒'}
            </h3>
            <p style="margin: 0 0 5px; font-size: 12px; color: #ccc;">${mg.desc}</p>
            <div style="font-size: 11px; color: ${mg.isUnlocked ? '#81c784' : '#ffa726'}; font-weight: bold;">
              ${mg.isUnlocked ? `最高紀錄: ${highScore} ${mg.unit}` : `🔒 ${mg.unlockCondition}即可解鎖！`}
            </div>
          </div>
          <button class="primary-btn" style="padding: 8px 16px; font-size: 13px; flex-shrink: 0; ${mg.isUnlocked ? '' : 'opacity: 0.5; cursor: not-allowed;'}" ${mg.isUnlocked ? '' : 'disabled'}>
            ${mg.isUnlocked ? '挑戰 ➔' : '🔒 未解鎖'}
          </button>
        `;

        if (mg.isUnlocked) {
          card.querySelector('button').onclick = (e) => {
            if (e) e.preventDefault();
            document.getElementById('modal-level-select').style.display = 'none';
            this.startMiniGame(mg.id);
          };
        }

        miniGamesContainer.appendChild(card);
      });
    }
  }

  renderProfileStats() {
    const p = saveManager.data;
    const uname = saveManager.currentUsername || '背柿小勇士';

    // Summary boxes
    const nameEl = document.getElementById('profile-stat-name');
    if (nameEl) nameEl.textContent = uname;

    const coinsEl = document.getElementById('profile-stat-coins');
    if (coinsEl) coinsEl.textContent = `$${p.totalCoins || 0}`;

    const lvlEl = document.getElementById('profile-stat-level');
    if (lvlEl) lvlEl.textContent = `第 ${p.highestLevel || 1} 關`;

    let totalScore = 0;
    if (p.levelScores) {
      Object.values(p.levelScores).forEach((sc) => totalScore += (sc || 0));
    }
    const scoreEl = document.getElementById('profile-stat-totalscore');
    if (scoreEl) scoreEl.textContent = `${totalScore.toLocaleString()} 分`;

    // 1. Level Scores Table
    const levelTableBody = document.getElementById('profile-level-scores-body');
    if (levelTableBody) {
      levelTableBody.innerHTML = '';
      LEVELS.forEach((lvl, idx) => {
        const lvlNum = idx + 1;
        const isReached = lvlNum <= (p.highestLevel || 1);
        const bestScore = (p.levelScores && p.levelScores[lvlNum]) || 0;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td><b>第 ${lvlNum} 關</b>：${lvl.name}</td>
          <td>${isReached ? '<span style="color: #81c784;">🌟 已解鎖</span>' : '<span style="color: #888;">🔒 未解鎖</span>'}</td>
          <td><span class="score-val-badge">${bestScore.toLocaleString()}</span> 分</td>
        `;
        levelTableBody.appendChild(row);
      });
    }

    // 2. All 10 Mini-Games Table
    const mgTableBody = document.getElementById('profile-minigame-scores-body');
    if (mgTableBody) {
      mgTableBody.innerHTML = '';
      const minigames = this.getMiniGamesList();

      minigames.forEach((mg) => {
        const score = (p.miniGameScores && p.miniGameScores[mg.scoreKey]) || 0;
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><b>${mg.name}</b></td>
          <td style="color: #ffa726;">${mg.unlockCondition}</td>
          <td><span class="score-val-badge" style="color: ${mg.isUnlocked ? '#ffd700' : '#888'};">${score.toLocaleString()}</span> ${mg.unit}</td>
        `;
        mgTableBody.appendChild(row);
      });
    }
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
    } else if (gameId === 'whackMole') {
      audio.playBGM('orchard');
      this.currentMiniGame = new WhackMoleGame(this.canvas, () => this.exitMiniGame());
    } else if (gameId === 'shootingGallery') {
      audio.playBGM('cave');
      this.currentMiniGame = new ShootingGalleryGame(this.canvas, () => this.exitMiniGame());
    } else if (gameId === 'cloudGlider') {
      audio.playBGM('orchard');
      this.currentMiniGame = new CloudGliderGame(this.canvas, () => this.exitMiniGame());
    } else if (gameId === 'bossParry') {
      audio.playBGM('boss');
      this.currentMiniGame = new BossParryGame(this.canvas, () => this.exitMiniGame());
    } else if (gameId === 'riverRaft') {
      audio.playBGM('orchard');
      this.currentMiniGame = new RiverRaftGame(this.canvas, () => this.exitMiniGame());
    } else if (gameId === 'nightMarket') {
      audio.playBGM('cave');
      this.currentMiniGame = new NightMarketGame(this.canvas, () => this.exitMiniGame());
    } else if (gameId === 'iceGlider') {
      audio.playBGM('orchard');
      this.currentMiniGame = new IceGliderGame(this.canvas, () => this.exitMiniGame());
    } else if (gameId === 'rhythmParry') {
      audio.playBGM('boss');
      this.currentMiniGame = new RhythmParryGame(this.canvas, () => this.exitMiniGame());
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
      saveManager.completeGame();
      document.getElementById('modal-game-complete').style.display = 'flex';
      document.getElementById('final-score-val').textContent = `最終總分: ${this.player.score}`;
      document.getElementById('final-coins-val').textContent = `總收集甜柿: ${this.player.coins}`;
    }
  }

  startNewGame() {
    console.log('[Game] Starting Level 1 (第一關：豐收果園)...');
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
      saveManager.recordLevelScore(this.currentLevelIndex, this.player.score, this.player.coins);
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

    // 4. Update Enemies & Check Player Stomp
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
              this.player.score += this.boss.isFinalBoss ? 15000 : 5000;
              saveManager.recordLevelScore(this.currentLevelIndex, this.player.score, this.player.coins);
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
        saveManager.recordLevelScore(this.currentLevelIndex, this.player.score, this.player.coins);
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

// Robust Game Bootstrapper
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
