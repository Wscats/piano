/**
 * Piano Player - TypeScript + Web Audio API refactored version
 * Based on wscats-projects-refactor-spec.md
 */

export interface NoteConfig {
  keyCode: number;
  key: string;
  note: string;
  frequency: number;
}

export const KEY_NOTE_MAP: NoteConfig[] = [
  { keyCode: 65, key: 'a', note: 'C4', frequency: 261.63 },
  { keyCode: 83, key: 's', note: 'D4', frequency: 293.66 },
  { keyCode: 68, key: 'd', note: 'E4', frequency: 329.63 },
  { keyCode: 70, key: 'f', note: 'F4', frequency: 349.23 },
  { keyCode: 71, key: 'g', note: 'G4', frequency: 392.00 },
  { keyCode: 72, key: 'h', note: 'A4', frequency: 440.00 },
  { keyCode: 74, key: 'j', note: 'B4', frequency: 493.88 },
  { keyCode: 75, key: 'k', note: 'C5', frequency: 523.25 },
];

export class PianoPlayer {
  private audioContext: AudioContext;
  private activeNotes: Map<number, OscillatorNode> = new Map();
  private handleKeyDownBound: (e: KeyboardEvent) => void;
  private handleKeyUpBound: (e: KeyboardEvent) => void;

  constructor() {
    this.audioContext = new AudioContext();
    this.handleKeyDownBound = this.handleKeyDown.bind(this);
    this.handleKeyUpBound = this.handleKeyUp.bind(this);
    this.bindEvents();
  }

  private bindEvents(): void {
    document.addEventListener('keydown', this.handleKeyDownBound);
    document.addEventListener('keyup', this.handleKeyUpBound);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.repeat) return;
    const config = KEY_NOTE_MAP.find(n => n.keyCode === e.keyCode);
    if (config) this.playNote(config);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.stopNote(e.keyCode);
  }

  private playNote(config: NoteConfig): void {
    if (this.activeNotes.has(config.keyCode)) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.frequency.value = config.frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
    oscillator.start();
    this.activeNotes.set(config.keyCode, oscillator);
  }

  private stopNote(keyCode: number): void {
    const oscillator = this.activeNotes.get(keyCode);
    if (oscillator) {
      oscillator.stop();
      this.activeNotes.delete(keyCode);
    }
  }

  public destroy(): void {
    this.audioContext.close();
    document.removeEventListener('keydown', this.handleKeyDownBound);
    document.removeEventListener('keyup', this.handleKeyUpBound);
    this.activeNotes.clear();
  }
}
