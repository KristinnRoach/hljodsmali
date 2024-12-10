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
  console.log(
    'Audio context resumed. Output latency: ',
    audioCtx.outputLatency
  );
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
    return source;
  } catch (error) {
    console.error('Failed to create buffer source node:', error);
    return null;
  }
}

/* Not currently needed */

// export function createAudioContext(
//   latencyHint: number = 0.001,
//   outputID?: string
// ): AudioContext {
//   return new (window.AudioContext || (window as any).webkitAudioContext)({
//     latencyHint: latencyHint,
//     // sinkId: outputID,
//     // sampleRate: 44100, // henda ef gerir ekkert gott (defaultar í devices preferred sample rate)
//   });
// }
