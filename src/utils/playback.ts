import { audioCtx } from './audioNodeGraph';

export function playAudioBuffer(audioBuffer: AudioBuffer, rate: number): void {
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  // const gainNode = new GainNode(audioCtx);
  // source.connect(gainNode).connect(audioCtx.destination);
  // gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);

  source.playbackRate.value = rate;
  source.start();
  // triggerAttackHoldRelease(gainNode, 1.0, 500, 1000, 500);
  //triggerAttack(gainNode, 1.0, 500);

  // console.log('base latency: ', audioCtx.baseLatency);
  // console.log('output latency: ', audioCtx.outputLatency);
}

export function createGainNode(volume: number): GainNode {
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;

  return gainNode;
}

export function triggerAttack(
  gainNode: GainNode,
  peakVolume: number,
  attackMs: number
) {
  const currentTime = audioCtx.currentTime;
  gainNode.gain.exponentialRampToValueAtTime(
    peakVolume,
    currentTime + attackMs
  );
}

export function triggerRelease(gainNode: GainNode, decayMs: number) {
  const currentTime = audioCtx.currentTime;

  gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + decayMs);
}

export function triggerAttackHoldRelease(
  gainNode: GainNode,
  peakVolume: number,
  attackMs: number,
  holdMs: number,
  releaseMs: number
) {
  triggerAttack(gainNode, peakVolume, attackMs);
  setTimeout(() => {
    triggerRelease(gainNode, releaseMs);
  }, holdMs);
}

export function setVolume(gainNode: GainNode, fadeTime: number) {
  const currentTime = audioCtx.currentTime;

  gainNode.gain.value = 0.5;

  gainNode.gain.exponentialRampToValueAtTime(
    gainNode.gain.value,
    audioCtx.currentTime + 0.03
  );
}

// export function createBufferSourceNode(audioBuffer: AudioBuffer) {
//   const source = audioCtx.createBufferSource();
//   source.buffer = audioBuffer;

//   // source.connect(audioCtx.destination);
//   //masterVolume.connect(masterCompressor);
//   //masterCompressor.connect(audioCtx.destination);

//   return source;
// }
