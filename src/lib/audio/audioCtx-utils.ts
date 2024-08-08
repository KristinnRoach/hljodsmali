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

export const getAudioContext = (): AudioContext | null => ctx;

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
export const createBufferSource = () => {
  const ctx = ensureAudioContext();
  ctx.createBufferSource();
};

export const createMediaStreamSource = (mediaStream: MediaStream) => {
  const ctx = ensureAudioContext();
  ctx.createMediaStreamSource(mediaStream);
};

export const createOscillator = () => {
  const ctx = ensureAudioContext();
  ctx.createOscillator();
};

export const createMediaElementSource = (
  // Currently not in use
  mediaElement: HTMLMediaElement
) => {
  const ctx = ensureAudioContext();
  ctx.createMediaElementSource(mediaElement);
};

// Destination nodes
export const createMediaStreamDestination = () => {
  const ctx = ensureAudioContext();
  ctx.createMediaStreamDestination();
};

export const createAnalyser = () => ctx?.createAnalyser();
export const createGainNode = () => ctx?.createGain();
export const createDynamicsCompressor = () => ctx?.createDynamicsCompressor();
export const createBiquadFilter = () => ctx?.createBiquadFilter();
export const createDelay = () => ctx?.createDelay();
export const createConvolver = () => ctx?.createConvolver();
export const createStereoPanner = () => ctx?.createStereoPanner();
// ChannelMerger: combine separate mono channels into stereo or surround sound.
export const createChannelMerger = () => ctx?.createChannelMerger(); // Currently not in use
