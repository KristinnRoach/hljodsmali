export async function getDecodedAudioBuffer(
  audioCtx: AudioContext,
  audioData: Blob | File
): Promise<AudioBuffer> {
  let arrayBuffer: ArrayBuffer;

  // if (typeof audioData === 'string') {
  //   // if it's a URL, fetch the file
  //   const response = await fetch(audioData);
  //   arrayBuffer = await response.arrayBuffer();
  // } else if (audioData instanceof Blob) {
  //   // File extends Blob
  arrayBuffer = await audioData.arrayBuffer();
  // } else {
  //   throw new TypeError(
  //     `Expected Blob, File, or string URL, got ${typeof audioData}`
  //   );
  // }
  try {
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('Error decoding audio data:', error);
    throw error;
  }
}

export async function getAudioStream(
  deviceID?: string
): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceID ? { exact: deviceID } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
    });

    return stream;
  } catch (error) {
    console.error('Error getting audio stream:', error);
    return null;
  }
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
    //source.connect(audioCtx.destination);
    return source;
  } catch (error) {
    console.error('Failed to create buffer source node:', error);
    return null;
  }
}

// ONLY USE IF bufferDuration NEEDED WITHOUT THE ACTUAL AUDIOBUFFER // needs testing
export async function getAudioDurationFromBlob(
  audioCtx: AudioContext,
  blob: Blob
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    blob
      .arrayBuffer()
      .then((arrayBuffer) => {
        audioCtx.decodeAudioData(
          arrayBuffer,
          (audioBuffer) => {
            const duration = audioBuffer.duration;
            // Immediately clear our reference to the AudioBuffer
            (audioBuffer as any) = null;
            resolve(duration);
          },
          (error) => {
            reject(new Error('Error decoding audio data: ' + error));
          }
        );
      })
      .catch((error) => {
        reject(new Error('Error processing audio blob: ' + error));
      });
  });
}

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
