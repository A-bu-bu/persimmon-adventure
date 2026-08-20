// Handcrafted Level Data for Levels 1, 2, and 3

function createGrid(w, h, fill = 0) {
  return new Array(w * h).fill(fill);
}

function setBlock(grid, mapW, x, y, w, h, tile) {
  for (let r = y; r < y + h; r++) {
    for (let c = x; c < x + w; c++) {
      if (c >= 0 && c < mapW && r >= 0 && r < grid.length / mapW) {
        grid[r * mapW + c] = tile;
      }
    }
  }
}

// --- LEVEL 1: 豐收果園 (Sunny Orchard) ---
const l1W = 80;
const l1H = 18;
const l1Tiles = createGrid(l1W, l1H, 0);

// Ground floor
setBlock(l1Tiles, l1W, 0, 15, 24, 3, 1);
setBlock(l1Tiles, l1W, 0, 16, 24, 2, 2);

// Gap 1 (Pit at x=24..26)
setBlock(l1Tiles, l1W, 27, 15, 20, 3, 1);
setBlock(l1Tiles, l1W, 27, 16, 20, 2, 2);

// Gap 2 (Pit at x=47..49)
setBlock(l1Tiles, l1W, 50, 15, 30, 3, 1);
setBlock(l1Tiles, l1W, 50, 16, 30, 2, 2);

// Elevated Platforms & Steps (平緩舒適的連貫階梯)
setBlock(l1Tiles, l1W, 10, 12, 6, 1, 1);
setBlock(l1Tiles, l1W, 15, 11, 8, 1, 3); // One-way wooden branch (平緩台階，僅 1 格高度差)
setBlock(l1Tiles, l1W, 27, 12, 6, 1, 1);
setBlock(l1Tiles, l1W, 34, 10, 8, 1, 3);
setBlock(l1Tiles, l1W, 43, 11, 5, 1, 1);
setBlock(l1Tiles, l1W, 55, 12, 6, 1, 1);
setBlock(l1Tiles, l1W, 63, 10, 7, 1, 3);

// Wall boundary
setBlock(l1Tiles, l1W, 0, 0, 1, 18, 5);
setBlock(l1Tiles, l1W, 79, 0, 1, 18, 5);

export const Level1 = {
  name: '第一關：豐收果園',
  theme: 'orchard',
  width: l1W,
  height: l1H,
  tiles: l1Tiles,
  playerStart: { x: 80, y: 400 },
  portal: { x: 74 * 32, y: 13 * 32 },
  collectibles: [
    { x: 12 * 32, y: 10 * 32, type: 'persimmon' },
    { x: 14 * 32, y: 10 * 32, type: 'persimmon' },
    { x: 20 * 32, y: 8 * 32, type: 'ingot' },
    { x: 30 * 32, y: 9 * 32, type: 'persimmon' },
    { x: 37 * 32, y: 7 * 32, type: 'persimmon' },
    { x: 39 * 32, y: 7 * 32, type: 'persimmon' },
    { x: 41 * 32, y: 7 * 32, type: 'heart' },
    { x: 58 * 32, y: 10 * 32, type: 'persimmon' },
    { x: 66 * 32, y: 8 * 32, type: 'ingot' }
  ],
  springs: [
    { x: 28 * 32, y: 14 * 32 + 8, power: -640 },
    { x: 52 * 32, y: 14 * 32 + 8, power: -680 }
  ],
  movingPlatforms: [
    { x: 23 * 32, y: 12 * 32, width: 70, height: 14, moveX: 110, moveY: 0, speed: 60 },
    { x: 46 * 32, y: 11 * 32, width: 70, height: 14, moveX: 100, moveY: 0, speed: 65 }
  ],
  crumblingPlatforms: [
    { x: 34 * 32, y: 12 * 32, width: 64, height: 14 }
  ],
  enemies: [
    { x: 15 * 32, y: 14 * 32, type: 'crawler' },
    { x: 38 * 32, y: 14 * 32, type: 'crawler' },
    { x: 45 * 32, y: 8 * 32, type: 'flyer' },
    { x: 60 * 32, y: 14 * 32, type: 'crawler' },
    { x: 68 * 32, y: 14 * 32, type: 'turret' }
  ]
};

