import { set } from 'react-hook-form';
import { SingleUseVoice } from '../types';

export function createAudioContext(latencyHint: number = 0.001): AudioContext {
  if (!typeof window) {
    throw new Error('window is not defined');
  }
  return new (window.AudioContext || (window as any).webkitAudioContext)({
    latencyHint: latencyHint,
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
  attackDuration: number = 0.07,
  volume: number = 0.75
) {
  if (voice.gain && voice.source) {
    const audioCtx = voice.source.context;
    voice.source.playbackRate.value = rate;
    // gainNode.gain.cancelScheduledValues(audioCtx.currentTime); // unnecessary?
    voice.gain.gain.setValueAtTime(0, audioCtx.currentTime);
    voice.source.start();
    voice.gain.gain.linearRampToValueAtTime(
      volume,
      audioCtx.currentTime + attackDuration
    );
  }

  // const MANDATORY_END_FADE_TIME = 0.1;
  // setTimeout(() => {
  //   triggerRelease(voice, MANDATORY_END_FADE_TIME);
  // }, voice.source.buffer!.duration! - (voice.source.context.currentTime - voice.triggerTime!) - MANDATORY_END_FADE_TIME * 2);
}

export function triggerRelease(
  voice: SingleUseVoice,
  decayDuration: number = 0.1
) {
  console.log('release voice:', voice);
  if (voice && voice.gain && voice.source) {
    console.log('triggerRelease: decayDuration:', decayDuration);

    const ctx = voice.source.context;
    const gain = voice.gain.gain;

    console.log('gain.value before fade:', gain.value);

    gain.cancelScheduledValues(ctx.currentTime); // necessary for release to work, kinda

    gain.setValueAtTime(gain.value, ctx.currentTime);
    gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decayDuration);

    console.log('gain.value after fade:', gain.value);
    //voice.source.stop(ctx.currentTime + decayDuration);
  } else {
    console.error('triggerRelease: GainNode is falsy');
  }
}
