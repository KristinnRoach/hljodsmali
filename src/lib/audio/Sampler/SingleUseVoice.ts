import { Sample_settings } from '../../../types/samples';
import { snapToNearestZeroCrossing } from '../DSP/zeroCrossingUtils';
import { snapDurationToNote, C5_DURATION_SEC } from '../../utils/noteToFreq';

export default class SingleUseVoice {
  private static sampleRate: number = 48000;
  private static allVoices: Set<SingleUseVoice> = new Set();
  static zeroCrossings: Map<string, number[]> = new Map(); // gera private og setter ef þetta virkar
  static sampleSettings: Map<string, Sample_settings> = new Map();

  // Loop & Hoild: should be able to save for each sample or global? // global makes sense with CapsLock
  private static globalLoop: boolean = false;
  private static hold: boolean = false;

  // private static sampleGainNodesMap: Map<string, GainNode> = new Map();

  private source: AudioBufferSourceNode;
  private sampleId: string;
  private midiNote: number = -1;
  private voiceGain: GainNode;
  private settings: Sample_settings;
  private trigger: number = -1;
  private held: number = -1;

  // // private minLoopLength: number | null = null;
  // private static readonly C1_FREQUENCY = 32.7; // C1 frequency in Hz
  // private static minLoopLengthInSamples: number;

  // private static calculateMinLoopLength(sampleRate: number): number {
  //   const periodInSeconds = 1 / SingleUseVoice.C1_FREQUENCY;
  //   return Math.ceil(periodInSeconds * sampleRate);
  // }

  // Static initializer block (supported in modern JavaScript/TypeScript)
  static initialize(sampleRate: number = 48000) {
    SingleUseVoice.sampleRate = sampleRate;
    // SingleUseVoice.minLoopLengthInSamples =
    //   SingleUseVoice.calculateMinLoopLength(sampleRate);
  }

  // // Method to update minLoopLengthInSamples if a different sample rate is encountered
  // static updateMinLoopLength(sampleRate: number = SingleUseVoice.sampleRate) {
  //   if (
  //     SingleUseVoice.minLoopLengthInSamples === undefined ||
  //     sampleRate !== SingleUseVoice.sampleRate
  //   ) {
  //     SingleUseVoice.minLoopLengthInSamples =
  //       SingleUseVoice.calculateMinLoopLength(sampleRate);
  //   }
  // }

  constructor(
    private audioCtx: AudioContext,
    readonly buffer: AudioBuffer,
    sampleId: string
  ) {
    console.log(
      'SingleUseVoice.sampleSettings: ',
      SingleUseVoice.sampleSettings
    );
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

  /*  SHOULD USE 'SingleUseVoice.sampleGainNodesMap' or 'this.sampleGainNodesMap' for static stuff ?? */

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
    // if (SingleUseVoice.globalLoop === isLoopOn) return;

    SingleUseVoice.globalLoop = !SingleUseVoice.globalLoop;
    // better to not set for active voices ?
    SingleUseVoice.allVoices.forEach((voice) => voice.setLoop());
    // setTimeout(() => {
    //   console.log('all voices: ', SingleUseVoice.allVoices);
    //   // SingleUseVoice.allVoices.clear();
    // }, 500);
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

  // static updateSampleSettings( // ef set virkar ekki í samplerengine
  //   sampleId: string,
  //   settings: Partial<Sample_settings>
  // ) {
  //   SingleUseVoice.sampleSettings.set(sampleId, {
  //     ...SingleUseVoice.sampleSettings.get(sampleId)!,
  //     ...settings,
  //   });
  //   SingleUseVoice.updateActiveVoices(sampleId, settings);
  // }

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

    // if (this.source.loop) {
    //   this.loopEnvelope();
    // } else {
    this.triggerAttack();
    // }
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
    // if (this.source.loop) {
    //   this.triggerRelease();
    // }
  }

