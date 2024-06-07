export const audioCtx = new (window.AudioContext ||
  (window as any).webkitAudioContext)();

export const ctxSampleRate = audioCtx.sampleRate;

export const outputNode = audioCtx.destination;

//const masterVolume = audioCtx.createGain();
//const masterCompressor = audioCtx.createDynamicsCompressor();

export function initAudioNodeGraph(): void {
  // include audioCtx?
  //masterVolume.gain.value = 1.0;
  // masterCompressor.threshold.value = -50;
  // masterCompressor.knee.value = 40;
  // masterCompressor.ratio.value = 12;
  // masterCompressor.attack.value = 0;
  // masterCompressor.release.value = 0.25;
  // masterVolume.connect(audioCtx.destination);
  // masterVolume.connect(masterCompressor);
  // masterCompressor.connect(audioCtx.destination);
}

// export const getAudioCtx = () => audioContext;  // getter necceary?
