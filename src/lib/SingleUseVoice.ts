import { Sample_settings } from '../types/sample';

export default class SingleUseVoice {
  private static allVoices: Set<SingleUseVoice> = new Set();

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

  constructor(
    private audioCtx: AudioContext,
    readonly buffer: AudioBuffer,
    readonly sample_settings: Sample_settings, // býr til copy?
    sampleId: string,
    sampleGainNode: GainNode
  ) {
    SingleUseVoice.allVoices.add(this);
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = buffer;
    this.voiceGain = this.audioCtx.createGain();
    this.voiceGain.gain.value = 0;
    this.source.connect(this.voiceGain);
    this.voiceGain.connect(sampleGainNode);

    this.settings = sample_settings;
    this.source.loop = SingleUseVoice.globalLoop || this.settings.loopLocked;

    this.sampleId = sampleId;
    this.setLoop();
    this.updateLoopPoints();

    this.source.onended = () => {
      this.stop();
    };
  }

  /*  SHOULD USE 'SingleUseVoice.sampleGainNodesMap' or 'this.sampleGainNodesMap' for static stuff ?? */

  static panic() {
    console.log('Panic! allVoices:', SingleUseVoice.allVoices);
    SingleUseVoice.allVoices.forEach((voice) => voice.stop());
    SingleUseVoice.globalLoop = false;
    SingleUseVoice.allVoices.clear();
  }

  static setGlobalLooping(isLoopOn: boolean) {
    if (SingleUseVoice.globalLoop === isLoopOn) return;

    SingleUseVoice.globalLoop = isLoopOn;
    // better to not set for active voices ?
    SingleUseVoice.allVoices.forEach((voice) => voice.setLoop());
    // setTimeout(() => {
    //   console.log('all voices: ', SingleUseVoice.allVoices);
    //   // SingleUseVoice.allVoices.clear();
    // }, 500);
  }

  static isGlobalLoopOn() {
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
          console.log('releaseNote static :', voice);
          voice.triggerRelease();
        }
      }
    });
  }

  getSettings() {
    return this.sample_settings;
  }

  now() {
    return this.audioCtx.currentTime;
  }

  start(midiNote: number) {
    const rate = 2 ** ((midiNote - 60) / 12);
    this.source.playbackRate.value = rate;

    this.source.start(0, this.settings.startPoint);

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
    const currentTime = this.now();
    this.voiceGain.gain.setValueAtTime(0, currentTime);
    this.voiceGain.gain.linearRampToValueAtTime(1, currentTime + attackTime);
    this.voiceGain.gain.setValueAtTime(
      1,
      currentTime + loopDuration - releaseTime
    );
    this.voiceGain.gain.linearRampToValueAtTime(0, currentTime + loopDuration);
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
    this.held = this.now() - this.trigger; // round

    console.log('held:', this.held);

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
    SingleUseVoice.allVoices.forEach((voice) => {
      if (voice.sampleId === sampleId) {
        voice.settings = { ...voice.settings, ...settings };
        voice.updateLoopPoints();
      }
    });
  }

  updateLoopPoints(settings: Partial<Sample_settings> = this.settings) {
    if (settings.loopStart) {
      this.source.loopStart = settings.loopStart;
    }
    if (settings.loopEnd) {
      this.source.loopEnd = settings.loopEnd;
    }
  }

  setLoopVolume(volume: number) {
    this.settings.loopVolume = volume;
  }
}

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
