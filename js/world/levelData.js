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

export const LEVELS = [Level1, Level2, Level3];
