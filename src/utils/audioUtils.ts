import { SingleUseVoice } from '../types';

export function createAudioContext(
  latencyHint: number = 0.001,
  outputID?: string
): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)({
    latencyHint: latencyHint,
    // sinkId: outputID,
    // sampleRate: 44100, // henda ef gerir ekkert gott (defaultar í devices preferred sample rate)
  });
}

export async function resumeAudioContext(
  audioCtx: AudioContext
): Promise<void> {
  if (audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
      console.log(
        'Audio context resumed, base latency: ',
        audioCtx.baseLatency
      );
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }
  console.log('Audio context output latency: ', audioCtx.outputLatency);
}

export function midiToPlaybackRate(midiNote: number): number {
  return 2 ** ((midiNote - 60) / 12);
}

export function createBufferSourceNode(
  audioCtx: AudioContext,
  audioBuffer: AudioBuffer | null
): AudioBufferSourceNode | null {
  if (!audioBuffer) {
    console.error(
      'createBufferSourceNode cancelled because audio buffer is null'
    );
    return null;
  }
  try {
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    //source.connect(audioCtx.destination);
    return source;
  } catch (error) {
    console.error('Failed to create buffer source node:', error);
    return null;
  }
}

export function createVoice(
  audioCtx: AudioContext,
  audioBuffer: AudioBuffer
): SingleUseVoice | null {
  const newSrc = createBufferSourceNode(audioCtx, audioBuffer);
  if (!newSrc) return null;

  const newGain = audioCtx.createGain();
  newSrc.connect(newGain);
  newGain.connect(audioCtx.destination);

  const voice: SingleUseVoice = { source: newSrc, gain: newGain };

  return voice;
}

export function playSourceNode(
  source: AudioBufferSourceNode,
  rate: number = 1
): void {
  if (source) {
    source.playbackRate.value = rate;
    source.start();
  } else {
    console.error('playAudioBuffer: AudioBufferSourceNode is falsy');
  }
}

export function triggerAttack(
  voice: SingleUseVoice,
  rate: number = 1,
  attackDuration: number = 0.03,
  volume: number = 0.75
) {
  if (voice.gain && voice.source) {
    const ctx = voice.source.context;
    voice.source.playbackRate.value = rate;
    voice.gain.gain.setValueAtTime(0, ctx.currentTime);
    voice.source.onended = () => {
      voice.source?.disconnect();
      voice.gain?.disconnect();
      voice.source.stop(ctx.currentTime);
    };
    voice.source.start();
    voice.gain.gain.linearRampToValueAtTime(
      volume,
      ctx.currentTime + attackDuration
    );
  }
}

export function triggerRelease(
  voice: SingleUseVoice,
  releaseDuration: number = 0.05
) {
  if (voice && voice.gain && voice.source) {
    const ctx = voice.source.context;
    const gain = voice.gain.gain;

    gain.cancelScheduledValues(ctx.currentTime); // necessary for release to work, kinda

    gain.setValueAtTime(gain.value, ctx.currentTime);
    gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + releaseDuration
    );
  } else {
    console.error('triggerRelease: GainNode is falsy');
  }
}
