// In-Game HUD (Heads Up Display) & Boss Health Bar Renderer

export class HUD {
  constructor() {
    this.weaponNames = ['甜柿果籽彈', '吉祥散射彈', '超熟大爆發'];
    this.weaponIcons = ['🌰', '✨', '💥'];
  }

  draw(ctx, player, currentLevel, boss = null, camera) {
    ctx.save();

    // --- TOP-LEFT: HEALTH (柿子小愛心) ---
    const startX = 20;
    const startY = 20;

    for (let i = 0; i < player.maxHp; i++) {
      const hx = startX + i * 28;
      const hy = startY;
      const isFilled = i < player.hp;

      ctx.save();
      if (isFilled) {
        // Glowing Persimmon / Heart
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#ff2222';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(hx + 10, hy + 10, 9, 0, Math.PI * 2);
        ctx.fill();

        // Green leaf cap
        ctx.fillStyle = '#7ac943';
        ctx.beginPath();
        ctx.arc(hx + 10, hy + 3, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Empty Heart slot
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hx + 10, hy + 10, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // --- ENERGY / DASH BAR (柿氣能量槽) ---
    const barX = startX;
    const barY = startY + 28;
    const barW = 140;
    const barH = 10;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Fill
    const energyRatio = Math.max(0, Math.min(1, player.energy / player.maxEnergy));
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, '#ff9900');
    grad.addColorStop(1, '#ffdd00');
    ctx.fillStyle = grad;
    ctx.fillRect(barX + 1, barY + 1, (barW - 2) * energyRatio, barH - 2);

    // --- WEAPON SELECTOR BADGE ---
    const wepX = startX;
    const wepY = barY + 16;
    ctx.fillStyle = 'rgba(30, 20, 45, 0.75)';
    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 1.5;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(wepX, wepY, 140, 26, 6);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(wepX, wepY, 140, 26);
      ctx.strokeRect(wepX, wepY, 140, 26);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Microsoft JhengHei", "PingFang TC", sans-serif';
    ctx.fillText(`${this.weaponIcons[player.weapon]} ${this.weaponNames[player.weapon]}`, wepX + 8, wepY + 18);

    // --- TOP-RIGHT: SCORE, COINS & LEVEL ---
    const rightX = camera.viewportWidth - 20;

    ctx.textAlign = 'right';
    // Level Title
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 15px "Microsoft JhengHei", "PingFang TC", sans-serif';
    ctx.fillText(currentLevel.name, rightX, startY + 10);

    // Coins & Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Microsoft JhengHei", "PingFang TC", sans-serif';
    ctx.fillText(`🪙 甜柿金幣: ${player.coins}`, rightX, startY + 32);
    ctx.fillText(`⭐ 得分: ${player.score}`, rightX, startY + 52);

    // --- BOSS HEALTH BAR (When in Boss Stage) ---
    if (boss && (boss.active || boss.isDead)) {
      const bossBarW = Math.min(420, camera.viewportWidth - 100);
      const bossBarH = 14;
      const bossBarX = (camera.viewportWidth - bossBarW) / 2;
      const bossBarY = 22;

      // Boss Name & Phase
      ctx.textAlign = 'center';
      ctx.fillStyle = boss.isEnraged ? '#ff4444' : '#ffea00';
      ctx.font = 'bold 14px "Microsoft JhengHei", "PingFang TC", sans-serif';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(
        `👑 貪吃蟲魔王 - 泰坦巨蠶 ${boss.isEnraged ? '(狂暴模式!)' : ''}`,
        camera.viewportWidth / 2,
        bossBarY - 6
      );

      // Boss Bar Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(bossBarX, bossBarY, bossBarW, bossBarH);
      ctx.strokeStyle = boss.isEnraged ? '#ff2200' : '#ffaa00';
      ctx.lineWidth = 2;
      ctx.strokeRect(bossBarX, bossBarY, bossBarW, bossBarH);

      // Boss Bar Fill
      const bossRatio = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
      const bossGrad = ctx.createLinearGradient(bossBarX, 0, bossBarX + bossBarW, 0);
      bossGrad.addColorStop(0, boss.isEnraged ? '#ff0000' : '#ff7700');
      bossGrad.addColorStop(1, boss.isEnraged ? '#ff6600' : '#ffdd00');

      ctx.fillStyle = bossGrad;
      ctx.fillRect(bossBarX + 2, bossBarY + 2, (bossBarW - 4) * bossRatio, bossBarH - 4);
    }

    ctx.restore();
  }
}