// --- LEVEL 2: 荊棘迷宮 (Bramble Maze) ---
const l2W = 90;
const l2H = 20;
const l2Tiles = createGrid(l2W, l2H, 0);

// Ground with thorns
setBlock(l2Tiles, l2W, 0, 17, 20, 3, 1);
setBlock(l2Tiles, l2W, 0, 18, 20, 2, 2);

// Thorn Pit (Spikes)
setBlock(l2Tiles, l2W, 20, 19, 12, 1, 4); // Spikes
setBlock(l2Tiles, l2W, 32, 17, 20, 3, 1);
setBlock(l2Tiles, l2W, 32, 18, 20, 2, 2);

// Thorn Pit 2
setBlock(l2Tiles, l2W, 52, 19, 14, 1, 4); // Spikes
setBlock(l2Tiles, l2W, 66, 17, 24, 3, 1);
setBlock(l2Tiles, l2W, 66, 18, 24, 2, 2);

// High Wall Climbing & Puzzle Sections
setBlock(l2Tiles, l2W, 14, 8, 2, 9, 5); // Wall for wall jumping
setBlock(l2Tiles, l2W, 18, 5, 8, 1, 3);
setBlock(l2Tiles, l2W, 28, 7, 2, 10, 5);
setBlock(l2Tiles, l2W, 38, 13, 6, 1, 1);
setBlock(l2Tiles, l2W, 46, 10, 6, 1, 3);
setBlock(l2Tiles, l2W, 54, 8, 4, 1, 1);
setBlock(l2Tiles, l2W, 60, 6, 8, 1, 3);
setBlock(l2Tiles, l2W, 72, 13, 6, 1, 1);
setBlock(l2Tiles, l2W, 78, 9, 6, 1, 3);

// Boundaries
setBlock(l2Tiles, l2W, 0, 0, 1, 20, 5);
setBlock(l2Tiles, l2W, 89, 0, 1, 20, 5);

export const Level2 = {
  name: '第二關：荊棘迷宮',
  theme: 'bramble',
  width: l2W,
  height: l2H,
  tiles: l2Tiles,
  playerStart: { x: 80, y: 460 },
  portal: { x: 84 * 32, y: 15 * 32 },
  collectibles: [
    { x: 16 * 32, y: 4 * 32, type: 'ingot' },
    { x: 22 * 32, y: 13 * 32, type: 'persimmon' },
    { x: 25 * 32, y: 13 * 32, type: 'persimmon' },
    { x: 35 * 32, y: 15 * 32, type: 'heart' },
    { x: 48 * 32, y: 8 * 32, type: 'persimmon' },
    { x: 56 * 32, y: 6 * 32, type: 'ingot' },
    { x: 62 * 32, y: 4 * 32, type: 'persimmon' },
    { x: 74 * 32, y: 11 * 32, type: 'persimmon' }
  ],
  springs: [
    { x: 10 * 32, y: 16 * 32 + 8, power: -690 },
    { x: 34 * 32, y: 16 * 32 + 8, power: -720 }
  ],
  movingPlatforms: [
    { x: 21 * 32, y: 14 * 32, width: 64, height: 14, moveX: 0, moveY: -140, speed: 60 },
    { x: 53 * 32, y: 14 * 32, width: 70, height: 14, moveX: 160, moveY: 0, speed: 70 }
  ],
  crumblingPlatforms: [
    { x: 23 * 32, y: 11 * 32, width: 60, height: 14 },
    { x: 55 * 32, y: 11 * 32, width: 60, height: 14 }
  ],
  enemies: [
    { x: 10 * 32, y: 16 * 32, type: 'crawler' },
    { x: 20 * 32, y: 3 * 32, type: 'turret' },
    { x: 36 * 32, y: 16 * 32, type: 'crawler' },
    { x: 42 * 32, y: 6 * 32, type: 'flyer' },
    { x: 58 * 32, y: 5 * 32, type: 'flyer' },
    { x: 70 * 32, y: 16 * 32, type: 'turret' },
    { x: 76 * 32, y: 16 * 32, type: 'crawler' }
  ]
};

