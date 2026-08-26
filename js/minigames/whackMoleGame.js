// Mini-Game 3: 果園保衛打地鼠 (Whack-a-Mole)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

export class WhackMoleGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    // 3x3 Holes Grid
    this.holes = [];
    const startX = 280;
    const startY = 160;
    const stepX = 200;
    const stepY = 110;

    let keyIdx = 1;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.holes.push({
          x: startX + c * stepX,
          y: startY + r * stepY,
          radiusX: 54,
          radiusY: 26,
          state: null, // 'caterpillar', 'flyer', 'persimmon', 'bomb'
          timer: 0,
          maxTimer: 1.1,
          key: String(keyIdx)
        });
        keyIdx++;
      }
    }

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 40;
    this.isOver = false;
    this.spawnTimer = 0.4;
    this.floatingTexts = [];
    this.hammer = { x: -100, y: -100, swingTimer: 0 };
  }

  handleClick(canvasX, canvasY) {
    if (this.isOver) {
      if (canvasX > 380 && canvasX < 580 && canvasY > 300 && canvasY < 380) {
        this.finish();
      }
      return;
    }

    if (canvasX > 840 && canvasX < 940 && canvasY > 15 && canvasY < 60) {
      this.finish();
      return;
    }

    this.hammer.x = canvasX;
    this.hammer.y = canvasY;
    this.hammer.swingTimer = 0.15;

    for (let h of this.holes) {
      const dx = (canvasX - h.x) / h.radiusX;
      const dy = (canvasY - (h.y - 20)) / 45;
      if (dx * dx + dy * dy <= 1.4 && h.state) {
        this.whackHole(h);
        break;
      }
    }
  }

  handleKey(key) {
    if (this.isOver) {
      if (key === 'Enter' || key === ' ') this.finish();
      return;
    }
    const hole = this.holes.find(h => h.key === key);
    if (hole && hole.state) {
      this.whackHole(hole);
    }
  }

  whackHole(h) {
    this.hammer.x = h.x;
    this.hammer.y = h.y - 20;
    this.hammer.swingTimer = 0.15;

    if (h.state === 'caterpillar') {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      const gain = 100 + this.combo * 20;
      this.score += gain;
      audio.playEnemyHit();
      particles.createHitSparks(h.x, h.y - 20, 10, '#81c784');
      this.floatingTexts.push({ text: `+${gain} 🐛 命中!`, x: h.x, y: h.y - 45, color: '#81c784', timer: 0.9 });
    } else if (h.state === 'flyer') {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      const gain = 200 + this.combo * 40;
      this.score += gain;
      audio.playEnemyHit();
      particles.createExplosion(h.x, h.y - 20, 15, '#ba68c8');
      this.floatingTexts.push({ text: `+${gain} 🦇 暴擊!`, x: h.x, y: h.y - 45, color: '#ba68c8', timer: 0.9 });
    } else if (h.state === 'persimmon') {
      this.combo += 2;
      const gain = 500;
      this.score += gain;
      audio.playCoin();
      particles.createExplosion(h.x, h.y - 20, 25, '#ffd700');
      this.floatingTexts.push({ text: `+${gain} 🍊 黃金福柿!`, x: h.x, y: h.y - 45, color: '#ffd700', timer: 1.0 });
    } else if (h.state === 'bomb') {
      this.combo = 0;
      this.score = Math.max(0, this.score - 300);
      audio.playHurt();
      particles.createExplosion(h.x, h.y - 20, 30, '#ff1744');
      this.floatingTexts.push({ text: `-300 💣 炸彈!`, x: h.x, y: h.y - 45, color: '#ff1744', timer: 1.0 });
    }

    h.state = null;
    h.timer = 0;
  }

  update(dt) {
    if (this.isOver) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.isOver = true;
      audio.playLevelClear();
      saveManager.saveMiniGameScore('whackMole', this.score);
    }

    if (this.hammer.swingTimer > 0) {
      this.hammer.swingTimer -= dt;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.3, 0.75 - (40 - this.timeLeft) * 0.01);
      const emptyHoles = this.holes.filter(h => !h.state);
      if (emptyHoles.length > 0) {
        const target = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
        const r = Math.random();
        if (r < 0.45) {
          target.state = 'caterpillar';
          target.maxTimer = 1.2;
        } else if (r < 0.75) {
          target.state = 'flyer';
          target.maxTimer = 1.0;
        } else if (r < 0.88) {
          target.state = 'persimmon';
          target.maxTimer = 0.9;
        } else {
          target.state = 'bomb';
          target.maxTimer = 1.4;
        }
        target.timer = target.maxTimer;
      }
    }

    for (let h of this.holes) {
      if (h.state) {
        h.timer -= dt;
        if (h.timer <= 0) {
          if (h.state !== 'bomb') this.combo = 0;
          h.state = null;
        }
      }
    }

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

    // Background Orchard
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#1c3018');
    bg.addColorStop(0.5, '#3b5e2b');
    bg.addColorStop(1, '#5c3d18');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Title & HUD
    ctx.fillStyle = '#a3ff44';
    ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🔨 果園保衛打地鼠 (Whack-A-Mole)', 30, 40);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
    ctx.fillText(`⏱️ 時間: ${Math.ceil(this.timeLeft)}s`, 30, 70);
    ctx.fillText(`⭐ 得分: ${this.score}`, 200, 70);
    if (this.combo > 1) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`🔥 連擊: x${this.combo}!`, 380, 70);
    }

    // Return button
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    if (ctx.roundRect) ctx.roundRect(840, 16, 90, 36, 8);
    else ctx.rect(840, 16, 90, 36);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
    ctx.fillText('返回 ✖', 885, 40);

    // Draw Holes
    for (let hole of this.holes) {
      ctx.save();
      // Hole bottom shadow
      ctx.fillStyle = '#261708';
      ctx.beginPath();
      ctx.ellipse(hole.x, hole.y, hole.radiusX, hole.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6d4c28';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Key label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`[${hole.key}]`, hole.x, hole.y + hole.radiusY + 16);

      // Character popping out
      if (hole.state) {
        const popOffset = Math.sin((hole.timer / hole.maxTimer) * Math.PI) * 28;
        const cy = hole.y - 10 - popOffset;

        if (hole.state === 'caterpillar') {
          ctx.fillStyle = '#76ff03';
          ctx.font = '46px sans-serif';
          ctx.fillText('🐛', hole.x, cy);
        } else if (hole.state === 'flyer') {
          ctx.fillStyle = '#e040fb';
          ctx.font = '46px sans-serif';
          ctx.fillText('🦇', hole.x, cy);
        } else if (hole.state === 'persimmon') {
          ctx.fillStyle = '#ff9800';
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 18;
          ctx.font = '48px sans-serif';
          ctx.fillText('🍊', hole.x, cy);
        } else if (hole.state === 'bomb') {
          ctx.fillStyle = '#ff1744';
          ctx.shadowColor = '#ff1744';
          ctx.shadowBlur = 12;
          ctx.font = '46px sans-serif';
          ctx.fillText('💣', hole.x, cy);
        }
      }
      ctx.restore();
    }

    // Draw Hammer if swinging
    if (this.hammer.swingTimer > 0) {
      ctx.save();
      ctx.translate(this.hammer.x, this.hammer.y);
      ctx.rotate(-0.4);
      ctx.font = '44px sans-serif';
      ctx.fillText('🔨', -15, 0);
      ctx.restore();
    }

    particles.draw(ctx);

    for (let ft of this.floatingTexts) {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 18px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    if (this.isOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 34px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 果園敲擊挑戰結算！', w / 2, h / 2 - 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`總得分: ${this.score} 分  |  最高連擊: x${this.maxCombo}`, w / 2, h / 2);

      ctx.fillStyle = '#ff7700';
      if (ctx.roundRect) ctx.roundRect(w / 2 - 90, h / 2 + 40, 180, 44, 10);
      else ctx.rect(w / 2 - 90, h / 2 + 40, 180, 44);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
      ctx.fillText('🍊 回主選單 (點擊)', w / 2, h / 2 + 68);
    }
  }

  finish() {
    this.isOver = true;
    if (this.onExit) this.onExit();
  }
}
