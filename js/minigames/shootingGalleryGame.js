// Mini-Game 4: 柿界神射手靶場 (Target Shooting Gallery)
import { audio } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { saveManager } from '../engine/saveManager.js';

export class ShootingGalleryGame {
  constructor(canvas, onExit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onExit = onExit;

    this.crosshairX = 480;
    this.crosshairY = 270;
    this.targets = [];
    this.bullets = [];
    this.floatingTexts = [];

    this.score = 0;
    this.shotsFired = 0;
    this.hits = 0;
    this.timeLeft = 35;
    this.isOver = false;
    this.spawnTimer = 0.3;
  }

  handleMouseMove(canvasX, canvasY) {
    if (!this.isOver) {
      this.crosshairX = canvasX;
      if (canvasY !== undefined) this.crosshairY = canvasY;
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
      return;
    }

    this.crosshairX = canvasX;
    this.crosshairY = canvasY;
    this.shoot(canvasX, canvasY);
  }

  handleKeyDown(code) {
    if (this.isOver && (code === 'Enter' || code === 'Space')) {
      this.finish();
      return;
    }
    if (code === 'Space' || code === 'KeyJ' || code === 'KeyX') {
      this.shoot(this.crosshairX, this.crosshairY);
    }
    if (code === 'ArrowLeft' || code === 'KeyA') this.crosshairX = Math.max(30, this.crosshairX - 30);
    if (code === 'ArrowRight' || code === 'KeyD') this.crosshairX = Math.min(930, this.crosshairX + 30);
    if (code === 'ArrowUp' || code === 'KeyW') this.crosshairY = Math.max(80, this.crosshairY - 30);
    if (code === 'ArrowDown' || code === 'KeyS') this.crosshairY = Math.min(480, this.crosshairY + 30);
  }

  shoot(tx, ty) {
    this.shotsFired++;
    audio.playShoot();
    particles.createHitSparks(tx, ty, 8, '#ffe066');

    let hitAny = false;
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      const dist = Math.hypot(tx - t.x, ty - t.y);
      if (dist <= t.radius + 10) {
        hitAny = true;
        this.hits++;
        this.hitTarget(t, i);
        break;
      }
    }

    if (!hitAny) {
      this.floatingTexts.push({ text: 'MISS', x: tx, y: ty - 15, color: '#aaa', timer: 0.5 });
    }
  }

  hitTarget(t, index) {
    if (t.type === 'target') {
      this.score += 150;
      audio.playEnemyHit();
      particles.createExplosion(t.x, t.y, 16, '#ff3d00');
      this.floatingTexts.push({ text: '+150 🎯 標靶命中!', x: t.x, y: t.y - 20, color: '#ffea00', timer: 0.9 });
    } else if (t.type === 'ufo') {
      this.score += 350;
      audio.playCoin();
      particles.createExplosion(t.x, t.y, 25, '#00e5ff');
      this.floatingTexts.push({ text: '+350 🛸 極速幽浮!', x: t.x, y: t.y - 20, color: '#00e5ff', timer: 0.9 });
    } else if (t.type === 'rainbow') {
      this.score += 600;
      audio.playCoin();
      particles.createExplosion(t.x, t.y, 30, '#ffd700');
      this.floatingTexts.push({ text: '+600 🍉 彩虹甜柿!', x: t.x, y: t.y - 20, color: '#ffd700', timer: 1.0 });
    } else if (t.type === 'bomb') {
      this.score = Math.max(0, this.score - 250);
      audio.playHurt();
      particles.createExplosion(t.x, t.y, 30, '#ff1744');
      this.floatingTexts.push({ text: '-250 💣 炸彈扣分!', x: t.x, y: t.y - 20, color: '#ff1744', timer: 1.0 });
    }

    this.targets.splice(index, 1);
  }

  spawnTarget() {
    const lanes = [120, 200, 290, 380];
    const laneY = lanes[Math.floor(Math.random() * lanes.length)];
    const fromLeft = Math.random() < 0.5;

    const types = [
      { type: 'target', radius: 28, speed: 180, prob: 0.45 },
      { type: 'ufo', radius: 24, speed: 320, prob: 0.25 },
      { type: 'rainbow', radius: 30, speed: 220, prob: 0.15 },
      { type: 'bomb', radius: 26, speed: 190, prob: 0.15 }
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

    this.targets.push({
      x: fromLeft ? -40 : 1000,
      y: laneY,
      vx: fromLeft ? selected.speed : -selected.speed,
      type: selected.type,
      radius: selected.radius
    });
  }

  update(dt) {
    if (this.isOver) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.isOver = true;
      audio.playLevelClear();
      saveManager.saveMiniGameScore('shootingGallery', this.score);
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.45;
      this.spawnTarget();
    }

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      t.x += t.vx * dt;
      if ((t.vx > 0 && t.x > 1020) || (t.vx < 0 && t.x < -60)) {
        this.targets.splice(i, 1);
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

    // Shooting range background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0a192f');
    bg.addColorStop(0.5, '#1e3c72');
    bg.addColorStop(1, '#2a5298');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Target lanes wooden tracks
    const lanes = [120, 200, 290, 380];
    for (let ly of lanes) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, ly + 25, w, 6);
      ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
      ctx.fillRect(0, ly + 27, w, 2);
    }

    // Title & HUD
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🎯 柿界神射手靶場 (Shooting Gallery)', 30, 40);

    const accuracy = this.shotsFired > 0 ? Math.round((this.hits / this.shotsFired) * 100) : 100;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
    ctx.fillText(`⏱️ 時間: ${Math.ceil(this.timeLeft)}s`, 30, 70);
    ctx.fillText(`⭐ 得分: ${this.score}`, 200, 70);
    ctx.fillText(`🎯 命中率: ${accuracy}% (${this.hits}/${this.shotsFired})`, 380, 70);

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

    // Draw Targets
    for (let t of this.targets) {
      ctx.save();
      ctx.translate(t.x, t.y);

      if (t.type === 'target') {
        ctx.fillStyle = '#ff1744';
        ctx.beginPath();
        ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, t.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff1744';
        ctx.beginPath();
        ctx.arc(0, 0, t.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (t.type === 'ufo') {
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 14;
        ctx.font = '38px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🛸', 0, 12);
      } else if (t.type === 'rainbow') {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 18;
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🍉', 0, 12);
      } else if (t.type === 'bomb') {
        ctx.fillStyle = '#ff1744';
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 12;
        ctx.font = '38px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💣', 0, 12);
      }
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

    // Crosshair
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffeb3b';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.crosshairX, this.crosshairY, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.crosshairX - 26, this.crosshairY);
    ctx.lineTo(this.crosshairX + 26, this.crosshairY);
    ctx.moveTo(this.crosshairX, this.crosshairY - 26);
    ctx.lineTo(this.crosshairX, this.crosshairY + 26);
    ctx.stroke();
    ctx.restore();

    if (this.isOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 34px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 神射手挑戰結算！', w / 2, h / 2 - 50);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
      ctx.fillText(`總得分: ${this.score} 分  |  命中率: ${accuracy}%`, w / 2, h / 2);

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