// --- LEVEL 3: 決戰！貪吃蟲魔王 (Boss: Aphid Titan Arena) ---
const l3W = 55;
const l3H = 18;
const l3Tiles = createGrid(l3W, l3H, 0);

// Ground arena
setBlock(l3Tiles, l3W, 0, 15, 55, 3, 1);
setBlock(l3Tiles, l3W, 0, 16, 55, 2, 2);

// Battle Arena Platforms
setBlock(l3Tiles, l3W, 10, 11, 8, 1, 3);
setBlock(l3Tiles, l3W, 36, 11, 8, 1, 3);
setBlock(l3Tiles, l3W, 22, 8, 10, 1, 3);

// Boundaries
setBlock(l3Tiles, l3W, 0, 0, 2, 18, 5);
setBlock(l3Tiles, l3W, 53, 0, 2, 18, 5);

export const Level3 = {
  name: '第三關：決戰！貪吃蟲魔王',
  theme: 'boss',
  width: l3W,
  height: l3H,
  tiles: l3Tiles,
  playerStart: { x: 120, y: 400 },
  hasBoss: true,
  bossStart: { x: 38 * 32, y: 13 * 32 },
  bossOptions: { name: '貪吃蟲魔王', hp: 35, isFinalBoss: false },
  portal: { x: 26 * 32, y: 6 * 32 },
  collectibles: [
    { x: 14 * 32, y: 9 * 32, type: 'persimmon' },
    { x: 40 * 32, y: 9 * 32, type: 'persimmon' },
    { x: 27 * 32, y: 6 * 32, type: 'heart' }
  ],
  springs: [
    { x: 4 * 32, y: 14 * 32 + 8, power: -680 },
    { x: 49 * 32, y: 14 * 32 + 8, power: -680 }
  ],
  movingPlatforms: [],
  crumblingPlatforms: [],
  enemies: []
};

// --- LEVEL 4: 熔岩果嶺 (Magma Ridge) ---
const l4W = 95;
const l4H = 20;
const l4Tiles = createGrid(l4W, l4H, 0);

// Ground with lava spike pits
setBlock(l4Tiles, l4W, 0, 17, 18, 3, 1);
setBlock(l4Tiles, l4W, 0, 18, 18, 2, 2);

// Lava Pit 1 (Spikes)
setBlock(l4Tiles, l4W, 18, 19, 14, 1, 4);
setBlock(l4Tiles, l4W, 32, 17, 16, 3, 1);
setBlock(l4Tiles, l4W, 32, 18, 16, 2, 2);

// Lava Pit 2
setBlock(l4Tiles, l4W, 48, 19, 16, 1, 4);
setBlock(l4Tiles, l4W, 64, 17, 30, 3, 1);
setBlock(l4Tiles, l4W, 64, 18, 30, 2, 2);

// Elevated Volcanic Platforms & Steep Stairs
setBlock(l4Tiles, l4W, 12, 13, 5, 1, 1);
setBlock(l4Tiles, l4W, 20, 10, 8, 1, 3);
setBlock(l4Tiles, l4W, 29, 7, 2, 11, 5); // Wall jump tower
setBlock(l4Tiles, l4W, 36, 12, 6, 1, 3);
setBlock(l4Tiles, l4W, 44, 9, 6, 1, 1);
setBlock(l4Tiles, l4W, 52, 13, 4, 1, 3);
setBlock(l4Tiles, l4W, 58, 8, 6, 1, 3);
setBlock(l4Tiles, l4W, 70, 12, 6, 1, 1);
setBlock(l4Tiles, l4W, 78, 8, 8, 1, 3);

// Boundaries
setBlock(l4Tiles, l4W, 0, 0, 1, 20, 5);
setBlock(l4Tiles, l4W, 94, 0, 1, 20, 5);

