// Game sound effects, synthesised with the Web Audio API (no audio files, so
// it works offline and inside a native wrapper). Everything is short, soft
// and pitched in one family: wooden clacks for pieces, a bright chime for
// rewards. Fails silently where Web Audio is unavailable.

type AudioCtor = typeof AudioContext;

class SoundManager {
  private audioContext: AudioContext | null = null;
  private isSoundEnabled = true;

  setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  // Created lazily on the first user gesture so autoplay policies are met.
  private ctx(): AudioContext | null {
    if (!this.isSoundEnabled || typeof window === "undefined") return null;
    if (!this.audioContext) {
      const Ctor: AudioCtor | undefined =
        window.AudioContext || (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.audioContext = new Ctor();
      } catch {
        return null;
      }
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => undefined);
    }
    return this.audioContext;
  }

  private tone(
    frequency: number,
    duration: number,
    volume = 0.2,
    type: OscillatorType = "sine",
    delay = 0,
    glideTo?: number
  ) {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  // A wooden "clack": a band-passed noise transient over a falling body tone.
  private clack(pitch: number, volume = 0.25, delay = 0) {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const length = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = pitch * 6;
    band.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    noise.connect(band).connect(gain).connect(ctx.destination);
    noise.start(t);
    this.tone(pitch, 0.09, volume * 0.7, "triangle", delay, pitch * 0.6);
  }

  playTap() {
    this.clack(520, 0.08);
  }

  playSelect() {
    this.clack(430, 0.14);
  }

  playMove() {
    this.clack(260, 0.3);
  }

  playCapture() {
    this.clack(240, 0.32);
    this.clack(330, 0.26, 0.09);
    this.tone(880, 0.18, 0.06, "sine", 0.12);
  }

  playPromotion() {
    this.clack(260, 0.25);
    [659, 784, 988, 1319].forEach((f, i) => this.tone(f, 0.22, 0.09, "sine", 0.1 + i * 0.07));
  }

  playWin() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.3, 0.12, "triangle", i * 0.12));
    this.tone(1568, 0.6, 0.06, "sine", 0.5);
  }

  playLose() {
    [392, 349, 311].forEach((f, i) => this.tone(f, 0.32, 0.12, "triangle", i * 0.16));
    this.tone(233, 0.6, 0.1, "sine", 0.5, 196);
  }

  playError() {
    this.tone(180, 0.15, 0.15, "square", 0, 140);
  }
}

export const soundManager = new SoundManager();
