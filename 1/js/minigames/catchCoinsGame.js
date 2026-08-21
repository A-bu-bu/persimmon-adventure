// Mini-Game 2: 天降財神接金鈔 (Catch the Falling Riches)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

export class CatchCoinsGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    this.playerX = 480;
    this.playerY = 440;
    this.playerWidth = 70;
    this.playerHeight = 60;
    this.speed = 460;
    this.keys = {};

    this.moneyItems = [];
    this.floatingTexts = [];
    this.score = 0;
    this.moneyTotal = 0;
    this.timeLeft = 40;
    this.isOver = false;
    this.spawnTimer = 0.2;

    this.heroImg = new Image();
    this.heroImg.src = './assets/hero_level2.png';
  }

  handleKeyDown(code) {
    this.keys[code] = true;
    if (this.isOver && (code === 'Enter' || code === 'Space')) {
      this.finish();
    }
  }

  handleKeyUp(code) {
    this.keys[code] = false;
  }

  handleMouseMove(canvasX) {
    if (!this.isOver) {
      this.playerX = Math.max(30, Math.min(930 - this.playerWidth, canvasX - this.playerWidth / 2));
    }
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
    }
  }

  spawnMoney() {
    const types = [
      { type: 'copper', val: 10, label: '🪙 10元', color: '#cd7f32', speed: 200, prob: 0.35 },
      { type: 'coin', val: 50, label: '💰 50元', color: '#ffd700', speed: 240, prob: 0.3 },
      { type: 'bill100', val: 100, label: '💵 100元', color: '#4caf50', speed: 260, prob: 0.18 },
      { type: 'bill1000', val: 1000, label: '💴 千元大鈔', color: '#2196f3', speed: 300, prob: 0.09 },
      { type: 'ingot', val: 5000, label: '⭐ 萬兩元寶', color: '#ffea00', speed: 340, prob: 0.04 },
      { type: 'bomb', val: -300, label: '💣 炸彈', color: '#ff1744', speed: 280, prob: 0.08 }
    ];

    const rand = Math.random();
    let accum = 0;
    let selected = types[0];
    for (let t of types) {
      accum += t.prob;
      if (rand <= accum) {
        selected = t;
        break;
      }
    }

    this.moneyItems.push({
      x: 40 + Math.random() * 880,
      y: -30,
      type: selected.type,
      val: selected.val,
      label: selected.label,
      color: selected.color,
      speed: selected.speed + Math.random() * 40,
      size: selected.type === 'ingot' ? 32 : (selected.type.startsWith('bill') ? 34 : 26),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 4
    });
  }

  update(dt) {
    if (this.isOver) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.isOver = true;
      audio.playLevelClear();
      saveManager.saveMiniGameScore('catchCoins', this.score);
    }

    // Keyboard move
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.playerX -= this.speed * dt;
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.playerX += this.speed * dt;
    }
    this.playerX = Math.max(20, Math.min(940 - this.playerWidth, this.playerX));

    // Spawn items
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.28;
      this.spawnMoney();
    }

    // Update falling items
    for (let i = this.moneyItems.length - 1; i >= 0; i--) {
      const m = this.moneyItems[i];
      m.y += m.speed * dt;
      m.rot += m.rotSpeed * dt;

      // Catch check with basket
      if (
        m.x + m.size > this.playerX &&
        m.x - m.size < this.playerX + this.playerWidth &&
        m.y + m.size > this.playerY &&
        m.y - m.size < this.playerY + this.playerHeight
      ) {
        if (m.type === 'bomb') {
          this.score = Math.max(0, this.score - 300);
          audio.playHurt();
          particles.createExplosion(m.x, m.y, 25, '#ff1744');
          this.floatingTexts.push({
            text: -300 炸彈! 💥,
            x: m.x,
            y: m.y - 20,
            color: '#ff1744',
            timer: 1.0
          });
        } else {
          this.score += m.val;
          this.moneyTotal += m.val;
          audio.playCoin();
          particles.createHitSparks(m.x, m.y, 10, m.color);
          this.floatingTexts.push({
            text: + 💵,
            x: m.x,
            y: m.y - 20,
            color: m.color,
            timer: 0.9
          });
        }
        this.moneyItems.splice(i, 1);
        continue;
      }

      // Out of bounds
      if (m.y > 560) {
        this.moneyItems.splice(i, 1);
      }
    }

    // Update floating text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 35 * dt;
      ft.timer -= dt;
      if (ft.timer <= 0) this.floatingTexts.splice(i, 1);
    }

    particles.update(dt);
  }

  draw() {
    const ctx = this.ctx;
    const w = 960;
    const h = 540;

    // Rich Sunset Gold Sky
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#102040');
    bg.addColorStop(0.6, '#3a1c50');
    bg.addColorStop(1, '#8c4810');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Floor
    ctx.fillStyle = '#4a2508';
    ctx.fillRect(0, 490, w, 50);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, 490, w, 4);

    // Title & Score HUD
    ctx.fillStyle = '#ffea00';
    ctx.font = 'bold 22px Microsoft JhengHei, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('💰 天降財神接金鈔 (Catch the Falling Riches)', 30, 40);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Microsoft JhengHei, sans-serif';
    ctx.fillText(⏱️ 時間: s, 30, 70);
    ctx.fillText(💵 累積金額: {this.moneyTotal}, 200, 70);
    ctx.fillText(⭐ 總得分: , 440, 70);

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

    // Draw Falling Money Items
    for (let m of this.moneyItems) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rot);

      if (m.type === 'copper') {
        ctx.fillStyle = '#cd7f32';
        ctx.strokeStyle = '#8c5020';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (m.type === 'coin') {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffea00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'bill100') {
        // Green  Bill
        ctx.fillStyle = '#4caf50';
        ctx.strokeStyle = '#a5d6a7';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-20, -10, 40, 20);
        ctx.strokeRect(-20, -10, 40, 20);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('', 0, 3);
      } else if (m.type === 'bill1000') {
        // Blue  Bill
        ctx.fillStyle = '#2196f3';
        ctx.strokeStyle = '#90caf9';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#64b5f6';
        ctx.shadowBlur = 12;
        ctx.fillRect(-24, -12, 48, 24);
        ctx.strokeRect(-24, -12, 48, 24);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('', 0, 4);
      } else if (m.type === 'ingot') {
        // Gold Ingot
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(0, 2, 16, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -2, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'bomb') {
        ctx.fillStyle = '#222';
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 2, 14, 0, Math.PI * 2);
        ctx.fill();
        // Spark
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(-2, -18, 4, 6);
      }
      ctx.restore();
    }

    // Draw Player Basket Hero
    ctx.save();
    // Glowing Persimmon Hero
    if (this.heroImg.complete) {
      ctx.drawImage(this.heroImg, this.playerX, this.playerY - 20, 64, 64);
    } else {
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.arc(this.playerX + 32, this.playerY + 10, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Golden Treasure Basket
    ctx.fillStyle = '#d4af37';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(this.playerX + 32, this.playerY + 36, 38, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Particles & Floating text
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
      ctx.fillText('🎉 接金鈔挑戰結算！', w / 2, h / 2 - 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Microsoft JhengHei, sans-serif';
      ctx.fillText(總收穫金額: {this.moneyTotal} 元  |  得分: , w / 2, h / 2);

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
