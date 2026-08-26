// Handcrafted Level Data for Levels 1 to 10 with unique Hero Sprites per level

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

// Elevated Platforms & Steps
setBlock(l1Tiles, l1W, 10, 12, 6, 1, 1);
setBlock(l1Tiles, l1W, 15, 11, 8, 1, 3);
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
  heroSprite: './assets/hero_transparent.png',
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

// --- LEVEL 2: 好運旺旺來・神采踩腳丫 (Bramble Maze) ---
const l2W = 90;
const l2H = 20;
const l2Tiles = createGrid(l2W, l2H, 0);

// Ground with thorns
setBlock(l2Tiles, l2W, 0, 17, 20, 3, 1);
setBlock(l2Tiles, l2W, 0, 18, 20, 2, 2);

// Thorn Pit (Spikes)
setBlock(l2Tiles, l2W, 20, 19, 12, 1, 4);
setBlock(l2Tiles, l2W, 32, 17, 20, 3, 1);
setBlock(l2Tiles, l2W, 32, 18, 20, 2, 2);

// Thorn Pit 2
setBlock(l2Tiles, l2W, 52, 19, 14, 1, 4);
setBlock(l2Tiles, l2W, 66, 17, 24, 3, 1);
setBlock(l2Tiles, l2W, 66, 18, 24, 2, 2);

// Gentle Stepping Platforms & Passable Wall Sections
setBlock(l2Tiles, l2W, 6, 14, 4, 1, 3);
setBlock(l2Tiles, l2W, 10, 12, 4, 1, 3);
setBlock(l2Tiles, l2W, 14, 11, 2, 6, 5);
setBlock(l2Tiles, l2W, 14, 11, 8, 1, 3);
setBlock(l2Tiles, l2W, 18, 8, 8, 1, 3);

