import audioCtx from './webAudioCtx';

const audioFormat = 'audio/ogg'; // 'audio/ogg; codecs=vorbis' vs opus vs annað?

// try catch + error handling
export async function recordAudioBlob(): Promise<Blob> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream); // , { mimeType: audioFormat,}
  // const chunks: Blob[] = []; // Blob or BlobPart?

  const chunks: BlobPart[] = [];

  return new Promise((resolve) => {
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      resolve(new Blob(chunks, { type: audioFormat }));
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 1000);
  });
}

export async function blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  return await audioCtx.decodeAudioData(arrayBuffer);
}

// npm install wav-encoder

// import * as WavEncoder from "wav-encoder";

// async function audioBufferToBlob(audioBuffer) {
//   const wavData = await WavEncoder.encode({
//     sampleRate: audioBuffer.sampleRate,
//     channelData: Array.from({ length: audioBuffer.numberOfChannels }, (_, channel) =>
//       audioBuffer.getChannelData(channel)
//     )
//   });

//   return new Blob([wavData], { type: "audio/wav" });
// }
