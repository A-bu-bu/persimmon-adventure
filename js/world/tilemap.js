// Tilemap Engine with Parallax Backgrounds & Hazard Traps
export class Tilemap {
  constructor(tileSize = 32) {
    this.tileSize = tileSize;
    this.width = 0;
    this.height = 0;
    this.tiles = [];
    this.theme = 'orchard'; // 'orchard', 'bramble', 'boss'
  }

  loadLevel(levelData) {
    this.width = levelData.width;
    this.height = levelData.height;
    this.tiles = levelData.tiles;
    this.theme = levelData.theme || 'orchard';
  }

  getTile(tx, ty) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
      return null;
    }
    const tileType = this.tiles[ty * this.width + tx];
    if (tileType === 0) return null;

    return {
      type: tileType,
      solid: tileType === 1 || tileType === 2 || tileType === 5,
      oneWay: tileType === 3,
      hazard: tileType === 4
    };
  }

  drawBackground(ctx, camera) {
    const w = camera.viewportWidth;
    const h = camera.viewportHeight;

    // --- SKY GRADIENT ---
    const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
    if (this.theme === 'orchard') {
      skyGradient.addColorStop(0, '#2d1b4e');
      skyGradient.addColorStop(0.5, '#7a3e65');
      skyGradient.addColorStop(1, '#d97d54');
    } else if (this.theme === 'bramble') {
      skyGradient.addColorStop(0, '#151324');
      skyGradient.addColorStop(0.6, '#282348');
      skyGradient.addColorStop(1, '#4a3055');
    } else if (this.theme === 'volcano') {
      // Magma Volcano Ridge
      skyGradient.addColorStop(0, '#2b0908');
      skyGradient.addColorStop(0.5, '#731f13');
      skyGradient.addColorStop(1, '#e65c00');
    } else if (this.theme === 'sky') {
      // Celestial Sky Canopy
      skyGradient.addColorStop(0, '#0c1b33');
      skyGradient.addColorStop(0.5, '#1e3c72');
      skyGradient.addColorStop(1, '#64b3f4');
    } else if (this.theme === 'final_boss') {
      // Cosmic Ancient Divine Tree Arena
      skyGradient.addColorStop(0, '#0a001a');
      skyGradient.addColorStop(0.5, '#3b0d60');
      skyGradient.addColorStop(1, '#9b1d70');
    } else {
      // Boss Arena (Dramatic Crimson & Gold Sunset)
      skyGradient.addColorStop(0, '#1e0c1b');
      skyGradient.addColorStop(0.5, '#541525');
      skyGradient.addColorStop(1, '#943828');
    }

    ctx.fillStyle = skyGradient;
    ctx.fillRect(camera.x, camera.y, w, h);

    // --- DISTANT SUN / CELESTIAL ORB ---
    ctx.save();
    const sunColor = this.theme === 'sky' ? '#e0f7fa' : (this.theme === 'volcano' ? '#ff3300' : (this.theme === 'final_boss' ? '#ffd700' : '#ffb347'));
    const shadowColor = this.theme === 'sky' ? '#80deea' : (this.theme === 'volcano' ? '#ff6600' : (this.theme === 'final_boss' ? '#ff00aa' : '#ffa500'));
    ctx.fillStyle = sunColor;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 24;
    const sunX = camera.x + w * 0.75 - (camera.x * 0.05);
    const sunY = camera.y + 90 - (camera.y * 0.03);
    ctx.beginPath();
    ctx.arc(sunX, sunY, this.theme === 'final_boss' ? 44 : 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- PARALLAX MOUNTAINS / CLOUDS LAYER 1 (Far) ---
    const farColor = this.theme === 'volcano' ? '#3d0c0c' : (this.theme === 'sky' ? 'rgba(255,255,255,0.25)' : (this.theme === 'final_boss' ? '#200533' : (this.theme === 'orchard' ? '#592c4e' : '#221a36')));
    ctx.fillStyle = farColor;
    const farOffset = camera.x * 0.15;
    ctx.beginPath();
    ctx.moveTo(camera.x, camera.y + h);
    for (let x = 0; x <= w + 120; x += 100) {
      const hillX = camera.x + x;
      const worldX = hillX + farOffset;
      const hillY = camera.y + h - 140 + Math.sin(worldX * 0.005) * 50;
      ctx.lineTo(hillX, hillY);
    }
    ctx.lineTo(camera.x + w, camera.y + h);
    ctx.fill();

    // --- PARALLAX LAYER 2 (Mid) ---
    const midColor = this.theme === 'volcano' ? '#260606' : (this.theme === 'sky' ? 'rgba(255,255,255,0.45)' : (this.theme === 'final_boss' ? '#120220' : (this.theme === 'orchard' ? '#3d2040' : '#171226')));
    ctx.fillStyle = midColor;
    const midOffset = camera.x * 0.35;
    ctx.beginPath();
    ctx.moveTo(camera.x, camera.y + h);
    for (let x = 0; x <= w + 100; x += 60) {
      const hillX = camera.x + x;
      const worldX = hillX + midOffset;
      const hillY = camera.y + h - 70 + Math.cos(worldX * 0.01) * 35;
      ctx.lineTo(hillX, hillY);
    }
    ctx.lineTo(camera.x + w, camera.y + h);
    ctx.fill();
  }

  drawTiles(ctx, camera) {
    const startTX = Math.max(0, Math.floor(camera.x / this.tileSize));
    const endTX = Math.min(this.width - 1, Math.ceil((camera.x + camera.viewportWidth) / this.tileSize));
    const startTY = Math.max(0, Math.floor(camera.y / this.tileSize));
    const endTY = Math.min(this.height - 1, Math.ceil((camera.y + camera.viewportHeight) / this.tileSize));

    const ts = this.tileSize;

    for (let ty = startTY; ty <= endTY; ty++) {
      for (let tx = startTX; tx <= endTX; tx++) {
        const tileType = this.tiles[ty * this.width + tx];
        if (tileType === 0) continue;

        const posX = tx * ts;
        const posY = ty * ts;

        ctx.save();
        if (tileType === 1) {
          // Top Ground Block
          const baseColor = this.theme === 'volcano' ? '#2b1810' : (this.theme === 'sky' ? '#1d3557' : (this.theme === 'final_boss' ? '#2b1035' : '#633e2b'));
          const topColor = this.theme === 'volcano' ? '#ff6600' : (this.theme === 'sky' ? '#48cae4' : (this.theme === 'final_boss' ? '#bf40bf' : '#6cb738'));
          const fringeColor = this.theme === 'volcano' ? '#ff9900' : (this.theme === 'sky' ? '#90e0ef' : (this.theme === 'final_boss' ? '#df73df' : '#8bd64e'));

          ctx.fillStyle = baseColor;
          ctx.fillRect(posX, posY, ts, ts);

          ctx.fillStyle = topColor;
          ctx.fillRect(posX, posY, ts, 6);
          ctx.fillStyle = fringeColor;
          for (let i = 0; i < ts; i += 6) {
            ctx.fillRect(posX + i, posY + 6, 4, 3);
          }
        } else if (tileType === 2) {
          // Deep Soil / Rock / Obsidian
          const rockColor = this.theme === 'volcano' ? '#1a0d0a' : (this.theme === 'sky' ? '#14213d' : (this.theme === 'final_boss' ? '#190822' : '#4a2d1f'));
          const innerColor = this.theme === 'volcano' ? '#0d0605' : (this.theme === 'sky' ? '#0b1320' : (this.theme === 'final_boss' ? '#0f0414' : '#392116'));

          ctx.fillStyle = rockColor;
          ctx.fillRect(posX, posY, ts, ts);
          ctx.fillStyle = innerColor;
          ctx.fillRect(posX + 4, posY + 4, ts - 8, ts - 8);
        } else if (tileType === 3) {
          // One-Way Wooden/Cloud Platform
          const platColor = this.theme === 'sky' ? '#e0fbfc' : (this.theme === 'volcano' ? '#ba5d2c' : '#9c6a38');
          const platInner = this.theme === 'sky' ? '#98c1d9' : (this.theme === 'volcano' ? '#782d12' : '#734b22');
          ctx.fillStyle = platColor;
          ctx.fillRect(posX, posY, ts, 8);
          ctx.fillStyle = platInner;
          ctx.fillRect(posX + 2, posY + 2, ts - 4, 4);
        } else if (tileType === 4) {
          // Spike Trap (Thorns / Magma Spikes / Energy Spikes)
          const spikeColor = this.theme === 'volcano' ? '#ff3300' : (this.theme === 'sky' ? '#00f0ff' : (this.theme === 'final_boss' ? '#ff0066' : '#d43535'));
          ctx.fillStyle = spikeColor;
          for (let i = 0; i < ts; i += 8) {
            ctx.beginPath();
            ctx.moveTo(posX + i, posY + ts);
            ctx.lineTo(posX + i + 4, posY + ts - 14);
            ctx.lineTo(posX + i + 8, posY + ts);
            ctx.fill();
          }
        } else if (tileType === 5) {
          // Stone Block / Boundary
          ctx.fillStyle = this.theme === 'volcano' ? '#331a1a' : '#545466';
          ctx.fillRect(posX, posY, ts, ts);
          ctx.fillStyle = this.theme === 'volcano' ? '#220d0d' : '#3a3a47';
          ctx.strokeRect(posX + 1, posY + 1, ts - 2, ts - 2);
        }
        ctx.restore();
      }
    }
  }
}
