// Save Manager: Multi-Account Management, Passwordless Login & 6 Mini-Games Statistics
export class SaveManager {
  constructor() {
    this.storageKeyProfiles = 'persimmon_adventure_profiles_v3';
    this.storageKeyActiveUser = 'persimmon_adventure_active_user_v3';
    this.oldStorageKey = 'persimmon_adventure_profiles_v2';

    this.profiles = this.loadAllProfiles();
    this.currentUsername = this.loadActiveUsername();

    if (!this.currentUsername || !this.profiles[this.currentUsername]) {
      const existingUsernames = Object.keys(this.profiles);
      if (existingUsernames.length > 0) {
        this.currentUsername = existingUsernames[0];
      } else {
        this.currentUsername = '背柿小勇士';
        this.profiles[this.currentUsername] = this.createNewProfile(this.currentUsername);
        this.migrateOldSave(this.currentUsername);
      }
      this.saveActiveUsername();
      this.saveAllProfiles();
    }
  }

  createNewProfile(username) {
    return {
      username: username,
      createdAt: Date.now(),
      lastPlayed: Date.now(),
      highestLevel: 1, // 1..6
      currentLevel: 1, // Checkpoint
      totalCoins: 0,   // 總累積金額 (甜柿金幣)
      gameCompleted: false,
      levelScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      miniGameScores: {
        pawStomp: 0,
        catchCoins: 0,
        whackMole: 0,
        shootingGallery: 0,
        cloudGlider: 0,
        bossParry: 0
      },
      unlockedMiniGames: ['pawStomp']
    };
  }

  migrateOldSave(targetUsername) {
    try {
      const old = localStorage.getItem(this.oldStorageKey);
      if (old) {
        const parsed = JSON.parse(old);
        if (parsed[targetUsername]) {
          const oldP = parsed[targetUsername];
          const p = this.profiles[targetUsername];
          if (oldP.highestLevel) p.highestLevel = Math.max(p.highestLevel, oldP.highestLevel);
          if (oldP.totalCoins) p.totalCoins = Math.max(p.totalCoins, oldP.totalCoins);
          if (oldP.levelScores) Object.assign(p.levelScores, oldP.levelScores);
          if (oldP.miniGameScores) Object.assign(p.miniGameScores, oldP.miniGameScores);
        }
      }
    } catch (e) {
      console.warn('Migration error:', e);
    }
  }

  loadAllProfiles() {
    try {
      const saved = localStorage.getItem(this.storageKeyProfiles);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load profiles:', e);
    }
    return {};
  }

  saveAllProfiles() {
    try {
      localStorage.setItem(this.storageKeyProfiles, JSON.stringify(this.profiles));
    } catch (e) {
      console.warn('Failed to save profiles:', e);
    }
  }

  loadActiveUsername() {
    try {
      return localStorage.getItem(this.storageKeyActiveUser) || '';
    } catch (e) {
      return '';
    }
  }

  saveActiveUsername() {
    try {
      localStorage.setItem(this.storageKeyActiveUser, this.currentUsername);
    } catch (e) {
      console.warn('Failed to save active username:', e);
    }
  }

  get data() {
    if (!this.profiles[this.currentUsername]) {
      this.profiles[this.currentUsername] = this.createNewProfile(this.currentUsername);
    }
    return this.profiles[this.currentUsername];
  }

  login(username) {
    const cleanName = (username || '').trim();
    if (!cleanName) return false;

    this.currentUsername = cleanName;
    if (!this.profiles[cleanName]) {
      this.profiles[cleanName] = this.createNewProfile(cleanName);
    }
    this.profiles[cleanName].lastPlayed = Date.now();

    this.saveActiveUsername();
    this.saveAllProfiles();
    return true;
  }

  getAllUsers() {
    return Object.keys(this.profiles).map((uname) => {
      const p = this.profiles[uname];
      return {
        username: uname,
        highestLevel: p.highestLevel || 1,
        totalCoins: p.totalCoins || 0,
        lastPlayed: p.lastPlayed || p.createdAt || 0
      };
    }).sort((a, b) => b.lastPlayed - a.lastPlayed);
  }

  deleteUser(username) {
    if (this.profiles[username]) {
      delete this.profiles[username];
      const remaining = Object.keys(this.profiles);
      if (remaining.length > 0) {
        this.currentUsername = remaining[0];
      } else {
        this.currentUsername = '背柿小勇士';
        this.profiles[this.currentUsername] = this.createNewProfile(this.currentUsername);
      }
      this.saveActiveUsername();
      this.saveAllProfiles();
    }
  }

  reachLevel(levelIndex) {
    const lvl = levelIndex + 1;
    const p = this.data;
    if (lvl > p.highestLevel) {
      p.highestLevel = lvl;
    }
    p.currentLevel = lvl;
    p.lastPlayed = Date.now();

    if (!p.unlockedMiniGames) p.unlockedMiniGames = [];

    // Auto-unlock mini-games on progression
    if (lvl >= 2 && !p.unlockedMiniGames.includes('pawStomp')) p.unlockedMiniGames.push('pawStomp');
    if (lvl >= 3 && !p.unlockedMiniGames.includes('catchCoins')) p.unlockedMiniGames.push('catchCoins');
    if (lvl >= 4 && !p.unlockedMiniGames.includes('whackMole')) p.unlockedMiniGames.push('whackMole');
    if (lvl >= 5 && !p.unlockedMiniGames.includes('shootingGallery')) p.unlockedMiniGames.push('shootingGallery');
    if (lvl >= 6 && !p.unlockedMiniGames.includes('cloudGlider')) p.unlockedMiniGames.push('cloudGlider');

    this.saveAllProfiles();
  }

  completeGame() {
    const p = this.data;
    p.gameCompleted = true;
    p.highestLevel = 6;
    if (!p.unlockedMiniGames.includes('bossParry')) {
      p.unlockedMiniGames.push('bossParry');
    }
    p.lastPlayed = Date.now();
    this.saveAllProfiles();
  }

  recordLevelScore(levelIndex, score, coinsEarned) {
    const lvl = levelIndex + 1;
    const p = this.data;

    if (!p.levelScores) p.levelScores = {};
    if (!p.levelScores[lvl] || score > p.levelScores[lvl]) {
      p.levelScores[lvl] = score;
    }

    p.totalCoins = (p.totalCoins || 0) + Math.max(0, coinsEarned);
    p.lastPlayed = Date.now();

    this.saveAllProfiles();
  }

  saveMiniGameScore(gameId, score) {
    const p = this.data;
    if (!p.miniGameScores) p.miniGameScores = {};
    if (score > (p.miniGameScores[gameId] || 0)) {
      p.miniGameScores[gameId] = score;
    }
    p.lastPlayed = Date.now();
    this.saveAllProfiles();
  }
}

export const saveManager = new SaveManager();
