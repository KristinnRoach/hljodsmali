export function sliceAudioBuffer(
  audioCtx: AudioContext,
  audioBuffer: AudioBuffer,
  startMs: number,
  endMs: number
) {
  const startSample = Math.floor((startMs / 1000) * audioBuffer.sampleRate);
  const endSample = Math.floor((endMs / 1000) * audioBuffer.sampleRate);
  const frameCount = endSample - startSample;

  const newBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels,
    frameCount,
    audioBuffer.sampleRate
  );

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const channelData = audioBuffer.getChannelData(i);
    const newChannelData = newBuffer.getChannelData(i);

    for (let j = 0; j < frameCount; j++) {
      newChannelData[j] = channelData[startSample + j];
    }
  }

  return newBuffer;
}
