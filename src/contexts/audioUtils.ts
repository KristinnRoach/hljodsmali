export const audioCtx = new (window.AudioContext ||
  (window as any).webkitAudioContext)();

export async function blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  return await audioCtx.decodeAudioData(arrayBuffer);
}

export function sliceAudioBuffer(
  audioBuffer: AudioBuffer,
  start: number,
  end: number
) {
  const newBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels,
    end - start,
    audioBuffer.sampleRate
  );

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const channelData = audioBuffer.getChannelData(i);
    const newChannelData = newBuffer.getChannelData(i);

    for (let j = start; j < end; j++) {
      newChannelData[j - start] = channelData[j];
    }
  }

  return newBuffer;
}

// import $ from 'jquery';

// function fadeIn(element: HTMLAudioElement, duration: number) {
//   $(element).animate({ volume: 1 }, duration);
// }

// function fadeOut(element: HTMLAudioElement, duration: number) {
//   $(element).animate({ volume: 0 }, duration);
// }

// export function sliceBlob(blob: Blob, start: number, end: number) {
//   return blob.slice(start, end);
// }
