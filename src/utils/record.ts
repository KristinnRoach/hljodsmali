export async function blobToAudioBuffer(
  blob: Blob,
  audioCtx: AudioContext
): Promise<AudioBuffer> {
  try {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

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

// const audioFormat = 'audio/ogg; codecs=opus'; // 'codecs=vorbis' vs opus vs annað?

// let mediaRecorder: MediaRecorder | undefined = undefined;
// let stream: MediaStream | undefined = undefined;

// // try catch + error handling
// export async function startRecordAudioBuffer(
//   audioCtx: AudioContext
// ): Promise<AudioBuffer | null> {
//   stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//   if (!stream) {
//     console.error('Could not get audio stream');
//     return null;
//   }
//   mediaRecorder = new MediaRecorder(stream);
//   const chunks: BlobPart[] = [];

//   return new Promise((resolve) => {
//     // bæta við reject?
//     if (mediaRecorder) {
//       mediaRecorder.ondataavailable = (e) => {
//         chunks.push(e.data);
//       };

//       mediaRecorder.onstop = async () => {
//         const blob = new Blob(chunks, { type: audioFormat });
//         const audioBuffer = await blobToAudioBuffer(blob, audioCtx);
//         chunks.length = 0;

//         resolve(audioBuffer);
//       };

//       mediaRecorder.start();
//     } else {
//       console.error('mediaRecorder is undefined');
//     }
//   });
// }

// export function stopRecordAudioBuffer() {
//   if (mediaRecorder?.state === 'recording') {
//     mediaRecorder.stop();
//   }
//   stopMediaStream(stream);
// }

// function stopMediaStream(stream?: MediaStream) {
//   if (stream) {
//     stream.getTracks().forEach((track) => {
//       if (track.readyState == 'live') {
//         track.stop();
//       }
//     });
//   }
// }
