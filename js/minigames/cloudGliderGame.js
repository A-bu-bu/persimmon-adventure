// Mini-Game 5: 雲霄無盡滑翔傘 (Cloud Glider)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

export class CloudGliderGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    this.playerX = 480;
    this.playerY = 160;
    this.playerWidth = 60;
    this.playerHeight = 60;
    this.speed = 460;
    this.keys = {};

    this.altitude = 3000; // Meters
    this.fallSpeed = 80;
    this.score = 0;
    this.ringsPassed = 0;
    this.isOver = false;
    this.spawnTimer = 0.25;

    this.cloudItems = [];
    this.floatingTexts = [];
    this.boostTimer = 0;

    this.heroImg = new Image();
    this.heroImg.src = './assets/hero_transparent.png';
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
      this.playerX = Math.max(40, Math.min(920 - this.playerWidth, canvasX - this.playerWidth / 2));
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

  spawnCloudItem() {
    const types = [
      { type: 'coin', val: 100, label: '🪙 雲端金幣', color: '#ffd700', prob: 0.45, size: 22 },
      { type: 'ring', val: 350, label: '🌈 彩虹光環', color: '#00e5ff', prob: 0.22, size: 48 },
      { type: 'persimmon', val: 500, label: '🍊 天界仙柿', color: '#ff9800', prob: 0.15, size: 28 },
      { type: 'thunder', val: -250, label: '⚡ 雷雲', color: '#7c4dff', prob: 0.18, size: 42 }
    ];

    const r = Math.random();
    let accum = 0;
    let selected = types[0];
    for (let t of types) {
      accum += t.prob;
      if (r <= accum) {
        selected = t;
        break;
      }
    }

    this.cloudItems.push({
      x: 50 + Math.random() * 860,
      y: 560,
      type: selected.type,
      val: selected.val,
      color: selected.color,
      size: selected.size,
      speed: (this.boostTimer > 0 ? 360 : 220) + Math.random() * 30
    });
  }

  update(dt) {
    if (this.isOver) return;

    // Altitude descent
    const currentFall = (this.boostTimer > 0 ? this.fallSpeed * 1.8 : this.fallSpeed) * dt;
    this.altitude -= currentFall;
    if (this.altitude <= 0) {
      this.altitude = 0;
      this.isOver = true;
      audio.playLevelClear();
      saveManager.saveMiniGameScore('cloudGlider', this.score);
    }

    if (this.boostTimer > 0) this.boostTimer -= dt;

    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.playerX -= this.speed * dt;
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.playerX += this.speed * dt;
    }
    this.playerX = Math.max(30, Math.min(930 - this.playerWidth, this.playerX));

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.boostTimer > 0 ? 0.18 : 0.28;
      this.spawnCloudItem();
    }

    for (let i = this.cloudItems.length - 1; i >= 0; i--) {
      const item = this.cloudItems[i];
      item.y -= item.speed * dt;

      // Collision with player
      const px = this.playerX + this.playerWidth / 2;
      const py = this.playerY + this.playerHeight / 2;
      const dist = Math.hypot(px - item.x, py - item.y);

      if (dist <= item.size + 24) {
        if (item.type === 'thunder') {
          this.score = Math.max(0, this.score - 250);
          audio.playHurt();
          particles.createHitSparks(item.x, item.y, 16, '#7c4dff');
          this.floatingTexts.push({ text: '-250 ⚡ 雷擊觸電!', x: item.x, y: item.y - 20, color: '#ff1744', timer: 0.9 });
        } else if (item.type === 'ring') {
          this.score += 350;
          this.ringsPassed++;
          this.boostTimer = 3.0;
          audio.playLevelClear();
          particles.createExplosion(item.x, item.y, 25, '#00e5ff');
          this.floatingTexts.push({ text: '+350 🌈 彩虹穿環加速!', x: item.x, y: item.y - 20, color: '#00e5ff', timer: 1.0 });
        } else if (item.type === 'persimmon') {
          this.score += 500;
          audio.playCoin();
          particles.createExplosion(item.x, item.y, 20, '#ffd700');
          this.floatingTexts.push({ text: '+500 🍊 天界仙柿!', x: item.x, y: item.y - 20, color: '#ffd700', timer: 1.0 });
        } else {
          this.score += 100;
          audio.playCoin();
          particles.createHitSparks(item.x, item.y, 10, '#ffd700');
          this.floatingTexts.push({ text: '+100 🪙', x: item.x, y: item.y - 20, color: '#ffd700', timer: 0.7 });
        }

        this.cloudItems.splice(i, 1);
        continue;
      }

      if (item.y < -60) {
        this.cloudItems.splice(i, 1);
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

    // Sky Background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#021028');
    bg.addColorStop(0.4, '#1b3b6f');
    bg.addColorStop(0.8, '#4a90e2');
    bg.addColorStop(1, '#90caf9');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Title & HUD
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🪂 雲霄無盡滑翔傘 (Cloud Glider)', 30, 40);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
    ctx.fillText(`⛰️ 高度: ${Math.ceil(this.altitude)}m`, 30, 70);
    ctx.fillText(`⭐ 得分: ${this.score}`, 200, 70);
    ctx.fillText(`🌈 穿環: ${this.ringsPassed}`, 380, 70);
    if (this.boostTimer > 0) {
      ctx.fillStyle = '#ffea00';
      ctx.fillText('🚀 極速俯衝加速中!', 500, 70);
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

    // Draw Items
    for (let item of this.cloudItems) {
      ctx.save();
      ctx.translate(item.x, item.y);

      if (item.type === 'coin') {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffea00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'ring') {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 8;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, item.size, 16, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (item.type === 'persimmon') {
        ctx.fillStyle = '#ff9800';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 14;
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🍊', 0, 12);
      } else if (item.type === 'thunder') {
        ctx.fillStyle = '#7c4dff';
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 14;
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', 0, 12);
      }
      ctx.restore();
    }

    // Draw Player Parachute & Hero
    ctx.save();
    ctx.translate(this.playerX + this.playerWidth / 2, this.playerY + this.playerHeight / 2);

    // Parachute canopy
    ctx.fillStyle = this.boostTimer > 0 ? '#ffea00' : '#ff7700';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -40, 36, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Suspension lines
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(-32, -40);
    ctx.lineTo(0, -5);
    ctx.moveTo(32, -40);
    ctx.lineTo(0, -5);
    ctx.stroke();

    // Hero
    if (this.heroImg.complete) {
      ctx.drawImage(this.heroImg, -28, -15, 56, 56);
    } else {
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.arc(0, 10, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

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
      ctx.fillText('🪂 雲霄滑翔降落成功！', w / 2, h / 2 - 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`總得分: ${this.score} 分  |  彩虹穿環: ${this.ringsPassed} 次`, w / 2, h / 2);

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
