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
    } else {
      // Boss Arena (Dramatic Crimson & Gold Sunset)
      skyGradient.addColorStop(0, '#1e0c1b');
      skyGradient.addColorStop(0.5, '#541525');
      skyGradient.addColorStop(1, '#943828');
    }

    ctx.fillStyle = skyGradient;
    ctx.fillRect(camera.x, camera.y, w, h);

    // --- DISTANT PERSIMMON SUN / MOON ---
    ctx.save();
    ctx.fillStyle = '#ffb347';
    ctx.shadowColor = '#ffa500';
    ctx.shadowBlur = 24;
    const sunX = camera.x + w * 0.75 - (camera.x * 0.05);
    const sunY = camera.y + 90 - (camera.y * 0.03);
    ctx.beginPath();
    ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- PARALLAX MOUNTAINS / HILLS LAYER 1 (Far) ---
    ctx.fillStyle = this.theme === 'orchard' ? '#592c4e' : '#221a36';
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

    // --- PARALLAX ORCHARD TREES LAYER 2 (Mid) ---
    ctx.fillStyle = this.theme === 'orchard' ? '#3d2040' : '#171226';
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
          // Grass Top Ground Block
          ctx.fillStyle = '#633e2b';
          ctx.fillRect(posX, posY, ts, ts);

          // Lush Green Top Grass
          ctx.fillStyle = '#6cb738';
          ctx.fillRect(posX, posY, ts, 6);
          // Grass fringe
          ctx.fillStyle = '#8bd64e';
          for (let i = 0; i < ts; i += 6) {
            ctx.fillRect(posX + i, posY + 6, 4, 3);
          }
        } else if (tileType === 2) {
          // Deep Soil / Rock
          ctx.fillStyle = '#4a2d1f';
          ctx.fillRect(posX, posY, ts, ts);

          ctx.fillStyle = '#392116';
          ctx.fillRect(posX + 4, posY + 4, ts - 8, ts - 8);
        } else if (tileType === 3) {
          // One-Way Wooden Platform
          ctx.fillStyle = '#9c6a38';
          ctx.fillRect(posX, posY, ts, 8);
          ctx.fillStyle = '#734b22';
          ctx.fillRect(posX + 2, posY + 2, ts - 4, 4);
        } else if (tileType === 4) {
          // Spike Trap (Thorns)
          ctx.fillStyle = '#d43535';
          for (let i = 0; i < ts; i += 8) {
            ctx.beginPath();
            ctx.moveTo(posX + i, posY + ts);
            ctx.lineTo(posX + i + 4, posY + ts - 14);
            ctx.lineTo(posX + i + 8, posY + ts);
            ctx.fill();
          }
        } else if (tileType === 5) {
          // Stone Block
          ctx.fillStyle = '#545466';
          ctx.fillRect(posX, posY, ts, ts);
          ctx.fillStyle = '#3a3a47';
          ctx.strokeRect(posX + 1, posY + 1, ts - 2, ts - 2);
        }
        ctx.restore();
      }
    }
  }
}