export const Level4 = {
  name: '第四關：熔岩果嶺',
  theme: 'volcano',
  width: l4W,
  height: l4H,
  tiles: l4Tiles,
  playerStart: { x: 80, y: 460 },
  portal: { x: 88 * 32, y: 15 * 32 },
  collectibles: [
    { x: 14 * 32, y: 11 * 32, type: 'persimmon' },
    { x: 23 * 32, y: 8 * 32, type: 'ingot' },
    { x: 38 * 32, y: 10 * 32, type: 'persimmon' },
    { x: 46 * 32, y: 7 * 32, type: 'heart' },
    { x: 60 * 32, y: 6 * 32, type: 'ingot' },
    { x: 72 * 32, y: 10 * 32, type: 'persimmon' },
    { x: 82 * 32, y: 6 * 32, type: 'ingot' }
  ],
  springs: [
    { x: 16 * 32, y: 16 * 32 + 8, power: -720 },
    { x: 46 * 32, y: 16 * 32 + 8, power: -740 }
  ],
  movingPlatforms: [
    { x: 22 * 32, y: 14 * 32, width: 68, height: 14, moveX: 0, moveY: -150, speed: 70 },
    { x: 50 * 32, y: 15 * 32, width: 72, height: 14, moveX: 180, moveY: 0, speed: 75 }
  ],
  crumblingPlatforms: [
    { x: 25 * 32, y: 12 * 32, width: 64, height: 14 },
    { x: 54 * 32, y: 11 * 32, width: 64, height: 14 }
  ],
  enemies: [
    { x: 10 * 32, y: 16 * 32, type: 'crawler' },
    { x: 24 * 32, y: 6 * 32, type: 'turret' },
    { x: 38 * 32, y: 7 * 32, type: 'flyer' },
    { x: 45 * 32, y: 16 * 32, type: 'crawler' },
    { x: 60 * 32, y: 5 * 32, type: 'flyer' },
    { x: 74 * 32, y: 16 * 32, type: 'turret' },
    { x: 80 * 32, y: 16 * 32, type: 'crawler' }
  ]
};

// --- LEVEL 5: 雲霄仙境 (Sky Canopy) ---
const l5W = 100;
const l5H = 22;
const l5Tiles = createGrid(l5W, l5H, 0);

// Sky islands ground
setBlock(l5Tiles, l5W, 0, 19, 16, 3, 1);
setBlock(l5Tiles, l5W, 0, 20, 16, 2, 2);

// Cloud Pit 1 (Endless Sky Hazard Spikes)
setBlock(l5Tiles, l5W, 16, 21, 16, 1, 4);
setBlock(l5Tiles, l5W, 32, 18, 14, 4, 1);
setBlock(l5Tiles, l5W, 32, 19, 14, 3, 2);

// Cloud Pit 2
setBlock(l5Tiles, l5W, 46, 21, 18, 1, 4);
setBlock(l5Tiles, l5W, 64, 18, 14, 4, 1);
setBlock(l5Tiles, l5W, 64, 19, 14, 3, 2);

// Cloud Pit 3
setBlock(l5Tiles, l5W, 78, 21, 10, 1, 4);
setBlock(l5Tiles, l5W, 88, 17, 12, 5, 1);
setBlock(l5Tiles, l5W, 88, 18, 12, 4, 2);

// High Celestial Cloud Platforms
setBlock(l5Tiles, l5W, 10, 14, 6, 1, 3);
setBlock(l5Tiles, l5W, 18, 10, 7, 1, 3);
setBlock(l5Tiles, l5W, 26, 6, 6, 1, 1);
setBlock(l5Tiles, l5W, 38, 12, 6, 1, 3);
setBlock(l5Tiles, l5W, 48, 8, 8, 1, 3);
setBlock(l5Tiles, l5W, 58, 6, 6, 1, 1);
setBlock(l5Tiles, l5W, 70, 12, 7, 1, 3);
setBlock(l5Tiles, l5W, 80, 9, 6, 1, 3);

// Boundaries
setBlock(l5Tiles, l5W, 0, 0, 1, 22, 5);
setBlock(l5Tiles, l5W, 99, 0, 1, 22, 5);

