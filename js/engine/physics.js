// 2D Platformer Physics & AABB Collision System

export class Physics {
  // Check overlap between two rectangles
  static checkAABB(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  // Resolve entity collision against solid tilemap & one-way platforms
  static resolveTilemapCollisions(entity, tilemap, dt) {
    const tileSize = tilemap.tileSize;

    // --- HORIZONTAL MOVEMENT & COLLISION ---
    entity.x += entity.vx * dt;

    let startTileX = Math.floor(entity.x / tileSize);
    let endTileX = Math.floor((entity.x + entity.width - 0.01) / tileSize);
    let startTileY = Math.floor(entity.y / tileSize);
    let endTileY = Math.floor((entity.y + entity.height - 0.01) / tileSize);

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const tile = tilemap.getTile(tx, ty);
        if (tile && tile.solid) {
          if (entity.vx > 0) {
            // Moving Right -> hit left wall of tile
            entity.x = tx * tileSize - entity.width;
            entity.vx = 0;
            entity.isWallRight = true;
          } else if (entity.vx < 0) {
            // Moving Left -> hit right wall of tile
            entity.x = (tx + 1) * tileSize;
            entity.vx = 0;
            entity.isWallLeft = true;
          }
        }
      }
    }

    // --- VERTICAL MOVEMENT & COLLISION ---
    entity.y += entity.vy * dt;
    entity.grounded = false;

    startTileX = Math.floor(entity.x / tileSize);
    endTileX = Math.floor((entity.x + entity.width - 0.01) / tileSize);
    startTileY = Math.floor(entity.y / tileSize);
    endTileY = Math.floor((entity.y + entity.height - 0.01) / tileSize);

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const tile = tilemap.getTile(tx, ty);
        if (tile) {
          // Solid Tiles (Full blocks)
          if (tile.solid) {
            if (entity.vy > 0) {
              // Falling Down -> Land on ground
              entity.y = ty * tileSize - entity.height;
              entity.vy = 0;
              entity.grounded = true;
            } else if (entity.vy < 0) {
              // Jumping Up -> Hit ceiling
              entity.y = (ty + 1) * tileSize;
              entity.vy = 0;
            }
          }
          // One-way Platform (Jump-through from below, stand on top)
          else if (tile.oneWay && !entity.dropThrough) {
            const tileTop = ty * tileSize;
            const prevBottom = entity.y - entity.vy * dt + entity.height;
            const fallMargin = Math.max(16, entity.vy * dt + 10);
            // Land if entity was falling down and crossed or landed on top of the platform
            if (entity.vy >= 0 && prevBottom <= tileTop + fallMargin && (entity.y + entity.height) >= tileTop && (entity.y + entity.height) <= tileTop + tileSize) {
              entity.y = tileTop - entity.height;
              entity.vy = 0;
              entity.grounded = true;
            }
          }
        }
      }
    }
  }

  // Resolve interaction with moving & crumbling platforms
  static resolvePlatformObjects(entity, platforms, dt) {
    if (entity.dropThrough) return;

    for (const plat of platforms) {
      if (!plat.active) continue;

      const prevBottom = entity.y - entity.vy * dt + entity.height;
      const onPlatformHorizontally =
        entity.x + entity.width > plat.x + 2 &&
        entity.x < plat.x + plat.width - 2;

      if (onPlatformHorizontally) {
        const fallMargin = Math.max(16, entity.vy * dt + 10);
        if (entity.vy >= 0 && prevBottom <= plat.y + fallMargin && (entity.y + entity.height) >= plat.y && (entity.y + entity.height) <= plat.y + plat.height + 12) {
          entity.y = plat.y - entity.height;
          entity.vy = 0;
          entity.grounded = true;
          
          // Carry player with moving platform
          if (plat.vx) entity.x += plat.vx * dt;
          if (plat.vy) entity.y += plat.vy * dt;

          if (plat.onStepped) {
            plat.onStepped(entity);
          }
        }
      }
    }
  }
}
