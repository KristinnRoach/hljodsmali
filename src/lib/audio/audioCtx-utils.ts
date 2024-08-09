// audioCtx-utils.ts

/* __________________ ERROR HANDLING __________________  */

class AudioContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioContextError';
  }
}

const ensureAudioContext = (): AudioContext => {
  if (!ctx) {
    throw new AudioContextError('AudioContext not initialized');
  }
  return ctx;
};

/* __________________ AUDIO CONTEXT MANAGEMENT __________________  */

let ctx: AudioContext | null = null;

export const initializeAudioContext = (): AudioContext => {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 0.0001,
      });
      if (ctx.state === 'running') {
        console.log('Audio context initialized successfully.');
        logLatency();
      }
    } catch (error) {
      throw new AudioContextError('Failed to initialize AudioContext');
    }
  }
  return ctx;
};

export async function resumeAudioContext(): Promise<void> {
  const ctx = ensureAudioContext();

  if (ctx.state !== 'running') {
    try {
      await ctx.resume();
      console.log('Audio context resumed successfully.');
      logLatency();
    } catch (error) {
      console.error('Failed to resume audio context:', error);
      throw error; // Re-throw to allow caller to handle the error
    }
  }
}

export const closeAudioContext = (): void => {
  if (ctx) {
    ctx.close();
    ctx = null;
  }
};

/* __________________  GETTERS  __________________  */

export const getAudioContext = (): AudioContext | null => {
  const ctx = ensureAudioContext();
  return ctx;
};

export const getCtxTime = (): number => {
  const ctx = ensureAudioContext();
  return ctx.currentTime;
};

export const getSampleRate = () => {
  const ctx = ensureAudioContext();
  return ctx.sampleRate;
};

export const getLatency = () => {
  const ctx = ensureAudioContext();
  const latency = {
    base: ctx.baseLatency,
    output: ctx.outputLatency,
  };
  return latency;
};

/* __________________  UTILS __________________  */

export const logLatency = () => {
  const ctx = ensureAudioContext();
  console.log('Base latency:', ctx.baseLatency);
  console.log('Output latency:', ctx.outputLatency);
};

