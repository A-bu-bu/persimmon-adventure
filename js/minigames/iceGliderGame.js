// Mini-Game 9: 冰上大滑行大逃脫 (Ice Glider Escape)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

export class IceGliderGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    this.heroX = 480;
    this.heroVx = 0;
    this.heroFriction = 0.90; // Ice friction (slippery)
    this.heroAccel = 550;
    this.heroY = 390;
    this.heroWidth = 44;

    this.score = 0;
    this.distance = 0;
    this.survived = 0; // seconds survived
    this.timeLeft = 45;
    this.isOver = false;
    this.keys = {};
    this.floatingTexts = [];

    this.obstacles = [];
    this.coins = [];
    this.scrollSpeed = 200;
    this.spawnObstacleTimer = 0.8;
    this.spawnCoinTimer = 0.35;
    this.bgOffset = 0;
  }

  handleKeyDown(code) {
    this.keys[code] = true;
    if (this.isOver && (code === 'Enter' || code === 'Space')) this.finish();
  }
  handleKeyUp(code) { this.keys[code] = false; }
  handleMouseMove(canvasX) {
    if (!this.isOver) {
      const dx = canvasX - this.heroX;
      this.heroVx += dx * 0.12;
    }
  }
  handleClick(canvasX, canvasY) {
    if (this.isOver) { if (canvasX > 380 && canvasX < 580 && canvasY > 280 && canvasY < 340) this.finish(); return; }
    if (canvasX > 840 && canvasX < 940 && canvasY > 15 && canvasY < 60) { this.finish(); return; }
  }

  spawnObstacle() {
    const types = [
      { type: 'crack', w: 80, h: 20, color: '#00bcd4', val: -200, label: '❄️ 冰裂縫！' },
      { type: 'pillar', w: 28, h: 80, color: '#b3e5fc', val: -180, label: '🧊 冰柱！' },
      { type: 'boulder', w: 48, h: 48, color: '#90a4ae', val: -250, label: '🪨 雪崩巨石！' }
    ];
    const sel = types[Math.floor(Math.random() * types.length)];
    this.obstacles.push({
      x: 60 + Math.random() * (960 - 120),
      y: -sel.h - 20,
      w: sel.w, h: sel.h,
      type: sel.type, color: sel.color, val: sel.val, label: sel.label
    });
  }

  update(dt) {
    if (this.isOver) return;

    this.timeLeft -= dt;
    this.survived += dt;
    this.distance += this.scrollSpeed * dt;
    this.bgOffset = (this.bgOffset + this.scrollSpeed * dt) % 80;
    this.score += Math.floor(this.scrollSpeed * dt * 0.4);
    this.scrollSpeed = Math.min(480, 200 + this.survived * 6);

    if (this.timeLeft <= 0) {
      this.timeLeft = 0; this.isOver = true;
      audio.playLevelClear();
      saveManager.saveMiniGameScore('iceGlider', this.score);
    }

    // Hero horizontal movement (slippery)
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.heroVx -= this.heroAccel * dt;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) this.heroVx += this.heroAccel * dt;
    this.heroVx *= Math.pow(this.heroFriction, dt * 60);
    this.heroVx = Math.max(-480, Math.min(480, this.heroVx));
    this.heroX += this.heroVx * dt;
    this.heroX = Math.max(this.heroWidth / 2, Math.min(960 - this.heroWidth / 2, this.heroX));

    // Spawn obstacles
    this.spawnObstacleTimer -= dt;
    if (this.spawnObstacleTimer <= 0) {
      this.spawnObstacleTimer = Math.max(0.35, 0.8 - this.survived * 0.012);
      this.spawnObstacle();
    }

    // Spawn coins
    this.spawnCoinTimer -= dt;
    if (this.spawnCoinTimer <= 0) {
      this.spawnCoinTimer = 0.38;
      this.coins.push({ x: 60 + Math.random() * 840, y: -30, r: 14 });
    }

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.y += this.scrollSpeed * dt;
      // Collision
      if (o.y + o.h >= this.heroY - 10 && o.y <= this.heroY + 40 &&
          this.heroX - this.heroWidth / 2 < o.x + o.w / 2 &&
          this.heroX + this.heroWidth / 2 > o.x - o.w / 2) {
        this.score = Math.max(0, this.score + o.val);
        audio.playHurt();
        particles.createHitSparks(this.heroX, this.heroY, 14, '#00e5ff');
        this.floatingTexts.push({ text: o.val + ' ' + o.label, x: this.heroX, y: this.heroY - 30, color: '#ff5722', timer: 0.9 });
        this.obstacles.splice(i, 1);
        continue;
      }
      if (o.y > 580) this.obstacles.splice(i, 1);
    }

    // Update coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.y += this.scrollSpeed * dt;
      const dx = this.heroX - c.x, dy = this.heroY - c.y;
      if (Math.hypot(dx, dy) < c.r + 22) {
        this.score += 80;
        audio.playCoin();
        particles.createCoinSparkle(c.x, c.y);
        this.floatingTexts.push({ text: '+80 🪙', x: c.x, y: c.y - 15, color: '#ffd700', timer: 0.7 });
        this.coins.splice(i, 1);
        continue;
      }
      if (c.y > 560) this.coins.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].y -= 28 * dt; this.floatingTexts[i].timer -= dt;
      if (this.floatingTexts[i].timer <= 0) this.floatingTexts.splice(i, 1);
    }
    particles.update(dt);
  }

  draw() {
    const ctx = this.ctx;
    const W = 960, H = 540;

    // Ice world background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0d2744'); bg.addColorStop(0.5, '#0a4a6e'); bg.addColorStop(1, '#0e7490');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Scrolling ice grid
    ctx.strokeStyle = 'rgba(180,240,255,0.12)'; ctx.lineWidth = 1;
    for (let y = (this.bgOffset % 80) - 80; y < H + 80; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    // Ice floor
    const iceGrad = ctx.createLinearGradient(0, 420, 0, H);
    iceGrad.addColorStop(0, '#b3e5fc');
    iceGrad.addColorStop(1, '#81d4fa');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, 430, W, H - 430);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 430);
    ctx.lineTo(W, 430);
    ctx.stroke();

    // Title & HUD
    ctx.fillStyle = '#b3e5fc'; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 8;
    ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('❄️ 冰上大滑行大逃脫！ (Ice Glider)', 30, 40);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
    ctx.fillText(`⏱️ ${Math.ceil(this.timeLeft)}s`, 30, 70);
    ctx.fillText(`⭐ 得分: ${this.score}`, 140, 70);
    ctx.fillText(`🛷 滑行: ${Math.floor(this.distance)}m`, 340, 70);

    // Return button
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    if (ctx.roundRect) ctx.roundRect(840, 16, 90, 36, 8); else ctx.rect(840, 16, 90, 36);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
    ctx.fillText('返回 ✖', 885, 40);

    // Draw coins
    for (const c of this.coins) {
      ctx.save(); ctx.fillStyle = '#ffd700'; ctx.shadowColor = '#ffea00'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    // Draw obstacles
    for (const o of this.obstacles) {
      ctx.save(); ctx.fillStyle = o.color; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 8;
      if (o.type === 'crack') {
        ctx.fillStyle = '#01579b';
        for (let i = 0; i < 3; i++) ctx.fillRect(o.x - o.w / 2 + i * 28, o.y, 22, o.h);
      } else {
        ctx.fillRect(o.x - o.w / 2, o.y, o.w, o.h);
      }
      ctx.restore();
    }

    // Draw Hero
    ctx.save();
    const lean = this.heroVx > 0 ? 0.2 : this.heroVx < 0 ? -0.2 : 0;
    ctx.translate(this.heroX, this.heroY);
    ctx.rotate(lean);
    ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 10;
    ctx.fillText('🏂', 0, 10);
    ctx.restore();

    // Speed indicator
    ctx.fillStyle = `rgba(0,229,255,${Math.min(1, this.scrollSpeed / 500)})`;
    ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`💨 速度: ${Math.floor(this.scrollSpeed)} km/h`, 30, 95);

    particles.draw(ctx);
    for (const ft of this.floatingTexts) {
      ctx.save(); ctx.fillStyle = ft.color; ctx.shadowBlur = 4; ctx.shadowColor = '#000';
      ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y); ctx.restore();
    }

    if (this.isOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#b3e5fc'; ctx.font = 'bold 34px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('❄️ 冰上大逃脫挑戰結算！', W / 2, H / 2 - 50);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`總得分: ${this.score} 分  |  滑行: ${Math.floor(this.distance)}m`, W / 2, H / 2);
      ctx.fillStyle = '#ff7700';
      if (ctx.roundRect) ctx.roundRect(W / 2 - 90, H / 2 + 40, 180, 44, 10); else ctx.rect(W / 2 - 90, H / 2 + 40, 180, 44);
      ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
      ctx.fillText('🍊 回主選單 (點擊)', W / 2, H / 2 + 68);
    }
  }

  finish() { this.isOver = true; if (this.onExit) this.onExit(); }
}