  triggerRelease() {
    if (this.trigger <= 0) return;
    // if (this.source.loop) return;
    if (SingleUseVoice.hold) return;

    this.voiceGain.gain.linearRampToValueAtTime(
      0.0001,
      this.now() + this.settings.releaseTime
    );
    this.held = this.now() - this.trigger; // not using !!

    this.source.stop(this.now() + this.settings.releaseTime + 0.1);

    // if (!this.source.loop) {
    //   this.source.stop(this.now() + this.settings.releaseTime + 0.1);
    // } else {
    //   this.loopEnvelope();
    // }
  }

  setLoop(isLoopOn: boolean = SingleUseVoice.globalLoop) {
    if (this.settings.loopLocked) {
      return;
    }
    this.source.loop = isLoopOn;
    if (!isLoopOn) {
      this.triggerRelease(); // get remaining play time
    }
  }

  setLoopLock(isLocked: boolean) {
    this.settings.loopLocked = isLocked;
  }

  static updateActiveVoices(
    sampleId: string,
    settings: Partial<Sample_settings>
  ) {
    // FOR EACH SAMPLE Static: update static sample_settings and recalculate loop points. Update Sample_db object in engine and context. Call the function below for each active voice
    // FOR EACH Active VOICE non-static: use the recalculated loop points to update source.loopStart, source.loopEnd (settings.loopStart, settings.loopEnd needed or no?)

    SingleUseVoice.allVoices.forEach((voice) => {
      if (voice.sampleId === sampleId) {
        voice.calculateLoopPoints();

        voice.settings = { ...voice.settings, ...settings };
        SingleUseVoice.sampleSettings.set(sampleId, voice.settings); // make clearer what is going on. No need for both voice and sample settings!
      }
    });
  }

  updateLoopPoints(
    newLoopStart: number = this.source.loopStart,
    newLoopEnd: number = this.source.loopEnd
  ) {
    this.source.loopStart = newLoopStart;
    this.source.loopEnd = newLoopEnd;
  }

  calculateLoopPoints(updated: Partial<Sample_settings> = this.settings) {
    // SHOULD BE STATIC?!
    let start = updated.loopStart ?? this.settings.loopStart;
    let end = updated.loopEnd ?? this.settings.loopEnd;

    const initLoopLength = end - start;
    console.log('init looplength:', initLoopLength);

    if (initLoopLength <= C5_DURATION_SEC) return; // how does this affect rendering? Should be in render function, or both?

    start = snapToNearestZeroCrossing(
      start,
      SingleUseVoice.zeroCrossings.get(this.sampleId) ?? []
    );
    end = snapToNearestZeroCrossing(
      end,
      SingleUseVoice.zeroCrossings.get(this.sampleId) ?? []
    );

    const zeroSnapLength = end - start;
    if (initLoopLength !== zeroSnapLength) {
      console.log('length SNAPPED TO ZERO: ', end - start);
    }

    this.updateLoopPoints(start, end);

    if (zeroSnapLength > 0.015) return;

    // Snap to notes when in audiorange
    const snappedLength = snapDurationToNote(
      zeroSnapLength,
      ['C'], // interpolate rather! // , 'D', 'E', 'F', 'G', 'A', 'B'
      'C',
      'C',
      0,
      7,
      'sec' // try ms or samples if needed
    );
    const newEnd = start + snappedLength;

    this.source.loopEnd = newEnd; // could call updateLoopPoints again, but only need to update loopEnd to adjust the length

    console.log('length SNAPPED TO C: ', newEnd - start);
  }

  setLoopVolume(volume: number) {
    this.settings.loopVolume = volume;
  }
}

// C0 (16.35 Hz):
// (1 / 16.35) * 1000 = 61.1620795107034 ms
// C1 (32.70 Hz):
// (1 / 32.70) * 1000 = 30.5810397553517 ms
// C2 (65.41 Hz):
// (1 / 65.41) * 1000 = 15.2881816237577 ms
// C3 (130.81 Hz):
// (1 / 130.81) * 1000 = 7.64468311290726 ms
// C4 (261.63 Hz):
// (1 / 261.63) * 1000 = 3.82234155638498 ms
// C5 (523.25 Hz):
// (1 / 523.25) * 1000 = 1.91117077819399 ms
// C6 (1046.50 Hz):
// (1 / 1046.50) * 1000 = 0.955585389097005 ms
// C7 (2093.00 Hz):
// (1 / 2093.00) * 1000 = 0.477792694455503 ms

