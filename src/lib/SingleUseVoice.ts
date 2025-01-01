import { Sample_settings } from '../types/sample';
import { snapToNearestZeroCrossing } from '../lib/DSP/zeroCrossingUtils';
import { snapDurationToNote, C5_DURATION_SEC } from './utils/noteToFreq';

export default class SingleUseVoice {
  private static sampleRate: number;
  private static allVoices: Set<SingleUseVoice> = new Set();
  static zeroCrossings: Map<string, number[]> = new Map(); // gera private og setter ef þetta virkar
  static sampleSettings: Map<string, Sample_settings> = new Map();

  private static globalLoop: boolean = false;
  private static hold: boolean = false;

  private source: AudioBufferSourceNode;
  private sampleId: string;
  private midiNote: number = -1;
  private voiceGain: GainNode;
  private settings: Sample_settings;
  private trigger: number = -1;

  static initialize(sampleRate: number = 48000) {
    SingleUseVoice.sampleRate = sampleRate;
  }

  constructor(
    private audioCtx: AudioContext,
    readonly buffer: AudioBuffer,
    sampleId: string
  ) {
    if (!SingleUseVoice.sampleSettings.has(sampleId)) {
      throw new Error('Sample not loaded, id: ' + sampleId);
    }

    this.settings = SingleUseVoice.sampleSettings.get(sampleId)!;
    SingleUseVoice.allVoices.add(this);

    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = buffer;
    this.voiceGain = this.audioCtx.createGain();
    this.voiceGain.gain.value = 0;
    this.source.connect(this.voiceGain);

    this.source.loop = SingleUseVoice.globalLoop || this.settings.loopLocked;

    this.sampleId = sampleId;
    this.setLoop();
    this.calculateLoopPoints();

    this.source.onended = () => {
      this.stop();
    };
  }

  static isPlaying(): boolean {
    return SingleUseVoice.allVoices.size > 0;
  }

  static getCurrentPlayheadPosition() {
    if (!(SingleUseVoice.allVoices.size > 0)) return 0;
    const voices = Array.from(SingleUseVoice.allVoices);
    if (voices[0].trigger <= 0) return 0;

    return voices[0].now() - voices[0].trigger;
  }

  static panic() {
    console.log('Panic! allVoices:', SingleUseVoice.allVoices);
    SingleUseVoice.allVoices.forEach((voice) => voice.stop());
    SingleUseVoice.globalLoop = false;
    SingleUseVoice.allVoices.clear();
  }

  static toggleLoop() {
    SingleUseVoice.globalLoop = !SingleUseVoice.globalLoop;
    SingleUseVoice.allVoices.forEach((voice) => voice.setLoop());
  }

  static setLoop(isLoopOn: boolean) {
    SingleUseVoice.globalLoop = isLoopOn;
    SingleUseVoice.allVoices.forEach((voice) => voice.setLoop());
  }

  static isLooping() {
    return SingleUseVoice.globalLoop;
  }

  static toggleHold() {
    SingleUseVoice.hold = !SingleUseVoice.hold;
    if (!SingleUseVoice.hold) {
      SingleUseVoice.allVoices.forEach((voice) => {
        voice.triggerRelease();
      });
    }
  }

  static setHold(isHoldOn: boolean) {
    SingleUseVoice.hold = isHoldOn;
    if (!SingleUseVoice.hold) {
      SingleUseVoice.allVoices.forEach((voice) => {
        voice.triggerRelease();
      });
    }
  }

  static isHolding() {
    return SingleUseVoice.hold;
  }

  static releaseNote(midiNote: number) {
    SingleUseVoice.allVoices.forEach((voice) => {
      if (voice.midiNote === midiNote) {
        if (!SingleUseVoice.hold) {
          // (!voice.source.loop) {
          voice.triggerRelease();
        }
      }
    });
  }

  now() {
    return this.audioCtx.currentTime;
  }

  getVoiceGain() {
    return this.voiceGain;
  }

