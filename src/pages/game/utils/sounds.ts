// Sound utility for generating and playing game sounds using Web Audio API

class SoundManager {
  private audioContext: AudioContext | null = null;
  private isSoundEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  // Play a simple beep tone
  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.isSoundEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play move sound - soft click
  playMove() {
    this.playTone(400, 0.1, 0.2);
  }

  // Play capture sound - higher pitched
  playCapture() {
    if (!this.isSoundEnabled || !this.audioContext) return;

    // Two-tone capture sound
    setTimeout(() => this.playTone(600, 0.08, 0.25), 0);
    setTimeout(() => this.playTone(800, 0.08, 0.25), 50);
  }

  // Play king promotion sound
  playPromotion() {
    if (!this.isSoundEnabled || !this.audioContext) return;

    // Ascending tones
    setTimeout(() => this.playTone(500, 0.1, 0.2), 0);
    setTimeout(() => this.playTone(600, 0.1, 0.2), 80);
    setTimeout(() => this.playTone(750, 0.15, 0.2), 160);
  }

  // Play win sound
  playWin() {
    if (!this.isSoundEnabled || !this.audioContext) return;

    // Victory fanfare
    setTimeout(() => this.playTone(523, 0.15, 0.25), 0);
    setTimeout(() => this.playTone(659, 0.15, 0.25), 150);
    setTimeout(() => this.playTone(784, 0.3, 0.25), 300);
  }

  // Play lose sound
  playLose() {
    if (!this.isSoundEnabled || !this.audioContext) return;

    // Descending tones
    setTimeout(() => this.playTone(400, 0.15, 0.2), 0);
    setTimeout(() => this.playTone(350, 0.15, 0.2), 150);
    setTimeout(() => this.playTone(300, 0.3, 0.2), 300);
  }

  // Play select piece sound - subtle
  playSelect() {
    this.playTone(500, 0.05, 0.15);
  }

  // Play illegal move sound - error beep
  playError() {
    this.playTone(200, 0.15, 0.2);
  }
}

export const soundManager = new SoundManager();
