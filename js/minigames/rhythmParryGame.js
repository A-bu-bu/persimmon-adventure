// Mini-Game 10: 終極魔王節奏彈刀！ (Rhythm Parry - Final Boss)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

export class RhythmParryGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    this.bossHp = 40;
    this.maxBossHp = 40;
    this.playerHp = 7;
    this.maxPlayerHp = 7;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectCount = 0;
    this.goodCount = 0;
    this.timeLeft = 60;
    this.isOver = false;
    this.hasWon = false;

    this.beatInterval = 1.2;
    this.beatTimer = 0;
    this.beatPhase = 0;
    this.bullets = [];
    this.parryFlash = 0;
    this.floatingTexts = [];
    this.bossRageMode = false;

    this.heroImg = new Image();
    this.heroImg.src = './assets/hero_transparent.png';
  }

  handleClick(canvasX, canvasY) {
    if (this.isOver) {
      if (canvasX > 380 && canvasX < 580 && canvasY > 300 && canvasY < 360) { this.finish(); }
      return;
    }
    if (canvasX > 840 && canvasX < 940 && canvasY > 15 && canvasY < 60) { this.finish(); return; }
    this.executeParry();
  }

  handleKeyDown(code) {
    if (this.isOver && (code === 'Enter' || code === 'Space')) { this.finish(); return; }
    if (['Space', 'KeyJ', 'KeyX', 'KeyK', 'Enter'].includes(code)) this.executeParry();
  }

  executeParry() {
    if (this.isOver) return;
    this.parryFlash = 0.2;

    let bestResult = null;
    let bestDist = Infinity;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.deflected) {
        const centerX = 200;
        const dist = Math.abs(b.x - centerX);
        if (dist < bestDist && dist <= 75) {
          bestDist = dist; bestResult = { idx: i, dist };
        }
      }
    }

    if (!bestResult) {
      this.combo = 0;
      this.floatingTexts.push({ text: 'MISS!', x: 200, y: 290, color: '#888', timer: 0.4 });
      return;
    }

    const b = this.bullets[bestResult.idx];
    b.deflected = true;
    b.vx = Math.abs(b.vx) * 1.5;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    if (bestResult.dist <= 30) {
      // PERFECT
      this.perfectCount++;
      const gain = 400 + this.combo * 80;
      this.score += gain;
      audio.playCoin();
      particles.createExplosion(b.x, b.y, 30, '#ffd700');
      this.floatingTexts.push({ text: `⚡ PERFECT! +${gain}`, x: 200, y: 280, color: '#ffd700', timer: 1.0 });
    } else {
      // GOOD
      this.goodCount++;
      const gain = 200 + this.combo * 30;
      this.score += gain;
      audio.playJump();
      particles.createHitSparks(b.x, b.y, 16, '#00e5ff');
      this.floatingTexts.push({ text: `✨ GOOD! +${gain}`, x: 200, y: 280, color: '#00e5ff', timer: 0.8 });
    }
  }

  fireBossBullet() {
    const speed = this.bossRageMode ? 320 + Math.random() * 120 : 220 + Math.random() * 80;
    const pattern = Math.floor(this.beatPhase % 4);
    const yOffsets = pattern === 0 ? [0] : pattern === 1 ? [-30, 30] : pattern === 2 ? [0, -50, 50] : [-30, 0, 30];
    for (const dy of yOffsets) {
      this.bullets.push({
        x: 750, y: 310 + dy,
        vx: -speed,
        deflected: false,
        color: this.bossRageMode ? '#ff1744' : '#e040fb',
        size: this.bossRageMode ? 18 : 14
      });
    }
    this.beatPhase++;
  }

  update(dt) {
    if (this.isOver) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0 && !this.hasWon) {
      this.timeLeft = 0; this.isOver = true;
      saveManager.saveMiniGameScore('rhythmParry', this.score);
    }

    if (this.parryFlash > 0) this.parryFlash -= dt;
    this.bossRageMode = this.bossHp <= this.maxBossHp * 0.4;

    // Beat spawning
    this.beatTimer += dt;
    const interval = this.bossRageMode ? this.beatInterval * 0.65 : this.beatInterval;
    if (this.beatTimer >= interval) {
      this.beatTimer = 0;
      this.fireBossBullet();
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;

      // Deflected hits boss
      if (b.deflected && b.x >= 720) {
        this.bossHp--;
        audio.playEnemyHit();
        particles.createExplosion(740, 310, 22, b.color);
        this.bullets.splice(i, 1);
        if (this.bossHp <= 0) {
          this.bossHp = 0;
          this.isOver = true; this.hasWon = true;
          this.score += 8000 + this.playerHp * 800 + this.perfectCount * 200;
          audio.playLevelClear();
          saveManager.saveMiniGameScore('rhythmParry', this.score);
        }
        continue;
      }

      // Hits player (missed)
      if (!b.deflected && b.x <= 150) {
        this.playerHp--;
        this.combo = 0;
        audio.playHurt();
        particles.createHitSparks(160, 310, 16, '#ff1744');
        this.floatingTexts.push({ text: '💥 受到攻擊！', x: 200, y: 260, color: '#ff1744', timer: 0.8 });
        this.bullets.splice(i, 1);
        if (this.playerHp <= 0) {
          this.playerHp = 0; this.isOver = true;
          saveManager.saveMiniGameScore('rhythmParry', this.score);
        }
        continue;
      }
      if (b.x < -60 || b.x > 1020) this.bullets.splice(i, 1);
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

    // Dark final boss background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a0015'); bg.addColorStop(0.5, '#200035'); bg.addColorStop(1, '#3d001a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Rage-mode pulsing border
    if (this.bossRageMode) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 180);
      ctx.strokeStyle = `rgba(255, 23, 68, ${pulse * 0.8})`;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, W - 10, H - 10);
    }

    // Arena floor
    ctx.fillStyle = '#1f0030'; ctx.fillRect(0, 430, W, H - 430);
    ctx.fillStyle = this.bossRageMode ? '#ff1744' : '#9c27b0';
    ctx.fillRect(0, 430, W, 4);

    // Title & HUD
    ctx.fillStyle = this.bossRageMode ? '#ff4444' : '#e040fb';
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
    ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('🌋 終極魔王節奏彈刀！ (Rhythm Parry)', 30, 40);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
    ctx.fillText(`⏱️ ${Math.ceil(this.timeLeft)}s`, 30, 70);
    ctx.fillText(`⭐ ${this.score}`, 140, 70);
    if (this.combo > 1) { ctx.fillStyle = '#ffd700'; ctx.fillText(`🔥 連擊: x${this.combo}!`, 290, 70); }

    // Player HP
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`❤️ ${'💖'.repeat(this.playerHp)}`, 30, 95);

    // Boss HP Bar
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('👹 混沌終極魔王', 930, 70);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(720, 80, 200, 14);
    ctx.fillStyle = this.bossRageMode ? '#ff1744' : '#e040fb';
    ctx.fillRect(720, 80, (this.bossHp / this.maxBossHp) * 200, 14);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(720, 80, 200, 14);

    // Return button
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    if (ctx.roundRect) ctx.roundRect(840, 16, 90, 36, 8); else ctx.rect(840, 16, 90, 36);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
    ctx.fillText('返回 ✖', 885, 40);

    // Parry zone arc on player side
    ctx.save();
    const parryColor = this.parryFlash > 0 ? '#ffd700' : 'rgba(255,255,255,0.2)';
    ctx.strokeStyle = parryColor; ctx.lineWidth = this.parryFlash > 0 ? 5 : 2;
    ctx.shadowColor = parryColor; ctx.shadowBlur = this.parryFlash > 0 ? 18 : 0;
    ctx.beginPath(); ctx.arc(175, 310, 65, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.restore();

    // Perfect zone indicator
    ctx.save();
    ctx.strokeStyle = 'rgba(255,215,0,0.5)'; ctx.lineWidth = 3; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.arc(175, 310, 28, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,215,0,0.12)';
    ctx.beginPath(); ctx.arc(175, 310, 28, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Hero
    if (this.heroImg.complete) {
      ctx.drawImage(this.heroImg, 100, 260, 80, 80);
    } else {
      ctx.font = '54px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🦸', 150, 330);
    }
    if (this.parryFlash > 0) {
      ctx.save(); ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 5; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(175, 310, 75, -0.5, 0.5); ctx.stroke(); ctx.restore();
    }

    // Boss
    const bossShake = this.bossRageMode ? (Math.random() - 0.5) * 5 : 0;
    ctx.save();
    ctx.shadowColor = this.bossRageMode ? '#ff1744' : '#e040fb'; ctx.shadowBlur = 30;
    ctx.font = '100px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('👹', 770 + bossShake, 360);
    ctx.restore();

    // Draw bullets
    for (const b of this.bullets) {
      ctx.save();
      ctx.fillStyle = b.deflected ? '#ffd700' : b.color;
      ctx.shadowColor = b.deflected ? '#ffd700' : b.color; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.size * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Beat pulse ring
    const beatPulse = Math.sin(this.beatTimer / this.beatInterval * Math.PI);
    if (beatPulse > 0.7) {
      ctx.save(); ctx.strokeStyle = `rgba(255,64,128,${beatPulse * 0.5})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(770, 310, 60 + beatPulse * 30, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    particles.draw(ctx);
    for (const ft of this.floatingTexts) {
      ctx.save(); ctx.fillStyle = ft.color; ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.font = 'bold 18px \"Microsoft JhengHei\", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y); ctx.restore();
    }

    if (this.isOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = this.hasWon ? '#ffd700' : '#ff1744';
      ctx.font = 'bold 34px \"Microsoft JhengHei\", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.hasWon ? '🌋 戰勝混沌終極魔王！節奏完美！' : '💥 節奏彈刀失誤！挑戰失敗！', W / 2, H / 2 - 50);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 18px \"Microsoft JhengHei\", sans-serif';
      ctx.fillText(`總得分: ${this.score} 分  |  完美彈刀: ${this.perfectCount} 次  |  最高連擊: x${this.maxCombo}`, W / 2, H / 2);
      ctx.fillStyle = '#ff7700';
      if (ctx.roundRect) ctx.roundRect(W / 2 - 90, H / 2 + 40, 180, 44, 10); else ctx.rect(W / 2 - 90, H / 2 + 40, 180, 44);
      ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px \"Microsoft JhengHei\", sans-serif';
      ctx.fillText('🍊 回主選單 (點擊)', W / 2, H / 2 + 68);
    }
  }

  finish() { this.isOver = true; if (this.onExit) this.onExit(); }
}
