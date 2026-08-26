// Tilemap Engine with Parallax Backgrounds & Hazard Traps
export class Tilemap {
  constructor(tileSize = 32) {
    this.tileSize = tileSize;
    this.width = 0;
    this.height = 0;
    this.tiles = [];
    this.theme = 'orchard';
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
      skyGradient.addColorStop(0, '#2b0908');
      skyGradient.addColorStop(0.5, '#731f13');
      skyGradient.addColorStop(1, '#e65c00');
    } else if (this.theme === 'sky') {
      skyGradient.addColorStop(0, '#0c1b33');
      skyGradient.addColorStop(0.5, '#1e3c72');
      skyGradient.addColorStop(1, '#64b3f4');
    } else if (this.theme === 'water') {
      skyGradient.addColorStop(0, '#02182b');
      skyGradient.addColorStop(0.5, '#06476a');
      skyGradient.addColorStop(1, '#008ba3');
    } else if (this.theme === 'night') {
      skyGradient.addColorStop(0, '#060012');
      skyGradient.addColorStop(0.5, '#1d0038');
      skyGradient.addColorStop(1, '#40005a');
    } else if (this.theme === 'ice') {
      skyGradient.addColorStop(0, '#081c2f');
      skyGradient.addColorStop(0.5, '#13466a');
      skyGradient.addColorStop(1, '#68b2d8');
    } else if (this.theme === 'final_boss' || this.theme === 'volcano_boss') {
      skyGradient.addColorStop(0, '#180000');
      skyGradient.addColorStop(0.5, '#480012');
      skyGradient.addColorStop(1, '#94002a');
    } else {
      skyGradient.addColorStop(0, '#1e0c1b');
      skyGradient.addColorStop(0.5, '#541525');
      skyGradient.addColorStop(1, '#943828');
    }

    ctx.fillStyle = skyGradient;
    ctx.fillRect(camera.x, camera.y, w, h);

    // --- DISTANT SUN / CELESTIAL ORB ---
    ctx.save();
    let sunColor = '#ffb347';
    let shadowColor = '#ffa500';
    if (this.theme === 'sky') { sunColor = '#e0f7fa'; shadowColor = '#80deea'; }
    else if (this.theme === 'water') { sunColor = '#80deea'; shadowColor = '#00e5ff'; }
    else if (this.theme === 'night') { sunColor = '#ff4081'; shadowColor = '#e040fb'; }
    else if (this.theme === 'ice') { sunColor = '#e1f5fe'; shadowColor = '#81d4fa'; }
    else if (this.theme === 'volcano' || this.theme === 'volcano_boss') { sunColor = '#ff3300'; shadowColor = '#ff6600'; }
    else if (this.theme === 'final_boss') { sunColor = '#ffd700'; shadowColor = '#ff00aa'; }

