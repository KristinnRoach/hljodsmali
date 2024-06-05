import audioCtx from './webAudioCtx';

const audioFormat = 'audio/ogg; codecs=opus'; // 'codecs=vorbis' vs opus vs annað?

let mediaRecorder: MediaRecorder | undefined = undefined;

// try catch + error handling
export async function startRecordAudioBuffer(
  durationMs?: number
): Promise<AudioBuffer | undefined> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  if (!stream) {
    console.error('Could not get audio stream');
    return;
  }
  mediaRecorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];

  return new Promise((resolve) => {
    // bæta við reject?
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: audioFormat });
        const audioBuffer = await blobToAudioBuffer(blob);
        chunks.length = 0;

        resolve(audioBuffer);
      };

      mediaRecorder.start();

      if (durationMs) {
        setTimeout(() => mediaRecorder?.stop(), durationMs);
      }
    } else {
      console.error('mediaRecorder is undefined');
    }
  });
}

export function stopRecordAudioBuffer() {
  if (mediaRecorder?.state === 'recording') {
    mediaRecorder.stop();
  } else {
    console.error('mediaRecorder is not recording');
  }
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

// const chunks: Blob[] = []; // Blob or BlobPart?

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
