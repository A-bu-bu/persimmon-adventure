// Save Manager: Multi-Account Management & Cloud Sync via Firebase Firestore
// Same username syncs across all devices (desktop + mobile) + World Leaderboard

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC3p5wUP1-qKChfEmwUgDS-oGNRH9M-4yA",
  authDomain: "persimmon-adventure.firebaseapp.com",
  projectId: "persimmon-adventure",
  storageBucket: "persimmon-adventure.firebasestorage.app",
  messagingSenderId: "572634712592",
  appId: "1:572634712592:web:301ef8b48b5731facb9895",
  measurementId: "G-XPR38DSTSB"
};

let _db = null;
let _firebaseError = false;

async function getFirestore() {
  if (_db) return _db;
  if (_firebaseError) return null;
  try {
    if (!window.firebase || !window.firebase.firestore) {
      await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
    }
    if (!window._firebaseApp && window.firebase) {
      window._firebaseApp = window.firebase.initializeApp(FIREBASE_CONFIG);
    }
    if (window.firebase && window.firebase.firestore) {
      _db = window.firebase.firestore();
      console.log('[Cloud] Firebase Firestore initialized successfully!');
      return _db;
    }
  } catch (e) {
    console.warn('[Cloud] Firebase Firestore initialization failed:', e);
    _firebaseError = true;
  }
  return null;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="' + src + '"]');
    if (existing) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = (err) => {
      console.warn('[Cloud] Failed to load script:', src, err);
      reject(err);
    };
    document.head.appendChild(s);
  });
}

// Default World Benchmark Legends (世界名人堂傳奇紀錄)
const WORLD_LEGENDS = [
  {
    username: '柿界戰神・阿布',
    highestLevel: 10,
    totalCoins: 1580,
    totalScore: 23800,
    miniGameTotal: 8900,
    gameCompleted: true,
    lastPlayed: 1720000000000
  },
  {
    username: '神速踩怪大師',
    highestLevel: 10,
    totalCoins: 1240,
    totalScore: 19650,
    miniGameTotal: 7500,
    gameCompleted: true,
    lastPlayed: 1720000000000
  },
  {
    username: '彩虹滑翔柿',
    highestLevel: 9,
    totalCoins: 960,
    totalScore: 16800,
    miniGameTotal: 6200,
    gameCompleted: false,
    lastPlayed: 1720000000000
  },
  {
    username: '彈刀劍聖・小元氣',
    highestLevel: 8,
    totalCoins: 820,
    totalScore: 13500,
    miniGameTotal: 5100,
    gameCompleted: false,
    lastPlayed: 1720000000000
  },
  {
    username: '果園巡守隊長',
    highestLevel: 6,
    totalCoins: 550,
    totalScore: 9400,
    miniGameTotal: 3800,
    gameCompleted: false,
    lastPlayed: 1720000000000
  },
  {
    username: '金幣收藏家',
    highestLevel: 5,
    totalCoins: 480,
    totalScore: 7200,
    miniGameTotal: 2900,
    gameCompleted: false,
    lastPlayed: 1720000000000
  }
];

export class SaveManager {
  constructor() {
    this.storageKeyProfiles = 'persimmon_adventure_profiles_v3';
    this.storageKeyActiveUser = 'persimmon_adventure_active_user_v3';
    this.oldStorageKey = 'persimmon_adventure_profiles_v2';
    this._syncTimeout = null;

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
      this.saveAllProfiles(false);
    }

