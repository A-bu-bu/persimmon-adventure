// Mini-Game 6: 真魔王彈刀大對決 (Boss Parrying & Bullet Deflect)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

export class BossParryGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    this.playerX = 180;
    this.playerY = 320;
    this.bossX = 760;
    this.bossY = 280;
    this.bossHp = 30;
    this.maxBossHp = 30;
    this.playerHp = 5;
    this.maxPlayerHp = 5;

    this.projectiles = [];
    this.floatingTexts = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectParries = 0;
    this.isOver = false;
    this.hasWon = false;
    this.parrySwingTimer = 0;
    this.fireTimer = 1.0;

    this.heroImg = new Image();
    this.heroImg.src = './assets/hero_transparent.png';
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

    this.executeParry();
  }

  handleKeyDown(code) {
    if (this.isOver && (code === 'Enter' || code === 'Space')) {
      this.finish();
      return;
    }
    if (code === 'Space' || code === 'KeyJ' || code === 'KeyX' || code === 'KeyK') {
      this.executeParry();
    }
  }

  executeParry() {
    if (this.isOver) return;

    this.parrySwingTimer = 0.22;
    audio.playShoot();

    let parriedAny = false;
    for (let p of this.projectiles) {
      if (!p.isDeflected && p.x >= this.playerX - 20 && p.x <= this.playerX + 110) {
        parriedAny = true;
        const dist = Math.abs(p.x - (this.playerX + 40));

        if (dist <= 35) {
          // PERFECT PARRY
          p.isDeflected = true;
          p.vx = -p.vx * 1.6;
          this.combo++;
          if (this.combo > this.maxCombo) this.maxCombo = this.combo;
          this.perfectParries++;
          const gain = 300 + this.combo * 50;
          this.score += gain;
          audio.playCoin();
          audio.playEnemyHit();
          particles.createExplosion(p.x, p.y, 25, '#ffd700');
          this.floatingTexts.push({ text: `⚡ PERFECT PARRY! +${gain}`, x: this.playerX + 60, y: this.playerY - 40, color: '#ffd700', timer: 1.0 });
        } else {
          // GOOD PARRY
          p.isDeflected = true;
          p.vx = -p.vx * 1.2;
          this.combo++;
          if (this.combo > this.maxCombo) this.maxCombo = this.combo;
          const gain = 150 + this.combo * 20;
          this.score += gain;
          audio.playJump();
          particles.createHitSparks(p.x, p.y, 14, '#00e5ff');
          this.floatingTexts.push({ text: `✨ GREAT PARRY! +${gain}`, x: this.playerX + 60, y: this.playerY - 40, color: '#00e5ff', timer: 0.8 });
        }
        break;
      }
    }

    if (!parriedAny) {
      this.floatingTexts.push({ text: 'MISS!', x: this.playerX + 60, y: this.playerY - 20, color: '#888', timer: 0.4 });
    }
  }

  spawnBossAttack() {
    const types = [
      { speed: 380, color: '#ff1744', size: 16, glow: '#ff5252' }, // Normal
      { speed: 520, color: '#e040fb', size: 14, glow: '#ea80fc' }, // Fast
      { speed: 280, color: '#ff9100', size: 22, glow: '#ffd180' }  // Heavy
    ];
    const sel = types[Math.floor(Math.random() * types.length)];

    this.projectiles.push({
      x: this.bossX - 40,
      y: this.playerY + (Math.random() - 0.5) * 20,
      vx: -sel.speed,
      color: sel.color,
      size: sel.size,
      glow: sel.glow,
      isDeflected: false
    });
  }

  update(dt) {
    if (this.isOver) return;

    if (this.parrySwingTimer > 0) this.parrySwingTimer -= dt;

    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTimer = Math.max(0.65, 1.4 - (this.maxBossHp - this.bossHp) * 0.025);
      this.spawnBossAttack();
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;

      // Deflected hit Boss
      if (p.isDeflected && p.x >= this.bossX - 30) {
        this.bossHp--;
        audio.playEnemyHit();
        particles.createExplosion(this.bossX, this.bossY, 20, p.glow);
        this.projectiles.splice(i, 1);

        if (this.bossHp <= 0) {
          this.bossHp = 0;
          this.isOver = true;
          this.hasWon = true;
          this.score += 5000 + this.playerHp * 500;
          audio.playLevelClear();
          saveManager.saveMiniGameScore('bossParry', this.score);
        }
        continue;
      }

      // Hit Player
      if (!p.isDeflected && p.x <= this.playerX + 20) {
        this.playerHp--;
        this.combo = 0;
        audio.playHurt();
        particles.createHitSparks(this.playerX, this.playerY, 18, '#ff1744');
        this.floatingTexts.push({ text: '💥 受到攻擊 -1HP', x: this.playerX, y: this.playerY - 30, color: '#ff1744', timer: 0.9 });
        this.projectiles.splice(i, 1);

        if (this.playerHp <= 0) {
          this.playerHp = 0;
          this.isOver = true;
          this.hasWon = false;
          saveManager.saveMiniGameScore('bossParry', this.score);
        }
        continue;
      }

      if (p.x < -50 || p.x > 1020) {
        this.projectiles.splice(i, 1);
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

    // Dark Throne Background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0f051d');
    bg.addColorStop(0.5, '#2b0938');
    bg.addColorStop(1, '#5c102a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Arena Floor
    ctx.fillStyle = '#1f132b';
    ctx.fillRect(0, 420, w, 120);
    ctx.fillStyle = '#e040fb';
    ctx.fillRect(0, 420, w, 4);

    // Title & HUD
    ctx.fillStyle = '#ff4081';
    ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🥋 真魔王彈刀大對決 (Boss Parry & Deflect)', 30, 40);

    // Player HP & Boss HP
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
    ctx.fillText(`❤️ 勇士生命: ${'💖'.repeat(this.playerHp)}`, 30, 75);
    ctx.fillText(`⭐ 得分: ${this.score}`, 300, 75);
    if (this.combo > 1) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`🔥 連擊: x${this.combo}!`, 480, 75);
    }

    // Boss HP Bar
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('👑 終極魔王皇帝', 930, 75);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(730, 85, 200, 14);
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(730, 85, (this.bossHp / this.maxBossHp) * 200, 14);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(730, 85, 200, 14);

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

    // Parry Zone Indicator on Player
    ctx.save();
    ctx.strokeStyle = this.parrySwingTimer > 0 ? '#ffd700' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = this.parrySwingTimer > 0 ? 4 : 2;
    ctx.beginPath();
    ctx.arc(this.playerX + 40, this.playerY + 20, 55, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.restore();

    // Draw Player Hero
    ctx.save();
    if (this.heroImg.complete) {
      ctx.drawImage(this.heroImg, this.playerX - 25, this.playerY - 30, 80, 80);
    } else {
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.arc(this.playerX + 15, this.playerY + 15, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sword Blade Animation
    if (this.parrySwingTimer > 0) {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(this.playerX + 40, this.playerY + 20, 60, -0.6, 0.6);
      ctx.stroke();
    }
    ctx.restore();

    // Draw Boss
    ctx.save();
    ctx.fillStyle = '#9c27b0';
    ctx.shadowColor = '#e040fb';
    ctx.shadowBlur = 25;
    ctx.font = '90px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👿', this.bossX, this.bossY + 50);
    ctx.restore();

    // Draw Projectiles
    for (let p of this.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.glow;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = this.hasWon ? '#ffd700' : '#ff1744';
      ctx.font = 'bold 36px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.hasWon ? '👑 戰勝真魔王！彈刀神話！' : '💥 彈刀失誤！挑戰失敗！', w / 2, h / 2 - 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`總得分: ${this.score} 分  |  完美彈刀: ${this.perfectParries} 次  |  最高連擊: x${this.maxCombo}`, w / 2, h / 2);

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
