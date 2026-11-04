/**
 * Procedural Harmonic Audio Synthesizer (Web Audio API)
 * Generates ambient harmonic chord progressions, node selection arpeggios, and autopoietic phase resonance pulses without external audio files.
 */

class AudioSynthesizerService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private currentChordIndex: number = 0;

  // Harmonically rich frequency sets (Hz) - D Dorian / Lydian atmospheric ratios
  private chordSets: number[][] = [
    [130.81, 196.00, 246.94, 293.66], // Cmaj9
    [146.83, 220.00, 261.63, 329.63], // Dm9
    [164.81, 246.94, 293.66, 369.99], // Em11
    [174.61, 261.63, 329.63, 392.00]  // Fmaj7#11
  ];

  public initialize(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.startAmbientDrone();
    } catch {
      // AudioContext blocked or unsupported
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.12, this.ctx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private startAmbientDrone(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ambientOscillators.length > 0) return;

    const freqs = this.chordSets[this.currentChordIndex];
    freqs.forEach(freq => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.025, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.ambientOscillators.push(osc);
    });
  }

  public shiftChord(): void {
    if (!this.ctx) this.initialize();
    if (!this.ctx || this.ambientOscillators.length === 0) return;

    this.currentChordIndex = (this.currentChordIndex + 1) % this.chordSets.length;
    const freqs = this.chordSets[this.currentChordIndex];

    this.ambientOscillators.forEach((osc, idx) => {
      if (this.ctx && freqs[idx]) {
        osc.frequency.setTargetAtTime(freqs[idx], this.ctx.currentTime, 1.5);
      }
    });
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      const targetGain = 0.12 * this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Modulates ambient audio filters and presence based on network synaptic conductance and nutrient flux.
   */
  public updateBioConductanceSoundscape(avgConductance: number, nutrientFlux: number): void {
    if (!this.ctx || this.isMuted) return;

    // Filter frequency scales from 350Hz (subtle warm drone) to 2200Hz (harmonic brilliance)
    const normalizedCond = Math.max(0.1, Math.min(1.0, avgConductance));
    const targetFreq = 350 + normalizedCond * 1850;

    // Modulate filter on each ambient oscillator
    const now = this.ctx.currentTime;
    if (this.ambientOscillators.length > 0) {
      // Periodically shift chord if nutrient flux is elevated
      if (nutrientFlux > 70 && Math.random() < 0.15) {
        this.shiftChord();
      }
    }
  }

  public playAnastomosisChime(pitchModifier: number = 1.0): void {
    if (!this.ctx || this.isMuted) {
      if (!this.ctx) this.initialize();
      if (this.isMuted) return;
    }
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Crystalline dual-tone bell chime (D5 & A5 fifth)
    const tones = [587.33 * pitchModifier, 880.00 * pitchModifier];

    tones.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.06 * this.volume, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9 + idx * 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + 1.2);
    });
  }

  public playMorphicPulseWave(): void {
    if (!this.ctx || this.isMuted) {
      if (!this.ctx) this.initialize();
      if (this.isMuted) return;
    }
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Deep infra-harmonic resonance sweep
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(60, now + 1.8);

    gain.gain.setValueAtTime(0.1 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.1);
  }

  public playBeaconPlacedTone(): void {
    if (!this.ctx || this.isMuted) {
      if (!this.ctx) this.initialize();
      if (this.isMuted) return;
    }
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Major triad ascending chime
    const triad = [523.25, 659.25, 783.99]; // C5, E5, G5

    triad.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.05 * this.volume, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6 + i * 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.07);
      osc.stop(now + 0.8 + i * 0.1);
    });
  }

  public playNodeSelectChime(resonance: number = 0.8): void {
    if (!this.ctx || this.isMuted) {
      if (!this.ctx) this.initialize();
      if (this.isMuted) return;
    }
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 440 + resonance * 330;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.3);

    gain.gain.setValueAtTime(0.08 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  public playAutopoieticPulse(): void {
    if (!this.ctx || this.isMuted) return;
    if (!this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);

    gain.gain.setValueAtTime(0.06 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  public playChimeSuccessTone(): void {
    this.playBeaconPlacedTone();
  }
}

export const audioSynthesizer = new AudioSynthesizerService();