    // Auto sync on startup
    setTimeout(async () => {
      await this.syncAllLocalProfilesToCloud();
      await this.pullFromCloud(this.currentUsername);
    }, 200);
  }

  createNewProfile(username) {
    return {
      username: username,
      createdAt: Date.now(),
      lastPlayed: Date.now(),
      highestLevel: 1,
      currentLevel: 1,
      totalCoins: 0,
      gameCompleted: false,
      levelScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
      miniGameScores: {
        pawStomp: 0,
        catchCoins: 0,
        whackMole: 0,
        shootingGallery: 0,
        cloudGlider: 0,
        bossParry: 0,
        riverRaft: 0,
        nightMarket: 0,
        iceGlider: 0,
        rhythmParry: 0
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

  saveAllProfiles(triggerCloud = true) {
    try {
      localStorage.setItem(this.storageKeyProfiles, JSON.stringify(this.profiles));
    } catch (e) {
      console.warn('Failed to save profiles:', e);
    }

    if (triggerCloud) {
      clearTimeout(this._syncTimeout);
      this._syncTimeout = setTimeout(() => {
        this.pushToCloud(this.currentUsername);
      }, 500);
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

  // ─── Cloud Sync (Firebase Firestore) ──────────────────────────────────────────

  async syncAllLocalProfilesToCloud() {
    try {
      const db = await getFirestore();
      if (!db) return;
      for (const uname of Object.keys(this.profiles)) {
        const p = this.profiles[uname];
        if (p && (p.highestLevel > 1 || p.totalCoins > 0 || Object.keys(p.levelScores || {}).some(k => p.levelScores[k] > 0))) {
          await this.pushToCloud(uname);
        }
      }
    } catch (e) {
      console.warn('[Cloud] syncAllLocalProfilesToCloud error:', e);
    }
  }

  async pushToCloud(username) {
    if (!username) return;
    const profile = this.profiles[username];
    if (!profile) return;

    try {
      const db = await getFirestore();
      if (!db) return;

      await db.collection('profiles').doc(username).set({
        ...profile,
        _lastSyncedAt: Date.now()
      }, { merge: true });

      console.log(`[Cloud] ✅ Pushed save for "${username}" (Level ${profile.highestLevel}, Coins $${profile.totalCoins})`);
    } catch (e) {
      console.warn('[Cloud] ⚠️ Push failed:', e);
    }
  }

  async pullFromCloud(username) {
    if (!username) return;

    try {
      const db = await getFirestore();
      if (!db) return;

      const doc = await db.collection('profiles').doc(username).get();
      if (!doc.exists) {
        console.log(`[Cloud] No remote document for "${username}". Uploading local data.`);
        await this.pushToCloud(username);
        return;
      }

      const cloud = doc.data();
      const local = this.profiles[username] || this.createNewProfile(username);

      const merged = { ...local };
      merged.highestLevel  = Math.max(local.highestLevel  || 1, cloud.highestLevel  || 1);
      merged.currentLevel  = Math.max(local.currentLevel  || 1, cloud.currentLevel  || 1);
      merged.totalCoins    = Math.max(local.totalCoins    || 0, cloud.totalCoins    || 0);
      merged.gameCompleted = Boolean(local.gameCompleted || cloud.gameCompleted);
      merged.lastPlayed    = Math.max(local.lastPlayed    || 0, cloud.lastPlayed    || 0);

      merged.levelScores = { ...(local.levelScores || {}) };
      if (cloud.levelScores) {
        for (const k of Object.keys(cloud.levelScores)) {
          merged.levelScores[k] = Math.max(merged.levelScores[k] || 0, cloud.levelScores[k] || 0);
        }
      }

      merged.miniGameScores = { ...(local.miniGameScores || {}) };
      if (cloud.miniGameScores) {
        for (const k of Object.keys(cloud.miniGameScores)) {
          merged.miniGameScores[k] = Math.max(merged.miniGameScores[k] || 0, cloud.miniGameScores[k] || 0);
        }
      }

      const uSet = new Set(local.unlockedMiniGames || ['pawStomp']);
      if (cloud.unlockedMiniGames && Array.isArray(cloud.unlockedMiniGames)) {
        cloud.unlockedMiniGames.forEach(g => uSet.add(g));
      }
      merged.unlockedMiniGames = Array.from(uSet);

      this.profiles[username] = merged;
      localStorage.setItem(this.storageKeyProfiles, JSON.stringify(this.profiles));

      console.log(`[Cloud] 🔄 Synchronized "${username}" -> Level ${merged.highestLevel}, Coins $${merged.totalCoins}`);

      document.dispatchEvent(new CustomEvent('cloudSyncDone', { detail: { username, profile: merged } }));

      if ((local.highestLevel || 1) > (cloud.highestLevel || 1) || (local.totalCoins || 0) > (cloud.totalCoins || 0)) {
        this.pushToCloud(username);
      }
    } catch (e) {
      console.warn('[Cloud] ⚠️ Pull failed:', e);
    }
  }

  /** Fetch World Leaderboard: merges benchmarks + all cloud profiles + all local profiles */
  async fetchWorldLeaderboard() {
    const playerMap = {};

    // 1. Seed with World Legends
    WORLD_LEGENDS.forEach((legend) => {
      playerMap[legend.username] = { ...legend };
    });

    // 2. Add all local profiles
    Object.keys(this.profiles).forEach((uname) => {
      const p = this.profiles[uname];
      let totalScore = 0;
      if (p.levelScores) {
        Object.values(p.levelScores).forEach(sc => totalScore += (Number(sc) || 0));
      }
      let miniGameTotal = 0;
      if (p.miniGameScores) {
        Object.values(p.miniGameScores).forEach(sc => miniGameTotal += (Number(sc) || 0));
      }
      playerMap[uname] = {
        username: uname,
        highestLevel: p.highestLevel || 1,
        totalCoins: p.totalCoins || 0,
        totalScore: totalScore,
        miniGameTotal: miniGameTotal,
        gameCompleted: Boolean(p.gameCompleted),
        lastPlayed: p.lastPlayed || p.createdAt || Date.now()
      };
    });

    // 3. Fetch from Firebase Cloud Firestore
    try {
      const db = await getFirestore();
      if (db) {
        const snapshot = await db.collection('profiles').get();
        snapshot.forEach((doc) => {
          const d = doc.data();
          const uname = d.username || doc.id;
          let totalScore = 0;
          if (d.levelScores) {
            Object.values(d.levelScores).forEach(sc => totalScore += (Number(sc) || 0));
          }
          let miniGameTotal = 0;
          if (d.miniGameScores) {
            Object.values(d.miniGameScores).forEach(sc => miniGameTotal += (Number(sc) || 0));
          }

          const existing = playerMap[uname];
          if (!existing) {
            playerMap[uname] = {
              username: uname,
              highestLevel: d.highestLevel || 1,
              totalCoins: d.totalCoins || 0,
              totalScore: totalScore,
              miniGameTotal: miniGameTotal,
              gameCompleted: Boolean(d.gameCompleted),
              lastPlayed: d.lastPlayed || d._lastSyncedAt || 0
            };
          } else {
            existing.highestLevel = Math.max(existing.highestLevel, d.highestLevel || 1);
            existing.totalCoins = Math.max(existing.totalCoins, d.totalCoins || 0);
            existing.totalScore = Math.max(existing.totalScore, totalScore);
            existing.miniGameTotal = Math.max(existing.miniGameTotal, miniGameTotal);
            existing.gameCompleted = existing.gameCompleted || Boolean(d.gameCompleted);
            existing.lastPlayed = Math.max(existing.lastPlayed, d.lastPlayed || 0);
          }
        });
      }
    } catch (e) {
      console.warn('[Leaderboard] Cloud fetch failed, using local saves & legends:', e);
    }

    const list = Object.values(playerMap);

    // Ranking algorithm:
    // 1. highestLevel (descending)
    // 2. totalScore (descending)
    // 3. totalCoins (descending)
    list.sort((a, b) => {
      if (b.highestLevel !== a.highestLevel) return b.highestLevel - a.highestLevel;
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.totalCoins !== a.totalCoins) return b.totalCoins - a.totalCoins;
      return b.lastPlayed - a.lastPlayed;
    });

    return list;
  }

  get data() {
    if (!this.profiles[this.currentUsername]) {
      this.profiles[this.currentUsername] = this.createNewProfile(this.currentUsername);
    }
    return this.profiles[this.currentUsername];
  }

  async login(username) {
    const cleanName = (username || '').trim();
    if (!cleanName) return false;

    this.currentUsername = cleanName;
    if (!this.profiles[cleanName]) {
      this.profiles[cleanName] = this.createNewProfile(cleanName);
    }
    this.profiles[cleanName].lastPlayed = Date.now();

    this.saveActiveUsername();
    this.saveAllProfiles(false);

    await this.pullFromCloud(cleanName);
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
      this.saveAllProfiles(false);
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

    if (lvl >= 2 && !p.unlockedMiniGames.includes('pawStomp')) p.unlockedMiniGames.push('pawStomp');
    if (lvl >= 3 && !p.unlockedMiniGames.includes('catchCoins')) p.unlockedMiniGames.push('catchCoins');
    if (lvl >= 4 && !p.unlockedMiniGames.includes('whackMole')) p.unlockedMiniGames.push('whackMole');
    if (lvl >= 5 && !p.unlockedMiniGames.includes('shootingGallery')) p.unlockedMiniGames.push('shootingGallery');
    if (lvl >= 6 && !p.unlockedMiniGames.includes('cloudGlider')) p.unlockedMiniGames.push('cloudGlider');
    if (lvl >= 7 && !p.unlockedMiniGames.includes('bossParry')) p.unlockedMiniGames.push('bossParry');
    if (lvl >= 8 && !p.unlockedMiniGames.includes('riverRaft')) p.unlockedMiniGames.push('riverRaft');
    if (lvl >= 9 && !p.unlockedMiniGames.includes('nightMarket')) p.unlockedMiniGames.push('nightMarket');
    if (lvl >= 10 && !p.unlockedMiniGames.includes('iceGlider')) p.unlockedMiniGames.push('iceGlider');

    this.saveAllProfiles(true);
  }

  completeGame() {
    const p = this.data;
    p.gameCompleted = true;
    p.highestLevel = 10;
    if (!p.unlockedMiniGames.includes('rhythmParry')) {
      p.unlockedMiniGames.push('rhythmParry');
    }
    p.lastPlayed = Date.now();
    this.saveAllProfiles(true);
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

    this.saveAllProfiles(true);
  }

  saveMiniGameScore(gameId, score) {
    const p = this.data;
    if (!p.miniGameScores) p.miniGameScores = {};
    if (score > (p.miniGameScores[gameId] || 0)) {
      p.miniGameScores[gameId] = score;
    }
    p.lastPlayed = Date.now();
    this.saveAllProfiles(true);
  }
}

export const saveManager = new SaveManager();