setBlock(l2Tiles, l2W, 22, 14, 4, 1, 3);
setBlock(l2Tiles, l2W, 25, 12, 4, 1, 3);
setBlock(l2Tiles, l2W, 28, 11, 2, 6, 5);
setBlock(l2Tiles, l2W, 28, 11, 8, 1, 3);

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
  name: '第二關：好運旺旺來・神采踩腳丫',
  theme: 'bramble',
  heroSprite: './assets/hero_level2.png',
  width: l2W,
  height: l2H,
  tiles: l2Tiles,
  playerStart: { x: 80, y: 460 },
  portal: { x: 84 * 32, y: 15 * 32 },
  collectibles: [
    { x: 8 * 32, y: 12 * 32, type: 'persimmon' },
    { x: 16 * 32, y: 6 * 32, type: 'ingot' },
    { x: 22 * 32, y: 13 * 32, type: 'persimmon' },
    { x: 25 * 32, y: 13 * 32, type: 'persimmon' },
    { x: 30 * 32, y: 9 * 32, type: 'ingot' },
    { x: 35 * 32, y: 15 * 32, type: 'heart' },
    { x: 48 * 32, y: 8 * 32, type: 'persimmon' },
    { x: 56 * 32, y: 6 * 32, type: 'ingot' },
    { x: 62 * 32, y: 4 * 32, type: 'persimmon' },
    { x: 74 * 32, y: 11 * 32, type: 'persimmon' }
  ],
  springs: [],
  pawPads: [
    { x: 8 * 32, y: 16 * 32 + 8, power: -720 },
    { x: 22 * 32, y: 16 * 32 + 8, power: -720 },
    { x: 40 * 32, y: 12 * 32 + 8, power: -680 },
    { x: 54 * 32, y: 16 * 32 + 8, power: -720 }
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
  heroSprite: './assets/hero_level3.png',
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

// Lava Pit 1
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
setBlock(l4Tiles, l4W, 29, 7, 2, 11, 5);
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
  heroSprite: './assets/hero_level4.png',
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

// Cloud Pit 1
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
  heroSprite: './assets/hero_level5.png',
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

// --- LEVEL 6: 終極神木王座・真魔王皇帝 ---
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
setBlock(l6Tiles, l6W, 24, 5, 12, 1, 3);

// Boundaries
setBlock(l6Tiles, l6W, 0, 0, 2, 18, 5);
setBlock(l6Tiles, l6W, 58, 0, 2, 18, 5);

export const Level6 = {
  name: '第六關：終極神木王座・真魔王皇帝',
  theme: 'final_boss',
  heroSprite: './assets/hero_level6.png',
  width: l6W,
  height: l6H,
  tiles: l6Tiles,
  playerStart: { x: 120, y: 400 },
  hasBoss: true,
  bossStart: { x: 42 * 32, y: 13 * 32 },
  bossOptions: { name: '魔化蟲皇・終極真身', hp: 45, isFinalBoss: false },
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

// --- LEVEL 7: 激流瀑布・柿柿泳渡！ (Water Cascades) ---
const l7W = 95;
const l7H = 20;
const l7Tiles = createGrid(l7W, l7H, 0);

// Riverbanks & Island Floors
setBlock(l7Tiles, l7W, 0, 17, 20, 3, 1);
setBlock(l7Tiles, l7W, 0, 18, 20, 2, 2);

// Whirlpool Gap 1
setBlock(l7Tiles, l7W, 20, 19, 14, 1, 4);
setBlock(l7Tiles, l7W, 34, 17, 18, 3, 1);
setBlock(l7Tiles, l7W, 34, 18, 18, 2, 2);

// Whirlpool Gap 2
setBlock(l7Tiles, l7W, 52, 19, 16, 1, 4);
setBlock(l7Tiles, l7W, 68, 17, 26, 3, 1);
setBlock(l7Tiles, l7W, 68, 18, 26, 2, 2);

// Cascading River Platforms & Bridges
setBlock(l7Tiles, l7W, 8, 13, 6, 1, 3);
setBlock(l7Tiles, l7W, 16, 10, 6, 1, 3);
setBlock(l7Tiles, l7W, 24, 7, 7, 1, 1);
setBlock(l7Tiles, l7W, 36, 12, 6, 1, 3);
setBlock(l7Tiles, l7W, 44, 9, 7, 1, 3);
setBlock(l7Tiles, l7W, 56, 12, 8, 1, 1);
setBlock(l7Tiles, l7W, 66, 8, 6, 1, 3);
setBlock(l7Tiles, l7W, 76, 12, 6, 1, 3);
setBlock(l7Tiles, l7W, 84, 8, 8, 1, 3);

// Boundaries
setBlock(l7Tiles, l7W, 0, 0, 1, 20, 5);
setBlock(l7Tiles, l7W, 94, 0, 1, 20, 5);

export const Level7 = {
  name: '第七關：激流瀑布・柿柿泳渡！',
  theme: 'water',
  heroSprite: './assets/hero_level7.png',
  width: l7W,
  height: l7H,
  tiles: l7Tiles,
  playerStart: { x: 80, y: 460 },
  portal: { x: 88 * 32, y: 15 * 32 },
  collectibles: [
    { x: 10 * 32, y: 11 * 32, type: 'persimmon' },
    { x: 18 * 32, y: 8 * 32, type: 'ingot' },
    { x: 27 * 32, y: 5 * 32, type: 'heart' },
    { x: 38 * 32, y: 10 * 32, type: 'persimmon' },
    { x: 46 * 32, y: 7 * 32, type: 'ingot' },
    { x: 60 * 32, y: 10 * 32, type: 'persimmon' },
    { x: 70 * 32, y: 6 * 32, type: 'ingot' },
    { x: 86 * 32, y: 6 * 32, type: 'persimmon' }
  ],
  springs: [
    { x: 18 * 32, y: 16 * 32 + 8, power: -720 },
    { x: 50 * 32, y: 16 * 32 + 8, power: -740 },
    { x: 74 * 32, y: 16 * 32 + 8, power: -720 }
  ],
  movingPlatforms: [
    { x: 22 * 32, y: 15 * 32, width: 70, height: 14, moveX: 130, moveY: 0, speed: 70 },
    { x: 54 * 32, y: 14 * 32, width: 70, height: 14, moveX: 0, moveY: -150, speed: 75 }
  ],
  crumblingPlatforms: [
    { x: 28 * 32, y: 11 * 32, width: 64, height: 14 },
    { x: 62 * 32, y: 10 * 32, width: 64, height: 14 }
  ],
  enemies: [
    { x: 12 * 32, y: 16 * 32, type: 'crawler' },
    { x: 26 * 32, y: 5 * 32, type: 'turret' },
    { x: 40 * 32, y: 16 * 32, type: 'crawler' },
    { x: 48 * 32, y: 6 * 32, type: 'flyer' },
    { x: 62 * 32, y: 6 * 32, type: 'flyer' },
    { x: 78 * 32, y: 16 * 32, type: 'turret' },
    { x: 84 * 32, y: 16 * 32, type: 'crawler' }
  ]
};

// --- LEVEL 8: 月光甜柿・夜市迷城！ (Night Market Neon Maze) ---
const l8W = 100;
const l8H = 22;
const l8Tiles = createGrid(l8W, l8H, 0);

// Night street floor
setBlock(l8Tiles, l8W, 0, 19, 22, 3, 1);
setBlock(l8Tiles, l8W, 0, 20, 22, 2, 2);

// Alley Trap 1
setBlock(l8Tiles, l8W, 22, 21, 14, 1, 4);
setBlock(l8Tiles, l8W, 36, 18, 16, 4, 1);
setBlock(l8Tiles, l8W, 36, 19, 16, 3, 2);

// Alley Trap 2
setBlock(l8Tiles, l8W, 52, 21, 16, 1, 4);
setBlock(l8Tiles, l8W, 68, 18, 16, 4, 1);
setBlock(l8Tiles, l8W, 68, 19, 16, 3, 2);

// Alley Trap 3
setBlock(l8Tiles, l8W, 84, 21, 8, 1, 4);
setBlock(l8Tiles, l8W, 92, 17, 8, 5, 1);
setBlock(l8Tiles, l8W, 92, 18, 8, 4, 2);

// Rooftop neon platforms
setBlock(l8Tiles, l8W, 10, 15, 6, 1, 3);
setBlock(l8Tiles, l8W, 18, 11, 8, 1, 3);
setBlock(l8Tiles, l8W, 28, 7, 7, 1, 1);
setBlock(l8Tiles, l8W, 40, 13, 6, 1, 3);
setBlock(l8Tiles, l8W, 50, 9, 8, 1, 3);
setBlock(l8Tiles, l8W, 60, 6, 6, 1, 1);
setBlock(l8Tiles, l8W, 72, 12, 7, 1, 3);
setBlock(l8Tiles, l8W, 82, 8, 8, 1, 3);

// Boundaries
setBlock(l8Tiles, l8W, 0, 0, 1, 22, 5);
setBlock(l8Tiles, l8W, 99, 0, 1, 22, 5);

export const Level8 = {
  name: '第八關：月光甜柿・夜市迷城！',
  theme: 'night',
  heroSprite: './assets/hero_level8.png',
  width: l8W,
  height: l8H,
  tiles: l8Tiles,
  playerStart: { x: 80, y: 520 },
  portal: { x: 94 * 32, y: 15 * 32 },
  collectibles: [
    { x: 12 * 32, y: 13 * 32, type: 'persimmon' },
    { x: 20 * 32, y: 9 * 32, type: 'ingot' },
    { x: 30 * 32, y: 5 * 32, type: 'heart' },
    { x: 42 * 32, y: 11 * 32, type: 'persimmon' },
    { x: 53 * 32, y: 7 * 32, type: 'ingot' },
    { x: 63 * 32, y: 4 * 32, type: 'persimmon' },
    { x: 75 * 32, y: 10 * 32, type: 'ingot' },
    { x: 85 * 32, y: 6 * 32, type: 'persimmon' }
  ],
  springs: [
    { x: 16 * 32, y: 18 * 32 + 8, power: -740 },
    { x: 48 * 32, y: 17 * 32 + 8, power: -760 },
    { x: 80 * 32, y: 17 * 32 + 8, power: -760 }
  ],
  movingPlatforms: [
    { x: 24 * 32, y: 16 * 32, width: 70, height: 14, moveX: 140, moveY: 0, speed: 75 },
    { x: 56 * 32, y: 15 * 32, width: 70, height: 14, moveX: 0, moveY: -160, speed: 80 }
  ],
  crumblingPlatforms: [
    { x: 26 * 32, y: 13 * 32, width: 64, height: 14 },
    { x: 66 * 32, y: 11 * 32, width: 64, height: 14 }
  ],
  enemies: [
    { x: 14 * 32, y: 18 * 32, type: 'crawler' },
    { x: 22 * 32, y: 5 * 32, type: 'flyer' },
    { x: 42 * 32, y: 17 * 32, type: 'turret' },
    { x: 54 * 32, y: 4 * 32, type: 'flyer' },
    { x: 70 * 32, y: 17 * 32, type: 'crawler' },
    { x: 78 * 32, y: 5 * 32, type: 'flyer' },
    { x: 88 * 32, y: 16 * 32, type: 'turret' }
  ]
};

// --- LEVEL 9: 冰雪仙境・滑溜冰山！ (Ice Peak Glider) ---
const l9W = 105;
const l9H = 22;
const l9Tiles = createGrid(l9W, l9H, 0);

// Ice floors
setBlock(l9Tiles, l9W, 0, 19, 20, 3, 1);
setBlock(l9Tiles, l9W, 0, 20, 20, 2, 2);

// Ice Chasm 1
setBlock(l9Tiles, l9W, 20, 21, 16, 1, 4);
setBlock(l9Tiles, l9W, 36, 18, 18, 4, 1);
setBlock(l9Tiles, l9W, 36, 19, 18, 3, 2);

// Ice Chasm 2
setBlock(l9Tiles, l9W, 54, 21, 18, 1, 4);
setBlock(l9Tiles, l9W, 72, 18, 18, 4, 1);
setBlock(l9Tiles, l9W, 72, 19, 18, 3, 2);

// Ice Chasm 3
setBlock(l9Tiles, l9W, 90, 21, 6, 1, 4);
setBlock(l9Tiles, l9W, 96, 17, 9, 5, 1);
setBlock(l9Tiles, l9W, 96, 18, 9, 4, 2);

// Ice Glider platforms
setBlock(l9Tiles, l9W, 8, 14, 6, 1, 3);
setBlock(l9Tiles, l9W, 16, 10, 7, 1, 3);
setBlock(l9Tiles, l9W, 26, 6, 6, 1, 1);
setBlock(l9Tiles, l9W, 38, 12, 7, 1, 3);
setBlock(l9Tiles, l9W, 48, 8, 8, 1, 3);
setBlock(l9Tiles, l9W, 60, 6, 6, 1, 1);
setBlock(l9Tiles, l9W, 74, 12, 8, 1, 3);
setBlock(l9Tiles, l9W, 86, 8, 7, 1, 3);

// Boundaries
setBlock(l9Tiles, l9W, 0, 0, 1, 22, 5);
setBlock(l9Tiles, l9W, 104, 0, 1, 22, 5);

export const Level9 = {
  name: '第九關：冰雪仙境・滑溜冰山！',
  theme: 'ice',
  heroSprite: './assets/hero_level9.png',
  width: l9W,
  height: l9H,
  tiles: l9Tiles,
  playerStart: { x: 80, y: 520 },
  portal: { x: 99 * 32, y: 15 * 32 },
  collectibles: [
    { x: 10 * 32, y: 12 * 32, type: 'persimmon' },
    { x: 18 * 32, y: 8 * 32, type: 'ingot' },
    { x: 28 * 32, y: 4 * 32, type: 'heart' },
    { x: 40 * 32, y: 10 * 32, type: 'persimmon' },
    { x: 51 * 32, y: 6 * 32, type: 'ingot' },
    { x: 63 * 32, y: 4 * 32, type: 'persimmon' },
    { x: 77 * 32, y: 10 * 32, type: 'ingot' },
    { x: 89 * 32, y: 6 * 32, type: 'persimmon' }
  ],
  springs: [
    { x: 14 * 32, y: 18 * 32 + 8, power: -750 },
    { x: 50 * 32, y: 17 * 32 + 8, power: -760 },
    { x: 86 * 32, y: 17 * 32 + 8, power: -760 }
  ],
  movingPlatforms: [
    { x: 22 * 32, y: 15 * 32, width: 70, height: 14, moveX: 140, moveY: 0, speed: 75 },
    { x: 58 * 32, y: 14 * 32, width: 70, height: 14, moveX: 0, moveY: -160, speed: 80 }
  ],
  crumblingPlatforms: [
    { x: 24 * 32, y: 12 * 32, width: 64, height: 14 },
    { x: 68 * 32, y: 10 * 32, width: 64, height: 14 }
  ],
  enemies: [
    { x: 10 * 32, y: 18 * 32, type: 'crawler' },
    { x: 20 * 32, y: 4 * 32, type: 'flyer' },
    { x: 42 * 32, y: 17 * 32, type: 'turret' },
    { x: 54 * 32, y: 4 * 32, type: 'flyer' },
    { x: 76 * 32, y: 17 * 32, type: 'crawler' },
    { x: 84 * 32, y: 4 * 32, type: 'flyer' },
    { x: 94 * 32, y: 16 * 32, type: 'turret' }
  ]
};

// --- LEVEL 10: 混沌火焰・終極魔王決戰！ (Ultimate Final Boss Arena) ---
const l10W = 65;
const l10H = 18;
const l10Tiles = createGrid(l10W, l10H, 0);

// Grand Colosseum Floor
setBlock(l10Tiles, l10W, 0, 15, 65, 3, 1);
setBlock(l10Tiles, l10W, 0, 16, 65, 2, 2);

// Elevated Battle Pillars
setBlock(l10Tiles, l10W, 8, 11, 8, 1, 3);
setBlock(l10Tiles, l10W, 49, 11, 8, 1, 3);
setBlock(l10Tiles, l10W, 20, 8, 8, 1, 3);
setBlock(l10Tiles, l10W, 37, 8, 8, 1, 3);
setBlock(l10Tiles, l10W, 27, 5, 11, 1, 3);

// Boundaries
setBlock(l10Tiles, l10W, 0, 0, 2, 18, 5);
setBlock(l10Tiles, l10W, 63, 0, 2, 18, 5);

export const Level10 = {
  name: '第十關：混沌火焰・終極魔王決戰！',
  theme: 'volcano_boss',
  heroSprite: './assets/hero_level10.png',
  width: l10W,
  height: l10H,
  tiles: l10Tiles,
  playerStart: { x: 120, y: 400 },
  hasBoss: true,
  bossStart: { x: 46 * 32, y: 13 * 32 },
  bossOptions: { name: '混沌滅世魔皇', hp: 75, isFinalBoss: true },
  portal: { x: 31 * 32, y: 3 * 32 },
  collectibles: [
    { x: 11 * 32, y: 9 * 32, type: 'persimmon' },
    { x: 52 * 32, y: 9 * 32, type: 'persimmon' },
    { x: 31 * 32, y: 3 * 32, type: 'heart' },
    { x: 33 * 32, y: 3 * 32, type: 'ingot' }
  ],
  springs: [
    { x: 4 * 32, y: 14 * 32 + 8, power: -740 },
    { x: 59 * 32, y: 14 * 32 + 8, power: -740 }
  ],
  movingPlatforms: [],
  crumblingPlatforms: [],
  enemies: []
};

export const LEVELS = [Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Level9, Level10];