    ctx.fillStyle = sunColor;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 24;
    const sunX = camera.x + w * 0.75 - (camera.x * 0.05);
    const sunY = camera.y + 90 - (camera.y * 0.03);
    ctx.beginPath();
    ctx.arc(sunX, sunY, (this.theme === 'final_boss' || this.theme === 'volcano_boss') ? 44 : 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- PARALLAX MOUNTAINS / WAVES LAYER 1 (Far) ---
    let farColor = '#221a36';
    if (this.theme === 'volcano' || this.theme === 'volcano_boss') farColor = '#3d0c0c';
    else if (this.theme === 'sky') farColor = 'rgba(255,255,255,0.25)';
    else if (this.theme === 'water') farColor = '#032c45';
    else if (this.theme === 'night') farColor = '#120024';
    else if (this.theme === 'ice') farColor = '#123956';
    else if (this.theme === 'final_boss') farColor = '#200533';
    else if (this.theme === 'orchard') farColor = '#592c4e';

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
    let midColor = '#171226';
    if (this.theme === 'volcano' || this.theme === 'volcano_boss') midColor = '#260606';
    else if (this.theme === 'sky') midColor = 'rgba(255,255,255,0.45)';
    else if (this.theme === 'water') midColor = '#021e31';
    else if (this.theme === 'night') midColor = '#0b0016';
    else if (this.theme === 'ice') midColor = '#0d283e';
    else if (this.theme === 'final_boss') midColor = '#120220';
    else if (this.theme === 'orchard') midColor = '#3d2040';

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
          let baseColor = '#633e2b', topColor = '#6cb738', fringeColor = '#8bd64e';
          if (this.theme === 'volcano' || this.theme === 'volcano_boss') {
            baseColor = '#2b1810'; topColor = '#ff6600'; fringeColor = '#ff9900';
          } else if (this.theme === 'sky') {
            baseColor = '#1d3557'; topColor = '#48cae4'; fringeColor = '#90e0ef';
          } else if (this.theme === 'water') {
            baseColor = '#004d61'; topColor = '#00b4d8'; fringeColor = '#90e0ef';
          } else if (this.theme === 'night') {
            baseColor = '#1a0033'; topColor = '#9c27b0'; fringeColor = '#e040fb';
          } else if (this.theme === 'ice') {
            baseColor = '#1a4160'; topColor = '#80deea'; fringeColor = '#e0f7fa';
          } else if (this.theme === 'final_boss') {
            baseColor = '#2b1035'; topColor = '#bf40bf'; fringeColor = '#df73df';
          }

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
          let rockColor = '#4a2d1f', innerColor = '#392116';
          if (this.theme === 'volcano' || this.theme === 'volcano_boss') {
            rockColor = '#1a0d0a'; innerColor = '#0d0605';
          } else if (this.theme === 'sky') {
            rockColor = '#14213d'; innerColor = '#0b1320';
          } else if (this.theme === 'water') {
            rockColor = '#003344'; innerColor = '#002230';
          } else if (this.theme === 'night') {
            rockColor = '#100020'; innerColor = '#070010';
          } else if (this.theme === 'ice') {
            rockColor = '#122c42'; innerColor = '#0c1d2c';
          } else if (this.theme === 'final_boss') {
            rockColor = '#190822'; innerColor = '#0f0414';
          }

          ctx.fillStyle = rockColor;
          ctx.fillRect(posX, posY, ts, ts);
          ctx.fillStyle = innerColor;
          ctx.fillRect(posX + 4, posY + 4, ts - 8, ts - 8);
        } else if (tileType === 3) {
          // One-Way Wooden / Cloud / Ice Platform
          let platColor = '#9c6a38', platInner = '#734b22';
          if (this.theme === 'sky') { platColor = '#e0fbfc'; platInner = '#98c1d9'; }
          else if (this.theme === 'water') { platColor = '#4dd0e1'; platInner = '#0097a7'; }
          else if (this.theme === 'night') { platColor = '#ba68c8'; platInner = '#7b1fa2'; }
          else if (this.theme === 'ice') { platColor = '#e0f7fa'; platInner = '#80deea'; }
          else if (this.theme === 'volcano' || this.theme === 'volcano_boss') { platColor = '#ba5d2c'; platInner = '#782d12'; }

          ctx.fillStyle = platColor;
          ctx.fillRect(posX, posY, ts, 8);
          ctx.fillStyle = platInner;
          ctx.fillRect(posX + 2, posY + 2, ts - 4, 4);
        } else if (tileType === 4) {
          // Spike Trap (Thorns / Magma / Ice / Energy)
          let spikeColor = '#d43535';
          if (this.theme === 'volcano' || this.theme === 'volcano_boss') spikeColor = '#ff3300';
          else if (this.theme === 'sky') spikeColor = '#00f0ff';
          else if (this.theme === 'water') spikeColor = '#00e5ff';
          else if (this.theme === 'night') spikeColor = '#ff007f';
          else if (this.theme === 'ice') spikeColor = '#80d8ff';
          else if (this.theme === 'final_boss') spikeColor = '#ff0066';

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
          ctx.fillStyle = (this.theme === 'volcano' || this.theme === 'volcano_boss') ? '#331a1a' : '#545466';
          ctx.fillRect(posX, posY, ts, ts);
          ctx.fillStyle = (this.theme === 'volcano' || this.theme === 'volcano_boss') ? '#220d0d' : '#3a3a47';
          ctx.strokeRect(posX + 1, posY + 1, ts - 2, ts - 2);
        }
        ctx.restore();
      }
    }
  }
}