  start(midiNote: number) {
    const rate = 2 ** ((midiNote - 60) / 12);
    this.source.playbackRate.value = rate;

    this.source.start(
      0,
      this.settings.startPoint,
      this.source.loop // sets end point only if not looping
        ? undefined
        : this.settings.endPoint - this.settings.startPoint
    );

    this.triggerAttack();
    this.midiNote = midiNote;
  }

  stop() {
    this.source.stop();
    SingleUseVoice.allVoices.delete(this);
    this.source.disconnect();
    this.voiceGain.disconnect();
  }

  loopEnvelope() {
    const { attackTime, releaseTime, loopStart, loopEnd } = this.settings;
    const loopDuration = loopEnd - loopStart;
    const now = this.now();
    this.voiceGain.gain.setValueAtTime(0, now);
    this.voiceGain.gain.linearRampToValueAtTime(1, now + attackTime);
    this.voiceGain.gain.setValueAtTime(1, now + loopDuration - releaseTime);
    this.voiceGain.gain.linearRampToValueAtTime(0, now + loopDuration);
  }

  triggerAttack() {
    this.voiceGain.gain.linearRampToValueAtTime(
      this.settings.sampleVolume,
      this.now() + this.settings.attackTime
    );
    this.trigger = this.now();
  }

  triggerRelease() {
    if (this.trigger <= 0) return;
    if (SingleUseVoice.hold) return;

    this.voiceGain.gain.linearRampToValueAtTime(
      0.0001,
      this.now() + this.settings.releaseTime
    );

    this.source.stop(this.now() + this.settings.releaseTime + 0.1);
  }

  setLoop(isLoopOn: boolean = SingleUseVoice.globalLoop) {
    if (this.settings.loopLocked) {
      return;
    }
    this.source.loop = isLoopOn;
    if (!isLoopOn) {
      this.triggerRelease();
    }
  }

  setLoopLock(isLocked: boolean) {
    this.settings.loopLocked = isLocked;
  }

  static updateActiveVoices(
    sampleId: string,
    settings: Partial<Sample_settings>
  ) {
    SingleUseVoice.allVoices.forEach((voice) => {
      if (voice.sampleId === sampleId) {
        voice.calculateLoopPoints();

        voice.settings = { ...voice.settings, ...settings };
        SingleUseVoice.sampleSettings.set(sampleId, voice.settings);
      }
    });
  }

  updateLoopPoints(
    newLoopStart: number = this.source.loopStart,
    newLoopEnd: number = this.source.loopEnd
  ) {
    this.source.loopStart = newLoopStart / SingleUseVoice.sampleRate;
    this.source.loopEnd = newLoopEnd / SingleUseVoice.sampleRate;
  }

  calculateLoopPoints(updated: Partial<Sample_settings> = this.settings) {
    let start = updated.loopStart ?? this.settings.loopStart;
    let end = updated.loopEnd ?? this.settings.loopEnd;

    const initLoopLength = end - start;

    if (initLoopLength <= C5_DURATION_SEC) return;

    start = snapToNearestZeroCrossing(
      start,
      SingleUseVoice.zeroCrossings.get(this.sampleId) ?? []
    );
    end = snapToNearestZeroCrossing(
      end,
      SingleUseVoice.zeroCrossings.get(this.sampleId) ?? []
    );

    const zeroSnapLength = end - start;

    this.updateLoopPoints(start, end);

    if (zeroSnapLength > 0.015) return;

    // Snap to notes when in audiorange
    const snappedLength = snapDurationToNote(
      zeroSnapLength,
      ['C'], // Available: C, 'D', 'E', 'F', 'G', 'A', 'B' // TODO: interpolate!
      'C',
      'C',
      0,
      7,
      'sec' // sec, ms or samples
    );
    const newEnd = start + snappedLength;

    this.source.loopEnd = newEnd;
  }

  setLoopVolume(volume: number) {
    this.settings.loopVolume = volume;
  }
}