export const decodeAudioData = (
  arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> => {
  const ctx = ensureAudioContext();
  return ctx.decodeAudioData(arrayBuffer);
};

/* __________________  CREATE NODES __________________  */

// Source nodes
export const createBufferSource = (): AudioBufferSourceNode => {
  const ctx = ensureAudioContext();
  return ctx.createBufferSource();
};

export const createMediaStreamSource = (
  mediaStream: MediaStream
): MediaStreamAudioSourceNode => {
  const ctx = ensureAudioContext();
  return ctx.createMediaStreamSource(mediaStream);
};

export const createMediaElementSource = (
  // Currently not in use
  mediaElement: HTMLMediaElement
): MediaElementAudioSourceNode => {
  const ctx = ensureAudioContext();
  return ctx.createMediaElementSource(mediaElement);
};

type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'custom';

export const createOscillator = (
  frequency?: number,
  type?: OscillatorType
): OscillatorNode => {
  const ctx = ensureAudioContext();
  const oscillator = ctx.createOscillator();
  if (frequency !== undefined)
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (type) oscillator.type = type;
  return oscillator;
};

// Destination nodes
export const createMediaStreamDestination =
  (): MediaStreamAudioDestinationNode => {
    const ctx = ensureAudioContext();
    return ctx.createMediaStreamDestination();
  };

export const createAnalyser = (): AnalyserNode => {
  const ctx = ensureAudioContext();
  return ctx.createAnalyser();
};

export const createGainNode = (): GainNode => {
  const ctx = ensureAudioContext();
  return ctx.createGain();
};

export const createDynamicsCompressor = (): DynamicsCompressorNode => {
  const ctx = ensureAudioContext();
  return ctx.createDynamicsCompressor();
};

export const createBiquadFilter = (
  type?: BiquadFilterType
): BiquadFilterNode => {
  const ctx = ensureAudioContext();
  const filter = ctx.createBiquadFilter();
  if (type) filter.type = type;
  return filter;
};

export const createDelay = (delayTime?: number): DelayNode => {
  const ctx = ensureAudioContext();
  const delay = ctx.createDelay();
  if (delayTime !== undefined)
    delay.delayTime.setValueAtTime(delayTime, ctx.currentTime);
  return delay;
};

export const createConvolver = (): ConvolverNode => {
  const ctx = ensureAudioContext();
  return ctx.createConvolver();
};

export const createStereoPanner = (): StereoPannerNode => {
  const ctx = ensureAudioContext();
  return ctx.createStereoPanner();
};

// ChannelMerger: combine separate mono channels into stereo or surround sound.
export const createChannelMerger = (
  numberOfInputs?: number
): ChannelMergerNode => {
  const ctx = ensureAudioContext();
  return ctx.createChannelMerger(numberOfInputs);
};

/* __________________  DETECT SOUND __________________  */

//   let activeAnalyser: AnalyserNode | null = null;
// let activeDetectionLoop: number | null = null;

// function initVolumeAnalyser(stream: MediaStream): AnalyserNode {
//   const analyser = createAnalyser();
//   const source = createMediaStreamSource(stream);
//   source.connect(analyser);
//   return analyser;
// }

// function getDecibels(analyser: AnalyserNode): number {
//   const data = new Uint8Array(analyser.frequencyBinCount);
//   analyser.getByteFrequencyData(data);
//   const volume = Math.max(...data);
//   return 20 * Math.log10(volume / 255);
// }

// export function detectSound(
//   stream: MediaStream,
//   onSound: (stream?: MediaStream) => void,
//   threshold: number = -60
// ): void {
//   stopDetectingSound();

//   activeAnalyser = initVolumeAnalyser(stream);

//   const detectLoop = () => {
//     if (!activeAnalyser) return;

//     const decibels = getDecibels(activeAnalyser);
//     if (decibels > threshold) {
//       onSound(stream);
//     }

//     activeDetectionLoop = requestAnimationFrame(detectLoop);
//   };

//   activeDetectionLoop = requestAnimationFrame(detectLoop);
// }

// export function detectSilence(
//   stream: MediaStream,
//   onSilence: (stream?: MediaStream) => void,
//   threshold: number = -60,
//   silenceDelay: number = 200
// ): void {
//   stopDetectingSound();

//   activeAnalyser = initVolumeAnalyser(stream);
//   let silenceStartTime = 0;

//   const detectLoop = (time: number) => {
//     if (!activeAnalyser) return;

//     const decibels = getDecibels(activeAnalyser);
//     if (decibels <= threshold) {
//       if (silenceStartTime === 0) {
//         silenceStartTime = time;
//       } else if (time - silenceStartTime > silenceDelay) {
//         onSilence(stream);
//         silenceStartTime = 0;
//       }
//     } else {
//       silenceStartTime = 0;
//     }

//     activeDetectionLoop = requestAnimationFrame(detectLoop);
//   };

//   activeDetectionLoop = requestAnimationFrame(detectLoop);
// }

// export function stopDetectingSound(): void {
//   if (activeDetectionLoop) {
//     cancelAnimationFrame(activeDetectionLoop);
//     activeDetectionLoop = null;
//   }

//   if (activeAnalyser) {
//     activeAnalyser.disconnect();
//     activeAnalyser = null;
//   }
// }

// export function createVolumeAnalyser(stream: MediaStream): AnalyserNode {
//   const analyser = createAnalyser();
//   const source = createMediaStreamSource(stream);
//   source.connect(analyser);
//   return analyser;
// }

// export function getDecibels(analyser: AnalyserNode): number {
//   const data = new Uint8Array(analyser.frequencyBinCount);
//   analyser.getByteFrequencyData(data);
//   const volume = Math.max(...data);
//   return 20 * Math.log10(volume / 255);
// }

// let volumeAnalyser: AnalyserNode | null = null;
// let stopSoundHandler: (() => void) | null = null;
// let stopSilenceHandler: (() => void) | null = null;

// export function detectSoundStart(
//   analyser: AnalyserNode,
//   threshold: number,
//   onSoundStart: () => void
// ): () => void {
//   let loopId: number;

//   const loop = () => {
//     if (!analyser) return; // Safety check in case analyser is nullified

//     const decibels = getDecibels(analyser);
//     if (decibels > threshold) {
//       onSoundStart();
//       return; // Stop the loop once sound is detected
//     }
//     loopId = requestAnimationFrame(loop);
//   };

//   loopId = requestAnimationFrame(loop);

//   return () => {
//     cancelAnimationFrame(loopId);
//   };
// }

// export function detectSoundEnd(
//   analyser: AnalyserNode,
//   threshold: number,
//   silenceDelay: number,
//   onSoundEnd: () => void
// ): () => void {
//   let loopId: number;
//   let silenceStartTime = 0;

//   const loop = (time: number) => {
//     if (!analyser) return; // Safety check in case analyser is nullified

//     const decibels = getDecibels(analyser);
//     if (decibels <= threshold) {
//       if (silenceStartTime === 0) {
//         silenceStartTime = time;
//       } else if (time - silenceStartTime > silenceDelay) {
//         onSoundEnd();
//         return; // Stop the loop once silence is detected for the specified duration
//       }
//     } else {
//       silenceStartTime = 0;
//     }
//     loopId = requestAnimationFrame(loop);
//   };

//   loopId = requestAnimationFrame(loop);

//   return () => {
//     cancelAnimationFrame(loopId);
//   };
// }

// export function startDetectingSound(
//   stream: MediaStream,
//   onSoundStart: () => void,
//   onSoundEnd: () => void,
//   threshold: number = -60,
//   silenceDelay: number = 200
// ): void {
//   if (volumeAnalyser) {
//     console.warn(
//       'Sound detection is already running. Call stopDetectingSound() first.'
//     );
//     return;
//   }

//   volumeAnalyser = createVolumeAnalyser(stream);
//   if (!volumeAnalyser) throw new Error('Failed to create volume analyser');

//   const handleSoundStart = () => {
//     onSoundStart();
//     if (stopSoundHandler) {
//       stopSoundHandler();
//       stopSoundHandler = null;
//     }
//     stopSilenceHandler = detectSoundEnd(
//       volumeAnalyser!,
//       threshold,
//       silenceDelay,
//       handleSoundEnd
//     );
//   };

//   const handleSoundEnd = () => {
//     onSoundEnd();
//     if (stopSilenceHandler) {
//       stopSilenceHandler();
//       stopSilenceHandler = null;
//       stopDetectingSound();
//     }
//     stopSoundHandler = detectSoundStart(
//       volumeAnalyser!,
//       threshold,
//       handleSoundStart
//     );
//   };

//   stopSoundHandler = detectSoundStart(
//     volumeAnalyser,
//     threshold,
//     handleSoundStart
//   );
// }

// export function stopDetectingSound(): void {
//   if (!volumeAnalyser) {
//     console.warn('No sound detection is currently running.');
//     return;
//   }

//   if (stopSoundHandler) stopSoundHandler();
//   if (stopSilenceHandler) stopSilenceHandler();
//   volumeAnalyser.disconnect();

//   volumeAnalyser = null;
//   stopSoundHandler = null;
//   stopSilenceHandler = null;
// }

// export function detectSound(
//   stream: MediaStream,
//   onSoundStart: (stream: MediaStream) => void,
//   onSoundEnd: (stream: MediaStream) => void,
//   threshold: number = -60,
//   silenceDelay: number = 200
// ): void {
//   if (volumeAnalyser) {
//     console.warn('Sound detection is already running. Call stopDetectingSound() first.');
//     return;
//   }

//   volumeAnalyser = createVolumeAnalyser(stream);

//   const analyser = createAnalyser();
//   createMediaStreamSource(stream).connect(analyser);

//   const data = new Uint8Array(analyser.frequencyBinCount);
//   let silenceStartTime = 0;
//   let soundDetected = false;

//   const cleanup = () => {
//     cancelAnimationFrame(rafId);
//     analyser.disconnect();
//   };

//   const loop = (time: number) => {
//     analyser.getByteFrequencyData(data);
//     const volume = Math.max(...data);
//     const decibels = 20 * Math.log10(volume / 255);

//     if (!soundDetected && decibels > threshold) {
//       soundDetected = true;
//       onSoundStart(stream);
//     } else if (soundDetected && decibels <= threshold) {
//       if (silenceStartTime === 0) {
//         silenceStartTime = time;
//       } else if (time - silenceStartTime > silenceDelay) {
//         onSoundEnd(stream);
//         cleanup();
//         return;
//       }
//     } else {
//       silenceStartTime = 0;
//     }

//     rafId = requestAnimationFrame(loop);
//   };

//   let rafId = requestAnimationFrame(loop);

//   return cleanup;
// }
