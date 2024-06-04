import audioCtx from './webAudioCtx';

export function playAudioBuffer(audioBuffer: AudioBuffer): void {
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.playbackRate.value = 2.0;

  source.start();
}
