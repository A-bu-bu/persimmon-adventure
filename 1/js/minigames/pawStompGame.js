// Mini-Game 1: 神速踩腳丫大對決 (Lucky Paw Stomp)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

export class PawStompGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    this.spots = [
      { x: 180, y: 170, radius: 52, state: null, timer: 0, maxTimer: 1.2, key: '1' },
      { x: 480, y: 170, radius: 52, state: null, timer: 0, maxTimer: 1.2, key: '2' },
      { x: 780, y: 170, radius: 52, state: null, timer: 0, maxTimer: 1.2, key: '3' },
      { x: 180, y: 360, radius: 52, state: null, timer: 0, maxTimer: 1.2, key: '4' },
      { x: 480, y: 360, radius: 52, state: null, timer: 0, maxTimer: 1.2, key: '5' },
      { x: 780, y: 360, radius: 52, state: null, timer: 0, maxTimer: 1.2, key: '6' }
    ];

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 35;
    this.isOver = false;
    this.spawnTimer = 0.5;

    this.floatingTexts = [];
    this.heroImg = new Image();
    this.heroImg.src = './assets/hero_level2.png';
  }

  handleClick(canvasX, canvasY) {
    if (this.isOver) {
      if (canvasX > 380 && canvasX < 580 && canvasY > 300 && canvasY < 380) {
        this.finish();
      }
      return;
    }

    // Check exit button
    if (canvasX > 840 && canvasX < 940 && canvasY > 15 && canvasY < 60) {
      this.finish();
      return;
    }

    // Check spots
    for (let s of this.spots) {
      const dx = canvasX - s.x;
      const dy = canvasY - s.y;
      if (Math.hypot(dx, dy) <= s.radius + 15 && s.state) {
        this.stompSpot(s);
        break;
      }
    }
  }

  handleKey(key) {
    if (this.isOver) {
      if (key === 'Enter' || key === ' ') this.finish();
      return;
    }
    const spot = this.spots.find(s => s.key === key);
    if (spot && spot.state) {
      this.stompSpot(spot);
    }
  }

  stompSpot(s) {
    if (s.state === 'golden_paw') {
      // Lucky Golden Paw!
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      const gain = 200 + this.combo * 50;
      this.score += gain;
      audio.playCoin();
      particles.createExplosion(s.x, s.y, 25, '#ffd700');
      this.floatingTexts.push({
        text: + 好運旺旺來! 🐾,
        x: s.x,
        y: s.y - 20,
        color: '#ffea00',
        timer: 1.0
      });
    } else if (s.state === 'monster_foot') {
      // Normal monster foot stomp
      this.combo++;
      const gain = 100 + this.combo * 20;
      this.score += gain;
      audio.playJump();
      particles.createLeaves(s.x, s.y, 12);
      this.floatingTexts.push({
        text: + 踩扁啦! 👣,
        x: s.x,
        y: s.y - 20,
        color: '#76ff03',
        timer: 0.9
      });
    } else if (s.state === 'spike_foot') {
      // Spike foot hazard!
      this.combo = 0;
      this.score = Math.max(0, this.score - 150);
      audio.playHurt();
      particles.createHitSparks(s.x, s.y, 15, '#ff1744');
      this.floatingTexts.push({
        text: -150 哎呀好痛! 💥,
        x: s.x,
        y: s.y - 20,
        color: '#ff1744',
        timer: 1.0
      });
    }

    s.state = null;
    s.timer = 0;
  }

  update(dt) {
    if (this.isOver) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.isOver = true;
      audio.playLevelClear();
      saveManager.saveMiniGameScore('pawStomp', this.score);
    }

    // Spawn spots
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.35, 0.9 - (35 - this.timeLeft) * 0.015);
      const emptySpots = this.spots.filter(s => !s.state);
      if (emptySpots.length > 0) {
        const target = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        const rand = Math.random();
        if (rand < 0.35) {
          target.state = 'golden_paw';
          target.maxTimer = 1.1;
        } else if (rand < 0.8) {
          target.state = 'monster_foot';
          target.maxTimer = 1.3;
        } else {
          target.state = 'spike_foot';
          target.maxTimer = 1.5;
        }
        target.timer = target.maxTimer;
      }
    }

    // Update spot timers
    for (let s of this.spots) {
      if (s.state) {
        s.timer -= dt;
        if (s.timer <= 0) {
          if (s.state !== 'spike_foot') this.combo = 0;
          s.state = null;
        }
      }
    }

    // Update floating text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 30 * dt;
      ft.timer -= dt;
      if (ft.timer <= 0) this.floatingTexts.splice(i, 1);
    }

    particles.update(dt);
  }

  draw() {
    const ctx = this.ctx;
    const w = 960;
    const h = 540;

    // Background Gradient
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#1a0933');
    bg.addColorStop(0.5, '#4a154b');
    bg.addColorStop(1, '#8c2d19');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Title & Score HUD
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 22px Microsoft JhengHei, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🐾 神速踩腳丫大對決 (Lucky Paw Stomp)', 30, 40);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Microsoft JhengHei, sans-serif';
    ctx.fillText(⏱️ 時間: s, 30, 70);
    ctx.fillText(⭐ 得分: , 200, 70);
    if (this.combo > 1) {
      ctx.fillStyle = '#ffeb3b';
      ctx.fillText(🔥 連擊: x!, 380, 70);
    }

    // Exit Button
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    if (ctx.roundRect) ctx.roundRect(840, 16, 90, 36, 8);
    else ctx.rect(840, 16, 90, 36);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px Microsoft JhengHei, sans-serif';
    ctx.fillText('返回 ✖', 885, 40);

    // Draw Stomp Spots
    for (let s of this.spots) {
      ctx.save();
      // Spot circle plate
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Key indicator
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText([按鍵 ], s.x, s.y + s.radius + 20);

      if (s.state) {
        const progress = s.timer / s.maxTimer;
        const scale = 0.85 + 0.15 * Math.sin(Date.now() * 0.015);

        if (s.state === 'golden_paw') {
          // Lucky Golden Paw
          ctx.fillStyle = '#ffd700';
          ctx.shadowColor = '#ffea00';
          ctx.shadowBlur = 22;
          ctx.font = ${Math.floor(56 * scale)}px sans-serif;
          ctx.fillText('🐾', s.x, s.y + 18);
          ctx.font = 'bold 13px Microsoft JhengHei';
          ctx.fillStyle = '#ffeb3b';
          ctx.fillText('好運旺旺來!', s.x, s.y - 34);
        } else if (s.state === 'monster_foot') {
          // Monster Foot
          ctx.fillStyle = '#76ff03';
          ctx.shadowColor = '#76ff03';
          ctx.shadowBlur = 12;
          ctx.font = ${Math.floor(52 * scale)}px sans-serif;
          ctx.fillText('👣', s.x, s.y + 18);
        } else if (s.state === 'spike_foot') {
          // Spike Foot Hazard
          ctx.fillStyle = '#ff1744';
          ctx.shadowColor = '#ff1744';
          ctx.shadowBlur = 16;
          ctx.font = ${Math.floor(50 * scale)}px sans-serif;
          ctx.fillText('🦔', s.x, s.y + 18);
        }

        // Circular timer bar
        ctx.shadowBlur = 0;
        ctx.strokeStyle = s.state === 'golden_paw' ? '#ffea00' : (s.state === 'spike_foot' ? '#ff1744' : '#76ff03');
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Particles & Floating texts
    particles.draw(ctx);

    for (let ft of this.floatingTexts) {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 18px Microsoft JhengHei, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // Game Over Overlay
    if (this.isOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 34px Microsoft JhengHei, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 踩腳丫挑戰結算！', w / 2, h / 2 - 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Microsoft JhengHei, sans-serif';
      ctx.fillText(總得分:  分  |  最高連擊: x, w / 2, h / 2);

      // Return Button
      ctx.fillStyle = '#ff7700';
      if (ctx.roundRect) ctx.roundRect(w / 2 - 90, h / 2 + 40, 180, 44, 10);
      else ctx.rect(w / 2 - 90, h / 2 + 40, 180, 44);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Microsoft JhengHei, sans-serif';
      ctx.fillText('🍊 回主選單 (點擊)', w / 2, h / 2 + 68);
    }
  }

  finish() {
    this.isOver = true;
    if (this.onExit) this.onExit();
  }
}
