// Web Audio Procedural Sound Effects & Retro Chiptune Music Synthesizer
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicVolume = 0.35;
    this.sfxVolume = 0.5;
    this.bgmNode = null;
    this.bgmPlaying = false;
    this.currentTrack = null;
    this.nextNoteTime = 0;
    this.currentNoteIndex = 0;
    this.bgmTimer = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized && this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.muted) {
      this.stopBGM();
    } else {
      if (this.currentTrack) {
        this.playBGM(this.currentTrack);
      }
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // --- SOUND EFFECTS (Procedurally Synthesized) ---

  playJump() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playDash() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // White noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  playShoot(type = 0) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (type === 0) {
      // Single Seed Shot (crisp blip)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 1) {
      // Spread Tri-Shot (chirp scatter)
      [700, 850, 1000].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.015);
        osc.frequency.exponentialRampToValueAtTime(180, now + i * 0.015 + 0.09);

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, now + i * 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.015 + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.015);
        osc.stop(now + i * 0.015 + 0.09);
      });
    } else {
      // Mega Blast (heavy laser charge boom)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  playCoin() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.frequency.setValueAtTime(1318.51, now + 0.06); // E6

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
    gain.gain.setValueAtTime(this.sfxVolume * 0.35, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.06);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.22);
  }

  playHurt() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.18);

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playEnemyHit() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(160, now + 0.03);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  playEnemyDie() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.16);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playSpring() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playPowerup() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(this.sfxVolume * 0.3, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.12);
    });
  }

  playBossHit() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playLevelClear() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C-E-G-C-E-G Fanfare
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + (idx === notes.length - 1 ? 0.6 : 0.18));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + (idx === notes.length - 1 ? 0.6 : 0.18));
    });
  }

  playGameOver() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 415.3, 392.0, 369.99];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(this.sfxVolume * 0.4, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.25);
    });
  }

  // --- PROCEDURAL CHIPTUNE BACKGROUND MUSIC ENGINE ---

  playBGM(track = 'orchard') {
    this.currentTrack = track;
    if (this.muted) return;
    this.resume();
    this.stopBGM();

    // Melody definitions (Frequency, Duration in 16th notes)
    // Scale: C Major / Pentatonic upbeat melodies
    const tracks = {
      orchard: [
        // Energetic happy orchard theme (柿柿順利主旋律)
        { f: 523.25, d: 2 }, { f: 659.25, d: 2 }, { f: 783.99, d: 2 }, { f: 1046.50, d: 2 },
        { f: 880.00, d: 2 }, { f: 783.99, d: 2 }, { f: 659.25, d: 4 },
        { f: 587.33, d: 2 }, { f: 659.25, d: 2 }, { f: 587.33, d: 2 }, { f: 523.25, d: 2 },
        { f: 440.00, d: 4 }, { f: 523.25, d: 4 },
        { f: 659.25, d: 2 }, { f: 783.99, d: 2 }, { f: 880.00, d: 2 }, { f: 1046.50, d: 2 },
        { f: 1174.66, d: 2 }, { f: 1046.50, d: 2 }, { f: 880.00, d: 4 },
        { f: 783.99, d: 2 }, { f: 659.25, d: 2 }, { f: 587.33, d: 2 }, { f: 523.25, d: 2 },
        { f: 523.25, d: 8 }
      ],
      maze: [
        // Mysterious & faster paced bramble maze theme
        { f: 440.00, d: 2 }, { f: 523.25, d: 2 }, { f: 440.00, d: 2 }, { f: 659.25, d: 2 },
        { f: 587.33, d: 2 }, { f: 523.25, d: 2 }, { f: 493.88, d: 4 },
        { f: 440.00, d: 2 }, { f: 392.00, d: 2 }, { f: 440.00, d: 2 }, { f: 523.25, d: 2 },
        { f: 659.25, d: 4 }, { f: 783.99, d: 4 },
        { f: 880.00, d: 2 }, { f: 783.99, d: 2 }, { f: 659.25, d: 2 }, { f: 587.33, d: 2 },
        { f: 523.25, d: 4 }, { f: 440.00, d: 4 }
      ],
      boss: [
        // Intense driving boss theme with pulsing bass
        { f: 220.00, d: 1 }, { f: 220.00, d: 1 }, { f: 440.00, d: 2 }, { f: 392.00, d: 2 },
        { f: 329.63, d: 2 }, { f: 349.23, d: 2 }, { f: 329.63, d: 2 }, { f: 293.66, d: 4 },
        { f: 220.00, d: 1 }, { f: 220.00, d: 1 }, { f: 440.00, d: 2 }, { f: 493.88, d: 2 },
        { f: 523.25, d: 2 }, { f: 587.33, d: 2 }, { f: 659.25, d: 4 },
        { f: 659.25, d: 2 }, { f: 587.33, d: 2 }, { f: 523.25, d: 2 }, { f: 493.88, d: 2 },
        { f: 440.00, d: 8 }
      ]
    };

    const notes = tracks[track] || tracks.orchard;
    const tempo = track === 'boss' ? 140 : 124; // BPM
    const stepDuration = 60 / tempo / 4; // 16th note in seconds

    this.bgmPlaying = true;
    let noteIndex = 0;

    const playNext = () => {
      if (!this.bgmPlaying || this.muted || !this.ctx) return;
      const note = notes[noteIndex];
      const duration = note.d * stepDuration;
      const now = this.ctx.currentTime;

      // Lead melody synth
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = track === 'boss' ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(note.f, now);

      gain.gain.setValueAtTime(this.musicVolume * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.92);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);

      // Bass note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(note.f / 2, now);
      bassGain.gain.setValueAtTime(this.musicVolume * 0.18, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.85);

      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + duration);

      noteIndex = (noteIndex + 1) % notes.length;
      this.bgmTimer = setTimeout(playNext, duration * 1000);
    };

    playNext();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const audio = new SoundEngine();
