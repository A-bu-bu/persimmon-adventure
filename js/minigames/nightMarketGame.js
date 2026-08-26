// Mini-Game 8: 夜市大胃王闖關 (Night Market Food Rush)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

const FOODS = [
  { emoji: '🍢', name: '關東煮', color: '#ff9800' },
  { emoji: '🫙', name: '臭豆腐', color: '#8bc34a' },
  { emoji: '🥚', name: '蚵仔煎', color: '#ffd54f' },
  { emoji: '🍡', name: '糖葫蘆', color: '#e91e63' },
  { emoji: '🍞', name: '胡椒餅', color: '#795548' },
  { emoji: '🥩', name: '鹹酥雞', color: '#ff5722' },
  { emoji: '🍦', name: '花生捲冰淇淋', color: '#00bcd4' },
  { emoji: '🧋', name: '珍珠奶茶', color: '#ff7043' }
];

const CUSTOMERS = [
  { emoji: '👴', want: null, x: 180 },
  { emoji: '👩', want: null, x: 420 },
  { emoji: '🧒', want: null, x: 660 },
  { emoji: '👨', want: null, x: 820 }
];

export class NightMarketGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctHits = 0;
    this.timeLeft = 45;
    this.isOver = false;
    this.floatingTexts = [];
    this.stalls = []; // food items on screen to click
    this.spawnTimer = 0.6;
    this.customers = CUSTOMERS.map(c => ({ ...c, want: this.randomFood(), patience: 5.0, maxPatience: 5.0, glow: 0 }));
  }

  randomFood() { return FOODS[Math.floor(Math.random() * FOODS.length)]; }

  handleClick(canvasX, canvasY) {
    if (this.isOver) {
      if (canvasX > 380 && canvasX < 580 && canvasY > 280 && canvasY < 340) { this.finish(); }
      return;
    }
    if (canvasX > 840 && canvasX < 940 && canvasY > 15 && canvasY < 60) { this.finish(); return; }

    // Check stalls
    for (let i = this.stalls.length - 1; i >= 0; i--) {
      const s = this.stalls[i];
      const dx = canvasX - s.x, dy = canvasY - s.y;
      if (dx * dx + dy * dy <= 36 * 36) {
        this.serveFood(s, i);
        return;
      }
    }
  }

  serveFood(stall, idx) {
    // Find matching customer
    const match = this.customers.find(c => c.want && c.want.emoji === stall.food.emoji && c.patience > 0);
    if (match) {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.correctHits++;
      const baseGain = 200 + Math.floor(match.patience / match.maxPatience * 150);
      const gain = baseGain + this.combo * 30;
      this.score += gain;
      audio.playCoin();
      particles.createExplosion(stall.x, stall.y, 18, stall.food.color);
      this.floatingTexts.push({ text: `+${gain} ${stall.food.emoji} 送對了！`, x: stall.x, y: stall.y - 30, color: '#ffd700', timer: 1.0 });
      match.want = this.randomFood();
      match.patience = match.maxPatience;
    } else {
      this.combo = 0;
      this.score = Math.max(0, this.score - 100);
      audio.playHurt();
      this.floatingTexts.push({ text: `-100 ❌ 送錯了！`, x: stall.x, y: stall.y - 30, color: '#ff1744', timer: 0.9 });
    }
    this.stalls.splice(idx, 1);
  }

  update(dt) {
    if (this.isOver) return;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0; this.isOver = true;
      audio.playLevelClear();
      saveManager.saveMiniGameScore('nightMarket', this.score);
    }

    // Update customer patience
    for (const c of this.customers) {
      if (c.patience > 0 && c.want) {
        c.patience -= dt;
        c.glow = Math.max(0, c.glow - dt * 2);
        if (c.patience <= 0) {
          c.patience = 0;
          this.combo = 0;
          this.score = Math.max(0, this.score - 80);
          this.floatingTexts.push({ text: `-80 ⏰ 客人不等了！`, x: c.x, y: 220, color: '#ff5722', timer: 0.9 });
          setTimeout(() => { c.want = this.randomFood(); c.patience = c.maxPatience; }, 1200);
        }
      }
    }

    // Spawn stall foods
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.stalls.length < 6) {
      this.spawnTimer = 0.55;
      const food = this.randomFood();
      this.stalls.push({ x: 80 + Math.random() * 800, y: 350 + Math.random() * 100, food, timer: 4.5 });
    }

    for (let i = this.stalls.length - 1; i >= 0; i--) {
      this.stalls[i].timer -= dt;
      if (this.stalls[i].timer <= 0) this.stalls.splice(i, 1);
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

    // Night market background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a0015'); bg.addColorStop(0.5, '#1a0030'); bg.addColorStop(1, '#2d0050');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Neon lights decoration
    const neons = ['#ff0080', '#00ffff', '#ffff00', '#ff8c00', '#00ff88'];
    for (let i = 0; i < 20; i++) {
      ctx.save();
      ctx.fillStyle = neons[i % neons.length];
      ctx.shadowColor = neons[i % neons.length]; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(48 * i + 24, 108, 7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Title
    ctx.fillStyle = '#ffd700'; ctx.shadowColor = '#ff9800'; ctx.shadowBlur = 12;
    ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('🌙 夜市大胃王闖關！ (Night Market Rush)', 30, 40);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
    ctx.fillText(`⏱️ ${Math.ceil(this.timeLeft)}s`, 30, 70);
    ctx.fillText(`⭐ 得分: ${this.score}`, 140, 70);
    if (this.combo > 1) { ctx.fillStyle = '#ffea00'; ctx.fillText(`🔥 連送: x${this.combo}!`, 340, 70); }

    // Return button
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    if (ctx.roundRect) ctx.roundRect(840, 16, 90, 36, 8); else ctx.rect(840, 16, 90, 36);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
    ctx.fillText('返回 ✖', 885, 40);

    // Stall divider
    ctx.fillStyle = 'rgba(255,200,0,0.15)';
    ctx.fillRect(0, 310, W, 220);
    ctx.fillStyle = '#ffd700'; ctx.fillRect(0, 310, W, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, 130, W, 180);

    // Draw customers
    for (const c of this.customers) {
      ctx.save();
      if (c.glow > 0) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 20 * c.glow; }
      // Patience bar
      if (c.patience > 0) {
        const pct = c.patience / c.maxPatience;
        ctx.fillStyle = '#333'; ctx.fillRect(c.x - 40, 135, 80, 10);
        ctx.fillStyle = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';
        ctx.fillRect(c.x - 40, 135, 80 * pct, 10);
      }
      // Customer emoji
      ctx.font = '44px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(c.emoji, c.x, 200);
      // Food they want
      if (c.want && c.patience > 0) {
        ctx.font = '32px sans-serif';
        ctx.fillText(c.want.emoji, c.x, 240);
        ctx.fillStyle = '#ffd700'; ctx.shadowColor = c.want.color; ctx.shadowBlur = 8;
        ctx.font = 'bold 11px "Microsoft JhengHei", sans-serif';
        ctx.fillText(c.want.name, c.x, 258);
      } else if (c.patience <= 0) {
        ctx.font = '28px sans-serif'; ctx.fillText('😤', c.x, 240);
      }
      ctx.restore();
    }

    // Draw stall foods (clickable)
    for (const s of this.stalls) {
      ctx.save();
      const urgency = s.timer < 1.5 ? (s.timer / 1.5) : 1;
      ctx.globalAlpha = 0.5 + urgency * 0.5;
      ctx.shadowColor = s.food.color; ctx.shadowBlur = 14;
      ctx.font = '38px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.food.emoji, s.x, s.y + 16);
      // Name label
      ctx.font = 'bold 11px "Microsoft JhengHei", sans-serif';
      ctx.fillStyle = '#fff'; ctx.shadowBlur = 0;
      ctx.fillText(s.food.name, s.x, s.y + 36);
      ctx.restore();
    }

    particles.draw(ctx);

    for (const ft of this.floatingTexts) {
      ctx.save(); ctx.fillStyle = ft.color; ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y); ctx.restore();
    }

    if (this.isOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.84)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 34px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🌙 夜市大胃王挑戰結算！', W / 2, H / 2 - 50);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`總得分: ${this.score} 分  |  正確配送: ${this.correctHits} 次`, W / 2, H / 2);
      ctx.fillStyle = '#ff7700';
      if (ctx.roundRect) ctx.roundRect(W / 2 - 90, H / 2 + 40, 180, 44, 10); else ctx.rect(W / 2 - 90, H / 2 + 40, 180, 44);
      ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
      ctx.fillText('🍊 回主選單 (點擊)', W / 2, H / 2 + 68);
    }
  }

  finish() { this.isOver = true; if (this.onExit) this.onExit(); }
}
