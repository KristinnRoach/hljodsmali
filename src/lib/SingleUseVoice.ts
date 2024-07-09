// @lib/SingleUseVoice.ts

export default class SingleUseVoice {
  private source: AudioBufferSourceNode;
  private voiceGain: GainNode;
  public canPlay: boolean = true;
  public midiNote: string;

  constructor(
    private audioCtx: AudioContext,
    private buffer: AudioBuffer,
    private masterGain: GainNode,
    private startPoint: number = 0,
    private endPoint: number = buffer.duration
  ) {
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = buffer;
    this.voiceGain = this.audioCtx.createGain();
    this.source.connect(this.voiceGain);
    this.voiceGain.connect(masterGain);

    this.source.onended = () => {
      this.canPlay = false;
      this.source.disconnect();
      this.voiceGain.disconnect();
    };
  }

  start(
    rate: number = 1,
    volume: number,
    attackTime: number,
    wait: number = 0
  ) {
    if (!this.canPlay) return;
    this.source.playbackRate.value = rate;
    this.source.start(wait, this.startPoint, this.endPoint - this.startPoint);
    this.setVolume(volume, attackTime, wait);
    this.canPlay = false;
    this.midiNote = '' + Math.round(12 * Math.log2(rate) + 60);
  }

  release(releaseTime: number) {
    this.setVolume(0.0001, releaseTime);
    this.source.stop(this.audioCtx.currentTime + releaseTime);
  }

  private setVolume(volume: number, fadeTime: number, wait: number = 0) {
    const startTime = this.audioCtx.currentTime + wait;
    this.voiceGain.gain.setValueAtTime(this.voiceGain.gain.value, startTime);
    this.voiceGain.gain.exponentialRampToValueAtTime(
      volume,
      startTime + fadeTime
    );
  }
}
