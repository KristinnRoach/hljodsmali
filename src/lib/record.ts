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
