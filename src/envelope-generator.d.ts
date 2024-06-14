// envelope-generator.d.ts

declare module 'envelope-generator' {
  export interface EnvelopeSettings {
    curve?: 'linear' | 'exponential';
    delayTime?: number;
    startLevel?: number;
    maxLevel?: number;
    sustainLevel?: number;
    attackTime?: number;
    holdTime?: number;
    decayTime?: number;
    releaseTime?: number;
    initialValueCurve?: Float32Array;
    releaseValueCurve?: Float32Array;
    sampleRate?: number;
    attackCurve?: 'linear' | 'exponential';
    decayCurve?: 'linear' | 'exponential';
    releaseCurve?: 'linear' | 'exponential';
  }

  export default class Envelope {
    constructor(context: AudioContext, settings: EnvelopeSettings);

    connect(targetParam: AudioParam): void;
    start(when: number): void;
    release(when: number): void;
    stop(when: number): void;
    getReleaseCompleteTime(): number;
  }
}
