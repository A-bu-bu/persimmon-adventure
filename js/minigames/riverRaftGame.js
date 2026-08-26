// Mini-Game 7: 激流接柿・大溯源 (River Raft Game)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

export class RiverRaftGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    this.raftX = 480;
    this.raftY = 460;
    this.raftWidth = 90;
    this.raftHeight = 24;
    this.raftSpeed = 420;

    this.keys = {};
    this.items = [];
    this.floatingTexts = [];
    this.waves = [];

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 40;
    this.isOver = false;
    this.spawnTimer = 0.35;
    this.waveTimer = 0;

    for (let i = 0; i < 8; i++) {
      this.waves.push({
        x: Math.random() * 960,
        y: 380 + Math.random() * 120,
        speed: 40 + Math.random() * 30,
        size: 20 + Math.random() * 40
      });
    }
  }

  handleKeyDown(code) {
    this.keys[code] = true;
    if (this.isOver && (code === 'Enter' || code === 'Space')) this.finish();
  }
  handleKeyUp(code) { this.keys[code] = false; }

  handleMouseMove(canvasX) {
    if (!this.isOver) {
      this.raftX = Math.max(this.raftWidth / 2, Math.min(960 - this.raftWidth / 2, canvasX));
    }
  }

  handleClick(canvasX, canvasY) {
    if (this.isOver) {
      if (canvasX > 380 && canvasX < 580 && canvasY > 300 && canvasY < 360) this.finish();
      return;
    }
    if (canvasX > 840 && canvasX < 940 && canvasY > 15 && canvasY < 60) { this.finish(); return; }
  }

  spawnItem() {
    const types = [
      { type: 'persimmon', val: 120, prob: 0.40 },
      { type: 'ingot',     val: 350, prob: 0.20 },
      { type: 'heart',     val: 200, prob: 0.15 },
      { type: 'rock',      val: -200, prob: 0.15 },
      { type: 'log',       val: -150, prob: 0.10 }
    ];
    const r = Math.random();
    let acc = 0, sel = types[0];
    for (const t of types) { acc += t.prob; if (r <= acc) { sel = t; break; } }
    const speed = 160 + Math.random() * 80;
    const drift = (Math.random() - 0.5) * 80;
    this.items.push({
      x: 60 + Math.random() * 840, y: -30,
      vy: speed, vx: drift,
      type: sel.type, val: sel.val, size: 22
    });
  }

  update(dt) {
    if (this.isOver) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.isOver = true;
      audio.playLevelClear();
      saveManager.saveMiniGameScore('riverRaft', this.score);
    }

    if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.raftX -= this.raftSpeed * dt;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) this.raftX += this.raftSpeed * dt;
    this.raftX = Math.max(this.raftWidth / 2 + 10, Math.min(960 - this.raftWidth / 2 - 10, this.raftX));

    this.waveTimer += dt;
    for (const w of this.waves) {
      w.x += w.speed * dt;
      if (w.x > 1020) w.x = -60;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.22, 0.38 - (40 - this.timeLeft) * 0.004);
      this.spawnItem();
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.x += item.vx * dt;
      item.y += item.vy * dt;

      if (
        item.y + item.size >= this.raftY &&
        item.y <= this.raftY + this.raftHeight &&
        item.x >= this.raftX - this.raftWidth / 2 - item.size &&
        item.x <= this.raftX + this.raftWidth / 2 + item.size
      ) {
        if (item.type === 'rock' || item.type === 'log') {
          this.score = Math.max(0, this.score + item.val);
          this.combo = 0;
          audio.playHurt();
          particles.createHitSparks(item.x, item.y, 14, '#ff5722');
          const label = item.type === 'rock' ? '🪨 落石!' : '🪵 漂流木!';
          this.floatingTexts.push({ text: `${item.val} ${label}`, x: item.x, y: item.y - 20, color: '#ff5722', timer: 0.9 });
        } else {
          this.combo++;
          if (this.combo > this.maxCombo) this.maxCombo = this.combo;
          const gain = item.val + this.combo * 20;
          this.score += gain;
          audio.playCoin();
          particles.createCoinSparkle(item.x, item.y);
          const emoji = item.type === 'persimmon' ? '🍊' : item.type === 'ingot' ? '💰' : '❤️';
          this.floatingTexts.push({ text: `+${gain} ${emoji}`, x: item.x, y: item.y - 20, color: '#a3ff44', timer: 0.9 });
        }
        this.items.splice(i, 1);
        continue;
      }
      if (item.y > 560) this.items.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].y -= 30 * dt;
      this.floatingTexts[i].timer -= dt;
      if (this.floatingTexts[i].timer <= 0) this.floatingTexts.splice(i, 1);
    }
    particles.update(dt);
  }

  draw() {
    const ctx = this.ctx;
    const w = 960, h = 540;

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0d2137');
    bg.addColorStop(0.4, '#0a3d5c');
    bg.addColorStop(1, '#1a7a8a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    for (const wave of this.waves) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= wave.size; i++) {
        const wx = wave.x + i;
        const wy = wave.y + Math.sin(i * 0.18 + this.waveTimer * 2.5) * 6;
        i === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🌊 激流接柿・大溯源！ (River Raft)', 30, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
    ctx.fillText(`⏱️ ${Math.ceil(this.timeLeft)}s`, 30, 70);
    ctx.fillText(`⭐ 得分: ${this.score}`, 140, 70);
    if (this.combo > 1) { ctx.fillStyle = '#ffd700'; ctx.fillText(`🔥 連接: x${this.combo}!`, 340, 70); }

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    if (ctx.roundRect) ctx.roundRect(840, 16, 90, 36, 8); else ctx.rect(840, 16, 90, 36);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
    ctx.fillText('返回 ✖', 885, 40);

    for (const item of this.items) {
      ctx.save();
      ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
      ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 8;
      const emojis = { persimmon: '🍊', ingot: '💰', heart: '❤️', rock: '🪨', log: '🪵' };
      ctx.fillText(emojis[item.type] || '?', item.x, item.y + 14);
      ctx.restore();
    }

    ctx.save();
    const rx = this.raftX - this.raftWidth / 2;
    const ry = this.raftY;
    ctx.fillStyle = '#8B4513';
    ctx.shadowColor = '#ff9800'; ctx.shadowBlur = 6;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(rx + i * (this.raftWidth / 3) + 2, ry, this.raftWidth / 3 - 4, this.raftHeight);
    }
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 3;
    ctx.strokeRect(rx, ry, this.raftWidth, this.raftHeight);
    ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.shadowBlur = 0;
    ctx.fillText('🧑', this.raftX, ry - 4);
    ctx.restore();

    particles.draw(ctx);
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.fillStyle = ft.color; ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    if (this.isOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 34px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🌊 激流溯源挑戰結算！', w / 2, h / 2 - 50);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`總得分: ${this.score} 分  |  最高連接: x${this.maxCombo}`, w / 2, h / 2);
      ctx.fillStyle = '#ff7700';
      if (ctx.roundRect) ctx.roundRect(w / 2 - 90, h / 2 + 40, 180, 44, 10); else ctx.rect(w / 2 - 90, h / 2 + 40, 180, 44);
      ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
      ctx.fillText('🍊 回主選單 (點擊)', w / 2, h / 2 + 68);
    }
  }

  finish() { this.isOver = true; if (this.onExit) this.onExit(); }
}