export const Level5 = {
  name: '第五關：雲霄仙境',
  theme: 'sky',
  width: l5W,
  height: l5H,
  tiles: l5Tiles,
  playerStart: { x: 80, y: 520 },
  portal: { x: 94 * 32, y: 15 * 32 },
  collectibles: [
    { x: 12 * 32, y: 12 * 32, type: 'persimmon' },
    { x: 20 * 32, y: 8 * 32, type: 'ingot' },
    { x: 28 * 32, y: 4 * 32, type: 'heart' },
    { x: 40 * 32, y: 10 * 32, type: 'persimmon' },
    { x: 51 * 32, y: 6 * 32, type: 'ingot' },
    { x: 60 * 32, y: 4 * 32, type: 'persimmon' },
    { x: 73 * 32, y: 10 * 32, type: 'ingot' },
    { x: 82 * 32, y: 7 * 32, type: 'persimmon' }
  ],
  springs: [
    { x: 14 * 32, y: 18 * 32 + 8, power: -750 },
    { x: 44 * 32, y: 17 * 32 + 8, power: -760 },
    { x: 76 * 32, y: 17 * 32 + 8, power: -760 }
  ],
  movingPlatforms: [
    { x: 18 * 32, y: 16 * 32, width: 70, height: 14, moveX: 140, moveY: 0, speed: 70 },
    { x: 50 * 32, y: 15 * 32, width: 70, height: 14, moveX: 0, moveY: -160, speed: 75 },
    { x: 80 * 32, y: 14 * 32, width: 70, height: 14, moveX: 120, moveY: 0, speed: 80 }
  ],
  crumblingPlatforms: [
    { x: 22 * 32, y: 13 * 32, width: 64, height: 14 },
    { x: 62 * 32, y: 10 * 32, width: 64, height: 14 }
  ],
  enemies: [
    { x: 8 * 32, y: 18 * 32, type: 'crawler' },
    { x: 20 * 32, y: 4 * 32, type: 'flyer' },
    { x: 36 * 32, y: 17 * 32, type: 'turret' },
    { x: 50 * 32, y: 4 * 32, type: 'flyer' },
    { x: 66 * 32, y: 17 * 32, type: 'turret' },
    { x: 74 * 32, y: 4 * 32, type: 'flyer' },
    { x: 90 * 32, y: 16 * 32, type: 'crawler' }
  ]
};

// --- LEVEL 6: 終極神木王座・真魔王皇帝 (The Ancient Divine Tree & True Chaos Emperor Boss) ---
const l6W = 60;
const l6H = 18;
const l6Tiles = createGrid(l6W, l6H, 0);

// Sacred Arena Ground floor
setBlock(l6Tiles, l6W, 0, 15, 60, 3, 1);
setBlock(l6Tiles, l6W, 0, 16, 60, 2, 2);

// Divine Sacred Tree Step Branches
setBlock(l6Tiles, l6W, 8, 11, 8, 1, 3);
setBlock(l6Tiles, l6W, 44, 11, 8, 1, 3);
setBlock(l6Tiles, l6W, 20, 8, 8, 1, 3);
setBlock(l6Tiles, l6W, 32, 8, 8, 1, 3);
setBlock(l6Tiles, l6W, 24, 5, 12, 1, 3); // High throne platform

// Boundaries
setBlock(l6Tiles, l6W, 0, 0, 2, 18, 5);
setBlock(l6Tiles, l6W, 58, 0, 2, 18, 5);

export const Level6 = {
  name: '第六關：終極神木王座・真魔王皇帝',
  theme: 'final_boss',
  width: l6W,
  height: l6H,
  tiles: l6Tiles,
  playerStart: { x: 120, y: 400 },
  hasBoss: true,
  bossStart: { x: 42 * 32, y: 13 * 32 },
  bossOptions: { name: '魔化蟲皇・終極真身', hp: 60, isFinalBoss: true },
  portal: { x: 28 * 32, y: 3 * 32 },
  collectibles: [
    { x: 11 * 32, y: 9 * 32, type: 'persimmon' },
    { x: 47 * 32, y: 9 * 32, type: 'persimmon' },
    { x: 29 * 32, y: 3 * 32, type: 'heart' },
    { x: 30 * 32, y: 3 * 32, type: 'ingot' }
  ],
  springs: [
    { x: 4 * 32, y: 14 * 32 + 8, power: -720 },
    { x: 54 * 32, y: 14 * 32 + 8, power: -720 }
  ],
  movingPlatforms: [],
  crumblingPlatforms: [],
  enemies: []
};

export const LEVELS = [Level1, Level2, Level3, Level4, Level5, Level6];
