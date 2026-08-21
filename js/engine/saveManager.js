// Save Manager: LocalStorage Game Progress & Unlocked Mini-Games
export class SaveManager {
  constructor() {
    this.storageKey = 'persimmon_adventure_save_v1';
    this.data = this.load();
  }

  getDefaultData() {
    return {
      highestLevel: 1, // 1-indexed (1..6)
      currentLevel: 1,
      totalCoins: 0,
      highScore: 0,
      unlockedMiniGames: ['pawStomp'], // 預設解鎖踩腳丫迷你遊戲
      miniGameScores: {
        pawStomp: 0,
        catchCoins: 0,
        whackBug: 0
      },
      lastSavedTime: Date.now()
    };
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Object.assign(this.getDefaultData(), parsed);
      }
    } catch (e) {
      console.warn('Could not load save data from localStorage:', e);
    }
    return this.getDefaultData();
  }

  save() {
    try {
      this.data.lastSavedTime = Date.now();
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not write save data to localStorage:', e);
    }
  }

  reachLevel(levelIndex) {
    const lvl = levelIndex + 1; // 1-indexed
    if (lvl > this.data.highestLevel) {
      this.data.highestLevel = lvl;
    }
    this.data.currentLevel = lvl;

    // 解鎖特定迷你遊戲
    if (lvl >= 2 && !this.data.unlockedMiniGames.includes('pawStomp')) {
      this.data.unlockedMiniGames.push('pawStomp');
    }
    if (lvl >= 3 && !this.data.unlockedMiniGames.includes('catchCoins')) {
      this.data.unlockedMiniGames.push('catchCoins');
    }
    if (lvl >= 4 && !this.data.unlockedMiniGames.includes('whackBug')) {
      this.data.unlockedMiniGames.push('whackBug');
    }
    this.save();
  }

  updateScore(score, coins) {
    if (score > this.data.highScore) {
      this.data.highScore = score;
    }
    this.data.totalCoins = (this.data.totalCoins || 0) + coins;
    this.save();
  }

  saveMiniGameScore(gameId, score) {
    if (!this.data.miniGameScores) this.data.miniGameScores = {};
    if (score > (this.data.miniGameScores[gameId] || 0)) {
      this.data.miniGameScores[gameId] = score;
    }
    this.save();
  }

  resetAll() {
    this.data = this.getDefaultData();
    this.save();
  }
}

export const saveManager = new SaveManager();
