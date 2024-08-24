// // src/lib/audio-utils/audioCtx-utils.ts

// /* __________________ ERROR HANDLING __________________  */

// class AudioContextError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = 'AudioContextError';
//   }
// }

// /* __________________ AUDIO CONTEXT MANAGEMENT __________________  */

// let audioCtx: AudioContext | null = null;

// export const initializeAudioContext = (): AudioContext => {
//   if (typeof window === 'undefined') {
//     console.warn('AudioContext is not available in non-browser environment.');
//     throw new AudioContextError(
//       'AudioContext is not available in non-browser environment.'
//     );
//   }

//   if (!audioCtx) {
//     const AudioContextClass =
//       window.AudioContext || (window as any).webkitAudioContext;
//     if (!AudioContextClass) {
//       throw new AudioContextError(
//         'AudioContext is not supported in this browser'
//       );
//     }
//     audioCtx = new AudioContextClass({ latencyHint: 0.0001 });
//   }

//   return audioCtx;
// };

// export const getAudioContext = (): AudioContext => {
//   return audioCtx || initializeAudioContext();
// };

// export async function resumeAudioContext(): Promise<void> {
//   const ctx = getAudioContext();

//   if (ctx && ctx.state !== 'running') {
//     await ctx.resume();
//     console.log('Audio context resumed successfully.');
//     logLatency();
//   }
// }

// export const closeAudioContext = (): void => {
//   if (audioCtx) {
//     audioCtx.close();
//     audioCtx = null;
//   }
// };

/* __________________  GETTERS  __________________  */

export const getCtxTime = (ctx: AudioContext): number => {
  return ctx.currentTime;
};

export const getSampleRate = (ctx: AudioContext) => {
  return ctx.sampleRate;
};

export const getLatency = (ctx: AudioContext) => {
  const latency = {
    base: ctx.baseLatency,
    output: ctx.outputLatency,
  };
  return latency;
};

/* __________________  UTILS __________________  */

export const addAudioWorklet = async (
  processorName: string,
  processorUrl: string,
  ctx: AudioContext
): Promise<void> => {
  await ctx.audioWorklet.addModule(processorUrl);
  console.log(`Audio worklet processor '${processorName}' added successfully.`);
};

export const logLatency = (ctx: AudioContext) => {
  console.log('Base latency:', ctx.baseLatency);
  console.log('Output latency:', ctx.outputLatency);
};

export const decodeAudioData = (
  ctx: AudioContext,
  arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> => {
  return ctx.decodeAudioData(arrayBuffer);
};

/* __________________  CONNECT / DISCONNECT TO AUDIO CONTEXT  __________________  */

export const connectNodeToAudioCtx = (
  node: AudioNode,
  ctx: AudioContext
): void => {
  node.connect(ctx.destination);
};

export const disconnectNodeFromAudioCtx = (
  node: AudioNode,
  ctx: AudioContext
): void => {
  node.disconnect(ctx.destination);
};

/* __________________  CREATE NODES __________________  */

// Source nodes
export const createBufferSource = (
  ctx: AudioContext
): AudioBufferSourceNode => {
  return ctx.createBufferSource();
};

export const createMediaStreamSource = (
  mediaStream: MediaStream,
  ctx: AudioContext
): MediaStreamAudioSourceNode => {
  return ctx.createMediaStreamSource(mediaStream);
};

export const createMediaElementSource = (
  // Currently not in use
  mediaElement: HTMLMediaElement,
  ctx: AudioContext
): MediaElementAudioSourceNode => {
  return ctx.createMediaElementSource(mediaElement);
};

type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'custom';

export const createOscillator = (
  ctx: AudioContext,
  frequency?: number,
  type?: OscillatorType
): OscillatorNode => {
  const oscillator = ctx.createOscillator();
  if (frequency !== undefined)
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (type) oscillator.type = type;
  return oscillator;
};

// Destination nodes
export const createMediaStreamDestination = (
  ctx: AudioContext
): MediaStreamAudioDestinationNode => {
  return ctx.createMediaStreamDestination();
};

export const createAnalyser = (ctx: AudioContext): AnalyserNode => {
  return ctx.createAnalyser();
};

export const createGainNode = (
  ctx: AudioContext,
  initVolume?: number
): GainNode => {
  const gainNode = ctx.createGain();
  if (initVolume !== undefined)
    gainNode.gain.setValueAtTime(initVolume, ctx.currentTime);
  return gainNode;
};

export const createDynamicsCompressor = (
  ctx: AudioContext
): DynamicsCompressorNode => {
  return ctx.createDynamicsCompressor();
};

export const createBiquadFilter = (
  ctx: AudioContext,
  type?: BiquadFilterType,
  initFreq?: number
): BiquadFilterNode => {
  const filter = ctx.createBiquadFilter();
  if (type) filter.type = type;
  if (initFreq !== undefined)
    filter.frequency.setValueAtTime(initFreq, ctx.currentTime);

  return filter;
};

export const createDelay = (
  ctx: AudioContext,
  delayTime?: number
): DelayNode => {
  const delay = ctx.createDelay();
  if (delayTime !== undefined)
    delay.delayTime.setValueAtTime(delayTime, ctx.currentTime);
  return delay;
};

export const createConvolver = (ctx: AudioContext): ConvolverNode => {
  return ctx.createConvolver();
};

export const createStereoPanner = (ctx: AudioContext): StereoPannerNode => {
  return ctx.createStereoPanner();
};

// ChannelMerger: combine separate mono channels into stereo or surround sound.
export const createChannelMerger = (
  ctx: AudioContext,
  numberOfInputs?: number
): ChannelMergerNode => {
  return ctx.createChannelMerger(numberOfInputs);
};

// Mock AudioContext for SSR
// const MockAudioContext = {
//   createGain: () => ({ gain: { value: 1 } }),
//   createOscillator: () => ({
//     frequency: { value: 440 },
//     connect: () => {},
//     start: () => {},
//     stop: () => {},
//   }),
//   decodeAudioData: () => Promise.resolve({}),
//   destination: {},
//   currentTime: 0,
// } as unknown as AudioContext;

// export const initializeAudioContext = (): AudioContext | null => {
//   if (typeof window !== 'undefined' && !theAudioContext) {
//     const AudioContextClass =
//       window.AudioContext || (window as any).webkitAudioContext;
//     if (AudioContextClass) {
//       theAudioContext = new AudioContextClass({ latencyHint: 0.0001 });
//       console.log('Audio context initialized successfully.');
//       logLatency();
//     }
//   }

//   return theAudioContext;
// };

/* probably not needed since we can do osc.connect(osc.ctx.destination) */

// export const connectNodesToDestination = (...nodes: AudioNode[]): void => {
//   const ctx = ensureAudioContext();
//   nodes.reduce((prevNode, currentNode) => {
//     prevNode.connect(currentNode);
//     return currentNode;
//   }, ctx.destination);
// };

// export const connectSingleNodeToDestination = (node: AudioNode): void => {
//   const ctx = ensureAudioContext();
//   node.connect(ctx.destination);
// };

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