// testloop();

// function calculateLoopLength(sampleRate: number, frequency: number): number {
//   return Math.round(sampleRate / frequency);
// }

// // Function to calculate frequency of C for a given octave
// function getCFrequency(octave: number): number {
//   // C4 (middle C) is 261.63 Hz
//   const C4_FREQUENCY = 261.63;
//   // Each octave doubles the frequency
//   return C4_FREQUENCY * Math.pow(2, octave - 4);
// }

// // Sample rate
// const SAMPLE_RATE = 48000;

// function testloop() {
//   // Calculate and print loop lengths for C notes from C0 to C8
//   for (let octave = 0; octave <= 8; octave++) {
//     const frequency = getCFrequency(octave);
//     const loopLength = calculateLoopLength(SAMPLE_RATE, frequency);
//     console.log(
//       `C${octave}: frequency = ${frequency.toFixed(
//         2
//       )} Hz, loop length = ${loopLength} samples`
//     );
//   }
// }

// updateLoopPoints(updated: Partial<Sample_settings> = this.settings) {
//   if (updated.loopStart) {
//     this.source.loopStart = snapToNearestZeroCrossing(
//       updated.loopStart,
//       SingleUseVoice.zeroCrossings.get(this.sampleId) ?? []
//     );
//   }
//   if (updated.loopEnd) {
//     this.source.loopEnd = snapToNearestZeroCrossing(
//       updated.loopEnd,
//       SingleUseVoice.zeroCrossings.get(this.sampleId) ?? []
//     );
//   }
// }

// loopEnvelope() {
//   if (
//     this.source.loop &&
//     (SingleUseVoice.globalLoop || this.voiceLoopLock)
//   ) {
//     const loopDuration = this.sample_settings.loopEnd - this.sample_settings.loopStart;
//     this.voiceGain.gain.setTargetAtTime(
//       this.sample_settings.loopVolume,
//       this.trigger + this.held + this.sample_settings.releaseTime,
//       this.sample_settings.attackTime
//     );
//     this.voiceGain.gain.setTargetAtTime(
//       0,
//       this.now() + this.held + this.sample_settings.releaseTime,
//       this.sample_settings.releaseTime
//     );
//     // this.held = this.now() - this.trigger;
//     console.log('looping:', this.held);
//   } else {
//   this.triggerRelease();
//   }
// }

// triggerAttack(offset: number = 0) {
//   this.trigger = this.now() + offset;
//   console.log('play:', this);
//   this.voiceGain.gain.setValueAtTime(0, this.trigger);

//   this.voiceGain.gain.linearRampToValueAtTime(
//     this.sample_settings.sampleVolume,
//     this.trigger + this.sample_settings.attackTime
//   );
//   if (SingleUseVoice.globalLoop || this.voiceLoopLock) {
//     this.triggerRelease(this.held);
//   }
// }

// triggerRelease(offset: number = 0) {
//   if (this.trigger < 0) return;
//   this.held = this.now() - this.trigger; // round
//   console.log('held:', this.held);

//   this.voiceGain.gain.setValueAtTime(
//     this.voiceGain.gain.value,
//     this.now() + offset
//   );
//   this.voiceGain.gain.linearRampToValueAtTime(
//     0,
//     this.now() + offset + this.sample_settings.releaseTime
//   );

//   if (!(SingleUseVoice.globalLoop || this.voiceLoopLock)) {
//     this.source.loop = false;
//     this.source.stop(this.now() + offset + this.sample_settings.releaseTime);
//   } else {
//     this.triggerAttack(offset + this.sample_settings.releaseTime);
//   }
// }
